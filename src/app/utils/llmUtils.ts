import OpenAI from "openai";
import { AzureOpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

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

