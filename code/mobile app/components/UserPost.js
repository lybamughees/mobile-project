// Importing necessary components and functions from external libraries and files
import {
  Box,
  Text,
  Avatar,
  AvatarFallbackText,
  HStack,
  VStack,
  Heading,
  Button,
  ButtonIcon,
  Divider,
  Link,
  Image,
  LinkText,
  AvatarImage,
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react-native"; // Importing icons from the Lucide library
import { reverseGeocodeAsync } from "expo-location"; // Importing reverseGeocodeAsync function from Expo for reverse geocoding
import { router } from "expo-router"; // Importing router from Expo for navigation
import api from "../utils/api"; // Importing utility functions for API calls
import { ENDPOINT } from "../globals"; // Importing ENDPOINT constant from a global file
import React, { useEffect, useRef, useState } from "react"; // Importing necessary components and hooks

// Functional component for rendering a user post
const UserPost = ({ post, openBottomSheet, setCurrentPost, updatePosts }) => {
  // Colors for heart icon based on post like status
  const likeColor = "$rose500";
  const unlikeColor = "$primary300";

  // State variables for managing current address, heart icon color, and number of likes
  const [currentAddress, setCurrentAddress] = useState(null);
  const [heartColor, setHeartColor] = useState(post.liked ? likeColor : unlikeColor);
  const [likes, setLikes] = useState(post.likes);

  // useEffect hook for reverse geocoding when the component mounts
  useEffect(() => {
    if (post) {
      const reverseGeocode = async () => {
        const reverseGeocodedAddress = await reverseGeocodeAsync({
          latitude: parseFloat(post.latitude),
          longitude: parseFloat(post.longitude),
        });
        const { streetNumber, street, city, region, postalCode } = reverseGeocodedAddress[0];
        setCurrentAddress(`${city}, ${region}`);
      };

      reverseGeocode();
    }
  }, []);

  // Function for displaying comments in a bottom sheet
  const displayComments = () => {
    api
      .get(`/client/comments?post_id=${post.post_id}`)
      .then((res) => {
        openBottomSheet(res.data);
        setCurrentPost(post);
      })
      .catch((err) => console.error(err));
  };

  // Function for liking/unliking a post
  const likePost = () => {
    api
      .post(`/client/like?post_id=${post.post_id}`)
      .then((res) => {
        setHeartColor(post.liked ? unlikeColor : likeColor);
        const postCpy = { ...post, liked: !post.liked };
        updatePosts(postCpy);
        setLikes(postCpy.liked ? likes + 1 : likes - 1);
      })
      .catch((err) => console.error(err));
  };

  // Rendering the user post
  return (
    <Box>
      {/* Horizontal stack for post content */}
      <HStack
        style={{
          paddingTop: 40,
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 20,
        }}
        space="md"
      >
        {/* Box for user avatar */}
        <Box>
          {/* Avatar component with background color, size, and border radius */}
          <Avatar bgColor="$primary600" size="md" borderRadius="$full">
            {/* Fallback text for accessibility */}
            <AvatarFallbackText>{post.username}</AvatarFallbackText>
            {/* Avatar image */}
            <AvatarImage
              source={{
                uri: `${ENDPOINT}/client/media/?url=${post.avatar_url}`,
              }}
            />
          </Avatar>
        </Box>

        {/* Box for post content and details */}
        <Box width="$full" style={{ flex: 1 }}>
          {/* Vertical stack for post details */}
          <VStack width="$full">
            {/* Displaying post image if available */}
            {post.image_url != null && (
              <Image
                source={`${ENDPOINT}/client/media/?url=${post.image_url}`}
                size="2xl"
                borderRadius="$md"
                alt="post_image"
                marginBottom={10}
                style={{
                  borderWidth: 1,
                  borderColor: "#737373",
                  backgroundColor: "#DADADA",
                }}
              />
            )}
            {/* Heading for post username with navigation to the user profile */}
            <Heading
              size="xs"
              onPress={() => router.push(`/profile?username=${post.username}`)}
            >
              {post.username}
            </Heading>
            {/* Text for post content */}
            <Text>{post.content}</Text>
            {/* Horizontal stack for like and comment buttons */}
            <HStack space="md">
              {/* Button for liking/unliking a post */}
              <Button variant="link" onPress={likePost}>
                {/* Heart icon with color based on like status */}
                <ButtonIcon as={Heart} color={heartColor} size="xl" />
              </Button>
              {/* Button for displaying comments */}
              <Button variant="link" onPress={displayComments}>
                {/* MessageCircle icon */}
                <ButtonIcon as={MessageCircle} color="$primary300" size="xl" />
              </Button>
            </HStack>
            {/* Horizontal stack for post details */}
            <HStack>
              {/* Text for number of replies and likes */}
              <Text size="sm" color="$secondary300">
                {post.comments} replies · {likes} likes
              </Text>
              {/* Displaying current address with navigation to the map screen */}
              {currentAddress && (
                <HStack>
                  <Text> · </Text>
                  <Link
                    style={{
                      alignItems: "flex-start",
                    }}
                    onPress={() => {
                      router.push(`/map?lat=${post.latitude}&lng=${post.longitude}`);
                    }}
                  >
                    <LinkText size="sm">{currentAddress}</LinkText>
                  </Link>
                </HStack>
              )}
            </HStack>
          </VStack>
        </Box>
      </HStack>
      {/* Divider for separating posts */}
      <Divider my="$0.5" />
    </Box>
  );
};

// Exporting the UserPost component as the default export
export default UserPost;
