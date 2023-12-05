// Importing necessary components and functions from external libraries and files
import { useState, useEffect } from "react";
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
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import { LogIn } from "lucide-react-native"; // Importing LogIn icon from the Lucide library for the login button
import { useSession } from "../utils/ctx"; // Importing useSession hook from a custom utility file
import globalStyles from "../styles/globalStyles"; // Importing global styles
import { router } from "expo-router"; // Importing router from Expo for navigation

// Functional component for rendering the sign-in screen
export default function SignIn() {
  // Accessing the signIn function from the useSession hook
  const { signIn } = useSession();

  // State variables for managing the username and password input
  const [username, setUsername] = useState("lleece0@stringshare.ca");
  const [password, setPassword] = useState("a");

  // Uncomment the following useEffect block if automatic navigation is needed upon component mount
  // useEffect(() => {
  //   router.replace("/");
  // }, []);

  // Rendering the sign-in form
  return (
    <Center style={globalStyles.formContainer}>
      {/* Application heading */}
      <Heading size="4xl" bold={true} style={{ marginBottom: 20 }}>
        StringShare
      </Heading>
      {/* Input field for the username */}
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
      {/* Input field for the password */}
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
      {/* Button for initiating the login process */}
      <Button
        size="md"
        variant="solid"
        action="primary"
        isDisabled={false}
        isFocusVisible={false}
        borderRadius="$full"
        onPress={() => {
          signIn(username, password);
        }}
      >
        <ButtonText>LogIn </ButtonText>
        {/* LogIn icon */}
        <ButtonIcon as={LogIn} />
      </Button>
      {/* Hyperlink for navigating to the registration screen */}
      <HStack marginTop={20}>
        <Text>Don't have an account? </Text>
        <Link onPress={() => router.push("/register")}>
          <LinkText>Register</LinkText>
        </Link>
      </HStack>
    </Center>
  );
}
