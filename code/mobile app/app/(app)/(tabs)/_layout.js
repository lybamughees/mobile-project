import React from "react";
import { Tabs } from "expo-router";
import { User2, Search, Home, PlusCircle, Heart, PenSquare } from "lucide-react-native";
import { ButtonIcon, Button, Box, Heading } from "@gluestack-ui/themed";

// Functional component defining the bottom navigation bar
export default () => {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false }}>
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: "StringShare",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          headerTitle: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      {/* Post Tab */}
      <Tabs.Screen
        name="post"
        options={{
          headerTitle: "Create a post",
          tabBarIcon: ({ color, size }) => <PenSquare color={color} size={size} />,
        }}
      />
      {/* Activity Tab */}
      <Tabs.Screen
        name="activity"
        options={{
          headerTitle: "Activity",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      {/* Account Tab */}
      <Tabs.Screen
        name="account"
        options={{
          headerTitle: "Account",
          tabBarIcon: ({ color, size }) => <User2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
};
