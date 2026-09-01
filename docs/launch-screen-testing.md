# Launch Screen Visual Testing Guide

**Status**: Ready for visual review in iPhone simulator  
**Date**: 2026-09-01

## Implementation Summary

### What Was Added

**1. Verse of the Day Service**
- Deterministic daily verse selection from 31 curated verses
- All verses validated against local WEB Bible corpus
- Same date always returns same verse
- No external API calls

**2. Launch Screen Component**
- Clean near-white background (#FAFAF8)
- Restrained typography with Plumb Line identity
- Thin horizontal line that animates left-to-right over 2 seconds
- "Verse of the Day" label and Scripture reference
- Verified Scripture text from local SQLite database
- "Continue" button appears after animation completes
- Respects reduce motion accessibility preference

**3. Launch State Management**
- Shows once per cold app launch (when process starts)
- Uses in-memory flag (not persisted to storage)
- Routes to appropriate screen after dismissal

### Visual Requirements Checklist

**Launch Screen Display**
- [ ] Shows immediately on cold app start
- [ ] Clean near-white background (not stark white)
- [ ] No Expo/debug controls visible
- [ ] Typography is restrained and calm
- [ ] "Verse of the Day" label visible at top

**Animation**
- [ ] Thin horizontal line near top of screen
- [ ] Line animates smoothly from left to right
- [ ] Animation takes approximately 2 seconds
- [ ] No jarring or abrupt motion
- [ ] With "Reduce Motion" enabled, animation is instant

**Verse Content**
- [ ] Scripture reference displayed (e.g., "Psalms 23:1")
- [ ] Verse text appears below reference
- [ ] Text is readable and well-spaced
- [ ] Multi-verse passages combine into single text block
- [ ] All text verified from local Bible database

**Continue Button**
- [ ] Appears after animation completes (~2 seconds)
- [ ] Button labeled "Continue"
- [ ] Dark button with light text (accessible contrast)
- [ ] Tappable with good touch target
- [ ] Navigates to daily path screen

**Fallback Behavior**
- [ ] If verse loading fails, shows John 3:16 fallback
- [ ] Continue button still appears after 2 seconds
- [ ] No error messages or loading spinners
- [ ] User never stuck on launch screen

**Accessibility**
- [ ] Works with system font scaling
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Continue button has accessibility role and label
- [ ] Verse reference marked as header
- [ ] Respects reduce motion preference

### Testing Scenarios

**1. Normal Cold Launch**
1. Quit app completely (swipe up in app switcher)
2. Reopen app from home screen
3. Launch screen should appear
4. Watch line animation complete
5. Tap "Continue"
6. Should navigate to daily path

**2. Returning User (Warm Start)**
1. Press home button (don't quit app)
2. Reopen app
3. Launch screen should NOT appear
4. Should go directly to daily path

**3. Network Offline**
1. Enable airplane mode
2. Quit and reopen app
3. Launch screen should still appear
4. Verse should load from local Bible
5. No network errors

**4. Reduce Motion**
1. Enable "Reduce Motion" in iOS Settings
2. Quit and reopen app
3. Launch screen appears
4. Animation completes instantly
5. Continue button available immediately

**5. Different Dates**
1. Test on different days
2. Verse should change deterministically
3. Same verse on same date across devices

### Technical Verification

**Tests**: ✅ 313 tests pass
- Verse of the Day service tests (7 tests)
- LaunchScreen component tests (10 tests)
- Launch state management tests (4 tests)

**TypeScript**: ✅ No compilation errors
**Linting**: ✅ All checks pass

**Files Added**:
- `src/domain/services/VerseOfTheDay.ts` - Verse selection logic
- `src/ui/screens/LaunchScreen.tsx` - Launch screen component
- `src/infrastructure/launch/useLaunchState.ts` - Launch state management
- `src/__tests__/VerseOfTheDay.test.ts` - Verse service tests
- `src/__tests__/LaunchScreen.test.tsx` - Component tests
- `src/__tests__/useLaunchState.test.tsx` - State tests

**Files Modified**:
- `app/index.tsx` - Show launch screen on cold start
- `src/ui/screens/index.ts` - Export LaunchScreen

### Design Notes

**Why Near-White Background?**
- Softer than stark white (#FFFFFF)
- More contemplative and calm
- Better for reading in various lighting
- Matches Plumb Line identity

**Why Thin Animated Line?**
- Visual progress indicator without spinner
- Gives user time to read verse
- Feels intentional, not rushed
- Creates moment of pause before app

**Why 2-Second Animation?**
- Long enough to read reference and start verse
- Short enough to not feel slow
- Provides natural pacing
- Respects user's time

**Why No Trial Skips?**
- Launch screen is part of the experience, not blocking
- Animation is brief (2 seconds)
- Creates consistent, calm entry point
- User can tap Continue as soon as it appears

### Known Limitations

1. **Verse rotation**: 31 verses means same verse repeats every 31 days
2. **Cold launch only**: Shows once per app process, not once per day
3. **No customization**: User cannot choose different verse
4. **No sharing**: Verse is for personal contemplation only

### Next Steps After Visual Approval

1. **If launch screen works well**: Continue to next feature
2. **If animation feels wrong**: Adjust duration or easing
3. **If text not readable**: Adjust typography or spacing
4. **After Saved Items verified**: Prompt 6 can be approved

---

**Important**: The launch screen is independent of:
- AI guide features (remains free)
- Paid subscriptions (always visible)
- Onboarding flow (shows before onboarding)
- Daily path (gateway to main experience)
