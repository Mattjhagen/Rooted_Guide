# App Identity - Plumb Line

## Identifiers

### Display Names
- **App Name**: Plumb Line
- **Repository**: Rooted_Guide (unchanged)
- **Package Name**: plumb-line

### Platform Identifiers

#### iOS
- **Bundle Identifier**: `com.mattjhagen.plumbline`
- **Display Name**: Plumb Line
- **URL Scheme**: `plumbline://`

#### Android
- **Package Name**: `com.mattjhagen.plumbline`
- **App Name**: Plumb Line
- **Deep Link Scheme**: `plumbline://`

### Version Information

**Current Version**: 0.1.0 (new app baseline)

This version number represents a fresh start for Plumb Line as a separately releasable application. It does not carry forward Rooted Daily's release history.

## Separation from Rooted Daily

Plumb Line is a **separate application** from Rooted Daily:

- **Different bundle identifiers** (iOS and Android)
- **Different EAS project** (must be created separately)
- **Different App Store/Play Store listings**
- **No shared update channels**
- **Independent release cadence**

### Repository Structure
- **Rooted_Guide**: Contains Plumb Line codebase (this repository)
- **Rooted_Daily**: Remains unchanged with its own identity (`com.rooteddaily.bible`)

Both applications can coexist on the same device without conflict.

## EAS Build & Update Configuration

**⚠️ IMPORTANT**: Do not reuse the existing Rooted Daily EAS project.

### Required Setup Steps (Manual)

Before creating production builds:

1. **Create New EAS Project**:
   ```bash
   cd /Users/matt/Documents/Rooted/Rooted_Guide
   eas init --id NEW_PROJECT_ID
   ```
   This will create a NEW EAS project linked to Plumb Line's bundle IDs.

2. **Configure EAS Build** (`eas.json`):
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "ios": {
           "bundleIdentifier": "com.mattjhagen.plumbline"
         },
         "android": {
           "package": "com.mattjhagen.plumbline"
         }
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "bundleIdentifier": "com.mattjhagen.plumbline"
         },
         "android": {
           "package": "com.mattjhagen.plumbline"
         }
       },
       "production": {
         "ios": {
           "bundleIdentifier": "com.mattjhagen.plumbline"
         },
         "android": {
           "package": "com.mattjhagen.plumbline"
         }
       }
     }
   }
   ```

3. **App Store Connect Setup** (iOS):
   - Create **new** App Store listing with bundle ID `com.mattjhagen.plumbline`
   - Do NOT use the existing Rooted Daily listing
   - Configure App Name: "Plumb Line"
   - Set up provisioning profiles for the new bundle ID

4. **Google Play Console Setup** (Android):
   - Create **new** app with package `com.mattjhagen.plumbline`
   - Do NOT use the existing Rooted Daily listing
   - Configure App Name: "Plumb Line"
   - Set up signing configuration

## Deep Linking

### URL Scheme
Both platforms use: `plumbline://`

### Universal Links (iOS)
Will be configured in future prompt with domain: `plumbline.app` or similar

### App Links (Android)
Will be configured in future prompt with domain: `plumbline.app` or similar

## Sign in with Apple

When implementing authentication (Prompt 8):
- Use bundle ID: `com.mattjhagen.plumbline`
- Create NEW Apple Developer service ID for Plumb Line
- Do NOT reuse Rooted Daily's Sign in with Apple configuration

## Current Status

- ✅ App identity configured in `app.json`
- ✅ Documentation updated
- ✅ Version reset to 0.1.0
- ⏳ EAS project creation (manual step required)
- ⏳ App Store Connect listing (manual step required)
- ⏳ Google Play Console listing (manual step required)
