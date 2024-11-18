import { Api } from "sst/constructs";
//configuration file that tells the app how to connect to AWS services
const awsExports = {
  Auth: {
      region: "us-east-1", // Replace with your AWS region
      userPoolId: "us-east-1_ZgdHinkjc", // Replace with your User Pool ID
      userPoolWebClientId: "d71lh69j33ljq911jr33sbukp", // Replace with your App Client ID
  },
  API: {
      endpoints: [ //address of my backend server where I can send and receive data
          {
              name: "MyApi",
              endpoint: "REACT_APP_API_BASE_URL", // Your API Gateway endpoint
          },
      ],
  },
};

export default awsExports;
