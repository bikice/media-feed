import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import type { FeedPost } from "./types";

interface MediaItemProps {
  post: FeedPost;
  isActive: boolean;
  style?: ViewStyle;
}

/**
 * Web variant of MediaItem (resolved automatically by Vite/Metro for web builds).
 *
 * - image/gif -> plain <img>, browsers decode animated GIF/WebP natively.
 * - video (mp4/webm) -> plain <video>, browsers play these natively.
 * - hls (.m3u8) -> <video> + hls.js, since no major desktop browser
 *   (Chrome/Firefox/Edge) supports HLS natively. Safari is the exception
 *   (native HLS via canPlayType), so we skip hls.js there and let the
 *   <video> tag handle it directly.
 */
export function MediaItem({ post, isActive, style }: MediaItemProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);

  // Set up / tear down HLS playback.
  useEffect(() => {
    if (post.mediaType !== "hls") return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const canPlayNativeHls =
      videoEl.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (canPlayNativeHls) {
      // Safari / WebKit: native HLS support, no library needed.
      videoEl.src = post.mediaUrl;
      return;
    }

    let cancelled = false;

    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(post.mediaUrl);
        hls.attachMedia(videoEl);
        hlsRef.current = hls;
      }
    });

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [post.mediaType, post.mediaUrl]);

  // Play/pause based on active state for both plain video and HLS.
  useEffect(() => {
    if (post.mediaType !== "video" && post.mediaType !== "hls") return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      videoEl.play().catch(() => {
        // Autoplay can be blocked until user interaction; ignore.
      });
    } else {
      videoEl.pause();
    }
  }, [isActive, post.mediaType]);

  if (post.mediaType === "image" || post.mediaType === "gif") {
    return (
      <View style={[styles.fill, style]}>
        <img
          src={post.mediaUrl}
          alt={post.caption}
          style={webFillStyle}
        />
      </View>
    );
  }

  // "video" (mp4/webm): set src directly, browser handles it natively.
  const directSrc = post.mediaType === "video" ? post.mediaUrl : undefined;

  return (
    <View style={[styles.fill, style]}>
      <video
        ref={videoRef}
        src={directSrc}
        loop
        muted={false}
        playsInline
        style={webFillStyle}
      />
    </View>
  );
}

const webFillStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const styles = StyleSheet.create({
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});