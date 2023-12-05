import React, { useState, useRef, useEffect } from "react";
import {
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonIcon,
  HStack,
  Box,
  Textarea,
  TextareaInput,
  InputSlot,
  InputIcon,
  VStack,
  Image,
  ToastTitle,
  Toast,
  ToastDescription,
  useToast,
} from "@gluestack-ui/themed";
import globalStyles from "../../../styles/globalStyles";
import { MapPin, CameraIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Camera } from "expo-camera";
import { geocodeAsync } from "expo-location";
import { ENDPOINT } from "../../../globals";
import { useSession } from "../../../utils/ctx";
import Empty from "../../../assets/empty.jpg";

// Functional component for the post screen
const PostScreen = () => {
  // Ref for the camera component
  let cameraRef = useRef();
  const toast = useToast();
  const { session } = useSession();

  // State variables
  const [image, setImage] = useState(Empty);
  const [hasCameraPermission, setHasCameraPermission] = useState(undefined);
  const [showCamera, setShowCamera] = useState(false);
  const [postText, setPostText] = useState("Test");
  const [postLocation, setPostLocation] = useState("Toronto, ON");

  // Toast actions for success and error
  const toastActions = {
    success: {
      actionType: "success",
      title: "Success!",
      description: "Your post was created successfully.",
    },
    error: {
      actionType: "error",
      title: "Error!",
      description:
        "There was an error processing your request. Please try again later.",
    },
  };

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
    })();
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // Take a picture using the camera
  const takePicture = async () => {
    let options = {
      quality: 0.5,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setImage(newPhoto);
    setShowCamera(false);
  };

  // Submit the post to the server
  const submitPost = async () => {
    try {
      // Get geocoded location for latitude and longitude
      const geocodedLocation = await geocodeAsync(postLocation);
      const { latitude, longitude } = geocodedLocation[0];

      // Prepare the URL for the post request
      const url = `${ENDPOINT}/client/post?post=${postText}&latitude=${latitude}&longitude=${longitude}`;

      // Upload the image and post data
      await FileSystem.uploadAsync(url, image.uri, {
        fieldName: "photo",
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          Authorization: `Bearer ${session}`,
        },
      });

      // Reset the form after successful submission
      resetForm();

      // Show success toast
      showToast(toastActions.success);
    } catch (error) {
      console.error("Error submitting post:", error);

      // Show error toast
      showToast(toastActions.error);
    }
  };

  // Reset the form
  const resetForm = () => {
    setImage(Empty);
    setPostLocation("");
    setPostText("");
  };

  // Show toast with provided action
  const showToast = (action) => {
    const { actionType, title, description } = action;
    toast.show({
      placement: "bottom",
      render: ({ id }) => {
        return (
          <Toast nativeID={"toast-" + id} action={actionType} variant="solid">
            <VStack space="xs">
              <ToastTitle>{title}</ToastTitle>
              <ToastDescription>{description}</ToastDescription>
            </VStack>
          </Toast>
        );
      },
    });
  };

  return (
    <>
      {showCamera ? (
        // Camera View
        <Camera
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            flexDirection: "column",
          }}
          ref={cameraRef}
        >
          <Button
            action="primary"
            onPress={takePicture}
            borderRadius="$full"
            size="xl"
            marginBottom={20}
          >
            <ButtonIcon as={CameraIcon} />
          </Button>
        </Camera>
      ) : (
        // Post Form View
        <Box style={globalStyles.formContainer}>
          {/* Post Text */}
          <Textarea
            size="md"
            isReadOnly={false}
            isInvalid={false}
            isDisabled={false}
            style={globalStyles.formInput}
          >
            <TextareaInput
              placeholder="Your post goes here..."
              onChangeText={(val) => setPostText(val)}
              value={postText}
            />
          </Textarea>

          {/* Post Location Input */}
          <Input backgroundColor="white" style={globalStyles.formInput}>
            <InputSlot pl="$3">
              <InputIcon as={MapPin} />
            </InputSlot>
            <InputField
              placeholder="Location"
              onChangeText={(val) => setPostLocation(val)}
              value={postLocation}
            />
          </Input>

          {/* Image Selection and Camera Buttons */}
          <VStack
            style={{
              alignItems: "flex-start",
              width: "100%",
              marginBottom: 10,
            }}
            space="md"
          >
            <HStack space="lg">
              {/* Select Image Button */}
              <Button
                size="md"
                variant="outline"
                action="primary"
                isDisabled={false}
                isFocusVisible={false}
                onPress={pickImage}
              >
                <ButtonText>Select Image</ButtonText>
              </Button>

              {/* Show Camera Button if camera permission is granted */}
              {hasCameraPermission && (
                <Button
                  size="md"
                  variant="outline"
                  action="primary"
                  isDisabled={false}
                  isFocusVisible={false}
                  onPress={() => setShowCamera(true)}
                >
                  <ButtonText>Take Picture</ButtonText>
                </Button>
              )}
            </HStack>

            {/* Display selected image */}
            <Image
              size="xl"
              source={
                image.uri
                  ? {
                      uri: image.uri,
                    }
                  : image
              }
              style={{
                borderWidth: 2,
                borderColor: "#737373",
                backgroundColor: "#DADADA",
              }}
              borderRadius="$sm"
              alt="post_img"
            />
          </VStack>

          {/* Submit Post Button */}
          <Button
            size="md"
            width="$64"
            variant="solid"
            action="primary"
            isDisabled={false}
            isFocusVisible={false}
            borderRadius="$full"
            onPress={submitPost}
          >
            <ButtonText>Create Post </ButtonText>
          </Button>
        </Box>
      )}
    </>
  );
};

export default PostScreen;
