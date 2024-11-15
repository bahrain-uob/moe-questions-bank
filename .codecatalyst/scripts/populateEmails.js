const AWS = require("aws-sdk");

//set up dynamo to work with the us-east-1
const dynamoDb =new AWS.DynamoDB.DocumentClient({region:"us-east-1"});
async function addEmails(){
    const emails = ["202104097@stu.uob.edu.bh","fatima.ja526@gmail.com"];//list of allowed emails

    for(const e of emails){
        //add each email to the alowwed emails table
        await dynamoDb
        .put({
            TableName:"AllowedEmails",
            Item: {e},//store the email in the table
        })
        .promise();
        console.log(`Added email: ${e}`);
    }
}
//run the fun to add the emails to the DB 
addEmails().catch((error)=>console.error(error));