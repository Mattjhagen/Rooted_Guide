# Plumb Line Guided — Subscription Design

**Status**: Design phase — not yet implemented  
**Version**: 1.0  
**Last Updated**: 2026-09-01

**Current App Readiness:**  
Prompt 6 visual approval is required before any subscription work begins. The following must be validated in simulator:
- Passage actions (bookmark, highlight, note) visibly save
- Saved Items screen successfully reopens the correct passage with full context
- Daily path completes without crashes or technical errors
- All Free tier features function as designed

Subscription implementation (StoreKit, server infrastructure, paywall UI) is entirely separate from and dependent on successful Prompt 6 approval.

## Product Overview

Plumb Line offers two tiers designed around a core principle: **the free experience is a complete, offline-first Scripture practice, not a crippled demo**.

### Free — Daily Scripture Practice
**Fully functional without payment or account**

- Complete 15-minute daily path (Arrive → Read → Reflect → Respond → Close)
- Offline World English Bible with verified passage loading
- Personal practice tools: reflections, prayers, bookmarks, highlights, notes
- Saved Items screen with passage context navigation
- Full data export and local deletion controls
- No ads, no social features, no shame-based messaging
- Never requires internet after initial Bible download

### Plumb Line Guided — $7.99/month or $59.99/year
**Optional AI companion for deeper exploration**

- "For Today" personalized summary after onboarding questions
- Ask contextual questions about the current verified passage
- Adaptive "Your next few days" plans (opt-in, based only on explicitly saved content)
- Fair-use AI allowance: 30 contextual questions and 4 adaptive plans per subscription period (designed for thoughtful use, not unlimited chat)
- No free trial at launch (revisit after operational validation)

**What Guided does NOT do:**
- Does not require creating an account
- Does not upload your reflections to a cloud profile
- Does not analyze your reading history without consent
- Does not interrupt Scripture reading with upgrade prompts

---

## 1. Entitlements

### Entitlement Model

Two entitlement levels:

1. **`free`** (default)
   - All local Scripture practice features
   - No AI-powered features
   - No server dependency (offline-capable)
   - No payment required

2. **`guided`** (subscription)
   - All `free` features
   - AI-powered "For Today" summary
   - Contextual passage questions
   - Adaptive "Your next few days" plans
   - Requires active subscription

### Product Identifiers

**Proposed Bundle ID**: `com.plumbline.guide`

**Proposed In-App Purchase IDs**:
- `com.plumbline.guide.guided.monthly` — $7.99/month
- `com.plumbline.guide.guided.yearly` — $59.99/year (17% savings)

**Entitlement Key**: `guided_access`
- Boolean flag checked before AI requests
- Stored in device-local preferences
- Refreshed from App Store receipt on app launch

### Restoring Purchases Without Account

Plumb Line uses **Apple StoreKit receipt validation** to restore subscriptions across devices without requiring a Plumb Line account.

**How it works:**

1. **On first launch** → User has `free` entitlement by default
2. **User subscribes** → App Store processes payment
3. **App receives transaction** → App stores entitlement flag locally and sends encrypted receipt to guide server
4. **User installs on iPad** → App launches with `free` entitlement
5. **App calls `restorePurchases()`** → StoreKit fetches latest receipt from Apple
6. **Receipt contains active subscription** → App sets local `guided_access = true`
7. **Server validates receipt** → Confirms entitlement before serving AI requests

**Key Implementation Points:**

- Use StoreKit 2's `Product.SubscriptionInfo` APIs
- Validate receipt signatures using Apple's public keys
- Check subscription expiration date and renewal status
- Handle grace periods and billing retry states
- Never require email or password to restore

**Receipt Validation Flow:**

```
Device                    Guide Server               Apple
  |                            |                        |
  |-- Receipt (encrypted) ---->|                        |
  |                            |-- Verify receipt ----->|
  |                            |<-- Status + expires ---|
  |<-- Entitlement granted ----|                        |
```

### Server-Side Entitlement Verification

Before spending AI resources, the guide server must verify current entitlement:

**Required Server Capabilities:**

