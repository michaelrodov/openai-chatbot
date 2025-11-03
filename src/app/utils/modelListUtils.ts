import { openAiClient } from "./llmUtils";
import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";
import OpenAI from "openai";

interface GeminiModel {
    name: string;
    displayName: string;
    description: string;
    supportedGenerationMethods: string[];
}

interface BedrockModelSummary {
    modelId?: string;
    modelName?: string;
    providerName?: string;
    inputModalities?: string[];
    outputModalities?: string[];
}

// OpenAI - List available models
export const listOpenAIModels = async () => {
    try {
        const models = await openAiClient.models.list();
        return models.data.map(model => ({
            id: model.id,
            created: model.created,
            owned_by: model.owned_by
        }));
    } catch (error) {
        console.error('Error listing OpenAI models:', error);
        throw error;
    }
};

// Azure OpenAI - List deployments (models are deployment-specific)
export const listAzureOpenAIModels = async () => {
    // Azure OpenAI uses deployments, which are configured in Azure Portal
    // There's no direct API to list them via the OpenAI SDK
    // You would need to use Azure Management API for this
    return {
        note: "Azure OpenAI models are deployment-specific. Configure deployments in Azure Portal.",
        configured: {
            deployment: process.env['AZUREOPENAI_DEPLOYMENT'],
            model: process.env['AZUREOPENAI_MODEL']
        }
    };
};

// Anthropic - Static list (no API endpoint for listing)
export const listAnthropicModels = async () => {
    // Anthropic doesn't have a models listing API
    // Return the known models
    return [
        { id: 'claude-3-5-sonnet-20241022', description: 'Most intelligent model' },
        { id: 'claude-3-5-haiku-20241022', description: 'Fastest model' },
        { id: 'claude-3-opus-20240229', description: 'Previous generation, powerful' },
        { id: 'claude-3-sonnet-20240229', description: 'Previous generation, balanced' },
        { id: 'claude-3-haiku-20240307', description: 'Previous generation, fast' }
    ];
};

// AWS Bedrock - List foundation models
export const listBedrockModels = async () => {
    try {
        const client = new BedrockClient({
            region: process.env['BEDROCK_AWS_REGION'] || 'us-east-1',
            credentials: {
                accessKeyId: process.env['BEDROCK_AWS_ACCESS_ID_KEY'] || '',
                secretAccessKey: process.env['BEDROCK_AWS_SECRET_ID_KEY'] || ''
            }
        });

        const command = new ListFoundationModelsCommand({});
        const response = await client.send(command);

        return response.modelSummaries?.map((model: BedrockModelSummary) => ({
            modelId: model.modelId,
            modelName: model.modelName,
            providerName: model.providerName,
            inputModalities: model.inputModalities,
            outputModalities: model.outputModalities
        })) || [];
    } catch (error) {
        console.error('Error listing Bedrock models:', error);
        throw error;
    }
};

// Google Gemini - List available models
export const listGeminiModels = async () => {
    try {
        // Use the REST API to list models
        const apiKey = process.env['GEMINI_API_KEY'];
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch Gemini models: ${response.statusText}`);
        }

        const data = await response.json();

        return data.models?.map((model: GeminiModel) => ({
            name: model.name,
            displayName: model.displayName,
            description: model.description,
            supportedGenerationMethods: model.supportedGenerationMethods
        })) || [];
    } catch (error) {
        console.error('Error listing Gemini models:', error);
        throw error;
    }
};

// Cohere - Static list with API validation
export const listCohereModels = async () => {
    // Cohere doesn't have a dedicated models list endpoint in their SDK
    // Return known models
    return [
        { id: 'command-r-plus', description: 'Most powerful model for complex tasks' },
        { id: 'command-r', description: 'Balanced model for most tasks' },
        { id: 'command', description: 'Legacy model, good for general use' },
        { id: 'command-light', description: 'Faster, lighter model' },
        { id: 'command-nightly', description: 'Experimental latest features' }
    ];
};

// Grok (xAI) - List available models (OpenAI-compatible)
export const listGrokModels = async () => {
    try {
        const grokClient = new OpenAI({
            apiKey: process.env['GROK_API_KEY'],
            baseURL: 'https://api.x.ai/v1'
        });

        const models = await grokClient.models.list();
        return models.data.map(model => ({
            id: model.id,
            created: model.created,
            owned_by: model.owned_by
        }));
    } catch (error) {
        console.error('Error listing Grok models:', error);
        throw error;
    }
};

// Main function to list all models by provider
export const listModelsByProvider = async (provider: string) => {
    switch (provider) {
        case 'openai':
            return await listOpenAIModels();
        case 'azure-openai':
            return await listAzureOpenAIModels();
        case 'anthropic':
            return await listAnthropicModels();
        case 'bedrock':
        case 'bedrock-converse':
            return await listBedrockModels();
        case 'gemini':
            return await listGeminiModels();
        case 'cohere':
            return await listCohereModels();
        case 'grok':
            return await listGrokModels();
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
};
