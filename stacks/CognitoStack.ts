
import { Duration } from "aws-cdk-lib";
import {use} from "sst/constructs";//to reference other stacks
import {Cognito , StackContext  } from "sst/constructs"; //import the tools needed to use cognito
import { DBStack } from "./DBStack";//Import the DBStack to use AllowedEmails table


//creat a fun. to setup cognito , will be run when the peoj. is deployed
export function CognitoStack ({stack}:StackContext){
    
    //reference the AlloedEmailsTable from the DBStack
    const{AllowedEmailsTable}=use(DBStack);

   //set up the cognito user pool (where users account are stored)
    const auth=new Cognito(stack ,"Auth", {
        //define how the users will login
        login:["email"],

        //configration for users pool
        cdk:{
            userPool:{
                selfSignUpEnabled:false,//only admin can add users

            },
            //define settings for the app that connects to uder pool
            userPoolClient:{
                //accessTokenValidity:Duration.hours(3),//users will stay loggedin for 3 hours befor they have to relogin
                //idTokenValidity:Duration.hours(3),
                //refreshTokenValidity:Duration.days(30),// Users can stay logged in for 30 days using a refresh token
            },
        },

        //add trigger to run something when a new user tries to signup (pre signup lambd)
        triggers:{
            preSignUp:{
                handler:"packages/functions/src/auth/preSignUp.handler",//path to the peresiginup lambda function
                environment:{
                    ALLOWED_EMAILS_TABLE:AllowedEmailsTable?.tableName!,//pass the table name to lambda //here

                },


            },
           

        },


    });
    //the userpoolclint is a "connector" between the website and the User Pool
    //save the user pool and app clint IDs so we can use them in another part , they are like adress that we will use in the frintend to connect the website to cignito
    stack.addOutputs({
        UserPoolId: auth.cdk.userPool.userPoolId, //unique id for the user pool
        AppClintId:auth.cdk.userPoolClient.userPoolClientId,//unique ID for the app that connects to the User Pool

    });
    //return the cognito resources so we can use it in another part
    return auth;
}