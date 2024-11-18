
//adds a list of emails to the table
//use tools from AWS to work with the database
const AWS = require("aws-sdk");

//set up dynamo to work with the us-east-1
const dynamoDb =new AWS.DynamoDB.DocumentClient({region:"us-east-1"});
async function addEmails(){
    //add emails
    const emails = ["202104097@stu.uob.edu.bh","fatima.ja526@gmail.com","yoikiko29@gmail.com"];//list of allowed emails

    for(const email of emails){
        //add each email to the alowwed emails table
        await dynamoDb //Wait here until the task is done before continuing to the next step(used with process that takes time)
        .put({
            TableName:"fatim-moe-questions-bank-AllowedEmails",
            Item: {email},//store the email in the table
        })
        .promise();//make the PUT fun. make a promise to tell us when its finished
        console.log(`Added email: ${email}`);
    }
}
//run the fun to add the emails to the DB 
addEmails().catch((error)=>console.error(error));