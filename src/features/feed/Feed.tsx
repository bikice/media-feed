import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Platform,
  StyleSheet,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import { FeedItem } from "./FeedItem";
import type { FeedPost } from "./types";


const POSTS: FeedPost[] = [
  {
    id: "1",
    mediaType: "gif",
    mediaUrl: "https://i.giphy.com/CaSiGd4onc5WJVJE9k.webp",
    caption: "Animated WebP",
  },
  {
    id: "2",
    mediaType: "gif",
    mediaUrl:
        "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExemQ5dWlodGJ4NnQ4ZHRkNnJ2aGJycWswYXIzcnFnbTBzcDRhdGFtYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G8l8kgNEVRGMl17L5S/giphy.gif",
    caption: "Classic GIF",
  },
  {
    id: "3",
    mediaType: "video",
    mediaUrl: "https://lorem.video/cat_128kbps",
    caption: "MP4 (no extension in URL — mediaType set explicitly)",
  },
  {
    id: "4",
    mediaType: "hls",
    mediaUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    caption: "HLS live stream test",
  },
  {
    id: "5",
    mediaType: "video",
    mediaUrl:
        "https://upload.wikimedia.org/wikipedia/commons/a/a2/Elephants_Dream_%282006%29.webm",
    caption: "WebM video",
  },
];

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 80,
};

export function Feed(): React.JSX.Element {
  const { height: windowHeight } = useWindowDimensions();
  const [activeId, setActiveId] = useState<string | null>(POSTS[0]?.id ?? null);

  const renderItem: ListRenderItem<FeedPost> = useCallback(
      ({ item }) => <FeedItem post={item} isActive={item.id === activeId} />,
      [activeId]
  );

  const getItemLayout = useCallback(
      (_data: ArrayLike<FeedPost> | null | undefined, index: number) => ({
        length: windowHeight,
        offset: windowHeight * index,
        index,
      }),
      [windowHeight]
  );

  const flatListRef = useRef<FlatList<FeedPost>>(null);
  const currentIndexRef = useRef(0);
  const scrollingRef = useRef(false);

  const onViewableItemsChanged = useCallback(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const firstVisible = viewableItems[0];
        if (firstVisible?.item) {
          setActiveId((firstVisible.item as FeedPost).id);
          currentIndexRef.current = firstVisible.index ?? 0;
          scrollingRef.current = false;
        }
      },
      []
  );

  const viewabilityConfig = useRef(VIEWABILITY_CONFIG).current;

  const scrollToDirection = useCallback((direction: number) => {
    if (scrollingRef.current) return;
    const nextIndex = currentIndexRef.current + direction;
    if (nextIndex < 0 || nextIndex >= POSTS.length) return;
    scrollingRef.current = true;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, []);

  // Web: handle mouse wheel, keyboard, and touch swipe to scroll between items
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined" || !window.addEventListener) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (direction !== 0) scrollToDirection(direction);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToDirection(1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToDirection(-1);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        scrollToDirection(deltaY > 0 ? 1 : -1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scrollToDirection]);

  return (
      <View style={[styles.container, { height: windowHeight }]}>
        <FlatList
            ref={flatListRef}
            data={POSTS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={getItemLayout}
            windowSize={3}
            removeClippedSubviews
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});