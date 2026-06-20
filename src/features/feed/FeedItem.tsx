import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { MediaItem } from "./MediaItem";
import type { FeedPost } from "./types";


interface FeedItemProps {
  post: FeedPost;
  /** Whether this item is currently the visible/focused item in the feed. */
  isActive: boolean;
}

export function FeedItem({ post, isActive }: FeedItemProps): React.JSX.Element {
  const { height } = useWindowDimensions();
  return (
      <View style={[styles.container, { height, width: "100%" }]}>
        <MediaItem post={post} isActive={isActive} />
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111",
    overflow: "hidden",
  },
  captionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  caption: {
    color: "#fff",
    fontSize: 16,
    padding: 16,
  },
});