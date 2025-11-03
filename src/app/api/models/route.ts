import { listModelsByProvider } from "@/app/utils/modelListUtils";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    const searchParams = req.nextUrl.searchParams;
    const provider = searchParams.get('provider');

    if (!provider) {
        return new Response(
            JSON.stringify({ error: 'Provider parameter is required. Use ?provider=openai|azure-openai|anthropic|bedrock|gemini|cohere|grok' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    try {
        console.log(`🔍 Fetching models for provider: ${provider}`);
        const models = await listModelsByProvider(provider);

        console.log(`✅ Found ${Array.isArray(models) ? models.length : 'N/A'} models for ${provider}`);

        return new Response(
            JSON.stringify({
                provider,
                models,
                timestamp: new Date().toISOString()
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error(`❌ Error fetching models for ${provider}:`, error);

        return new Response(
            JSON.stringify({
                error: 'Failed to fetch models',
                provider,
                // @ts-expect-error - error.message exists on Error type
                message: error?.message || 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
