// ─────────────────────────────────────────────────────────
//  src/components/BannerSlider.tsx
//  Auto-scrolling banner carousel – external links
// ─────────────────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import {
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

export const BANNER_HEIGHT = 180;
const { width } = Dimensions.get('window');

interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
}

/* helper: ensure URL has scheme */
const normalizeURL = (raw = '') => {
  let url = raw.trim();
  if (!url) return '';
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = `https://${url}`;
  try { return encodeURI(new URL(url).toString()); } catch { return ''; }
};

export default function BannerSlider({ banners = [] }: { banners: Banner[] }) {
  const ref         = useRef<FlatList<Banner>>(null);
  const indexRef    = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ---- auto-advance every 4 s ---- */
  useEffect(() => {
    if (!banners.length) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % banners.length;
      ref.current?.scrollToIndex({
        index: indexRef.current,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(intervalRef.current!);
  }, [banners.length]);

  /* ---- keep indexRef in sync with manual swipes ---- */
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = newIndex;
  };

  /* ---- open link ---- */
  const openLink = (raw?: string) => {
    const url = normalizeURL(raw);
    if (!url) return;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to open link:\n' + url),
    );
  };

  /* ---- layout helper for scrollToIndex ---- */
  const getItemLayout = (_: any, i: number) => ({
    length: width,
    offset: width * i,
    index : i,
  });

  return (
    <FlatList
      ref={ref}
      data={banners}
      horizontal
      pagingEnabled
      snapToInterval={width}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      keyExtractor={(b) => b.id}
      getItemLayout={getItemLayout}
      onMomentumScrollEnd={onMomentumEnd}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={() => openLink(item.link)}>
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width, height: BANNER_HEIGHT }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    />
  );
}
