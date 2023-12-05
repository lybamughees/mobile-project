import { View } from "react-native";
import React, { useState, useEffect } from "react";
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
} from "@gluestack-ui/themed";
import { Search } from "lucide-react-native";
import { router } from "expo-router";
import api from "../../../utils/api";
import { ENDPOINT } from "../../../globals";

// Functional component for the search screen
const SearchScreen = () => {
  // State variables
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  // Fetch initial search results on component mount
  useEffect(() => {
    api.get("/client/search?search_query=").then((res) => {
      setResults(res.data);
    });
  }, []);

  // Function to perform a user search based on the input query
  const searchUser = () => {
    api.get(`/client/search?search_query=${query}`).then((res) => {
      setResults(res.data);
    });
  };

  // Function to follow a user and update the results accordingly
  const followUser = (username) => {
    api.post(`/client/follow?username=${username}`).then(() => {
      const resultsCpy = [...results];
      setResults(
        resultsCpy.map((user) =>
          user.username === username ? { ...user, is_following: true } : user
        )
      );
    });
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Search Input */}
      <Input
        backgroundColor="white"
        borderRadius="$lg"
        style={{ marginBottom: 20 }}
      >
        <InputSlot pl="$3">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField
          placeholder="Search..."
          onChangeText={(val) => setQuery(val)}
          value={query}
          onSubmitEditing={searchUser}
        />
      </Input>

      {/* Display search results */}
      {results.map((result) => {
        return (
          <Box key={`search_result_${result.username}`}>
            {/* User Information */}
            <HStack style={{ marginTop: 20, marginBottom: 20 }} space="md">
              <Box>
                {/* User Avatar */}
                <Avatar bgColor="$primary600" size="md" borderRadius="$full">
                  <AvatarFallbackText>{result.username}</AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: `${ENDPOINT}/client/media/?url=${result.avatar_url}`,
                    }}
                  />
                </Avatar>
              </Box>
              <HStack style={{ justifyContent: "space-between", flex: 1 }}>
                <VStack>
                  {/* Username and Full Name */}
                  <Heading
                    size="xs"
                    onPress={() =>
                      router.push(`/profile?username=${result.username}`)
                    }
                  >
                    {result.username}
                  </Heading>
                  <Text>{result.full_name}</Text>
                </VStack>

                {/* Follow Button */}
                <Button
                  size="md"
                  variant="outline"
                  action={result.is_following ? "secondary" : "primary"}
                  onPress={() => followUser(result.username)}
                  disabled={result.is_following}
                >
                  <ButtonText>
                    {result.is_following ? "Following" : "Follow"}
                  </ButtonText>
                </Button>
              </HStack>
            </HStack>

            {/* Divider between search results */}
            <Divider my="$0.5" />
          </Box>
        );
      })}
    </View>
  );
};

export default SearchScreen;
