// Importing necessary components and functions from external libraries and files
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Heading,
  Box,
  Input,
  InputField,
  HStack,
  Button,
  ButtonIcon,
} from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"; // Importing BottomSheet and BottomSheetView components from the BottomSheet library
import Comment from "./Comment"; // Importing Comment component
import UserPost from "./UserPost"; // Importing UserPost component
import { SendHorizontal } from "lucide-react-native"; // Importing SendHorizontal icon from the Lucide library
import { ScrollView } from "react-native"; // Importing ScrollView component from React Native
import api from "../utils/api"; // Importing utility functions for API calls

// Functional component for rendering a section of user posts
const PostSection = ({ posts, setPosts }) => {
  // State variables for managing comments, current post, and new comment input
  const [comments, setComments] = useState([]);
  const [currentPost, setCurrentPost] = useState({});
  const [newComment, setNewComment] = useState("");
  const snapPoints = ["50%", "80"]; // Snap points for the BottomSheet
  const sheetRef = useRef(null); // Ref for the BottomSheet component

  // Function for opening the BottomSheet with comments
  const openBottomSheet = (comments) => {
    setComments(comments);
    sheetRef.current.snapToIndex(1);
  };

  // useEffect hook for closing the BottomSheet when the component mounts
  useEffect(() => {
    sheetRef?.current.close();
  }, [sheetRef]);

  // Function for posting a new comment
  const postComment = async () => {
    try {
      await api.post("/client/comment", {
        post_id: currentPost.post_id,
        content: newComment,
      });
      const updatedComments = await api.get(
        `/client/comments?post_id=${currentPost.post_id}`
      );

      setComments(updatedComments.data);
      setNewComment("");
      updatePosts({ ...currentPost, comments: currentPost.comments + 1 });
    } catch (error) {
      console.error(error);
    }
  };

  // Function for updating the list of posts with the modified post
  const updatePosts = (post) => {
    const postsCpy = [...posts];
    setPosts(
      postsCpy.map((curPost) =>
        curPost.post_id === post.post_id ? post : curPost
      )
    );
  };

  // Rendering the PostSection component
  return (
    <Box style={{ height: "100%" }}>
      {/* ScrollView for displaying user posts */}
      <ScrollView style={{ flex: 1 }}>
        {/* Mapping over the posts and rendering UserPost component for each post */}
        {posts.map((post) => {
          return (
            <UserPost
              key={post.post_id}
              post={post}
              openBottomSheet={openBottomSheet}
              setCurrentPost={setCurrentPost}
              updatePosts={updatePosts}
            />
          );
        })}
      </ScrollView>

      {/* BottomSheet component for displaying comments */}
      <BottomSheet
        snapPoints={snapPoints}
        ref={sheetRef}
        enablePanDownToClose={true}
        index={-1}
        style={{ position: "absolute" }}
      >
        {/* BottomSheetView for the content of the BottomSheet */}
        <BottomSheetView style={{ flex: 1, paddingLeft: 20, paddingRight: 20 }}>
          {/* Heading for the comments section */}
          <Heading size="md">Comments</Heading>
          {/* Horizontal stack for input field and send button */}
          <HStack style={{ alignItems: "flex-end" }} space="md">
            {/* Input field for entering a new comment */}
            <Input variant="rounded" size="md" marginTop={10} flex={1}>
              <InputField
                placeholder="Add your comment here..."
                value={newComment}
                onChangeText={(val) => setNewComment(val)}
              />
            </Input>
            {/* Button for posting a new comment */}
            <Button
              borderRadius="$full"
              onPress={postComment}
              disabled={newComment.length == 0}
            >
              {/* SendHorizontal icon */}
              <ButtonIcon as={SendHorizontal} />
            </Button>
          </HStack>

          {/* Mapping over the comments and rendering Comment component for each comment */}
          {comments?.map((comment) => {
            return <Comment key={comment.comment_id} comment={comment} />;
          })}
        </BottomSheetView>
      </BottomSheet>
    </Box>
  );
};

// Exporting the PostSection component as the default export
export default PostSection;
