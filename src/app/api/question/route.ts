import OpenAI from "openai";
import {isEmpty} from "lodash";
import {AIFW_EVENTS_SYSTEM_PROMPT, aiFwClient, askAiFw, askOpenAi, MODEL_NAME, openAiClient} from "../../utils/llmUtils";

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


    const isProtectedByAiFw = req?.headers?.get("X-is-protected") ?? false;
    console.log(`loading openAi through: (base:${isProtectedByAiFw ? aiFwClient.baseURL : openAiClient.baseURL})`);


    try {
        const asyncResponse = isProtectedByAiFw ? askAiFw(propmpt) : askOpenAi(propmpt);
        const aiResponse = await asyncResponse;
        console.log('aiResponse: ', JSON.stringify(aiResponse, null, 2));
        const responseText = aiResponse.choices.length > 0 ? aiResponse.choices[0]?.message?.content ?? ERROR_MESSAGE : ERROR_MESSAGE ;
        return new Response(responseText, {
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, X-is-protected'
            },
            status: responseText ? 200 : 500
        });
    } catch (error) {
        console.error("Error processing request:", error);
        // @ts-ignore
        return new Response(`error processing request: ${error.message}`, {status: 500});
    }
}


