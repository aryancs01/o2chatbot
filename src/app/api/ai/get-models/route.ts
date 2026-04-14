import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API}`,
                "Content-Type": "application/json",

            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }

        const models = await response.json();

        //@ts-expect-error - The API response structure is not well-defined
        const freeModels = models.data.filter(model => {
            const promptPrice = parseFloat(model.pricing.prompt) || 0;
            const completionPrice = parseFloat(model.pricing.completion) || 0;
            
            return promptPrice === 0 && completionPrice === 0;
        });

        //@ts-expect-error - The API response structure is not well-defined
        const formattedModels = freeModels.map((model) => ({
            id: model.id,
            name: model.name,
            description: model.description,
            context_length: model.context_length,
            architecture: model.architecture,
            pricing: model.pricing,
            top_provider: model.top_provider,
        }));

        return NextResponse.json({
            models: formattedModels
        });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
}