// Importing necessary components from external libraries and files
import React from "react";
import {
  Text,
  Input,
  InputSlot,
  InputIcon,
  InputField,
  HStack,
  Box,
  Avatar,
  AvatarFallbackText,
  VStack,
  Button,
  ButtonText,
  Divider,
  Heading,
  AvatarImage,
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import { router } from "expo-router"; // Importing router from the Expo library for navigation
import { ENDPOINT } from "../globals"; // Importing ENDPOINT constant from a global file

// Functional component for rendering an activity card
const ActivityCard = ({ actionUser, action, postId, avatarUrl }) => {
  // Mapping actions to corresponding messages
  const message = {
    like: "Liked your post",
    comment: "Commented on your post",
    follow: "Followed you",
  };

  return (
    <Box>
      <Box>
        {/* Horizontal stack for layout */}
        <HStack space="md">
          {/* Box for user avatar */}
          <Box>
            {/* Avatar component with a background color, size, and border radius */}
            <Avatar bgColor="$primary600" size="sm" borderRadius="$full">
              {/* Fallback text for accessibility */}
              <AvatarFallbackText>{actionUser}</AvatarFallbackText>
              {/* Avatar image loaded from the specified URL */}
              <AvatarImage
                source={{
                  uri: `${ENDPOINT}/client/media/?url=${avatarUrl}`,
                }}
              />
            </Avatar>
          </Box>
          {/* Horizontal stack with flexible layout */}
          <HStack style={{ flex: 1 }}>
            {/* Vertical stack with flexible layout */}
            <VStack style={{ flex: 1 }}>
              {/* Heading component with a link to user profile on click */}
              <Heading
                size="xs"
                onPress={() => router.push(`/profile?username=${actionUser}`)}
              >
                {actionUser}
              </Heading>
              {/* Text component displaying the action message */}
              <Text>{message[action]}</Text>
              {/* Divider component for visual separation */}
              <Divider my="$0.5" marginTop={20} marginBottom={20} />
            </VStack>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

// Exporting the ActivityCard component as the default export
export default ActivityCard;
