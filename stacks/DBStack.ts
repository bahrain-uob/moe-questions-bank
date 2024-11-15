import { PartitionKey } from "aws-cdk-lib/aws-appsync";
import { Table, StackContext } from "sst/constructs";

// RDS imports are kept commented out for reference, not needed since we're not using RDS
// import * as rds from "aws-cdk-lib/aws-rds";
// import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";
// import * as path from 'path';
// import { Fn } from "aws-cdk-lib";


//create ans manage the dynamtables
export function DBStack({ stack, app }: StackContext) {
    
    // Create a DynamoDB table 
    const table = new Table(stack, "Counter", {
        fields: {
            counter: "string",
        },
        primaryIndex: { partitionKey: "counter" },
    });

    //create a DynamoDB table for the allowed emails for the presignup validation
    const AllowedEmailsTable =new Table(stack,"AllowedEmails",{
        fields:{
            email:"string",//the key for this table
        },
        primaryIndex:{partitionKey:"email"},
    });

    //make the table name accessabile in other parts
    stack.addOutputs({
    AllowedEmailsTableName:AllowedEmailsTable.tableName,
    });
    return{AllowedEmailsTable};


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
    return { table };
}

