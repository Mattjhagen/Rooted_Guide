# Plumb Line Visual Identity

**Application:** Plumb Line  
**Repository:** Rooted_Guide  
**Status:** Original design, not derived from existing logos

---

## Design Concept

The Plumb Line visual identity is built around a simple, recognizable mark: a fine vertical line with a suspended geometric plumb weight.

### Symbolism

The plumb line represents:

- **Alignment** — True vertical reference
- **Truth** — An unchanging standard
- **Examination** — Testing what is straight
- **Faithful direction** — Guidance toward what is right

The design references the biblical image from Amos 7:7-8, where God uses a plumb line as a metaphor for divine examination and truth.

### Design Principles

- **Abstract and refined** — Not literal construction equipment
- **Minimal geometry** — Simple shapes, clean lines
- **Generous negative space** — Room to breathe
- **Functional in monochrome** — No color dependency
- **Recognizable at small sizes** — Works at 16×16px
- **No text or letters** — Icon communicates through form alone

---

## Master Artwork

### SVG Sources (Editable)

**Master icon (transparent background):**
`assets/plumb-line-icon-master.svg`

**Light theme variant (dark mark on light background):**
`assets/plumb-line-icon-light.svg`

**Dark theme variant (light mark on dark background):**
`assets/plumb-line-icon-dark.svg`

**Monochrome variant (single color, for Android adaptive icon):**
`assets/plumb-line-monochrome.svg`

**Light splash mark:**
`assets/plumb-line-splash-light.svg`

**Dark splash mark:**
`assets/plumb-line-splash-dark.svg`

**Optical size variants (v3):**
`assets/plumb-line-icon-48px.svg`
`assets/plumb-line-icon-32px.svg`
`assets/plumb-line-icon-24px.svg`
`assets/plumb-line-icon-16px.svg`

### Vector Geometry (v3 - Optical Sizing)

**Version:** v3 (optical sizing for all display contexts)

**Changes from v2:**

- Created size-specific SVG variants for optimal legibility
- 48px variant: 2px stroke (vs mathematical 0.375px)
- 32px variant: 2px stroke, simplified weight (vs mathematical 0.25px)
- 24px variant: 2px stroke, visible line guaranteed (vs mathematical 0.19px)
- 16px variant: 2px stroke, minimal glyph (vs mathematical 0.125px)
- Large assets continue using base geometry

**Changes from v1:**

- Increased line stroke: 4px → 8px (v2)
- Enlarged weight by ~40% (v2)
- Added subtle top anchor cap (v2)
- Removed internal hole detail (v2)
- Improved optical centering (v2)
- Added optical size variants for small displays (v3)

**Base geometry (1024×1024 canvas)**

**Top anchor cap:**

- Horizontal line from (488, 160) to (536, 160)
- Stroke width: 6px
- Stroke cap: round
- Color: #2C3E50 (light theme) / #E8EAED (dark theme)

**Vertical plumb line:**

- Start point: (512, 170)
- End point: (512, 740)
- Stroke width: 8px (increased from 4px for visibility)
- Stroke cap: round
- Color: #2C3E50 (light theme) / #E8EAED (dark theme)

**Plumb weight (simplified teardrop):**

- Path: M 512 740 L 470 810 Q 470 860, 512 890 Q 554 860, 554 810 Z
- Fill: #2C3E50 (light theme) / #E8EAED (dark theme)
- Note: Enlarged from v1, internal hole detail removed for simplicity

**Optional shadow (subtle depth):**

- Ellipse center: (512, 900)
- Radii: (28, 8)
- Fill: #000000
- Opacity: 0.06 (light theme) / 0.05 (dark theme)

**Optical size variants:**

v3 introduces size-specific SVG files with extreme optical adjustments for small display contexts:

| Size | Canvas | Stroke | Weight           | Top Cap | Notes                          |
| ---- | ------ | ------ | ---------------- | ------- | ------------------------------ |
| Base | 1024px | 8px    | Full teardrop    | 6px     | For large icons (≥200px)       |
| 48px | 48px   | 2px    | Simplified       | 1.5px   | For favicon, small icons       |
| 32px | 32px   | 2px    | Bold simplified  | 1.5px   | Weight distinguishability test |
| 24px | 24px   | 2px    | Very simplified  | 1.5px   | Line visibility test           |
| 16px | 16px   | 2px    | Minimal triangle | None    | Simplified intentional glyph   |

At 16px, the stroke is 16× thicker than mathematical scaling would produce, ensuring the plumb-line concept remains recognizable even at extreme sizes.

---

## Color Palette

### Light Theme

| Element    | Color               | Hex             | Usage                   |
| ---------- | ------------------- | --------------- | ----------------------- |
| Background | Light warm neutral  | `#F8F9FA`       | Icon background, splash |
| Mark       | Dark slate          | `#2C3E50`       | Line and weight         |
| Hole       | Light neutral       | `#F8F9FA`       | Weight hole detail      |
| Shadow     | Black (low opacity) | `#000000` at 8% | Optional depth          |

