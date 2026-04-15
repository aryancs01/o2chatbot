"use server";

import { MessageRole, MessageType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { currentUser } from "@/modules/authentication/actions";

import { revalidatePath } from "next/cache";

export const createChatWithMessage = async (values: { content: string; model: string }) => {
  try {
    const user = await currentUser();

    if (!user)
      return {
        success: false,
        message: "User not authenticated",
      };

    const { content, model } = values;

    if (!content || !model)
      return {
        success: false,
        message: "Content and model are required",
      };

    const title = content.slice(0, 20) + (content.length > 20 ? "..." : "");

    const chat = await prisma.chat.create({
      data: {
        title,
        model,
        userId: user.id,
        messages: {
          create: {
            content,
            messageRole: MessageRole.USER,
            messageType: MessageType.NORMAL,
            model,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    revalidatePath("/")

    return {
      success: true,
      message: "Chat created successfully",
      data: chat,
    };
  } catch (error) {
    console.error("Error creating chat with message:", error);
    throw error;
  }
};

export const getAllChats = async ()=> {
  try {
    const user = await currentUser();

    if (!user)
      return {
        success: false,
        message: "User not authenticated",
      };

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Chats fetched successfully",
      data: chats,
    };

  } catch (error) {
    console.error("Error fetching chats:", error);
    return {
      success: false,
      message: "Error fetching chats",
    };
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    if (!chat) {
      return {
        success: false,
        message: "Chat not found",
      };
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      message: "Chat deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return {
      success: false,
      message: "Error deleting chat",
    };
  }
};
