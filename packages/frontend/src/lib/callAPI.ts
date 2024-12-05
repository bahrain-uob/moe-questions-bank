// @ts-ignore
import sigV4Client from "./sigV4Client.js";
import { getCurrentUser } from "./getToken.ts";
import { getUserToken } from "./getToken.ts";
import AWS from "aws-sdk";
import getAwsCredentials from "./getIAMCred.ts";

//Invokes the our API Gateway using the retreived IAM credentials

const sigClient: any = sigV4Client;

export default async function invokeApig({
  path,
  method = "GET",
  headers = {},
  queryParams = {},
  body,
}: {
  path: string; // Correct type definition
  method?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number>;
  body: any;
}) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("User is not authenticated");
  }

  const userToken = await getUserToken(currentUser); //User token from the cognito user pool
  await getAwsCredentials(userToken); //IAM cred based on the cognito token

  const accessKey = await AWS.config.credentials?.accessKeyId ?? "";
  const secretKey = await AWS.config.credentials?.secretAccessKey ?? "";
  const sessionToken = await AWS.config.credentials?.sessionToken ?? "";

  if (!accessKey || !secretKey || !sessionToken) {
    throw new Error("AWS credentials are not available.");
  }

  //sigV4 is needed as our API authorizer is IAM
  const client = sigClient.newClient({
    accessKey: accessKey,
    secretKey: secretKey,
    sessionToken: sessionToken,
    region: import.meta.env.VITE_REGION,
    endpoint: import.meta.env.VITE_API_URL,
  });

  //Signs the request with the appropriate data
  const signedRequest = client.signRequest({
    method,
    path,
    headers,
    queryParams,
    body,
  });

  body = body ? JSON.stringify(body) : body;

  //Sends the signed request
  const results = await fetch(signedRequest.url, {
    method,
    headers: signedRequest.headers,
    body,
  });

   if (!results.ok) {
     const errorText = await results.text();
     throw new Error(`API call failed: ${errorText}`);
   }

   const textResponse = await results.text();
   try {
     return textResponse ? JSON.parse(textResponse) : null;
   } catch (error) {
     //@ts-ignore
     throw new Error(`Failed to parse response as JSON: ${error.message}`);
   }
}