1. **Receipt Validation Endpoint**
   - Accepts encrypted App Store receipt
   - Calls Apple's `verifyReceipt` API
   - Caches validation result with TTL (6-24 hours)
   - Returns entitlement status and expiration date

2. **Request Authorization**
   - Every AI request includes receipt or cached token
   - Server checks entitlement before calling AI provider
   - Returns `402 Payment Required` if subscription expired
   - Returns `503 Service Unavailable` if AI quota exceeded

3. **Quota Management**
   - Track requests per user per billing period
   - Fair-use limits (e.g., 100 questions/month, 10 adaptive plans)
   - Soft limits with graceful degradation
   - Hard limits with clear messaging

**Entitlement Cache Strategy:**

- Server caches `(receipt_hash → entitlement, expires_at)` for 6 hours
- Client refreshes receipt on app launch and every 24 hours
- Client handles offline mode by caching last-known entitlement locally
- Server treats expired cache as `free` tier (fail-safe)

### Cross-Device Restoration

Subscription access is tied to the user's **Apple ID**, not a Plumb Line account.

**Automatic Restoration:**
- App calls `AppStore.sync()` on launch to fetch latest transactions
- StoreKit 2 automatically updates subscription status
- App updates local entitlement flag based on active subscription
- Works across iPhone, iPad, Mac (same Apple ID)

**Manual Restoration:**
- "Restore Purchases" button in settings (standard pattern)
- Triggers `AppStore.sync()` and `Product.currentEntitlement`
- Shows success/failure message
- No account login required

**Family Sharing:**
- **Decision: Guided AI subscriptions will NOT support Family Sharing**
- This prevents multiple family members from exhausting AI quota rapidly
- Free tier Scripture and daily practice remain available to all family members without restriction

---

## 2. Privacy

### Core Privacy Principle

**Local by default. Voluntary when beneficial.**

Scripture reading and personal reflections remain on-device unless the user actively engages AI features. The guide server never receives saved content without explicit user action.

### Data Boundaries

**Always Local (Never Sent to Server):**
- Bible text (pre-downloaded, offline)
- Reflections, prayers, notes
- Bookmarks and highlights
- Daily session history
- "Arrive" onboarding responses (unless user proceeds to "For Today" summary)

**Sent to Guide Server (Only When User Chooses):**
- Specific question text typed by user
- Current passage reference (e.g., John 3:16-21) for context
- "For Today" summary request (includes arrive response user just typed)
- Adaptive plan generation (user explicitly opts in)

**Adaptive Plan Consent:**
- User must explicitly enable "Your next few days" feature
- Consent screen explains what's analyzed and why
- User chooses which saved items to include in plan (default: none)
- User can pause or delete adaptive plans at any time

### Request Context Minimization

When the user asks a question about John 3:16-21, the guide server receives:

**Sent:**
```json
{
  "userInput": "What does 'born of water and Spirit' mean?",
  "context": {
    "passageRef": {
      "book": "John",
      "chapter": 3,
      "verseStart": 16,
      "verseEnd": 21
    },
    "verseText": "For God so loved the world..." // verified local text
  },
  "requestId": "uuid-for-idempotency",
  "entitlementToken": "encrypted-receipt-or-cached-token"
}
```

**NOT Sent:**
- User's full reflection history
- Other bookmarked passages
- Daily session completion data
- Device identifiers beyond what's in the receipt

### Adaptive Plans — Opt-In Model

"Your next few days" is an **opt-in feature** that requires explicit consent because it analyzes saved content.

**Consent Flow:**

1. User discovers feature in settings or post-practice prompt (not during reading)
2. Consent screen explains:
   - "We'll suggest passages based on content you've saved"
   - "You choose which reflections and bookmarks to include"
   - "Plans are generated on-demand, not stored on our servers"
   - "You can pause or delete at any time"
3. User selects saved items to include (checkboxes)
4. User confirms "Generate plan"

**Privacy Controls:**

- **Pause**: Stop generating new plans, keep existing local suggestions
- **Delete**: Remove all adaptive plan suggestions from device
- **Change sources**: Update which saved items are considered
- **Revoke consent**: Return to manual passage selection only

