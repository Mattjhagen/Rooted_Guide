import React from 'react';
import Svg, { Line, Path, Ellipse, SvgProps } from 'react-native-svg';
import { useTheme } from '@/features/preferences/ThemeContext';

export interface PlumbLineLogoProps extends SvgProps {
  size?: number;
  variant?: 'auto' | 'light' | 'dark';
}

/**
 * PlumbLineLogo
 *
 * Vector SVG Plumb Line logo mark that dynamically adapts its stroke, fill,
 * and shadow colors to match light or dark mode as configured in settings.
 */
export function PlumbLineLogo({ size = 48, variant = 'auto', ...props }: PlumbLineLogoProps) {
  const { resolvedScheme, theme } = useTheme();

  const activeScheme = variant === 'auto' ? resolvedScheme : variant;
  const isDark = activeScheme === 'dark';

  const strokeColor = isDark ? theme.text : theme.text;
  const bobColor = isDark ? theme.primary : theme.primary;
  const shadowColor = isDark ? '#FFFFFF' : '#000000';
  const shadowOpacity = isDark ? 0.08 : 0.08;

  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" {...props}>
      {/* Top anchor cap */}
      <Line
        x1="488"
        y1="160"
        x2="536"
        y2="160"
        stroke={strokeColor}
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Vertical plumb line */}
      <Line
        x1="512"
        y1="170"
        x2="512"
        y2="740"
        stroke={strokeColor}
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Plumb weight / pendulum bob */}
      <Path d="M 512 740 L 460 810 Q 460 865, 512 895 Q 564 865, 564 810 Z" fill={bobColor} />

      {/* Grounded shadow */}
      <Ellipse cx="512" cy="915" rx="36" ry="10" fill={shadowColor} opacity={shadowOpacity} />
    </Svg>
  );
}
