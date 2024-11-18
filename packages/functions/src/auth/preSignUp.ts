//import { DynamoDB, CognitoIdentityServiceProvider } from "aws-sdk";

//const dynamoDb = new DynamoDB.DocumentClient();
//const cognito = new CognitoIdentityServiceProvider();

//export async function handler(event: any) {
 // console.log("PreSignUp event received:", JSON.stringify(event));

  //const email = event.request?.userAttributes?.email;
  //if (!email || !email.includes("@")) {
   // console.error("Invalid or missing email in sign-up request.");
   // throw new Error("Sign-up not allowed - invalid email");
 // }

  //const tableName = process.env.ALLOWED_EMAILS_TABLE;//"fatim-moe-questions-bank-AllowedEmails"
  //const userPoolId = process.env.COGNITO_USER_POOL_ID;//"us-east-1_ZgdHinkjc"

  //if (!tableName || !userPoolId) {
    //console.error("Missing required environment variables.");
    //throw new Error("Sign-up not allowed - internal configuration error");
  //}

  //const params = {
   // TableName: tableName,
    //Key: { email },
  //};

  //try {
    //const result = await dynamoDb.get(params).promise();
    //console.log("DynamoDB result:", result);

    //if (!result.Item) {
     // console.error(`Email ${email} is not authorized for sign-up.`);
      //throw new Error("Sign-up not allowed - unauthorized email");
    //}

    //try {
     // await cognito
      //  .adminCreateUser({
        //  UserPoolId: userPoolId,
        //  Username: email,
        //  UserAttributes: [
         //   { Name: "email", Value: email },
          //  { Name: "email_verified", Value: "true" },
          //],
          //TemporaryPassword: "TemporaryPassword123!", // Provide a strong default temporary password
          //MessageAction: "SUPPRESS", // Suppress default message
        //})
        //.promise();
      //console.log(`User successfully created for ${email}`);
    //} catch (error: any) {
     // if (error.code === "UsernameExistsException") {
      //  console.log(`User ${email} already exists in Cognito.`);
      //} else {
       // console.error("Error creating user in Cognito:", error);
       // throw new Error("Sign-up not allowed - Cognito error");
     // }
   // }
  //} catch (error) {
   // console.error("Error during sign-up process:", error);
   // throw new Error("Sign-up not allowed - internal error");
 // }

 // return event;
//}
