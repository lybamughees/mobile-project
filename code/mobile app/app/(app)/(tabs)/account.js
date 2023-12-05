// Importing necessary React Native components and libraries
import { View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { useSession } from "../../../utils/ctx"; // Importing the useSession hook for managing user sessions
import {
  Center,
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonIcon,
  Heading,
  Badge,
  BadgeText,
  HStack,
  Box,
  Textarea,
  TextareaInput,
  InputSlot,
  InputIcon,
  VStack,
  Image,
  Avatar,
  AvatarFallbackText,
  Divider,
} from "@gluestack-ui/themed"; // Importing UI components from a theme library
import PostSection from "../../../components/PostSection"; // Importing the custom PostSection component
import api from "../../../utils/api"; // Importing the api utility for making API requests

// Functional component for the account screen
const AccountScreen = () => {
  const { signOut } = useSession(); // Destructuring the signOut function from the useSession hook
  const [userInfo, setUserInfo] = useState(null); // State to store user information

  // useEffect hook to fetch user information from the server when the component mounts
  useEffect(() => {
    api
      .get(`/client/me`)
      .then((res) => {
        // Update the state with the fetched user information
        setUserInfo(res.data);
      })
      .catch((err) => console.error(err)); // Log any errors that occur during the API request
  }, []);

  // Render the account screen
  return (
    <>
      <Box>
        <HStack
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            marginTop: 40,
            marginLeft: 10,
            marginRight: 10,
          }}
        >
          {/* Displaying user information such as name and username */}
          <VStack>
            <Heading size="xl">{userInfo?.full_name}</Heading>
            <Text>{userInfo?.username}</Text>
          </VStack>
          {/* Displaying user avatar */}
          <Avatar bgColor="$primary600" size="xl" borderRadius="$full">
            <AvatarFallbackText>{userInfo?.username}</AvatarFallbackText>
          </Avatar>
        </HStack>

        {/* Buttons for editing profile and signing out */}
        <HStack space="md" marginBottom={40} marginLeft={10} marginRight={10}>
          <Button variant="outline" action="primary" flex={1}>
            <ButtonText>Edit Profile</ButtonText>
          </Button>
          <Button
            variant="outline"
            action="negative"
            flex={1}
            onPress={() => {
              // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
              signOut(); // Calling the signOut function to sign out the user
            }}
          >
            <ButtonText>Sign Out</ButtonText>
          </Button>
        </HStack>

        {/* Displaying user's posts */}
        <VStack>
          <Heading size="lg" marginLeft={10}>
            Posts
          </Heading>
          {userInfo && <PostSection posts={userInfo?.posts} />}
        </VStack>
      </Box>
    </>
  );
};

// Exporting the AccountScreen component as the default export
export default AccountScreen;
