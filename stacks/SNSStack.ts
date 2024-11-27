// import { StackContext, Topic } from "sst/constructs";
// import * as sns from "aws-cdk-lib/aws-sns";  // Import SNS from AWS CDK
// import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";  // Import subscription classes

// export function SNSStack({ stack }: StackContext) {
//   // Create an SNS topic
//   const topic = new Topic(stack, "Report");

//   // Create an email subscription manually using sns.Subscription
//   new sns.Subscription(stack, "EmailSubscription", {
//     topic: topic,  // The SNS topic to subscribe to
//     protocol: sns.SubscriptionProtocol.EMAIL,  // Define the protocol (e.g., email)
//     endpoint: "202109479@stu.uob.edu.bh",  // Replace with a valid email address
//   });

//   return topic;
// }


import { StackContext, Topic } from "sst/constructs";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";  // Import subscription classes

export function SNSStack({ stack }: StackContext) {
    // Create the SNS topic
    const topic = new Topic(stack, "Report");

//   // Add an email subscription to the topic
//   new snsSubscriptions.EmailSubscription({
//     topic: topic,  // Access the underlying CDK Topic object
//     endpoint: "XX@example.com",  // Email address for subscription
//   });



    // stack.addOutputs({
    //     TOPIC_ARN: topic.topicArn
    // });
    return topic;
}
