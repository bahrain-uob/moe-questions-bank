import { Bucket, Function, StackContext, use  } from "sst/constructs";
import { DBStack } from "./DBStack";
import * as iam from 'aws-cdk-lib/aws-iam';




export function FunctionsStack({ stack }: StackContext) {
  const audioBucket = new Bucket(stack, "AudioBucket");
  const { exams_table } = use(DBStack);
  const createExamFunction = new Function(stack, "CreateExamFunction", {
    handler: "packages/functions/src/createNewExam.createExam",
    timeout: 180,
    memorySize: 512,
    url: {
      cors: {
        allowOrigins: ["*"],
      },
    },
    permissions: ["dynamodb", "bedrock", exams_table],
    environment: {
      TABLE_NAME: exams_table.tableName,
    },
  });


  // // Create the function for generating the audio
  // const generateAudioFunction = new Function(stack, "GenerateAudioFunction", {
  //   handler: "packages/functions/src/generateAudio.generateAudio", 
  //   timeout: 180,
  //   memorySize: 512,
  //   url: {
  //     cors: {
  //       allowOrigins: ["*"], // allow all origins 
  //     },
  //   },
  //   permissions: ["dynamodb", "polly:SynthesizeSpeech","s3:PutObject","s3:GetObject","s3:ListBucket","bedrock", exams_table,audioBucket] , // Add any necessary permissions
  //   environment: {
  //     TABLE_NAME: exams_table.tableName,
  //     AUDIO_BUCKET_NAME: audioBucket.bucketName,
  //     //here
  //   },
  // });


  // Create the function for generating the audio
  const generateAudioFunction = new Function(stack, "GenerateAudioFunction", {
    handler: "packages/functions/src/generateAudio.generateAudio", // Ensure this points to the correct handler
    timeout: 180,
    memorySize: 512,
    url: {
      cors: {
        allowOrigins: ["*"], // Allow all origins (adjust as needed)
      },
    },
    permissions: [
      "dynamodb", 
      "bedrock", 
      exams_table, 
      "polly:SynthesizeSpeech",
      "s3", 
      "s3:PutObject",
    ],
    environment: {
      TABLE_NAME: exams_table.tableName,
     // AUDIO_BUCKET_NAME: audioBucket.bucketName,
    },
  });
  
  // Add custom permissions to the Lambda function for S3 access
  generateAudioFunction.attachPermissions([
    "s3:PutObject",
    "s3:GetObject",
    "s3:ListBucket"
  ]);


    stack.addOutputs({
        CreateExamFunctionURL: createExamFunction.url,
        GenerateAudioFunctionURL: generateAudioFunction.url,
       // AudioBucketName: audioBucket.bucketName,
    })
    
    return { createExamFunction,generateAudioFunction };
}
