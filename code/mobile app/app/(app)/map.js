// Importing necessary components from external libraries and files
import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router"; // Importing router-related components from Expo
import MapView, { Marker, Callout, CalloutSubview } from "react-native-maps"; // Importing MapView components for displaying maps
import { Button, ButtonText } from "@gluestack-ui/themed"; // Importing UI components from the GlueStack UI library
import { Linking } from "react-native"; // Importing Linking for opening external links

// Functional component for rendering a map with a marker
const Map = () => {
  // Accessing local search parameters using the useLocalSearchParams hook
  const local = useLocalSearchParams();
  const latitude = parseFloat(local.lat);
  const longitude = parseFloat(local.lng);

  // State to store the map reference
  const [mapRef, setMapRef] = useState(null);

  // Adjusting the map to fit the marker coordinates when the map reference is available
  useEffect(() => {
    if (mapRef)
      mapRef.fitToCoordinates([
        {
          latitude: latitude,
          longitude: longitude,
        },
      ]);
  }, [mapRef]);

  // Rendering the map and marker
  return (
    <View style={{ flex: 1 }}>
      {/* Screen title */}
      <Stack.Screen options={{ headerTitle: "Map" }} />

      {/* MapView component for displaying the map */}
      <MapView
        style={{ flex: 1 }}
        showsUserLocation={true}
        ref={(ref) => {
          setMapRef(ref);
        }}
      >
        {/* Marker component with a callout */}
        <Marker
          key={1}
          coordinate={{ latitude, longitude }}
          title="Cool pin"
          description="A description"
        >
          {/* Callout component with a subview containing a button for directions */}
          <Callout>
            <CalloutSubview
              onPress={() => {
                // Opening the device's maps app for directions using Linking
                Linking.openURL(
                  `maps://0,0?q=Directions@${latitude},${longitude}`
                );
              }}
            >
              {/* Button component for displaying directions */}
              <Button variant="link">
                <ButtonText>Directions</ButtonText>
              </Button>
            </CalloutSubview>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
};

// Exporting the Map component as the default export
export default Map;
