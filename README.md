This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
create ".env.development" file in the root of the project with the following content:
```env
OPENAI_API_KEY=<your_openai_api_key>
OPENAI_ORG_ID=<your_openai_org_id>
OPENAI_PROJECT_ID=<your_openai_project_id>
AIFW_API_KEY=<your_aifw_api_key>
AIFW_GATEWAY_URL=<your_aifw_gateway_url>
```

```env
Then, run the development server:

```bash
npm run dev
# or
```

Send POST request to the API endpoint: http://localhost:3000/
With the following JSON body:
```json
{
  "question": <your question here>
}

