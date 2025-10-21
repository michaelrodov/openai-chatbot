import OpenAI from "openai";
import { AzureOpenAI } from "openai";

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
        "X-Imperva-Api-Key": process.env['AIFW_API_KEY'] 
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