**Server Behavior:**

- Server receives selected saved items only when generating plan
- Server does not store user's saved content
- Server returns suggested passages with reasoning
- Client stores plan suggestions locally
- User can regenerate plan with different input at any time

### Data Deletion

**Local Deletion:**
- "Delete all data" in Data Controls removes everything from device
- Includes all saved items, session history, and cached AI responses
- Does not cancel subscription (separate App Store action)

**Server Deletion:**
- Guide server does not store user content beyond request/response cache
- Request cache TTL: 1 hour (for deduplication)
- Receipt validation cache TTL: 6 hours
- No long-term user profile or history

**Subscription Cancellation:**
- User cancels via App Store (standard flow)
- Subscription remains active until end of billing period
- After expiration, AI features gracefully disable
- Local data remains on device (user can continue with Free tier)

---

## 3. User Experience

### Upgrade Offer Placement

Guided features are **gently visible but never intrusive**. The free experience remains complete.

**Where Upgrade Prompts Appear:**

1. **Post-Practice Screen (Path Complete)**
   - After user completes the daily path
   - Small card: "Try Plumb Line Guided" with one-line description
   - Below "View saved items" and "Manage data" buttons
   - Dismissible (user can ignore)

2. **Settings / Data Controls Screen**
   - Dedicated "Plumb Line Guided" section at bottom
   - Clear feature list and pricing
   - "Subscribe to Plumb Line Guided" button (no trial at launch)
   - "Restore purchases" button

3. **"For Today" Summary Screen (Graceful Degradation)**
   - If user is on Free tier, show local fallback summary (no AI)
   - Below summary: "Plumb Line Guided adds personalized AI insights"
   - Optional "Learn more" link → settings
   - Never blocks access to Scripture reading

**Where Upgrade Prompts NEVER Appear:**

- ❌ During Scripture reading (no interruptions)
- ❌ During daily path modules (no mid-practice popups)
- ❌ On app launch (no paywall splash)
- ❌ After X days of use (no nagging)
- ❌ When user completes a streak (no gamification pressure)

### Free Tier Experience

The Free tier is designed as a **complete offline Scripture practice**, not a trial.

**What Free Users Can Do Without Limitation:**

- Read any passage from World English Bible offline
- Complete full 15-minute daily path every day
- Save unlimited reflections, prayers, bookmarks, highlights, notes
- Export all their data as JSON
- Use Saved Items to revisit passages
- Delete all local data

**What Free Users See for Guided Features:**

- "For Today" summary uses local rule-based fallback (warm, simple, no AI)
- No "Ask a question" button visible
- No "Your next few days" section in UI
- Settings show "Try Plumb Line Guided" with feature list

**No Artificial Limitations:**

- ❌ No "3 reflections per month" limits
- ❌ No "unlock full Bible" upsells
- ❌ No ads or sponsored content
- ❌ No locked passages
- ❌ No reduced functionality after trial period

### Messaging and Copy

All subscription messaging uses **clear, gentle language** that respects the user's decision.

**Good Examples:**

> **"Try Plumb Line Guided"**  
> Get AI-powered insights and adaptive plans for $7.99/month. Your daily practice stays fully functional either way.

> **"For Today" (Free Tier)**  
> Thank you for taking this time. Whatever you're bringing today, you're welcome here. Let's turn to Scripture together.  
> _Plumb Line Guided adds personalized AI insights based on what you share._

> **"Subscription Expired"**  
> Your Guided subscription has ended. You can still use all Scripture reading and reflection features. Restore your subscription anytime in settings.

**Bad Examples (Avoid):**

> ❌ "Unlock premium features" (implies Bible reading is locked)  
> ❌ "You've used 2 of 3 free questions" (creates false scarcity)  
> ❌ "Upgrade now to keep your streak" (shame-based)  
> ❌ "Join thousands of premium users" (social pressure)  
> ❌ "Limited time offer" (urgency manipulation)

### Fair-Use Allowance Messaging

Guided is marketed as **thoughtful AI assistance**, not unlimited chat.

**In Settings / Marketing:**

