// Importing necessary components from external libraries and files
import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router"; // Importing router-related components from Expo
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
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import PostSection from "../../components/PostSection"; // Importing a custom PostSection component
import api from "../../utils/api"; // Importing utility functions for API calls

// Functional component for rendering a user profile
const Profile = () => {
  // Accessing local search parameters using the useLocalSearchParams hook
  const local = useLocalSearchParams();
  const username = local.username;

  // State to store user information retrieved from the API
  const [userInfo, setUserInfo] = useState(null);

  // Fetching user information from the API when the component mounts or when the username changes
  useEffect(() => {
    api
      .get(`/client/users?username=${username}`)
      .then((res) => {
        setUserInfo(res.data);
      })
      .catch((err) => console.error(err));
  }, [username]);

  // Rendering the user profile if user information is available
  return (
    <>
      {userInfo && (
        <Box>
          {/* Screen title */}
          <Stack.Screen options={{ headerTitle: "Profile" }} />

          {/* Horizontal stack for user details */}
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
            {/* Vertical stack for user name and username */}
            <VStack>
              <Heading size="xl">{userInfo.full_name}</Heading>
              <Text>{userInfo.username}</Text>
            </VStack>
            {/* Avatar component with background color, size, and border radius */}
            <Avatar bgColor="$primary600" size="xl" borderRadius="$full">
              {/* Fallback text for accessibility */}
              <AvatarFallbackText>{userInfo.username}</AvatarFallbackText>
            </Avatar>
          </HStack>

          {/* Vertical stack for user posts */}
          <VStack>
            {/* Heading for the posts section */}
            <Heading size="lg" marginLeft={10}>
              Posts
            </Heading>
            {/* Custom PostSection component displaying user posts */}
            <PostSection posts={userInfo.posts} />
          </VStack>
        </Box>
      )}
    </>
  );
};

// Exporting the Profile component as the default export
export default Profile;
