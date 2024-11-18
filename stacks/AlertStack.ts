import { StackContext } from "sst/constructs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";

export function AlertStack({ stack }: StackContext) {
  // Create the SNS Topic using AWS CDK constructs
  const alertTopic = new sns.Topic(stack, "AlertTopic");

  // Add an email subscription
  alertTopic.addSubscription(
    new snsSubscriptions.EmailSubscription("yoikiko29@gmail.com") // Replace with the admin email
  );

  // Output the topic ARN for use in other parts of the app
  stack.addOutputs({
    AlertTopicArn: alertTopic.topicArn, // Outputs the topic ARN for reference
  });

  return alertTopic; // Return the created topic
}



