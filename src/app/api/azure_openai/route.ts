import { askAzureOpenAi } from "@/app/utils/llmUtils";
import { isEmpty } from "lodash";

const ERROR_MESSAGE = 'Could not get a response from the AI';


export const POST = async (req: Request) => {
    const prompt = await req.text();

    if (isEmpty(prompt)) {
        return new Response('request must contain text in the body', { status: 400 });
    }
    const isProtectedByAiFw = !!(req?.headers?.get("X-is-firewalled"));

    console.log(`Loading Azure OpenAI through endpoint: ${process.env['AZUREOPENAI_ENDPOINT']}`);
    console.log(`Using deployment: ${process.env['AZUREOPENAI_DEPLOYMENT']}`);

    try {
        const asyncResponse = askAzureOpenAi(prompt, undefined, isProtectedByAiFw);
        const aiResponse = await asyncResponse;

        console.log('Azure OpenAI Response: ', JSON.stringify(aiResponse, null, 2));

        const responseText = aiResponse.choices.length > 0
            ? aiResponse.choices[0]?.message?.content ?? ERROR_MESSAGE
            : ERROR_MESSAGE;

        return new Response(responseText, {
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key'
            },
            status: responseText ? 200 : 500
        });
    } catch (error) {
        console.error("Error processing Azure OpenAI request:", error);
        // @ts-expect-error - error.message exists on Error type
        return new Response(`error processing request: ${error.message}`, { status: 500 });
    }
}
