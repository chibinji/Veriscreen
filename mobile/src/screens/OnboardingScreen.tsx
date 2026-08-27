import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { APP_NAME } from '../constants';
import { colors, radii, spacing } from '../theme';

type Slide = {
  key: string;
  kicker: string;
  title: string;
  body: string;
  image: ImageSourcePropType;
  icon: keyof typeof Ionicons.glyphMap;
};

const SLIDES: Slide[] = [
  {
    key: 'verify',
    kicker: 'Official records',
    title: 'Verify every document',
    body: 'Identity, registration, and academic papers — confirmed against the university source of truth.',
    image: require('../../assets/onboarding/verify-documents.jpg'),
    icon: 'id-card-outline',
  },
  {
    key: 'screen',
    kicker: 'Trusted screening',
    title: 'Screened for authenticity',
    body: 'Every slip is matched to live university data so institutions can trust what they receive.',
    image: require('../../assets/onboarding/screen-authenticity.jpg'),
    icon: 'search-outline',
  },
  {
    key: 'ready',
    kicker: 'Ready to share',
    title: 'Verified. Then issued.',
    body: 'Sign in to preview confirmation slips, examination documents, and results with a unique VeriScreen ID.',
    image: require('../../assets/onboarding/check-records.jpg'),
    icon: 'shield-checkmark-outline',
  },
];

const FOOTER_CONTENT = 108;
const PANEL_OVERLAP = 28;

interface Props {
  onFinished: () => void;
}

export default function OnboardingScreen({ onFinished }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  const last = index === SLIDES.length - 1;
  const compact = height < 700;
  const footerPad = Math.max(insets.bottom, 12);
  const pageHeight = listHeight || Math.max(height - FOOTER_CONTENT - footerPad, 1);
  const heroHeight = Math.round(pageHeight * (compact ? 0.5 : 0.56));

  const onMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex(Math.max(0, Math.min(next, SLIDES.length - 1)));
    },
    [width]
  );

  const goNext = () => {
    if (last) {
      onFinished();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={SLIDES}
        extraData={width}
        key={width}
        style={styles.list}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.height);
          if (next > 0 && next !== listHeight) setListHeight(next);
        }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScrollToIndexFailed={({ index: failed }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({ index: failed, animated: true });
          });
        }}
        renderItem={({ item }) => (
          <View style={[styles.page, { width, height: pageHeight }]}>
            <View style={[styles.hero, { height: heroHeight }]}>
              <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
              <View style={styles.heroShade} />
              <View style={[styles.heroTopFade, { height: insets.top + 64 }]} />
              <View style={[styles.brandBar, { paddingTop: insets.top + 10 }]}>
                <View style={styles.brandChip}>
                  <Ionicons name={item.icon} size={16} color={colors.gold} />
                  <Text style={styles.brandText}>{APP_NAME}</Text>
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.watermark} pointerEvents="none">
                <Ionicons name="shield-checkmark-outline" size={148} color="rgba(44,61,143,0.06)" />
              </View>
              <View style={styles.printRow} pointerEvents="none">
                <Ionicons name="finger-print-outline" size={22} color="rgba(44,61,143,0.12)" />
                <Ionicons name="document-text-outline" size={22} color="rgba(201,162,39,0.28)" />
                <Ionicons name="lock-closed-outline" size={22} color="rgba(44,61,143,0.12)" />
              </View>
              <Text style={styles.kicker}>{item.kicker}</Text>
              <View style={styles.goldRule} />
              <Text style={[styles.title, compact && styles.titleCompact]}>{item.title}</Text>
              <Text style={[styles.body, compact && styles.bodyCompact]}>{item.body}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              style={[styles.dot, i < SLIDES.length - 1 && styles.dotSpacing, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.actions}>
          {last ? (
            <View />
          ) : (
            <Pressable onPress={onFinished} hitSlop={8} accessibilityRole="button" accessibilityLabel="Skip onboarding">
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.cta}
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel={last ? 'Get started' : 'Next slide'}
          >
            <Text style={styles.ctaText}>{last ? 'Get started' : 'Next'}</Text>
            <Ionicons
              name={last ? 'arrow-forward' : 'chevron-forward'}
              size={18}
              color={colors.white}
              style={styles.ctaIcon}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  list: { flex: 1 },
  page: { overflow: 'hidden' },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.navy,
  },
  heroImage: { width: '100%', height: '100%' },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 29, 54, 0.32)',
  },
  heroTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 29, 54, 0.42)',
  },
  brandBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  brandChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 29, 54, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.45)',
    borderRadius: radii.control,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  brandText: {
    color: colors.gold,
    fontWeight: '800',
    letterSpacing: 1.3,
    fontSize: 11,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  panel: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -PANEL_OVERLAP,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -18,
    bottom: -24,
  },
  printRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  kicker: {
    color: colors.gold,
    fontWeight: '800',
    letterSpacing: 1.4,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  goldRule: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginBottom: 12,
  },
  title: {
    color: colors.navy,
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  titleCompact: { fontSize: 24, marginBottom: 8 },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
  },
  bodyCompact: { fontSize: 15, lineHeight: 22 },
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotSpacing: { marginRight: 8 },
  dotActive: {
    width: 22,
    backgroundColor: colors.indigo,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  skip: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 16,
    paddingVertical: 12,
    minWidth: 64,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.indigo,
    borderRadius: radii.control,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    marginLeft: 'auto',
  },
  ctaIcon: { marginLeft: 6 },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
