// Importing necessary components and functions from external libraries and files
import React from "react";
import {
  Text,
  HStack,
  Box,
  Avatar,
  AvatarFallbackText,
  VStack,
  Divider,
  Heading,
  AvatarImage,
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import { router } from "expo-router"; // Importing router from Expo for navigation
import { ENDPOINT } from "../globals"; // Importing ENDPOINT constant from a global file

// Functional component for rendering a comment
const Comment = ({ comment }) => {
  return (
    <Box>
      {/* Horizontal stack for displaying the comment */}
      <HStack style={{ marginTop: 20, marginBottom: 20 }} space="md">
        {/* Box for user avatar */}
        <Box>
          {/* Avatar component with background color, size, and border radius */}
          <Avatar bgColor="$primary600" size="md" borderRadius="$full">
            {/* Fallback text for accessibility */}
            <AvatarFallbackText>{comment.username}</AvatarFallbackText>
            {/* Avatar image */}
            <AvatarImage
              source={{
                uri: `${ENDPOINT}/client/media/?url=${comment.avatar_url}`,
              }}
            />
          </Avatar>
        </Box>
        {/* Horizontal stack for comment details */}
        <HStack style={{ flex: 1 }}>
          {/* Vertical stack for comment details */}
          <VStack>
            {/* Heading for comment username with navigation to the user profile */}
            <Heading
              size="xs"
              onPress={() =>
                router.push(`/profile?username=${comment.username}`)
              }
            >
              {comment.username}
            </Heading>
            {/* Text for comment content */}
            <Text>{comment.content}</Text>
          </VStack>
        </HStack>
      </HStack>
      {/* Divider for separating comments */}
      <Divider my="$0.5" />
    </Box>
  );
};

// Exporting the Comment component as the default export
export default Comment;
