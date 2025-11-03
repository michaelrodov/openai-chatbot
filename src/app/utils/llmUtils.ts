import OpenAI from "openai";
import { AzureOpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand, ConverseCommand, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CohereClient } from "cohere-ai";

export const MODEL_NAME = "gpt-4.1"; // Define the model name
export const AIFW_EVENTS_SYSTEM_PROMPT = "You are a security expert and a sales person who specializes in Firewall security product\n" +
    + "You have a new product called AI firewall.\n" +
    + "\nAI Firewall is a service that protects incoming and outgoing prompts and responses from various malicious attacks, PII leakage, and wrongdoings in general.\n\n" +
    "I will send you a JSON in the payload, which describes a violation caught by the AI firewall.\n" +
    "- the violation type is located in 'guardian' field.\n" +
    "- the result of the guardian operation is placed in 'mode' field.\n" +
    "- the prompt or response that cause the violation is located in 'messages' object.\n" +
    "When such JSON present, please provide one sentence that would describe why request triggered the guardian that was triggered and also what action was done."

const azureOpenAIClient = new AzureOpenAI({
    apiKey: process.env['AZUREOPENAI_API_KEY'],
    endpoint: process.env['AZUREOPENAI_ENDPOINT'],
    apiVersion: process.env['AZUREOPENAI_VERSION'],
    deployment: process.env['AZUREOPENAI_DEPLOYMENT']
});

const azureOpenAIClientAifw = new AzureOpenAI({
    apiKey: process.env['AZUREOPENAI_API_KEY'],
    endpoint: process.env['AIFW_GATEWAY_URL'],
    apiVersion: process.env['AZUREOPENAI_VERSION'],
    deployment: process.env['AZUREOPENAI_DEPLOYMENT'],
    defaultHeaders: { 
        "X-Imperva-Api-Key": process.env['AIFW_API_KEY'],
        "X-Target-Url": process.env['AZUREOPENAI_ENDPOINT'],
        "X-User-Id": 'rodov1'
    }
});

export const openAiClient = new OpenAI();

export const openAiClientAifw = new OpenAI({
    baseURL: process.env['AIFW_GATEWAY_URL'],
    defaultHeaders: {
        "X-Imperva-Api-Key": process.env['AIFW_API_KEY'] ,
        "X-Target-Url": 'https://api.openai.com/v1'
    }
});

const anthropicClient = new Anthropic({
    apiKey: process.env['CHATBOT_ANTHROPIC_API_KEY']
});

const anthropicClientAifw = new Anthropic({
    apiKey: process.env['CHATBOT_ANTHROPIC_API_KEY'],
    baseURL: process.env['AIFW_GATEWAY_URL'],
    defaultHeaders: {
        "X-Imperva-Api-Key": process.env['AIFW_API_KEY'],
        "X-Target-Url": process.env['ANTHROPIC_LLM_PROVIDER_TARGET_URL'] || 'https://api.anthropic.com'
    }
});

const bedrockClient = new BedrockRuntimeClient({
    region: process.env['BEDROCK_AWS_REGION'] || 'us-east-1',
    credentials: {
        accessKeyId: process.env['BEDROCK_AWS_ACCESS_ID_KEY'] || '',
        secretAccessKey: process.env['BEDROCK_AWS_SECRET_ID_KEY'] || ''
    }
});

// Google Gemini client
const geminiClient = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');

// Cohere client
const cohereClient = new CohereClient({
    token: process.env['COHERE_API_KEY'] || ''
});

// Grok/xAI client (OpenAI-compatible)
const grokClient = new OpenAI({
    apiKey: process.env['GROK_API_KEY'],
    baseURL: 'https://api.x.ai/v1'
});

const grokClientAifw = new OpenAI({
    apiKey: process.env['GROK_API_KEY'],
    baseURL: process.env['AIFW_GATEWAY_URL'],
    defaultHeaders: {
        "X-Imperva-Api-Key": process.env['AIFW_API_KEY'],
        "X-Target-Url": 'https://api.x.ai/v1'
    }
});


