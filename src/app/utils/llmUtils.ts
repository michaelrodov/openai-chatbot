import OpenAI from "openai";
import { APIClient } from "openai/core.mjs"

export const MODEL_NAME = "gpt-4.1"; // Define the model name
export const AIFW_EVENTS_SYSTEM_PROMPT = "You are a security expert and a sales person who specializes in Firewall security product\n" +
    + "You have a new product called AI firewall.\n" +
    + "\nAI Firewall is a service that protects incoming and outgoing prompts and responses from various malicious attacks, PII leakage, and wrongdoings in general.\n\n" +
    "I will send you a JSON in the payload, which describes a violation caught by the AI firewall.\n" +
    "- the violation type is located in 'guardian' field.\n" +
    "- the result of the guardian operation is placed in 'mode' field.\n" +
    "- the prompt or response that cause the violation is located in 'messages' object.\n" +
    "When such JSON present, please provide one sentence that would describe why request triggered the guardian that was triggered and also what action was done."

export const aiFwClient = new OpenAI({
    baseURL: process.env['AIFW_GATEWAY_URL'],
    defaultHeaders: { "X-Api-Key": process.env['AIFW_API_KEY'] }
});

export const openAiClient = new OpenAI();

export const loadSystemPrompt = async (prompt: string) => {
    return askOpenAi(prompt, "system");
}

export const askAiFw = async (question: string) => {
    return aiFwClient.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: question }]
    }, {
        headers: {
            'X-Api-Key': process.env['AIFW_API_KEY']
        }
    });
}

export const askOpenAi = async (prompt: string, userRole: any = "user") => {
    return openAiClient.chat.completions.create(
        {
            model: MODEL_NAME,
            messages: [{ role: userRole, content: prompt }]
        });
}

