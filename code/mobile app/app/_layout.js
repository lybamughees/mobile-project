import { Slot } from "expo-router";
import { SessionProvider } from "../utils/ctx";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { StatusBar } from "expo-status-bar";
export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionProvider>
      <GluestackUIProvider>
        <StatusBar style="dark" />
        <Slot />
      </GluestackUIProvider>
    </SessionProvider>
  );
}
