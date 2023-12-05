// Importing necessary React components and libraries
import React, { useEffect, useRef, useState } from "react";
import PostSection from "../../../components/PostSection"; // Importing a custom PostSection component
import api from "../../../utils/api"; // Importing the api utility for making API requests

// Functional component for the home screen
function HomeScreen() {
  // State to store the list of posts and a function to update the posts
  const [posts, setPosts] = useState([]);

  // useEffect hook to fetch posts from the server when the component mounts
  useEffect(() => {
    api
      .get("/client/posts") // Making a GET request to the server to fetch posts
      .then((response) => {
        // Handle the response data here
        setPosts(response.data); // Update the state with the fetched posts
      })
      .catch((error) => {
        // Handle any errors that occur during the request
        console.error(error);
      });
  }, []); // The empty dependency array ensures that the effect runs only once when the component mounts

  // Render the PostSection component with the fetched posts
  return <PostSection posts={posts} setPosts={setPosts} />;
}

// Exporting the HomeScreen component as the default export
export default HomeScreen;