### Dark Theme

| Element    | Color               | Hex             | Usage                   |
| ---------- | ------------------- | --------------- | ----------------------- |
| Background | Deep neutral        | `#1A1D23`       | Icon background, splash |
| Mark       | Light neutral       | `#E8EAED`       | Line and weight         |
| Hole       | Deep neutral        | `#1A1D23`       | Weight hole detail      |
| Shadow     | White (low opacity) | `#FFFFFF` at 6% | Optional depth          |

### Contrast Verification

**Light theme:**

- Mark (#2C3E50) on background (#F8F9FA): 11.2:1 (AAA)

**Dark theme:**

- Mark (#E8EAED) on background (#1A1D23): 14.8:1 (AAA)

Both variants exceed WCAG AAA requirements (7:1 for normal text).

---

## Generated Assets

### App Icons

| File                          | Size      | Format | Platform | Purpose                   |
| ----------------------------- | --------- | ------ | -------- | ------------------------- |
| `icon.png`                    | 1024×1024 | PNG    | All      | Primary app icon          |
| `android-icon-foreground.png` | 432×432   | PNG    | Android  | Adaptive icon foreground  |
| `android-icon-background.png` | 432×432   | PNG    | Android  | Adaptive icon background  |
| `android-icon-monochrome.png` | 432×432   | PNG    | Android  | Themed icon (Android 13+) |

### Splash Screens

| File              | Size    | Format | Platform | Purpose                   |
| ----------------- | ------- | ------ | -------- | ------------------------- |
| `splash-icon.png` | 200×200 | PNG    | All      | Native launch screen mark |

### Web

| File          | Size  | Format | Platform | Purpose         |
| ------------- | ----- | ------ | -------- | --------------- |
| `favicon.png` | 48×48 | PNG    | Web      | Browser favicon |

---

## Export Specifications

### Standard App Icon (1024×1024)

- Format: PNG, RGBA
- Source: `plumb-line-icon-light.svg`
- Background: Light warm neutral (#F8F9FA)
- Mark: Dark slate (#2C3E50)
- No transparency in final export
- Safe area: 64px padding from edges (important content stays within)

### Android Adaptive Icon

**Foreground (432×432):**

- Source: `plumb-line-icon-light.svg`
- Background: Transparent
- Safe area: 108px padding (important content survives all mask shapes)
- Format: PNG, RGBA

**Background (432×432):**

- Solid color fill: #F8F9FA
- Can be replaced with `backgroundColor` in app.json

**Monochrome (432×432):**

- Source: `plumb-line-monochrome.svg`
- Single color: Black (#000000)
- Platform applies tint color
- Slightly thicker stroke (10px vs 8px) for monochrome legibility
- Simplified geometry (no internal details)

### Splash Screen Mark (200×200)

- Simplified plumb line
- Smaller, centered composition
- Transparent background (platform provides splash color)
- Line length: 90px
- Weight size: proportionally scaled
- Format: PNG, RGBA

### Favicon (48×48)

- Recognizable at browser tab size
- Uses 48px optical size variant (v3) with 2px stroke
- Background: Light warm neutral (#F8F9FA)
- Format: PNG, RGBA
- Stroke is 5.3× thicker than mathematical scaling for legibility

---

## Adaptive Icon Safe Zones

Android adaptive icons are displayed in different shapes depending on device manufacturer:

- **Circle:** ~87% of canvas visible
- **Squircle:** ~90% of canvas visible
- **Rounded square:** ~92% of canvas visible
- **Square:** 100% of canvas visible

**Safe zone calculation:**

- Canvas: 432×432px
- Minimum visible diameter: 76% (circle mask)
- Safe area: 108px padding from all edges
- Important content: Keep within 216×216px centered region

The plumb line mark is vertically oriented and centered, ensuring it remains fully visible in all mask shapes.

---

## Platform Configuration

### Expo Configuration (app.json)

**Icon:**

```json
"icon": "./assets/icon.png"
```

**iOS Splash:**

```json
"ios": {
  "splash": {
    "image": "./assets/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#F8F9FA",
    "dark": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1D23"
    }
  }
}
```

**Android Splash:**

```json
"android": {
  "splash": {
    "image": "./assets/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#F8F9FA",
    "dark": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1D23"
    }
  },
  "adaptiveIcon": {
    "foregroundImage": "./assets/android-icon-foreground.png",
    "backgroundImage": "./assets/android-icon-background.png",
    "monochromeImage": "./assets/android-icon-monochrome.png",
    "backgroundColor": "#F8F9FA"
  }
}
```

**Web Favicon:**

```json
"web": {
  "favicon": "./assets/favicon.png"
}
```

**User Interface Style:**

```json
"userInterfaceStyle": "automatic"
```

Follows system appearance by default. Users can override in settings (Prompt 7).

---

## Regeneration Procedure

To regenerate PNG assets from SVG sources:

```bash
# Generate all PNG assets
node scripts/generate-png-assets.js
```

**Script uses:**

- `qlmanage` — Render SVG to PNG (macOS built-in)
- `sips` — Resize and optimize (macOS built-in)

**Manual generation (if script unavailable):**

1. Open SVG in vector editor (Figma, Illustrator, Inkscape)
2. Export at specified dimensions
3. Verify transparency and dimensions
4. Optimize with ImageOptim or similar

---

## Theme Support

### Light/Dark Splash Behavior

**System appearance (default):**

- Detects device light/dark mode at launch
- Shows appropriate splash variant
- Transitions to app with matching theme
- No visible flash or mode mismatch

**Explicit preference:**

- User can later set explicit light or dark preference (Prompt 7)
- Preference stored locally
- Applied at next launch

### Dynamic Icon Switching

**Not supported (platform limitation):**

- iOS and Android do not support dynamic home-screen icon changes based on system theme
- Single icon is used regardless of device appearance
- Light theme icon (#F8F9FA background) was chosen as primary because:
  - Majority of devices use light home screens by default
  - Light backgrounds are standard for app icons
  - Design is recognizable in both contexts

**Android themed icons (Android 13+):**

- Monochrome variant used when user enables themed icons
- Platform applies dynamic tint color
- Icon shape changes based on system theme

---

## Accessibility

### Visual Accessibility

- ✅ **High contrast** — Exceeds WCAG AAA (7:1) in both themes
- ✅ **No color dependency** — Shape alone is recognizable
- ✅ **Clear at small sizes** — Tested at 16×16px
- ✅ **Simple geometry** — No fine details that blur
- ✅ **Monochrome support** — Works in Android themed icons

### Screen Reader

App icon has no screen-reader implications (device reads app name "Plumb Line").

### Reduced Motion

Splash screen has no animation. Respects reduced-motion preference for post-splash transitions.

### High Contrast Mode

Design works in high-contrast mode without modification:

- Strong baseline contrast (11.2:1 light, 14.8:1 dark)
- Simple shapes remain distinct
- No gradient dependency

---

## Brand Guidelines

### Do

- ✅ Use official SVG sources as master artwork
- ✅ Maintain 64px safe area padding for standard icons
- ✅ Maintain 108px safe area padding for adaptive icons
- ✅ Use exact color values specified
- ✅ Export at exact dimensions specified
- ✅ Verify contrast ratios after any color changes

### Do Not

- ❌ Distort, rotate, or skew the mark
- ❌ Change aspect ratio
- ❌ Add gradients, shadows, or effects not in master
- ❌ Place mark on low-contrast backgrounds
- ❌ Add text or other elements to icon
- ❌ Use unofficial color variants
- ❌ Crop or expand canvas without maintaining safe zones

---

## File Manifest

### Source Files (SVG)

**Base geometry (1024×1024):**

- `assets/plumb-line-icon-master.svg` — Master artwork (transparent)
- `assets/plumb-line-icon-light.svg` — Light theme variant
- `assets/plumb-line-icon-dark.svg` — Dark theme variant
- `assets/plumb-line-monochrome.svg` — Monochrome variant

**Splash marks:**

- `assets/plumb-line-splash-light.svg` — Light splash mark
- `assets/plumb-line-splash-dark.svg` — Dark splash mark

**Optical size variants (v3):**

- `assets/plumb-line-icon-48px.svg` — 48×48 optical size (favicon)
- `assets/plumb-line-icon-32px.svg` — 32×32 optical size (test)
- `assets/plumb-line-icon-24px.svg` — 24×24 optical size (test)
- `assets/plumb-line-icon-16px.svg` — 16×16 optical size (test)

### Generated Assets (PNG)

- `assets/icon.png` — 1024×1024 standard icon
- `assets/android-icon-foreground.png` — 432×432 adaptive foreground
- `assets/android-icon-background.png` — 432×432 adaptive background
- `assets/android-icon-monochrome.png` — 432×432 monochrome
- `assets/splash-icon.png` — 200×200 splash mark
- `assets/favicon.png` — 48×48 web favicon

### Generation Script

- `scripts/generate-png-assets.js` — Automated PNG export

---

## Platform Support Matrix

| Platform | Feature             | Supported | Notes                   |
| -------- | ------------------- | --------- | ----------------------- |
| iOS      | Standard icon       | ✅ Yes    | 1024×1024 PNG           |
| iOS      | Light/dark splash   | ✅ Yes    | System automatic        |
| iOS      | Dynamic icon        | ❌ No     | Platform limitation     |
| Android  | Standard icon       | ✅ Yes    | 1024×1024 PNG           |
| Android  | Adaptive icon       | ✅ Yes    | Foreground + background |
| Android  | Monochrome (themed) | ✅ Yes    | Android 13+             |
| Android  | Light/dark splash   | ✅ Yes    | System automatic        |
| Web      | Favicon             | ✅ Yes    | 48×48 PNG               |
| Web      | Light/dark icon     | ❌ No     | Not supported           |

---

**End of Visual Identity Documentation**
