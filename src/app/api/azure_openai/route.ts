import { askAzureOpenAi } from "@/app/utils/llmUtils";
import { RESPONSE_DEFAULT_HEADERS } from "@/app/utils/networkUtils";
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
            headers: RESPONSE_DEFAULT_HEADERS,
            status: responseText ? 200 : 500
        });
    } catch (error) {
        console.error("Error processing Azure OpenAI request:", error);
        
        // handle blocking errors from AI Firewall
        // @ts-expect-error - error.message exists on Error type
        if(error?.status === 400) {
            // @ts-expect-error - error.message exists on Error type
            return new Response(error.message, { status: 200 });
        }

        // @ts-expect-error - error.message exists on Error type
        return new Response(`error processing request: ${error.message}`, { status: error.status || 500 });
    }
}
