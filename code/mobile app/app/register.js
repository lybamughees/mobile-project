// Importing necessary components and functions from external libraries and files
import React, { useState, useCallback, useRef } from "react";
import {
  Center,
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonIcon,
  Heading,
  Link,
  LinkText,
  Text,
  HStack,
  Box,
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import { LogIn } from "lucide-react-native"; // Importing LogIn icon from the Lucide library for the login button
import { useSession } from "../utils/ctx"; // Importing useSession hook from a custom utility file
import globalStyles from "../styles/globalStyles"; // Importing global styles
import { router } from "expo-router"; // Importing router from Expo for navigation
import YoutubePlayer from "react-native-youtube-iframe"; // Importing YoutubePlayer component for playing YouTube videos
import api from "../utils/api"; // Importing utility functions for API calls
import axios from "axios"; // Importing Axios for making HTTP requests
import { ENDPOINT } from "../globals"; // Importing ENDPOINT constant from a global file
import { Alert } from "react-native"; // Importing Alert component for displaying alerts

// Functional component for rendering the registration screen
const Register = () => {
  // Accessing the signIn function from the useSession hook
  const { signIn } = useSession();

  // State variables for managing user registration inputs and video playback
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [playing, setPlaying] = useState(false);

  // Callback function for handling video state changes
  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("Video has finished playing!");
    }
  }, []);

  // Function for handling user registration
  const onRegister = () => {
    const postData = {
      username,
      full_name: fullName,
      password,
    };

    // URL where you want to send the POST request
    const url = `${ENDPOINT}/client/signup`; // Replace with your API endpoint

    // Sending POST request with Axios
    axios
      .post(url, JSON.stringify(postData), {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // Navigating to the sign-in screen upon successful registration
        router.push("/sign-in");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Rendering the registration form
  return (
    <Center style={globalStyles.formContainer}>
      {/* Application heading */}
      <Heading size="4xl" bold={true} style={{ marginBottom: 20 }}>
        StringShare
      </Heading>
      {/* Input field for full name */}
      <Input
        variant="rounded"
        size="md"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        style={globalStyles.formInput}
      >
        <InputField
          placeholder="Full Name"
          value={fullName}
          onChangeText={(val) => setFullName(val)}
        />
      </Input>
      {/* Input field for username */}
      <Input
        variant="rounded"
        size="md"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        style={globalStyles.formInput}
      >
        <InputField
          placeholder="Username"
          value={username}
          onChangeText={(val) => setUsername(val)}
        />
      </Input>
      {/* Input field for password */}
      <Input
        variant="rounded"
        size="md"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        style={globalStyles.formInput}
      >
        <InputField
          placeholder="Password"
          type="password"
          value={password}
          onChangeText={(val) => setPassword(val)}
        />
      </Input>
      {/* Button for initiating the registration process */}
      <Button
        size="md"
        variant="solid"
        action="primary"
        isDisabled={false}
        isFocusVisible={false}
        borderRadius="$full"
        onPress={onRegister}
      >
        <ButtonText>Register </ButtonText>
      </Button>
      {/* Hyperlink for navigating to the sign-in screen */}
      <HStack marginTop={20} marginBottom={20}>
        <Text>Already have an account? </Text>
        <Link onPress={() => router.push("/sign-in")}>
          <LinkText>Sign In</LinkText>
        </Link>
      </HStack>
      {/* YoutubePlayer component for playing a YouTube video */}
      <YoutubePlayer
        height={300}
        flex={1}
        width="100%"
        play={playing}
        videoId={"vPlWDFtP0T0"}
        onChangeState={onStateChange}
      />
    </Center>
  );
};

// Exporting the Register component as the default export
export default Register;
