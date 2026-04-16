import { convertToModelMessages, streamText, tool } from "ai";
import { prisma } from "@/lib/db";
import { MessageRole, MessageType } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const provider = createOpenRouter({
  apiKey: process.env.OPENROUTER_API!,
});

type ChatRole = "user" | "assistant";

interface StoredMessagePart {
  type: string;
  text?: string;
}

interface TextMessagePart {
  type: "text";
  text: string;
}

interface StoredMessage {
  id: string;
  content: string;
  messageRole: MessageRole;
  createdAt: Date;
}

interface UIMessage {
  id: string;
  role: ChatRole;
  parts: TextMessagePart[];
  content?: string;
  createdAt: Date;
}

interface ChatRequestBody {
  chatId?: string | null;
  messages?: UIMessage | UIMessage[];
  model: string;
  skipUserMessages?: boolean;
}

type ModelMessages = Awaited<ReturnType<typeof convertToModelMessages>>;

void tool;

function convertStoreMessageToUI(message: StoredMessage): UIMessage | null {
  const fallbackMessage: UIMessage = {
    id: message.id,
    role: message.messageRole === MessageRole.USER ? "user" : "assistant",
    parts: [{ type: "text", text: message.content }],
    createdAt: message.createdAt,
  };

  const trimmedContent = message.content.trim();

  // Support legacy/plain-text rows that were saved before JSON parts format.
  if (!(trimmedContent.startsWith("[") || trimmedContent.startsWith("{"))) {
    return fallbackMessage;
  }

  try {
    const parts = JSON.parse(message.content) as StoredMessagePart[];

    const partsArray = Array.isArray(parts) ? parts : [];

    const validParts = partsArray.filter(
      (part): part is TextMessagePart =>
        part.type === "text" && typeof part.text === "string",
    );

    if (validParts.length === 0) return fallbackMessage;

    return {
      id: message.id,
      role: message.messageRole === MessageRole.USER ? "user" : "assistant",
      parts: validParts,
      createdAt: message.createdAt,
    };
  } catch {
    return fallbackMessage;
  }
}

function extractPartsAsJSON(message: UIMessage): string {
  if (message.parts && Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }

  const content = message.content || "";
  return JSON.stringify([{ type: "text", text: content }]);
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const limit = await rateLimit(`chat:${clientIp}`, 5, 60_000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limited: maximum 5 requests per minute.",
          retryAfter: limit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
          },
        },
      );
    }

    const {
      chatId,
      messages: newMessages,
      model,
      skipUserMessages,
    } = (await request.json()) as ChatRequestBody;

    const previousMessages: StoredMessage[] = chatId
      ? await prisma.message.findMany({
          where: {
            chatId,
          },
          orderBy: {
            createdAt: "asc",
          },
        })
      : [];

    const uiMessages = previousMessages
      .map(convertStoreMessageToUI)
      .filter((msg): msg is UIMessage => msg !== null);

    const normalizedNewMessages: UIMessage[] = Array.isArray(newMessages)
      ? newMessages
      : newMessages
        ? [newMessages]
        : [];

    const allUIMessages: UIMessage[] = [
      ...uiMessages,
      ...normalizedNewMessages,
    ];

    let modelMessages: ModelMessages;

    try {
      modelMessages = await convertToModelMessages(allUIMessages);
    } catch (conversionError) {
      console.error(
        "Error converting UI messages to model messages:",
        conversionError,
      );
      modelMessages = allUIMessages
        .map((msg) => ({
          role: msg.role,
          content: msg.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n"),
        }))
        .filter((msg) => msg.content) as ModelMessages;
    }

    const result = streamText({
      model: provider.chat(model),
      messages: modelMessages,
      system: CHAT_SYSTEM_PROMPT,
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: allUIMessages,
      onFinish: async ({ responseMessage }) => {
        try {
          if (!chatId) return;

          const messageToSave: {
            content: string;
            messageRole: MessageRole;
            chatId: string;
            model: string;
            messageType: MessageType;
          }[] = [];

          if (!skipUserMessages) {
            const latestMessage =
              normalizedNewMessages[normalizedNewMessages.length - 1];

            if (latestMessage?.role === "user") {
              const userPartsJSON = extractPartsAsJSON(latestMessage);

              messageToSave.push({
                content: userPartsJSON,
                messageRole: MessageRole.USER,
                chatId: chatId,
                model,
                messageType: MessageType.NORMAL,
              });
            }
          }

          if (responseMessage?.parts && responseMessage.parts.length > 0) {
            const assistantPartsJSON = extractPartsAsJSON(responseMessage);

            messageToSave.push({
              content: assistantPartsJSON,
              messageRole: MessageRole.ASSISTANT,
              chatId: chatId,
              model,
              messageType: MessageType.NORMAL,
            });
          }

          if (messageToSave.length > 0) {
            await prisma.message.createMany({
              data: messageToSave,
            });
          }
        } catch (error) {
            console.error("Error saving messages to database:", error);
        }
      },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing the chat." },
      { status: 500 },
    );
  }
}
