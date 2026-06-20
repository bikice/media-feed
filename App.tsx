import React from "react";
import { StyleSheet } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Feed } from "@/features/feed/Feed";

export default function App(): React.JSX.Element {
  return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <Feed />
        </SafeAreaView>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
});