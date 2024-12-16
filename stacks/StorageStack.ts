import { Bucket, StackContext } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  // Create the S3 bucket and set up notifications
  const materialsBucket = new Bucket(stack, "MaterialsBucket", {});
  
    
  // Outputs
  stack.addOutputs({
    BucketName: materialsBucket.bucketName,
    
  });

  return { materialsBucket };
}
