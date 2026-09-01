import React from 'react';
import { Text, StyleSheet, ColorValue } from 'react-native';

/**
 * Fallback icons using unicode/text
 *
 * Used when lucide-react-native SVG icons can't render
 * (requires react-native-svg native module).
 */

interface IconProps {
  size?: number;
  color?: ColorValue;
}

export function HomeIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Home icon">
      🏠
    </Text>
  );
}

export function BookIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Book icon">
      📖
    </Text>
  );
}

export function BookmarkIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Bookmark icon">
      🔖
    </Text>
  );
}

export function ChevronLeftIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Previous">
      ‹
    </Text>
  );
}

export function ChevronRightIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Next">
      ›
    </Text>
  );
}

export function BookOpenIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Browse books">
      📚
    </Text>
  );
}

export function SearchIcon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]} accessibilityLabel="Search">
      🔍
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
