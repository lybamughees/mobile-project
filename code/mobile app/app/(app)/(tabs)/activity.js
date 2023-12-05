// Importing necessary React components and libraries
import React, { useState, useEffect } from "react";
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
  Text,
} from "@gluestack-ui/themed"; // Importing UI components from a theme library
import ActivityCard from "../../../components/ActivityCard"; // Importing a custom ActivityCard component
import { ScrollView } from "react-native"; // Importing ScrollView for scrolling functionality
import api from "../../../utils/api"; // Importing the api utility for making API requests

// Functional component for the activity screen
const ActivityScreen = () => {
  // State to store the list of activities
  const [activities, setActivities] = useState([]);

  // useEffect hook to fetch activities from the server when the component mounts
  useEffect(() => {
    api.get("/client/activity").then((res) => {
      // Update the state with the fetched activities
      setActivities(res.data);
    });
  }, []); // The empty dependency array ensures that the effect runs only once when the component mounts

  // Render the activity screen
  return (
    <Box margin={20} height="100%">
      {activities.length > 0 ? ( // Check if there are activities to display
        <ScrollView style={{ flex: 1 }}>
          {activities.map((activity, index) => {
            return (
              // Render an ActivityCard component for each activity
              <ActivityCard
                key={`activity_${index}`}
                actionUser={activity.action_user}
                action={activity.action}
                postId={activity.post_id}
                avatarUrl={activity.avatar_url}
              />
            );
          })}
        </ScrollView>
      ) : (
        // Display a message when there are no activities
        <Text>No Activities</Text>
      )}
    </Box>
  );
};

// Exporting the ActivityScreen component as the default export
export default ActivityScreen;
