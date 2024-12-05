import {
  CognitoUserPool,
} from "amazon-cognito-identity-js";


export function getUserToken(currentUser: any) {
  return new Promise((resolve, reject) => {
    if (!currentUser) {
      reject(new Error("No user is currently logged in."));
      return;
    }

    if (typeof currentUser.getSession !== "function") {
      reject(
        new Error("Invalid Cognito user object: getSession method is missing.")
      );
      return;
    }

    currentUser.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}


//Returns the current logged in user
export function getCurrentUser() {
  const userPool = new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_USER_POOL_ID,
    ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  });

  return userPool.getCurrentUser();
}


export function getCurrentUserEmail() {
  const userPool = new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_USER_POOL_ID,
    ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  });

  const currentUser = userPool.getCurrentUser();

  return new Promise((resolve, reject) => {
    if (!currentUser) {
      return reject("No user is currently logged in.");
    }

    //@ts-ignore
    currentUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        return reject("Unable to retrieve user session.");
      }

      currentUser.getUserAttributes((err, attributes) => {
        if (err) {
          return reject("Unable to retrieve user attributes.");
        }

        //@ts-ignore
        const emailAttr = attributes.find((attr) => attr.Name === "email");
        if (emailAttr) {
          resolve(emailAttr.Value);
        } else {
          reject("Email attribute not found.");
        }
      });
    });
  });
}