export const askOpenAi = async (prompt: string, userRole: string = "user", isFirewalled: boolean) => {
    const configurations = {
        model: process.env['OPENAI_MODEL'],
        messages: [{ role: userRole, content: prompt }]
    };

    if(isFirewalled) {
        return openAiClientAifw.chat.completions.create(configurations);
    }
    return openAiClient.chat.completions.create(configurations);
}

export const askOpenAiStream = async (prompt: string, userRole: string = "user", isFirewalled: boolean) => {
    const configurations = {
        model: process.env['OPENAI_MODEL'],
        messages: [{ role: userRole, content: prompt }] as any,
        stream: true as const
    };

    if(isFirewalled) {
        console.log('🛡️  Using AIFW client with endpoint:', process.env['AIFW_GATEWAY_URL']);
        const stream = await openAiClientAifw.chat.completions.create(configurations);

        // Create a debugging wrapper around the stream
        const debugStream = (async function* () {
            let chunkIndex = 0;
            try {
                for await (const chunk of stream) {
                    chunkIndex++;
                    // Check for any AIFW-specific fields
                    const chunkAsAny = chunk as any;
                    if (chunkAsAny.imperva || chunkAsAny.aifw || chunkAsAny.firewall) {
                        console.log('⚠️  AIFW-specific fields detected:', {
                            imperva: chunkAsAny.imperva,
                            aifw: chunkAsAny.aifw,
                            firewall: chunkAsAny.firewall
                        });
                    }

                    yield chunk;
                }
                console.log(`\n✅ [DEBUG - AIFW Stream] Completed. Total chunks: ${chunkIndex}`);
            } catch (error) {
                console.error(`\n❌ [DEBUG - AIFW Stream] Error at chunk #${chunkIndex}:`, error);
                throw error;
            }
        })();

        return debugStream;
    }
    return openAiClient.chat.completions.create(configurations);
}

export const askAzureOpenAi = async (prompt: string, userRole: string = "user", isFirewalled: boolean) => {
    const configurations = {
        model: process.env['AZUREOPENAI_MODEL'],
        messages: [{ role: userRole, content: prompt }]
    };

    if(isFirewalled) {
        return azureOpenAIClientAifw.chat.completions.create(configurations);
    }

    return azureOpenAIClient.chat.completions.create(configurations);
}

export const askAzureOpenAiStream = async (prompt: string, userRole: string = "user", isFirewalled: boolean) => {
    const configurations = {
        model: process.env['AZUREOPENAI_MODEL'],
        messages: [{ role: userRole, content: prompt }] as any,
        stream: true as const
    };

    if(isFirewalled) {
        return azureOpenAIClientAifw.chat.completions.create(configurations);
    }

    return azureOpenAIClient.chat.completions.create(configurations);
}

export const askAnthropic = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean) => {
    const configurations = {
        model: process.env['CHATBOT_ANTHROPIC_MODEL'] || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: userRole, content: prompt }]
    };

    if(isFirewalled) {
        return anthropicClientAifw.messages.create(configurations);
    }
    return anthropicClient.messages.create(configurations);
}

export const askAnthropicStream = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean) => {
    const configurations = {
        model: process.env['CHATBOT_ANTHROPIC_MODEL'] || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: userRole, content: prompt }],
        stream: true as const
    };

    if(isFirewalled) {
        console.log('🛡️  Using AIFW client with endpoint:', process.env['AIFW_GATEWAY_URL']);
        const stream = await anthropicClientAifw.messages.create(configurations);

        // Create a debugging wrapper around the stream
        const debugStream = (async function* () {
            let chunkIndex = 0;
            try {
                for await (const chunk of stream) {
                    chunkIndex++;
                    // Check for any AIFW-specific fields
                    const chunkAsAny = chunk as any;
                    if (chunkAsAny.imperva || chunkAsAny.aifw || chunkAsAny.firewall) {
                        console.log('⚠️  AIFW-specific fields detected:', {
                            imperva: chunkAsAny.imperva,
                            aifw: chunkAsAny.aifw,
                            firewall: chunkAsAny.firewall
                        });
                    }

                    yield chunk;
                }
                console.log(`\n✅ [DEBUG - AIFW Stream] Completed. Total chunks: ${chunkIndex}`);
            } catch (error) {
                console.error(`\n❌ [DEBUG - AIFW Stream] Error at chunk #${chunkIndex}:`, error);
                throw error;
            }
        })();

        return debugStream;
    }
    return anthropicClient.messages.create(configurations);
}

