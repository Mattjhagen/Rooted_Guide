# Visual Test Checklist - Plumb Line Redesign

Test on physical iPhone to verify the calm, premium, Scripture-first experience.

## Design System Verification

### Colors & Theme
- [ ] **Light mode**: Warm off-white background (#FAF8F4), warm brown accents (#6B5744)
- [ ] **Dark mode**: True black background (#000000), warm bronze accents (#8B7355)
- [ ] **Surfaces**: Soft, elevated cards with subtle borders (not harsh outlines)
- [ ] **Text hierarchy**: Clear distinction between display, title, body, and caption text
- [ ] **Accent color**: Restrained, earthy brown (not bright blue)

### Spacing & Layout
- [ ] **Generous whitespace**: Breathing room around all elements
- [ ] **Consistent padding**: 24px horizontal margins on primary screens
- [ ] **Vertical rhythm**: Clear visual grouping with appropriate gaps
- [ ] **Touch targets**: All buttons minimum 56px height, easy to tap

### Typography
- [ ] **Display text** (36pt, -0.5 tracking): "Path complete", "Welcome back"
- [ ] **Title text** (28-32pt, -0.3 tracking): Module names like "Arrive", "Read"
- [ ] **Body text** (17-19pt): Clear, readable prompts and messages
- [ ] **Micro text** (11pt, uppercase, +1 tracking): Progress indicators

## Home Screen States

### State 1: Before Practice
- [ ] Shows "Today's path" as display heading
- [ ] Shows "A 15-minute guided journey into Scripture" message
- [ ] Shows single primary action: "Begin today's path" button
- [ ] Button is prominent, warm accent color, 56px height, 12px radius
- [ ] No competing CTAs, clean and focused
- [ ] Generous padding creates calm, centered layout

### State 2: During Practice
- [ ] Progress bar shows current position (thin 3px bar, not heavy)
- [ ] Progress text shows "1 of 5", "2 of 5", etc. in small caption text
- [ ] Module title is large and clear (32pt)
- [ ] Prompt text is readable body size (19pt)
- [ ] Input field has soft border, 12px radius, generous 24px padding
- [ ] Continue/Complete button fixed at bottom, full width
- [ ] Button disabled (gray) until text entered, then accent color
- [ ] Module transitions smoothly without jarring layout shifts

### State 3: After Completion (No Gate)
- [ ] "Path complete" in large display text, centered
- [ ] "You've completed today's practice" message
- [ ] "Continue reading" button prominent, same style as begin button
- [ ] Clean, calm completion state (no confetti, streaks, or pressure)
- [ ] Vertical centering with generous padding

### State 4: After Completion (With 12-Hour Gate)
- [ ] "Path complete" heading same as above
- [ ] "A new practice opens in 8h 14m" gentle message
- [ ] "Until then, continue in Scripture" encouragement (not guilt)
- [ ] Time format shows hours and minutes clearly
- [ ] "Continue reading" is the only action
- [ ] Message is calm, not pressuring or gamified
- [ ] Layout identical to no-gate state (just message text differs)

### State 5: Welcome Back Choice
- [ ] "Welcome back" heading
- [ ] "You paused during '[Module]'" message
- [ ] Two buttons: "Continue" (primary) and "Start from beginning" (secondary)
- [ ] Secondary button has border, not filled
- [ ] Clear hierarchy between actions

## Tab Navigation

### Visual Design
- [ ] Tab bar uses warm neutrals (#FAF8F4 light, #000000 dark)
- [ ] Active tab uses primary accent color (#6B5744 / #8B7355)
- [ ] Inactive tabs use tertiary text color (muted)
- [ ] Tab bar border is subtle warm tone
- [ ] Icons are working fallback shapes (not emoji)
- [ ] Labels are clear, 11pt, bold

### Tab Behavior
- [ ] Home tab opens to appropriate daily path state
- [ ] Bible tab shows continue reading card if last position exists
- [ ] Saved tab opens to saved items
- [ ] Transitions are smooth, no flicker
- [ ] Tab bar stays fixed at bottom

## Bible Tab

- [ ] Continue reading card has soft border, white/dark surface
- [ ] Card shows "CONTINUE READING" label in micro text
- [ ] Card shows passage reference (e.g., "Genesis 1") in heading size
- [ ] Chevron icon subtle, not competing
- [ ] Card tap opens reader at correct position
- [ ] If no reading position, shows browser directly

## Accessibility

### Dynamic Type
- [ ] Text scales appropriately with iOS text size settings
- [ ] Layout doesn't break at larger text sizes
- [ ] All text remains readable at smallest size

### Dark Mode
- [ ] All screens adapt correctly to dark mode
- [ ] Contrast ratios meet WCAG AA standards
- [ ] No bright flashes or harsh transitions

### Reduced Motion
- [ ] No animations if reduced motion is enabled
- [ ] Transitions are instant but smooth
- [ ] Progress indicators don't animate unnecessarily

### Screen Reader
- [ ] All buttons have clear labels
- [ ] Input fields have associated labels
- [ ] Screen reader can navigate entire flow
- [ ] Focus order is logical

## 12-Hour Gate Behavior

### Lock Timing
- [ ] Gate locks immediately upon completing Close module
- [ ] Lock time is exactly 12 hours from completion timestamp
- [ ] Time remaining updates correctly (test by changing system time)

### Persistence
- [ ] Close and reopen app: gate still locked if time hasn't passed
- [ ] Force quit and reopen: gate still locked
- [ ] Lock survives airplane mode
- [ ] Lock survives app backgrounding

### Unlock Behavior
- [ ] After 12 hours pass, devotional automatically unlocks
- [ ] Check by advancing system time 12+ hours
- [ ] No manual refresh needed
- [ ] Unlocked state shows "Begin today's path" not completion screen

### Direct Navigation Protection
- [ ] Can't start a new practice by tapping Home tab repeatedly
- [ ] Can't bypass gate by force-closing and reopening
- [ ] Gate message always shows if locked

## Edge Cases

### First Launch
- [ ] Launch screen shows verse of the day
- [ ] Transitions to "Begin today's path" state
- [ ] No errors or loading flickers

### Interrupted Sessions
- [ ] Pausing mid-practice and returning shows welcome back
- [ ] Can continue or restart as expected
- [ ] Draft text persists if user typed something

### No Internet
- [ ] All states work offline
- [ ] No network errors in gate logic
- [ ] Time calculations work offline

### Midnight Rollover
- [ ] Completing at 11:55pm and checking at 12:05am next day
- [ ] Gate should unlock at correct absolute time (not just "next day")

## Overall Polish

- [ ] **Visual cohesion**: All screens feel like one system
- [ ] **Calm tone**: No urgency, guilt, or gamification
- [ ] **Premium feel**: Generous space, refined typography, soft surfaces
- [ ] **Scripture-first**: Bible and reading are natural next steps
- [ ] **Minimal**: No visual noise, duplicate headings, or competing cards
- [ ] **Warm neutrals**: Color palette feels cohesive throughout
- [ ] **One accent**: Primary action color is consistent and restrained
- [ ] **Small motion**: Transitions are purposeful, not distracting
- [ ] **No emoji**: Fallback icons only, awaiting proper native design

## Performance

- [ ] Screens load quickly, no lag
- [ ] Scrolling is smooth
- [ ] Keyboard interaction is responsive
- [ ] No memory warnings or crashes
- [ ] Time calculations don't block UI

## Notes Section

Use this space to record observations, issues, or deviations:

```
Date tested: ___________
Device: ___________
iOS version: ___________

Observations:
-
-
-

Issues found:
-
-
-
```
