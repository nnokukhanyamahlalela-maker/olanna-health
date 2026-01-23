import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView, VideoPlayer } from 'expo-video';
import { useTheme } from '@/hooks/useTheme';

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_SIZE = Math.min(SCREEN_WIDTH * 0.9, 350);

const videoSource = require('../assets/videos/olanna-logo-animation.mov');

export function AnimatedLogo({ onAnimationComplete }: AnimatedLogoProps) {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  const player = useVideoPlayer(videoSource, (p: VideoPlayer) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (player) {
      const checkStatus = setInterval(() => {
        if (player.status === 'readyToPlay' && player.currentTime > 0) {
          const duration = player.duration || 3;
          const remaining = (duration - player.currentTime) * 1000;
          if (remaining < 500 || player.currentTime >= duration - 0.1) {
            onAnimationComplete?.();
            clearInterval(checkStatus);
          }
        }
      }, 200);

      const fallbackTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 4000);

      return () => {
        clearInterval(checkStatus);
        clearTimeout(fallbackTimer);
      };
    }
  }, [player, onAnimationComplete]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.videoWrapper, { backgroundColor: theme.backgroundRoot }]}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  videoWrapper: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  video: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE * 0.6,
  },
});
