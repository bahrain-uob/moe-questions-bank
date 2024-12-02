
//import {
  //  CognitoIdentityProviderClient,
    //CreateGroupCommand,
  //} from "@aws-sdk/client-cognito-identity-provider";
  
 // export async function main(event: any) {
  //  const client = new CognitoIdentityProviderClient({
   //   region: process.env.REGION,
   // });
   // const userPoolId = process.env.USER_POOL_ID;
  
   // const groups = [
 //     { GroupName: "Admins", Description: "Administrators who can approve or reject exams " },
   //   { GroupName: "Users", Description: "regular users who generate exams" },
  //  ];
  
   // const results: Record<string, string> = {};
  
 //   for (const group of groups) {
  //    try {
   //     await client.send(
    //      new CreateGroupCommand({
     //       GroupName: group.GroupName,
     //       UserPoolId: userPoolId,
      //      Description: group.Description,
       //   })
      //  );
      //  results[group.GroupName] = "Created";
     // } catch (error: any) {
    //    if (error.name === "GroupExistsException") {
     //     results[group.GroupName] = "Already exists";
     //   } else {
       //   results[group.GroupName] = `Error: ${error.message}`;
      //  }
     // }
   // }
  
 //   return {
  //    statusCode: 200,
   //   body: JSON.stringify(results),
    //};
  //}
  