import { use } from "sst/constructs";
import { Cognito, StackContext } from "sst/constructs";
import { DBStack } from "./DBStack";

export function CognitoStack({ stack }: StackContext) {
  // Reference the AllowedEmailsTable from the DBStack
  //=>const { AllowedEmailsTable } = use(DBStack);

  // Create the Cognito user pool
  const auth = new Cognito(stack, "Auth", {
    // Define how users will log in
    login: ["email"],

    // Cognito configuration
    cdk: {
      userPool: {
        //=>false
        selfSignUpEnabled: true, 
      },
    },

    // Add the PreSignUp trigger with permissions
    triggers: {}
    //here=>
   // triggers: {
     // preSignUp: {
       // handler: "packages/functions/src/auth/preSignUp.handler", // Path to the PreSignUp Lambda function
        //environment: {
         // ALLOWED_EMAILS_TABLE: AllowedEmailsTable.tableName, // Pass the AllowedEmails table name
          //COGNITO_USER_POOL_ID: "us-east-1_ZgdHinkjc", // Cognito User Pool ID
        //},
        //permissions: [
         // AllowedEmailsTable, // Grant access to the DynamoDB table
         // "cognito-idp:AdminCreateUser", // Grant permission to create users in Cognito
        //],
      //},
    //},
  });

  // Output User Pool details for frontend configuration
  stack.addOutputs({
    UserPoolId: auth.cdk.userPool.userPoolId, // Unique ID for the User Pool
    AppClientId: auth.cdk.userPoolClient.userPoolClientId, // Unique ID for the User Pool Client
  });

  return auth;
}
