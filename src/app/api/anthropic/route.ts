import {isEmpty} from "lodash";
import { askAnthropic, askAnthropicStream } from "@/app/utils/llmUtils";
import { RESPONSE_DEFAULT_HEADERS } from "@/app/utils/networkUtils";

const ERROR_MESSAGE = 'Could not get a response from the AI';

export const POST = async (req: Request) => {
    const startTime = Date.now();
    const requestId = `req_${startTime}`;

    const prompt = await req.text();
    console.log('Body (prompt):', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));

    if (isEmpty(prompt)) {
        return new Response('request must contain text in the body', {status: 400});
    }

    const isProtectedByAiFw = !!(req?.headers?.get("X-is-firewalled"));
    const isStreaming = !!(req?.headers?.get("X-Stream"));

    console.log('Config:', {
        isProtectedByAiFw,
        isStreaming,
        model: process.env['CHATBOT_ANTHROPIC_MODEL']
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Handle streaming requests
    if (isStreaming) {
        try {
            console.log('🔄 [CALLING ANTHROPIC - STREAMING]', requestId);

            const stream = await askAnthropicStream(prompt, undefined, isProtectedByAiFw);

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

                            // Anthropic streaming format differs from OpenAI
                            // chunk.type can be: message_start, content_block_start, content_block_delta, content_block_stop, message_delta, message_stop
                            let content = '';

                            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                                content = chunk.delta.text;
                            }

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
                        console.log(`\n✅ [STREAMING COMPLETE] Total chunks: ${chunkCount}, Duration: ${Date.now() - startTime}ms`);
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

    // Handle non-streaming requests
    try {
        console.log('🔄 [CALLING ANTHROPIC]', requestId);

        const asyncResponse = askAnthropic(prompt, undefined, isProtectedByAiFw);
        const aiResponse = await asyncResponse;

        console.log('Anthropic Response:', JSON.stringify(aiResponse, null, 2));

        // Anthropic response structure: aiResponse.content is an array of content blocks
        const responseText = aiResponse.content && aiResponse.content.length > 0
            ? aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ERROR_MESSAGE
            : ERROR_MESSAGE;

        console.log(`✅ [SUCCESS] ${requestId} - Duration: ${Date.now() - startTime}ms`);

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
