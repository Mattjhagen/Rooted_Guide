# Product Vision — Plumb Line

**Repository:** Rooted_Guide  
**Application Name:** Plumb Line  
**Status:** Clean rebuild in progress

---

## Product Identity

### User-Facing Name

**Plumb Line**

Use this capitalization exactly. The name is inspired by the biblical image of a plumb line as a standard for alignment, truth, examination, and faithful direction.

### Technical Identity

**Preserve these existing identifiers:**

- GitHub repository: `Rooted_Guide`
- Git history: preserved from original Rooted working title
- iOS bundle identifier: `com.mattjhagen.plumbline`
- Android package: `com.mattjhagen.plumbline`

**Update these user-facing values:**

- Expo app name: `Plumb Line`
- Expo display name: `Plumb Line`
- Expo slug: `plumb-line`
- URL scheme: `plumbline`
- User-visible references: "Plumb Line" (not "Rooted")

**Technical domain concepts remain unchanged:**

- GuideGateway, GuideThread, GuideTurn (generic guide-domain types)
- BibleRepository, NotesRepository, etc.
- Architecture boundaries and code organization

---

## Core Product Vision

### The Opening Experience

**Plumb Line is a minimal, personal Bible-study guide.**

The opening experience is a quiet writing surface with a blinking cursor and a gentle invitation:

> **"What's on your heart?"**

The guide learns enough about the person to shape a meaningful, structured Bible-study journey. It should not feel like a generic personality quiz or a long registration form.

**The person experiences value before being asked to create an account.**

### Core Principles

- **The cursor is the front door.** Not a dashboard, not tabs, not a feed.
- **Scripture is the ground truth.** Every citation is verified from local Bible text.
- **Conversation is the navigation.** The guide learns through natural exchange.
- **A personalized study journey is the outcome.** Not a generic devotional sequence.

---

## Conversational Onboarding

### Provisional Sequence

The following questions represent a provisional onboarding sequence. The exact wording and flow belong to the later experience-design stage and may change.

1. **What's on your heart?**
2. **What would you like Scripture to help you understand?**
3. **How familiar are you with the Bible?**
4. **Would you prefer a gentle guided pace, a deeper study, or something between?**
5. **Are there Christian traditions or perspectives Plumb Line should recognize without assuming?**
6. **Are there accessibility or reading preferences that would make study easier?**

### Requirements

These questions must:

- ✓ Be conversational rather than form-like
- ✓ Be skippable
- ✓ Explain why personal information is being requested
- ✓ Avoid diagnosing, stereotyping, or ranking the person
- ✓ Avoid inferring sensitive traits that the person did not provide
- ✓ Allow answers to be reviewed, edited, or deleted
- ✓ Remain local-first before sign-in
- ✓ Collect only information that materially improves the study experience

### Implementation Status

❌ **Not implemented in this product-vision amendment.**  
The conversational onboarding flow is documented but deferred to the later experience-design and implementation stages.

---

## Account Timing and Minimal Sign-In

### Intended Flow

- **Anonymous use works first** — The app is fully functional without an account
- **Introductory conversation occurs before account creation** — No registration wall
- **The person receives an initial personalized Scripture interaction before sign-in** — Value before friction
- **A minimal sign-in prompt appears only after value has been demonstrated** — Trust earned through experience
- **The prompt is framed around preserving the journey, not restricting access** — Positive motivation

### Provisional Sign-In Copy

```
Save your journey

Sign in to keep your study, reflections, and preferences
available across your devices.

· Continue with Apple
· Continue with email
· Not now
```

### Requirements

- ✓ "Not now" must be a real option
- ✓ The app continues to function locally without an account
- ✓ No onboarding answer is uploaded before informed consent and sign-in
- ✓ Before merging anonymous local data into an account, the person must explicitly choose whether to merge it
- ✓ Authentication implementation remains deferred to the designated auth/sync stage

### Implementation Status

❌ **Not implemented in this product-vision amendment.**  
Account timing strategy is documented but authentication implementation is deferred to Prompt 8 (Optional account and safe synchronization).

---

## Personalized Structured Study

### Personalization Dimensions

Every person's study journey may differ in:

- Starting passage
- Study topic
- Question sequence
- Study depth
- Pacing
- Reading length
- Reflection prompts
- Prayer prompts
- Cross-references
- Explanatory detail
- Follow-up sessions
- Reminder preferences
- Accessibility presentation

### Grounding Requirements

Personalization must remain grounded in:

- ✓ Verified Scripture from the local Bible corpus
- ✓ Explicit user preferences and stated interests
- ✓ Transparent selection rationale when possible

### Prohibited Behaviors

Personalization must NOT:

- ❌ Invent Scripture
- ❌ Alter Bible text
- ❌ Claim divine revelation
- ❌ Say that "God told me something about you"
- ❌ Manipulate people through fear, guilt, streak loss, or engagement pressure
- ❌ Rank spiritual maturity
- ❌ Make medical or psychological diagnoses
- ❌ Hide why a passage or study path was selected
- ❌ Force a denominational position
- ❌ Turn private answers into social or advertising profiles

### Transparency

The person should be able to:

- ✓ See the preferences shaping their journey
- ✓ Change preferences at any time
- ✓ Understand why a particular passage was suggested
- ✓ Review and edit onboarding answers

---