export const askBedrock = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean) => {
    const modelId = process.env['BEDROCK_MODEL_ID'] || 'anthropic.claude-3-haiku-20240307-v1:0';

    const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        messages: [{ role: userRole, content: prompt }]
    };

    const command = new InvokeModelCommand({
        modelId: modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody)
    });

    if (isFirewalled) {
        // For AIFW, we would need to proxy through the firewall
        // This would require custom implementation based on your AIFW setup
        console.log('🛡️  Bedrock with AIFW is not yet implemented');
    }

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody;
}

export const askBedrockStream = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean) => {
    const modelId = process.env['BEDROCK_MODEL_ID'] || 'anthropic.claude-3-haiku-20240307-v1:0';

    const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        messages: [{ role: userRole, content: prompt }]
    };

    const command = new InvokeModelWithResponseStreamCommand({
        modelId: modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody)
    });

    if (isFirewalled) {
        console.log('🛡️  Bedrock streaming with AIFW is not yet implemented');
    }

    const response = await bedrockClient.send(command);

    // Create an async generator to yield chunks
    return (async function* () {
        if (response.body) {
            for await (const chunk of response.body) {
                if (chunk.chunk?.bytes) {
                    const chunkData = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
                    yield chunkData;
                }
            }
        }
    })();
}

// Bedrock Converse API (newer, recommended API)
export const askBedrockConverse = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean) => {
    const modelId = process.env['BEDROCK_MODEL_ID'] || 'anthropic.claude-3-haiku-20240307-v1:0';

    const command = new ConverseCommand({
        modelId: modelId,
        messages: [
            {
                role: userRole,
                content: [{ text: prompt }]
            }
        ],
        inferenceConfig: {
            maxTokens: 4096
        }
    });

    if (isFirewalled) {
        console.log('🛡️  Bedrock Converse with AIFW is not yet implemented');
    }

    const response = await bedrockClient.send(command);
    return response;
}

export const askBedrockConverseStream = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean) => {
    const modelId = process.env['BEDROCK_MODEL_ID'] || 'anthropic.claude-3-haiku-20240307-v1:0';

    const command = new ConverseStreamCommand({
        modelId: modelId,
        messages: [
            {
                role: userRole,
                content: [{ text: prompt }]
            }
        ],
        inferenceConfig: {
            maxTokens: 4096
        }
    });

    if (isFirewalled) {
        console.log('🛡️  Bedrock Converse streaming with AIFW is not yet implemented');
    }

    const response = await bedrockClient.send(command);

    // Create an async generator to yield chunks
    return (async function* () {
        if (response.stream) {
            for await (const chunk of response.stream) {
                yield chunk;
            }
        }
    })();
}

// Google Gemini functions
export const askGemini = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean, modelName?: string) => {
    const selectedModel = modelName || process.env['GEMINI_MODEL'] || 'gemini-pro';
    const model = geminiClient.getGenerativeModel({ model: selectedModel });

    if (isFirewalled) {
        console.log('🛡️  Gemini with AIFW is not yet implemented');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
        content: response.text(),
        rawResponse: response
    };
}

export const askGeminiStream = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean, modelName?: string) => {
    const selectedModel = modelName || process.env['GEMINI_MODEL'] || 'gemini-pro';
    const model = geminiClient.getGenerativeModel({ model: selectedModel });

    if (isFirewalled) {
        console.log('🛡️  Gemini streaming with AIFW is not yet implemented');
    }

    const result = await model.generateContentStream(prompt);

    // Create an async generator to yield chunks in a unique Gemini format
    return (async function* () {
        let chunkIndex = 0;
        try {
            for await (const chunk of result.stream) {
                chunkIndex++;
                const chunkText = chunk.text();

                // Gemini-specific chunk structure (different from OpenAI/Anthropic)
                yield {
                    type: 'gemini_chunk',
                    index: chunkIndex,
                    text: chunkText,
                    candidates: chunk.candidates,
                    promptFeedback: chunk.promptFeedback
                };
            }
            console.log(`\n✅ [DEBUG - Gemini Stream] Completed. Total chunks: ${chunkIndex}`);
        } catch (error) {
            console.error(`\n❌ [DEBUG - Gemini Stream] Error at chunk #${chunkIndex}:`, error);
            throw error;
        }
    })();
}

