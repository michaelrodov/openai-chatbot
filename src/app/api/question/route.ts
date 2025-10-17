import {isEmpty} from "lodash";
import { askOpenAi } from "@/app/utils/llmUtils";
import { RESPONSE_DEFAULT_HEADERS } from "@/app/utils/networkUtils";


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


    const isProtectedByAiFw = !!(req?.headers?.get("X-is-firewalled"));
    


    try {
        const asyncResponse = askOpenAi(propmpt, undefined, isProtectedByAiFw);
        const aiResponse = await asyncResponse;
        console.log('aiResponse: ', JSON.stringify(aiResponse, null, 2));
        const responseText = aiResponse.choices.length > 0 ? aiResponse.choices[0]?.message?.content ?? ERROR_MESSAGE : ERROR_MESSAGE ;
        return new Response(responseText, {
            headers: RESPONSE_DEFAULT_HEADERS,
            status: responseText ? 200 : 500
        });
    } catch (error) {
        console.error("Error processing request:", error);
        
        // handle blocking errors from AI Firewall
        if(error?.status === 400) {
            return new Response(error.message, { status: 200 });
        }
        
        return new Response(`error processing request: ${error.message}`, {status: error.status || 500});
    }
}


