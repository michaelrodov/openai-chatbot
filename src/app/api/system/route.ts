import OpenAI from "openai";
import {isEmpty} from "lodash";
import {AIFW_EVENTS_SYSTEM_PROMPT, aiFwClient, askAiFw, askOpenAi, loadSystemPrompt, MODEL_NAME} from "../../utils/llmUtils";

// in case the baseUrl is not provided the regular openAi url will be used (in the .env files)
// const openAiClient = new OpenAI({
//     baseURL: process.env['AIFW_GATEWAY_URL'],
//     defaultHeaders: {"X-Api-Key": process.env['AIFW_API_KEY']}
// });
const ERROR_MESSAGE = 'Could not get a response from the AI';



export const POST = async (req: Request) => {
    const propmpt = await req.text();

    if (isEmpty(propmpt)) {
        return new Response('request must contain json object in the body of this type {question: "xxxxxx"}', {status: 400});
    }

    try {        
        const aiResponse = await loadSystemPrompt(propmpt);
        console.log('aiResponse', aiResponse);
        const responseText = aiResponse.choices.length > 0 ? aiResponse.choices[0]?.message?.content ?? ERROR_MESSAGE : ERROR_MESSAGE ;
        return new Response(responseText, {status: responseText ? 200 : 500});
    } catch (error) {
        console.error("Error processing request:", error);
        // @ts-ignore
        return new Response(`error processing request: ${error.message}`, {status: 500});
    }
}


