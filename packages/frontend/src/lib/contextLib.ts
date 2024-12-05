// import { createContext, useContext } from "react";
// import { getCurrentUser } from "./getToken";


// //Used to store the user authentication state across the app
// export interface AppContextType {
//   isAuthenticated: boolean;
//   userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
//   userRole: string;
//   updateUserRole: React.Dispatch<React.SetStateAction<string>>;
// }

// const currentUser = getCurrentUser();
// export const AppContext = createContext<AppContextType>({
//   isAuthenticated: !!currentUser,
//   userHasAuthenticated: () => { },
//   userRole: "",
//   updateUserRole: () => { },
// }
// );

// export function useAppContext() {
//   return useContext(AppContext);
// }



import { createContext, useContext } from "react";

// Used to store the user authentication state across the app
export interface AppContextType {
  isAuthenticated: boolean;
  userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: string;
  updateUserRole: React.Dispatch<React.SetStateAction<string>>;
}

// Create a placeholder context; no static initialization here
export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContext.Provider");
  }
  return context;
}
