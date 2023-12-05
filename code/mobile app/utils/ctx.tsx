import React from "react";
import { useStorageState } from "./useStorageState";
import axios from "axios";
import { ENDPOINT } from "../globals";
import { setAccessToken } from "./api";
import { router } from "expo-router";
const AuthContext = React.createContext<{
  signIn: (username, password) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
} | null>(null);

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props) {
  const [[isLoading, session], setSession] = useStorageState("string-share");

  return (
    <AuthContext.Provider
      value={{
        signIn: (username, password) => {
          const postData = new URLSearchParams();
          postData.append("username", username);
          postData.append("password", password);

          // Define the request headers
          const headers = {
            accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          };

          // Define the URL for the request
          const url = `${ENDPOINT}/token`;

          // Perform the POST request
          axios
            .post(url, postData.toString(), { headers })
            .then((response) => {
              // Handle the successful response
              const accessToken = response.data.access_token;
              setAccessToken(accessToken);
              setSession(accessToken);
              router.replace("/");
            })
            .catch((error) => {
              // Handle any errors that occurred during the request
              const errorString = JSON.stringify(error, null, 2);
              console.error("Error:", errorString);
            });
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
