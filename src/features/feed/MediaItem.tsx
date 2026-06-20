import React, { useRef, useEffect } from "react";
import { Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from "react-native";
import Video, { VideoRef } from "react-native-video";
import type { FeedPost } from "./types";

interface MediaItemProps {
    post: FeedPost;
    /** Whether this item is the currently visible/focused item in the feed. */
    isActive: boolean;
    style?: StyleProp<ViewStyle | ImageStyle>;
}

/**
 * Renders a single feed media item (image, gif, mp4/webm video, or HLS stream).
 *
 * Native (iOS / Android / Fire TV): images and gifs use RN's <Image>,
 * which natively decodes animated GIFs. Video and HLS both go through
 * react-native-video — AVPlayer (iOS/tvOS) and ExoPlayer (Android/FireTV)
 * both support HLS playback directly, no extra library needed.
 */
export function MediaItem({ post, isActive, style }: MediaItemProps): React.JSX.Element {
    const videoRef = useRef<VideoRef>(null);

    useEffect(() => {
        if (!isActive) {
            videoRef.current?.pause();
        }
    }, [isActive]);

    if (post.mediaType === "image" || post.mediaType === "gif") {
        return (
            <Image
                source={{ uri: post.mediaUrl }}
                style={[styles.fill, style as StyleProp<ImageStyle>, { width: "100%", height: "100%" }]}
                resizeMode="contain"
            />
        );
    }

    // "video" (mp4/webm) and "hls" (.m3u8) both play through react-native-video.
    return (
        <Video
            ref={videoRef}
            source={{ uri: post.mediaUrl }}
            style={[styles.fill, style as StyleProp<ViewStyle>, { width: "100%", height: "100%" }]}
            resizeMode="contain"
            repeat
            paused={!isActive}
            muted={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="obey"
        />
    );
}

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
});