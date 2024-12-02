import { ApiStack } from "./ApiStack";
import { Cognito, Function, StackContext, use } from "sst/constructs";
//import * as cr from "aws-cdk-lib/custom-resources";
//import * as iam from "aws-cdk-lib/aws-iam";

export function AuthStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);

  // Create Cognito User Pool and Identity Pool
  const auth = new Cognito(stack, "Auth", {
    login: ["email"],
  });

  // Attach permissions for authenticated users to access the API
  auth.attachPermissionsForAuthUsers(stack, [api]);

  // Lambda function to create groups in Cognito
 
  // Lambda function to create groups in Cognito
 // const groupCreator = new Function(stack, "GroupCreatorFunction", {
  //  handler: "packages/functions/src/createGroups.main",
   // environment: {
    //  USER_POOL_ID: auth.userPoolId,
    //  REGION: app.region,
    //},
    //permissions: [
     // "cognito-idp:CreateGroup",
     // "cognito-idp:DescribeUserPool",
    //],
  //});

  // Grant the custom resource permission to invoke the Lambda function
 // const invokePermission = new iam.PolicyStatement({
   // actions: ["lambda:InvokeFunction"],
    //resources: [groupCreator.functionArn],
  //});

 // const customResource = new cr.AwsCustomResource(stack, "InvokeGroupCreator", {
   // onCreate: {
     // service: "Lambda",
      //action: "invoke",
      //parameters: {
      //  FunctionName: groupCreator.functionName,
      //  InvocationType: "RequestResponse",
      //  Payload: JSON.stringify({}),
     // },
     // physicalResourceId: cr.PhysicalResourceId.of("InvokeGroupCreatorResource"),
    //},
   // policy: cr.AwsCustomResourcePolicy.fromStatements([invokePermission]),
  //});

  // Add outputs for easier debugging and resource references
  stack.addOutputs({
   // GroupCreatorFunctionName: groupCreator.functionName,
   // CognitoGroups: "Admins, Users", // Note: Groups are created by the function
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
    IdentityPoolId: auth.cognitoIdentityPoolId,
  });

  return {
    auth,
  };
}