## Minimal Design System

### Visual Principles

- **Minimal visual hierarchy** — Few simultaneous choices
- **Generous spacing** — Room to breathe
- **Very limited simultaneous choices** — Not overwhelming
- **Quiet motion** — Subtle, calm transitions
- **Scripture visually distinguished from generated guidance** — Clear source attribution
- **No dashboard clutter** — Focus on one thing at a time
- **No tab-heavy navigation** — Unless later research proves it necessary
- **No feeds, points, badges, streak pressure, or gamification** — Personal study, not competition
- **Progressive disclosure** — Features revealed when needed, not feature-dense screens

### Theme Modes

- Light
- Dark
- System/Auto (follows device preference)

### Accessibility

Accessibility preferences should eventually include:

- Dynamic Type and large-text support
- Adjustable reading size
- Adjustable line spacing
- High-contrast option
- Reduced motion
- Screen-reader support
- Visible keyboard focus
- Minimum touch targets (44×44pt)
- Color-blind-safe highlighting
- Dyslexia-friendly or highly legible font option (if validated)
- Plain-language interface copy
- Audio/read-aloud preference (when implemented)

**Accessibility must be part of the architecture, not a later cosmetic feature.**

### Implementation Status

✓ **Partial foundation established in Prompt 2:**

- Theme system (light/dark)
- Accessibility labels and roles
- Minimum touch targets
- Dark mode support

---

## Product Boundaries

### Explicitly Excluded

Plumb Line does **not** include:

- ❌ Community feeds
- ❌ Direct messages
- ❌ Public journals by default
- ❌ Devotional publishing/admin
- ❌ Organizations
- ❌ Reading-plan dashboards
- ❌ Points
- ❌ Streak pressure
- ❌ Check-ins
- ❌ Gamification
- ❌ Client-side provider credentials
- ❌ Unverified Bible translations
- ❌ Rooted Translation content (until provenance established)

### Future Considerations (Post-MVP)

The following may be reconsidered after the core guide proves itself:

- Optional reading plans (if requested by users)
- Shared study groups (private, invitation-only)
- Audio Bible playback
- Additional verified Bible translations

---

## Implementation Roadmap

### Current Stage

**Product-Vision Amendment (Before Prompt 3B)**

- ✓ Rename application to "Plumb Line"
- ✓ Document product vision
- ✓ Update user-facing references
- ✓ Update configuration values
- ✓ Preserve technical identifiers

### Staged Implementation

| Stage                         | Prompt | Status      |
| ----------------------------- | ------ | ----------- |
| Clean-room boundary           | 1      | ✅ Complete |
| Fresh foundation              | 2      | ✅ Complete |
| Bible corpus audit            | 3A     | ✅ Complete |
| Offline Scripture engine      | 3B     | ⏳ Next     |
| Blinking-cursor guide         | 4      | ⏳ Pending  |
| Server-grounded AI            | 5      | ⏳ Pending  |
| Local-first personal data     | 6      | ⏳ Pending  |
| Reader and settings           | 7      | ⏳ Pending  |
| Optional account and sync     | 8      | ⏳ Pending  |
| Audio and reminders           | 9      | ⏳ Pending  |
| Privacy and release hardening | 10     | ⏳ Pending  |

---

## Technical Guardrails

### Security

- No AI API keys in client
- No OAuth client secrets in client
- No service-role keys in client
- Server-side credential management
- Rate limiting and abuse prevention

### Privacy

- Private by default
- Local-first storage
- Explicit consent before cloud sync
- No conversation logging by default
- User data export and deletion

### Scripture Integrity

- Every citation verified against local Bible corpus
- No invented or altered verses
- Translation attribution visible
- Public domain or properly licensed translations only

### AI Safety

- Compassionate but not authoritative
- No claims of divine revelation
- Denominational neutrality when relevant
- Safety path for crisis content
- Prompt injection protection

---

## Success Criteria

A successful Plumb Line experience means:

1. ✓ A person opens the app to a blinking cursor
2. ✓ They type what's on their heart without creating an account
3. ✓ The guide responds with warmth and verified Scripture
4. ✓ Citations open to contextual passages in an offline reader
5. ✓ The person saves a private reflection and finds it after relaunch
6. ✓ The entire experience works offline
7. ✓ The person can export and delete their data
8. ✓ Sign-in is optional and clearly beneficial, not restrictive

---

## Naming Rationale

### Biblical Source

The name **Plumb Line** is inspired by Amos 7:7-8:

> Then the Lord showed me this: behold, the Lord stood beside a wall built with a plumb line, with a plumb line in his hand. And the Lord said to me, "Amos, what do you see?" And I said, "A plumb line." Then the Lord said, "Behold, I am setting a plumb line in the midst of my people Israel; I will never again pass by them."

### Metaphor

A plumb line is a simple tool—a weight on a string—used to establish true vertical alignment. In the biblical context, it represents:

- **Truth and standard** — God's Word as the measure
- **Examination** — Testing alignment with God's will
- **Faithful direction** — Guidance toward what is straight and true
- **Simplicity** — A humble tool, not elaborate machinery

### Application Identity

**Plumb Line** conveys:

- Personal guidance grounded in Scripture
- Alignment with truth, not religious performance
- A tool for examination and reflection
- Simplicity and clarity over complexity

---

**End of Product Vision**
