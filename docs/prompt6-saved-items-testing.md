# Prompt 6 Visual Testing Guide - Saved Items

**Status**: Ready for visual review in iPhone simulator  
**Date**: 2026-09-01

## Changes Implemented

### 1. Fixed Saved Items Navigation (Critical Bug Fix)
- **Problem**: Tapping saved reflection cards did nothing
- **Root Cause**: Reflections were not storing Scripture references when saved during daily practice
- **Fix**: Updated repositories and hooks to persist passage references (John 3:16-21)
- **Verified**: All 6 navigation tests pass

### 2. Added Category Filtering
- **Filters**: All, Reflections, Prayers, Notes, Bookmarks, Highlights, Conversations
- **Behavior**: Horizontally scrollable tabs at top of screen
- **State**: Filter selection persists only for current visit (not saved to storage)
- **Verified**: All 5 filtering tests pass

### 3. Added Date Grouping
- **Groups**: "Today", "Yesterday", then "Weekday, Month Day" for older items
- **Ordering**: Newest first within each group
- **Verified**: All 4 date grouping tests pass

### 4. Improved Empty States
- **Per-Category Messages**: Gentle, helpful copy like "No saved prayers yet."
- **Style**: Sparse, contemplative tone (no charts, counts, streaks, or gamification)

## Visual Testing Checklist

### Setup (in iPhone Simulator)
1. **Complete daily path**: Arrive → Read → Reflect → Respond → Close
2. **Add multiple saved items**:
   - During "Read" module: tap verses to bookmark/highlight
   - During "Reflect": write a reflection (saved with John 3:16-21)
   - During "Respond": write a prayer response
   - Add notes to individual verses

### Test Navigation (Critical)
- [ ] Tap a **reflection card** → should open John 3:16-21 passage
- [ ] Tap a **prayer card** → should open its associated verse
- [ ] Tap a **note card** → should open the noted verse
- [ ] Tap a **bookmark card** → should open bookmarked verse with indicator
- [ ] Tap a **highlight card** → should show verse with background color
- [ ] Verify **Back button** returns to Saved Items
- [ ] Confirm reopened passage shows correct bookmark/highlight state

### Test Category Filters
- [ ] Default view shows **All** items
- [ ] Tap **Reflections** → shows only reflections (not prayers or bookmarks)
- [ ] Tap **Prayers** → shows only prayer entries
- [ ] Tap **Notes** → shows only standalone notes
- [ ] Tap **Bookmarks** → shows only bookmarked verses
- [ ] Tap **Highlights** → shows only highlighted verses
- [ ] Tap **Conversations** → shows guide threads (if any exist)
- [ ] Verify empty state message when category has no items
- [ ] Filter tabs are horizontally scrollable on small screens

### Test Date Grouping
- [ ] Items created **today** appear under "Today" heading
- [ ] Items created **yesterday** appear under "Yesterday" heading
- [ ] Older items show "Weekday, Month Day" heading (e.g., "Thursday, August 28")
- [ ] Within each date group, items are ordered newest first
- [ ] Date groups themselves are ordered newest first

### Test Scripture References
- [ ] Every card shows its Scripture reference (e.g., "John 3:16")
- [ ] References are visible before tapping
- [ ] Multi-verse passages show range (e.g., "John 3:16-21")

### Test Visual Style
- [ ] Layout is sparse and contemplative (not busy or dashboard-like)
- [ ] No charts, progress indicators, streaks, or counts
- [ ] No social features or sharing prompts
- [ ] Color scheme matches accessible Plumb Line theme
- [ ] Works in both light and dark mode

### Test Accessibility
- [ ] Filter tabs have proper `accessibilityRole="tab"`
- [ ] Selected filter has `accessibilityState.selected`
- [ ] Cards are tappable with appropriate touch targets
- [ ] Text is readable at system font sizes

## Test Results

**Unit Tests**: ✅ 292 tests pass  
**TypeScript**: ✅ No compilation errors  
**Linting**: ✅ All checks pass  

**Saved Item Types Tested**:
- Reflections with Scripture references
- Prayers (both from daily practice and standalone)
- Notes attached to verses
- Bookmarks (verse markers)
- Highlights (with color persistence)
- Guide conversations (passage-based)

**Navigation Tests**: ✅ 6 tests pass
- Reflection card navigation
- Bookmark card navigation
- Highlight card navigation
- Guide thread navigation with verse range
- Handles missing verseRef gracefully
- Displays Scripture reference in subtitle

**Filtering Tests**: ✅ 11 tests pass
- Shows all items by default
- Filters to each category correctly
- Shows appropriate empty states
- Maintains filter during session
- Orders newest first
- Groups by date correctly

## Known Limitations (Expected Behavior)

1. **Filter state is ephemeral**: Resets to "All" when app reopens (by design)
2. **Today's passage only**: All reflections from daily practice link to John 3:16-21
3. **Local-only data**: No cloud sync or sharing (privacy by design)

## Files Changed

**Source**:
- `src/ui/screens/SavedItemsScreen.tsx` - Added filters and date grouping
- `src/domain/repositories/ReflectionRepository.ts` - Accept optional verseRef
- `src/infrastructure/persistence/SQLiteReflectionRepository.ts` - Store verseRef
- `src/features/dailyPath/useDailyPath.ts` - Pass passage ref when saving

**Tests**:
- `src/__tests__/SavedItemsScreen-navigation.test.tsx` - Navigation regression tests (6 tests)
- `src/__tests__/SavedItemsScreen-filtering.test.tsx` - Filtering and grouping tests (11 tests)

## Next Steps After Visual Approval

1. **If navigation works**: Prompt 6 is approved
2. **If any navigation fails**: Debug and fix before approval
3. **After approval**: Begin Prompt 7 (Guide integration)

---

**Important**: Do not claim Prompt 6 is approved until:
1. Saved item cards are confirmed tappable in simulator
2. Cards navigate to correct passage with proper context
3. Reopened passages show bookmark/highlight state correctly
4. All visual requirements above are manually verified
