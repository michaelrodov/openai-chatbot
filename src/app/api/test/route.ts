export const GET = async (request: Request) => {
    return new Response(
        JSON.stringify({message: 'Hello from the test API!'}),
        {status: 200, headers: {'Content-Type': 'application/json'}}
    );
};