// Cohere functions
export const askCohere = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean, modelName?: string) => {
    const model = modelName || process.env['COHERE_MODEL'] || 'command';

    if (isFirewalled) {
        console.log('🛡️  Cohere with AIFW is not yet implemented');
    }

    const response = await cohereClient.generate({
        model: model,
        prompt: prompt,
        maxTokens: 4096
    });

    return {
        content: response.generations[0]?.text || '',
        rawResponse: response
    };
}

export const askCohereStream = async (prompt: string, userRole: "user" | "assistant" = "user", isFirewalled: boolean, modelName?: string) => {
    const model = modelName || process.env['COHERE_MODEL'] || 'command';

    if (isFirewalled) {
        console.log('🛡️  Cohere streaming with AIFW is not yet implemented');
    }

    const stream = await cohereClient.generateStream({
        model: model,
        prompt: prompt,
        maxTokens: 4096
    });

    // Create an async generator to yield chunks in Cohere's unique format
    return (async function* () {
        let chunkIndex = 0;
        try {
            for await (const chunk of stream) {
                chunkIndex++;

                // Cohere-specific chunk structure (different from OpenAI/Anthropic)
                yield {
                    type: 'cohere_chunk',
                    index: chunkIndex,
                    eventType: chunk.eventType,
                    text: chunk.text,
                    isFinished: chunk.isFinished,
                    finishReason: chunk.finishReason,
                    response: chunk.response
                };
            }
            console.log(`\n✅ [DEBUG - Cohere Stream] Completed. Total chunks: ${chunkIndex}`);
        } catch (error) {
            console.error(`\n❌ [DEBUG - Cohere Stream] Error at chunk #${chunkIndex}:`, error);
            throw error;
        }
    })();
}

// Grok/xAI functions (OpenAI-compatible but different model)
export const askGrok = async (prompt: string, userRole: string = "user", isFirewalled: boolean, modelName?: string) => {
    const configurations = {
        model: modelName || process.env['GROK_MODEL'] || 'grok-beta',
        messages: [{ role: userRole, content: prompt }]
    };

    if (isFirewalled) {
        return grokClientAifw.chat.completions.create(configurations);
    }
    return grokClient.chat.completions.create(configurations);
}

export const askGrokStream = async (prompt: string, userRole: string = "user", isFirewalled: boolean, modelName?: string) => {
    const configurations = {
        model: modelName || process.env['GROK_MODEL'] || 'grok-beta',
        messages: [{ role: userRole, content: prompt }] as any,
        stream: true as const
    };

    if (isFirewalled) {
        console.log('🛡️  Using AIFW client with endpoint:', process.env['AIFW_GATEWAY_URL']);
        const stream = await grokClientAifw.chat.completions.create(configurations);

        const debugStream = (async function* () {
            let chunkIndex = 0;
            try {
                for await (const chunk of stream) {
                    chunkIndex++;
                    const chunkAsAny = chunk as any;
                    if (chunkAsAny.imperva || chunkAsAny.aifw || chunkAsAny.firewall) {
                        console.log('⚠️  AIFW-specific fields detected:', {
                            imperva: chunkAsAny.imperva,
                            aifw: chunkAsAny.aifw,
                            firewall: chunkAsAny.firewall
                        });
                    }
                    yield chunk;
                }
                console.log(`\n✅ [DEBUG - Grok AIFW Stream] Completed. Total chunks: ${chunkIndex}`);
            } catch (error) {
                console.error(`\n❌ [DEBUG - Grok AIFW Stream] Error at chunk #${chunkIndex}:`, error);
                throw error;
            }
        })();

        return debugStream;
    }
    return grokClient.chat.completions.create(configurations);
}