> **"What's included?"**  
> - Personalized "For Today" summaries
> - Ask contextual questions about passages
> - Generate adaptive "Your next few days" plans
>
> _Designed for thoughtful use alongside your daily practice._

**When User Approaches Limit:**

> **"You're using Guided frequently this period"**  
> You've asked 25 of your 30 questions this subscription period. Guided is designed for thoughtful reflection, not unlimited chat. Your allowance resets in 5 days.

**When User Exceeds Limit:**

> **"You've reached your question limit"**  
> Your daily Scripture practice continues without interruption. Question allowance resets on Sept 5. Consider which questions matter most, and we'll answer those.

**Philosophy:**

- Limits exist to manage AI costs and encourage thoughtful use
- Free tier remains unaffected
- No upsell to "unlimited" tier (slippery slope)
- Transparent about limits upfront

---

## 4. Operational Readiness

### Server Capabilities Required Before Launch

The guide server must have these capabilities before any subscription can be sold:

#### A. Authentication & Entitlement

- [x] Secure API endpoint with HTTPS
- [ ] **App Store receipt validation** (call Apple's `verifyReceipt` API)
- [ ] **Entitlement cache** (store validated receipts with TTL)
- [ ] **Request authorization** (check entitlement before AI calls)
- [ ] **402 Payment Required** responses when subscription expired
- [ ] **Family Sharing disabled** for Guided AI product configuration in App Store Connect

#### B. Guide Request Handling

- [x] Accept `GuideServiceRequest` with user input and context
- [x] Validate Scripture citations against local Bible before AI call
- [x] Return structured `GuideServiceResponse` with citations
- [ ] **Rate limiting** per user (30 questions/period, 4 plans/period for Guided tier — provisional limits)
- [ ] **Quota tracking** (requests per billing period, separate counters for questions vs. plans)
- [ ] **Graceful degradation** when quota exceeded

#### C. Abuse Prevention

- [ ] **Request deduplication** (cache identical requests for 1 hour)
- [ ] **Input validation** (max question length, sanitize input)
- [ ] **Rate limiting** (max 10 requests per minute per user)
- [ ] **Suspicious activity detection** (e.g., scripted requests)
- [ ] **Emergency kill switch** (disable AI for specific users)

#### D. Privacy & Compliance

- [ ] **Privacy Policy** published and linked in app
- [ ] **Terms of Service** for Guided subscription
- [ ] **COPPA compliance** (no data collection from users under 13)
- [ ] **GDPR considerations** (even though users are anonymous)
- [ ] **Request logging** (minimal, anonymized, short retention)
- [ ] **Data deletion endpoint** (purge user's cached data)

#### E. Reliability & Monitoring

- [ ] **Health check endpoint** (`/health` returns status)
- [ ] **Metrics dashboard** (request volume, latency, errors)
- [ ] **Alerting** (PagerDuty or similar for outages)
- [ ] **Fallback behavior** (client handles 503 gracefully)
- [ ] **Provider credential rotation** (AI API keys)
- [ ] **Uptime SLA** (99.5% target for paid tier)

#### F. Testing & Staging

- [ ] **Staging environment** (separate from production)
- [ ] **Sandbox receipt validation** (test App Store transactions)
- [ ] **Load testing** (simulate 1000 concurrent Guided users)
- [ ] **Subscription lifecycle tests** (new, renew, expire, cancel, restore — no trial at launch)
- [ ] **Error scenario tests** (AI provider down, quota exceeded, invalid receipt)

### Current Implementation Gaps

**What Exists Today (Prompt 5):**

- ✅ `GuideServiceContract` type definitions
- ✅ `HTTPGuideGateway` client (can call remote API)
- ✅ `LocalDevGuideGateway` (mock for development)
- ✅ Graceful fallback when guide unavailable
- ✅ Scripture citation validation
- ✅ Request/response structure

**What's Missing for Subscriptions:**

1. **Client-Side (iOS App):**
   - [ ] StoreKit 2 integration
   - [ ] `SubscriptionManager` service
   - [ ] Receipt validation and caching
   - [ ] Entitlement check before AI features
   - [ ] "Restore Purchases" flow
   - [ ] Subscription status UI in settings
   - [ ] Grace period and billing retry handling
   - [ ] "Try Plumb Line Guided" upgrade prompts

2. **Server-Side (Guide API):**
   - [ ] Receipt validation endpoint
   - [ ] Entitlement cache database
   - [ ] Request quota tracking
   - [ ] Rate limiting middleware
   - [ ] Abuse prevention logic
   - [ ] Monitoring and alerting
   - [ ] Privacy policy and terms hosting

3. **External Setup (Apple):**
   - [ ] App Store Connect account
   - [ ] Create in-app purchase products
   - [ ] Configure subscription groups
   - [ ] Set pricing in all regions
   - [ ] Submit app for review with subscription
   - [ ] Test with sandbox accounts

4. **Legal & Compliance:**
   - [ ] Privacy Policy drafted and reviewed
   - [ ] Terms of Service drafted and reviewed
   - [ ] COPPA compliance verification
   - [ ] GDPR considerations documented
   - [ ] App Store review guidelines compliance

### Development Roadmap (Future)

**Phase 1: Infrastructure (Pre-Launch)**
- Implement server receipt validation
- Add entitlement caching
- Set up quota tracking and rate limiting
- Deploy monitoring and alerting
- Write and publish Privacy Policy

**Phase 2: Client Integration**
- Add StoreKit 2 framework
- Build `SubscriptionManager` service
- Implement "Restore Purchases"
- Add entitlement checks to AI features
- Design and implement upgrade prompts

**Phase 3: External Setup**
- Create App Store Connect products
- Configure subscription pricing
- Set up sandbox testing
- Submit for App Review

**Phase 4: Launch & Monitor**
- Soft launch to small user group
- Monitor server load and costs
- Gather user feedback
- Iterate on upgrade messaging

---

## 5. Proposed Implementation Model

### Client Entitlement Check

```typescript
// src/domain/services/SubscriptionManager.ts
export interface SubscriptionManager {
  /**
   * Get current entitlement level
   * Checks local cache first, refreshes from StoreKit if stale
   */
  getCurrentEntitlement(): Promise<'free' | 'guided'>;

  /**
   * Refresh entitlement from App Store
   * Called on app launch and when user taps "Restore Purchases"
   */
  refreshEntitlement(): Promise<void>;

  /**
   * Check if user has active Guided subscription
   */
  hasGuidedAccess(): Promise<boolean>;

  /**
   * Get subscription status details
   * Returns expiration date, billing period, etc.
   */
  getSubscriptionInfo(): Promise<SubscriptionInfo | null>;
}
```

**Usage in ForTodaySummaryScreen:**

```typescript
const subscriptionManager = useSubscriptionManager();
const [hasGuided, setHasGuided] = useState(false);

useEffect(() => {
  async function checkEntitlement() {
    const guided = await subscriptionManager.hasGuidedAccess();
    setHasGuided(guided);
  }
  checkEntitlement();
}, []);

// Later in render:
if (hasGuided) {
  // Use AI gateway for personalized summary
} else {
  // Use local fallback summary
}
```

### Server Receipt Validation

```typescript
// Server endpoint: POST /api/entitlement/verify
{
  "appReceipt": "base64-encoded-app-store-receipt"
}

// Response:
{
  "entitlement": "guided",
  "expiresAt": "2026-09-30T23:59:59Z",
  "productId": "com.plumbline.guide.guided.monthly",
  "cacheToken": "opaque-token-for-future-requests"
}
```

**Request Authorization:**

```typescript
// Every guide request includes:
{
  "userInput": "...",
  "context": {...},
  "entitlementToken": "opaque-token-from-verify-response"
}

// Server validates token before calling AI:
if (!isValidToken(request.entitlementToken)) {
  return 402; // Payment Required
}
if (quotaExceeded(request.entitlementToken)) {
  return 429; // Too Many Requests
}
// Proceed with AI call
```

### Upgrade Prompt Component

```typescript
// src/ui/components/GuidedUpgradeCard.tsx
export function GuidedUpgradeCard() {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Try Plumb Line Guided</Text>
      <Text style={styles.description}>
        Get AI-powered insights and adaptive plans for $7.99/month.
        Your daily practice stays fully functional either way.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/subscription')}
      >
        <Text style={styles.buttonText}>Learn more</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Placement in DailyPathScreen:**

```typescript
// Only show on "Path Complete" screen, below main actions
if (isComplete) {
  return (
    <SafeAreaView>
      <Text>Path Complete</Text>
      <Link href="/saved">View saved items</Link>
      <Link href="/data">Manage data</Link>
      {!hasGuidedSubscription && <GuidedUpgradeCard />}
    </SafeAreaView>
  );
}
```

---

## 6. Open Decisions

### Product Questions

1. **Seven-Day Free Trial**
   - **Decision: Launch without a free trial**
   - Revisit seven-day trial only after guide server has demonstrated reliable operation and real usage costs are known
   - Managing trial state adds complexity better addressed after operational validation

2. **Fair-Use Limits**
   - **Decision: Initial launch allowance is 30 contextual questions per subscription period and 4 adaptive plans per subscription period**
   - These limits are provisional and must be reviewed using real cost and usage data before any wider launch
   - Separate quotas prevent over-consumption of expensive plan generation
   - Limits will be adjusted based on actual AI provider costs and user behavior patterns

3. **Family Sharing**
   - **Decision: Guided AI subscriptions will NOT support Family Sharing** (see Legal Questions section)
   - Prevents quota exhaustion from multiple family members
   - Free tier remains available to all users without restriction

4. **Offline Behavior**
   - **Decision: Guided entitlement may have a seven-day offline grace period before re-verification**
   - If user cancels subscription but stays offline, Guided AI features disable after 7 days
   - Free tier Bible and daily practice remain permanently available offline regardless of subscription status

5. **Upgrade Messaging**
   - How prominently to promote Guided without annoying free users?
   - Risk: Too subtle = low conversion, too aggressive = poor experience
   - Recommendation: Post-practice card only, A/B test in soft launch

### Technical Questions

1. **Receipt Caching Duration**
   - **Decision: Client refreshes purchase status immediately after completed purchase**
   - Server cache TTL remains 6 hours for passive refresh
   - Server is the final entitlement authority before spending AI resources
   - Ensures immediate feature access after subscription purchase

2. **Quota Reset Logic**
   - **Decision: Guided AI allowance resets on each subscription renewal date**
   - Monthly subscribers: reset on same day each month
   - Yearly subscribers: reset on annual renewal date
   - Avoids surge load on calendar month boundaries

3. **Server Scaling**
   - How many Guided users can one server instance handle?
   - Need load testing with real AI provider latency
   - Recommendation: Auto-scaling with CloudWatch alarms

4. **Provider Costs**
   - $7.99/month must cover AI costs plus margin
   - Need to estimate typical usage and provider pricing
   - Recommendation: Model costs in Prompt 9 before launch

### Legal Questions

1. **Privacy Policy Hosting**
   - **Decision: Privacy policy will be hosted at `https://plumbline.app/privacy`**
   - Must be easily accessible in-app via link
   - Source markdown in repo, rendered at target URL

2. **Refund Policy**
   - Follow App Store standard (no questions asked within 14 days)?
   - Or more restrictive due to AI costs?
   - Recommendation: Follow App Store default, absorb occasional abuse

3. **COPPA Compliance**
   - **Decision: App Store age rating not yet determined**
   - Must be determined through Apple's current rating questionnaire before release
   - No parental-consent flow will be added at this stage
   - Rating will be based on Apple's guidelines for apps with AI-generated content

---

## 7. Success Metrics (Future)

### Pre-Launch Metrics

- Server response time < 2 seconds (p95)
- Receipt validation success rate > 99%
- AI provider uptime > 99.5%
- Zero security vulnerabilities in receipt handling

### Post-Launch Metrics

- Free → Guided conversion rate (target: 5-10%)
- Guided subscriber retention at 90 days (target: 60%)
- Average questions per Guided user per month (target: 20-40)
- AI cost per Guided subscriber per month (target: < $3)
- Customer satisfaction (NPS target: 50+)

### Red Flags

- Conversion rate < 2% → upgrade messaging too subtle
- Retention < 40% → Guided features not valuable enough
- Questions/user > 80 → quota too generous, costs unsustainable
- AI cost/user > $5 → need to optimize provider usage or raise price

---

## Appendix: Comparison to Alternatives

### Why Not Require an Account?

**Alternatives considered:**
- Email + password account system
- "Sign in with Apple" required for Guided

**Decision: Use StoreKit receipt validation without accounts**

Reasons:
- Lower friction (no email, no password, no verification email)
- Better privacy (no email address collected)
- Seamless cross-device (Apple ID already handles it)
- Less server infrastructure (no user database)
- Aligns with "local-first" philosophy

Tradeoff: Cannot offer web access to saved content (iOS-only)

### Why Not Freemium with Ads?

**Alternative considered:** Free tier shows ads, paid tier removes them

**Decision: No ads, ever**

Reasons:
- Ads interrupt Scripture reading (misaligned with mission)
- Ad targeting requires tracking (privacy violation)
- Ad revenue unpredictable and low for niche app
- Ad networks often serve inappropriate content
- Subscription better aligns incentives (serve user, not advertiser)

### Why Not One-Time Purchase?

**Alternative considered:** $29.99 one-time unlock instead of subscription

**Decision: Subscription model for ongoing AI costs**

Reasons:
- AI provider costs are per-request (need ongoing revenue)
- One-time purchase would require aggressive upsells later
- Subscription allows continuous feature updates
- Lower upfront price ($7.99/mo) more accessible than $29.99

Tradeoff: Some users prefer one-time purchase (accept smaller market)

---

## Summary

**Proposed Product Identifiers:**
- Free tier: Built-in, no identifier needed
- Guided monthly: `com.plumbline.guide.guided.monthly` ($7.99)
- Guided yearly: `com.plumbline.guide.guided.yearly` ($59.99)
- Entitlement key: `guided_access` (boolean)

**Entitlement Behavior:**
- StoreKit 2 receipt validation (no Plumb Line account required)
- Server verifies receipt before spending AI resources (final authority)
- Cross-device restoration via Apple ID
- Family Sharing NOT supported for Guided AI
- Offline grace period: 7 days for Guided features (free tier always offline)
- Quota resets on subscription renewal date
- Client refreshes receipt immediately after purchase

**Required Server Work:**
- Receipt validation endpoint
- Entitlement caching (6-hour TTL)
- Request quota tracking (30 questions/period, 4 plans/period — provisional limits requiring real-data review)
- Rate limiting (10 requests/minute)
- Abuse prevention
- Monitoring and alerting
- Privacy policy hosting

**What's Missing in Current Project:**
- All StoreKit 2 client code
- All server receipt validation
- Upgrade prompt UI
- Subscription settings screen
- Quota tracking
- Privacy policy
- Terms of service
- App Store Connect setup

**Launch Decisions:**
- Family Sharing: NOT supported for Guided AI subscriptions
- Offline grace period: 7 days for Guided features (free tier always offline)
- Quota reset: On subscription renewal date (not rolling 30-day)
- Receipt refresh: Immediate after purchase; server is final authority
- Privacy policy: `https://plumbline.app/privacy`
- Age rating: Determined via Apple questionnaire before release (no parental consent flow)
- **Seven-day trial: Launch WITHOUT trial; revisit only after server reliability and real costs validated**
- **Fair-use quotas (provisional): 30 contextual questions and 4 adaptive plans per subscription period**
- **Limits must be reviewed with real data before wider launch**

---

**Next Steps:**
1. **Complete Prompt 6 visual acceptance in simulator** (immediate priority)
   - Validate passage actions save correctly
   - Verify Saved Items reopens passages with full context
   - Confirm daily path completes without crashes
2. Draft Privacy Policy and Terms of Service
3. Estimate AI provider costs per user (Prompt 9)
4. Implement StoreKit 2 integration (future prompt)
5. Build server receipt validation (future prompt)
6. Set up App Store Connect products (external)
7. Soft launch with provisional quotas
8. Review real cost and usage data, adjust quotas before wider launch
