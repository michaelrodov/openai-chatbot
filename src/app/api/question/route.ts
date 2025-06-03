import OpenAI from "openai";
import {isEmpty} from "lodash";

// in case the baseUrl is not provided the regular openAi url will be used (in the .env files)
const MODEL_NAME = "gpt-4.1"; // Define the model name
const openAiClient = new OpenAI({
    baseURL: process.env['AIFW_GATEWAY_URL'],
    defaultHeaders: {"X-Api-Key": process.env['AIFW_API_KEY']}
});
const ERROR_MESSAGE = 'Could not get a response from the AI';

export const POST = async (req: Request) => {
    const body = await req.json();
    console.log(`loading openAi through: (base:${openAiClient.baseURL}, `)
    if (isEmpty(body?.question)) {
        return new Response('request must contain json object in the body of this type {question: "xxxxxx"}', {status: 400});
    }

    try {
        const aiResponse = await openAiClient.chat.completions.create({
            model: MODEL_NAME,
            messages: [{role: "user", content: body.question}]
        },{
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': process.env['AIFW_API_KEY']
            }
        });
        console.log('aiResponse', aiResponse);
        const responseText = aiResponse.choices.length > 0 ? aiResponse.choices[0]?.message?.content ?? ERROR_MESSAGE : ERROR_MESSAGE ;
        return new Response(responseText, {status: responseText ? 200 : 500});
    } catch (error) {
        console.error("Error processing request:", error);
        // @ts-ignore
        return new Response(`error processing request: ${error.message}`, {status: 500});
    }
}


