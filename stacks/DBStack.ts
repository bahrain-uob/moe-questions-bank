import { Table, StackContext } from "sst/constructs";

export function DBStack({ stack }: StackContext) {
  // Create a DynamoDB table for allowed emails
  const AllowedEmailsTable = new Table(stack, "AllowedEmails", {
    fields: {
      email: "string", // Email is the primary key
    },
    primaryIndex: { partitionKey: "email" },
  });

  // Create a DynamoDB table for feedback
  const FeedbackTable = new Table(stack, "FeedbackTable", {
    fields: {
      feedbackId: "string", // Partition key
    },
    primaryIndex: { partitionKey: "feedbackId" },
  });

  // Create a DynamoDB table for exam history
  const ExamHistoryTable = new Table(stack, "ExamHistoryTable", {
    fields: {
      examId: "string", // Unique ID for the exam
      grade: "string", // Grade level for filtering
      subject: "string", // Subject for filtering
    },
    primaryIndex: { partitionKey: "examId" }, // Primary key for the table
    globalIndexes: {
      // Define a global secondary index for filtering by grade
      gradeIndex: { partitionKey: "grade" },
      // Define a global secondary index for filtering by subject
      subjectIndex: { partitionKey: "subject" },
    },
  });

  stack.addOutputs({
    AllowedEmailsTableName: AllowedEmailsTable.tableName,
    FeedbackTableName: FeedbackTable.tableName,
    ExamHistoryTableName: ExamHistoryTable.tableName,
  });

  return { AllowedEmailsTable, FeedbackTable, ExamHistoryTable };
}


    // RDS-related code (commented out):
    // const mainDBLogicalName = "MainDatabase";
    // const dbSecretArnOutputName = "DBSecretArn";
    // const dbClusterIdentifierOutputName = "DBClusterIdentifier";
    
    // var db: RDS;

    // if (app.stage == "prod") {
    //     db = new RDS(stack, mainDBLogicalName, {
    //         engine: "mysql5.7",
    //         defaultDatabaseName: "maindb",
    //         migrations: [".","packages","db-migrations"].join(path.sep),
    //     });

    //     stack.addOutputs({
    //         [dbSecretArnOutputName]: {
    //             value: db.secretArn,
    //             exportName: dbSecretArnOutputName,
    //         },
    //         [dbClusterIdentifierOutputName]: {
    //             value: db.clusterIdentifier,
    //             exportName: dbClusterIdentifierOutputName,
    //         },
    //     });
    // } else {
    //     const existing_secret = secretsManager.Secret.fromSecretCompleteArn(stack, "ExistingSecret", Fn.importValue(dbSecretArnOutputName));
    //     db = new RDS(stack, "ExistingDatabase", {
    //         engine: "mysql5.7",
    //         defaultDatabaseName: "maindb",
    //         migrations: [".","packages","db-migrations"].join(path.sep),
    //         cdk: {
    //             cluster: rds.ServerlessCluster.fromServerlessClusterAttributes(stack, "ExistingCluster", {
    //                 clusterIdentifier: Fn.importValue(dbClusterIdentifierOutputName),
    //                 secret: existing_secret,
    //             }),
    //             secret: existing_secret,
    //         },
    //     });
    // }

    // Return DynamoDB table (RDS code is commented out for now)
    //return { table };

