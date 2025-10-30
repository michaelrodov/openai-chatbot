import {isEmpty} from "lodash";
import { askOpenAi, askOpenAiStream } from "@/app/utils/llmUtils";
import { RESPONSE_DEFAULT_HEADERS } from "@/app/utils/networkUtils";


// in case the baseUrl is not provided the regular openAi url will be used (in the .env files)
// const openAiClient = new OpenAI({
//     baseURL: process.env['AIFW_GATEWAY_URL'],
//     defaultHeaders: {"X-Api-Key": process.env['AIFW_API_KEY']}
// });
const ERROR_MESSAGE = 'Could not get a response from the AI';



export const POST = async (req: Request) => {
    const startTime = Date.now();
    const requestId = `req_${startTime}`;

    const prompt = await req.text();
    console.log('Body (prompt):', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));

    if (isEmpty(prompt)) {
        return new Response('request must contain json object in the body of this type {question: "xxxxxx"}', {status: 400});
    }


    const isProtectedByAiFw = !!(req?.headers?.get("X-is-firewalled"));
    const isStreaming = !!(req?.headers?.get("X-Stream"));

    console.log('Config:', {
        isProtectedByAiFw,
        isStreaming,
        model: process.env['OPENAI_MODEL']
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');


    // Handle streaming requests
    if (isStreaming) {
        try {
            console.log('🔄 [CALLING OPENAI - STREAMING]', requestId);

            const stream = await askOpenAiStream(prompt, undefined, isProtectedByAiFw);

            // Create a ReadableStream to send SSE format
            const encoder = new TextEncoder();
            let chunkCount = 0;

            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        console.log('\n🌊 [STREAMING STARTED]', requestId);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                        for await (const chunk of stream) {
                            chunkCount++;

                            // 🔍 LOG RAW CHUNK BEFORE PROCESSING
                            console.log(`\n[CHUNK #${chunkCount}] Raw chunk received:`);
                            console.log('Full chunk object:', JSON.stringify(chunk, null, 2));
                            console.log('Chunk structure:', {
                                id: chunk.id,
                                object: chunk.object,
                                created: chunk.created,
                                model: chunk.model,
                                choices: chunk.choices?.map((choice) => ({
                                    index: choice.index,
                                    delta: choice.delta,
                                    finish_reason: choice.finish_reason
                                }))
                            });

                            const content = chunk.choices[0]?.delta?.content || '';
                            console.log(`Content extracted: "${content}"`);
                            console.log(`Content length: ${content.length}`);

                            if (content) {
                                const data = `data: ${JSON.stringify({ text: content })}\n\n`;
                                console.log(`Sending to client: ${data.substring(0, 100)}...`);
                                controller.enqueue(encoder.encode(data));
                            } else {
                                console.log('⚠️  No content in this chunk (might be metadata or finish)');
                            }
                            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        }


                        // Send completion signal
                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (error) {
                        console.error('\n❌ [STREAMING ERROR]', requestId);
                        console.error("Error in streaming:", error);
                        console.error('Chunks processed before error:', chunkCount);
                        controller.error(error);
                    }
                }
            });

            return new Response(readableStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        } catch (error) {
            console.error("Error setting up stream:", error);

            // handle blocking errors from AI Firewall
            // @ts-expect-error - error.status exists on Error type
            if(error?.status === 400) {
                // @ts-expect-error - error.message exists on Error type
                return new Response(error.message, { status: 200 });
            }

            // @ts-expect-error - error.message and error.status exist on Error type
            return new Response(`error processing request: ${error.message}`, {status: error.status || 500});
        }
    }

    // Handle non-streaming requests (original code)
    try {
        console.log('🔄 [CALLING OPENAI]', requestId);

        const asyncResponse = askOpenAi(prompt, undefined, isProtectedByAiFw);
        const aiResponse = await asyncResponse;


        const responseText = aiResponse.choices.length > 0 ? aiResponse.choices[0]?.message?.content ?? ERROR_MESSAGE : ERROR_MESSAGE ;


        return new Response(responseText, {
            headers: RESPONSE_DEFAULT_HEADERS,
            status: responseText ? 200 : 500
        });
    } catch (error) {
        // ❌ LOG ERROR
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ [ERROR]', requestId);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error("Error Details:", error);
        console.log('Duration before error:', Date.now() - startTime + 'ms');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // handle blocking errors from AI Firewall
        // @ts-expect-error - error.status exists on Error type
        if(error?.status === 400) {
            // @ts-expect-error - error.message exists on Error type
            return new Response(error.message, { status: 200 });
        }

        // @ts-expect-error - error.message and error.status exist on Error type
        return new Response(`error processing request: ${error.message}`, {status: error.status || 500});
    }
}


