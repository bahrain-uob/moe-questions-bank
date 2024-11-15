//import the aws sdk to ineteract with dynamo
import{DynamoDB} from "aws-sdk";

//create dynamodb clint to talk to the DB
const dynamoDb=new DynamoDB.DocumentClient();

//lambda function that runs befor a user siginup
export async function handler(event:any) {
    console.log("PreSignUp",event);


//get the user email from the signup request
const email=event.request.userAttributes.email;

//set up the parameters to check email in the allowed emails table
const params={
  TableName:process.env.ALLOWED_EMAILS_TABLES!, //here
   Key:{email},//use the email as a lookup key
};

try{
    //check the email if in the table
    const result=await dynamoDb.get(params).promise();

    if (!result.Item){
        //email is not found
        throw new Error("Email is not authorized ");

    }

}catch(error){
    console.error("Error validating email:",error);
    throw new Error("login not allowed");

}

//if email is found 
return event;
}