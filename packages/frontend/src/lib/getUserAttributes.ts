import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserSession,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

function getCurrentUser(): CognitoUser | null {
  const userPool = new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_USER_POOL_ID,
    ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  });
  return userPool.getCurrentUser();
}

export async function getUserAttributes(): Promise<Record<string, string>> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("User not logged in");
  }

  return new Promise((resolve, reject) => {
    currentUser.getSession(
      //@ts-ignore
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }

        currentUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          if (!attributes) {
            reject(new Error("No attributes found"));
            return;
          }

          const userAttributes = attributes.reduce(
            (acc: Record<string, string>, attr: CognitoUserAttribute) => ({
              ...acc,
              [attr.Name]: attr.Value,
            }),
            {}
          );
          resolve(userAttributes);
        });
      }
    );
  });
}
