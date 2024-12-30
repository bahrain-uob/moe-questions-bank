import { StackContext, Function, use, Stack } from "sst/constructs";
import { BedrockKnowledgeBase } from "bedrock-agents-cdk";
import * as iam from "aws-cdk-lib/aws-iam";
// import { KnowledgeBaseStack } from "./KnowledgeStack";
import { MyStack } from "./OpenSearchStack";
// import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources"; // Import EventSource for S3 trigger
// import { EventType } from "aws-cdk-lib/aws-s3"; // Import Bucket from AWS CDK
// import { Token } from "aws-cdk-lib";
// import * as sst from "@serverless-stack/resources";
import { StorageStack } from "./StorageStack";


 
export function BedrockKbLambdaStack({ stack }: StackContext) {
  const { materialsBucket: bucket } = use(StorageStack);


  const s3BucketArn = bucket.bucketArn;
  const { collectionArn, customResource } = use(MyStack);

  if (!customResource)
  {
    throw new Error("Custom Resource not found");
  }

  // or should we do a while loop to wait for the custom resource to be created? NAIVE IMPLEMENTATION
  // while (!customResource) {
  //   console.log("Waiting for custom resource to be created...");
  //   delay(1000);
  //   customResource = use(MyStack).customResource;
  // }
 
  const bedrockKbRole = new iam.Role(stack, "bedrock-kb-role", {
    roleName: `AmazonBedrockExecutionRoleForKnowledgeBase_bkb-${stack.stage}`,
    description: "IAM role to create a Bedrock Knowledge Base",
    assumedBy: new iam.ServicePrincipal("bedrock.amazonaws.com"),
    managedPolicies: [
      new iam.ManagedPolicy(stack, "bedrock-kb-invoke", {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["bedrock:InvokeModel"],
            resources: [
              "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v1",
            ],
          }),
        ],
      }),
      new iam.ManagedPolicy(stack, "bedrock-kb-s3-managed-policy", {
        statements: [
          new iam.PolicyStatement({
            sid: "S3ListBucketStatement",
            effect: iam.Effect.ALLOW,
            actions: ["s3:ListBucket"],
            resources: [s3BucketArn],
          }),
          new iam.PolicyStatement({
            sid: "S3GetObjectStatement",
            effect: iam.Effect.ALLOW,
            actions: ["s3:GetObject"],
            resources: [`${s3BucketArn}/*`],
          }),
 
          new iam.PolicyStatement({
            sid: "S3PutObjectStatement",
            effect: iam.Effect.ALLOW,
            actions: ["s3:PutObject"],
            resources: [`${s3BucketArn}/*`],
          }),
        ],
      }),
 
      new iam.ManagedPolicy(stack, "bedrock-kb-opensearch-policy", {
        statements: [
          new iam.PolicyStatement({
            sid: "OpenSearchServerlessAPIAccessAllStatement",
            effect: iam.Effect.ALLOW,
            actions: [
              "aoss:APIAccessAll",
            ],
            resources: [collectionArn], // Scoped to the specific collection ARN
          }),
        ],
      }),
    ],
  });
 
  const bedrockKb = new BedrockKnowledgeBase(stack, "bedrock-knowledge-base", {
    name: `bedrock-kb-${stack.stage}`,
    roleArn: bedrockKbRole.roleArn,
    storageConfiguration: {
      opensearchServerlessConfiguration: {
        collectionArn: collectionArn,
        vectorIndexName: "embeddings",
        fieldMapping: {
          textField: "textField",
          metadataField: "metadataField",
          vectorField: "vectorField",
        },
      },
      type: "OPENSEARCH_SERVERLESS",
    },
    dataSource: {
      dataSourceConfiguration: {
        s3Configuration: {
          bucketArn: s3BucketArn,
        },
      },
    },
  });
 


//  Add IAM permissions for the Lambda function
 const syncKnowledgeBaseFunction = new Function(stack, "SyncKnowledgeBase", {
  handler: "packages/functions/src/SyncKB.handler",
  environment: {
    KNOWLEDGE_BASE_ID: bedrockKb.knowledgeBaseId,
    DATA_SOURCE_ID: bedrockKb.dataSourceId,
  },
  permissions: [
    "bedrock:StartIngestionJob",    // Permission to start ingestion jobs in Bedrock
    "s3:GetObject",  
    "aoss:CreateDocument",
    "aoss:ReadDocument",
  ],
});

// Add an S3 trigger to the Lambda function (currently gives cyclic dependency error)
// syncKnowledgeBaseFunction.addEventSource(new S3EventSource(bucket, {
//   events: [EventType.OBJECT_CREATED]
// }) as any);
 
  stack.addOutputs({
    KNOWLEDGE_BASE_ID: bedrockKb.knowledgeBaseId,
    DATA_SOURCE_ID: bedrockKb.dataSourceId,
  });

  return { bedrockKbRole, bedrockKb, syncKnowledgeBaseFunction }
}