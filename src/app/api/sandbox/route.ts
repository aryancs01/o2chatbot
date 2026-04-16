import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import CodeInterpreter from "@e2b/code-interpreter";
import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // SECURITY: Verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to use the Sandbox." }, { status: 401 });
    }

    // RATE LIMIT: 2 requests per minute per user/IP
    const clientIp = getClientIp(req);
    const limit = await rateLimit(`sandbox:${session.user.id}:${clientIp}`, 2, 60_000);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Rate limited: Maximum 2 requests per minute. Try again in ${limit.retryAfterSeconds}s.` },
        { 
          status: 429, 
          headers: { "Retry-After": String(limit.retryAfterSeconds) } 
        }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Generate the UI Code Using Gemini
    // Using gemini-2.5-flash model for free tier
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are an expert Frontend Web Developer. 
      Create a single HTML file containing the requested UI component.
      
      REQUIREMENTS:
      1. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
      2. Keep it in ONE single file (HTML, CSS, JS all together)
      3. Make the design modern, clean, and beautiful like a v0 component. Use a modern font like Inter from Google Fonts.
      4. Ensure it works beautifully without any build steps.
      5. Output ONLY raw HTML code. Do NOT output markdown formatting like \`\`\`html or \`\`\`. Start strictly with <!DOCTYPE html>.
      
      USER REQUEST: ${prompt}`,
    });

    let code = text.trim();
    if (code.startsWith("```html")) code = code.replace(/^```html\n?/, "");
    if (code.startsWith("```")) code = code.replace(/^```\n?/, "");
    if (code.endsWith("```")) code = code.replace(/\n?```$/, "");

    code = code.trim();

    // 2. Start E2B Sandbox (Code Interpreter provides a ready-to-run environment)
    // Note: requires E2B_API_KEY env var
    const sandbox = await CodeInterpreter.create();

    // 3. Write our generated code directly to the sandbox
    await sandbox.files.write("/home/user/index.html", code);

    // 4. Start a simple python webserver to serve the HTML
    await sandbox.commands.run("python3 -m http.server 8000", { background: true });

    // 5. Get the sandbox URL for rendering
    const previewUrl = `https://${sandbox.getHost(8000)}`;

    return NextResponse.json({
      code,
      previewUrl,
      sandboxId: sandbox.sandboxId,
    });
  } catch (error: any) {
    console.error("Sandbox Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate sandbox" }, { status: 500 });
  }
}
