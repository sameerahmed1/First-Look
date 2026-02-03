# Hybrid Web/Mobile Architecture Recommendations

## The Challenge

You want to:
1. **Keep the customer upload experience on the web** - Customers receive links and upload photos via browser (no app download required)
2. **Move the contractor dashboard to a native mobile app** - Contractors manage projects from their phones

This is a smart approach because:
- Customers have a one-time interaction and won't want to download an app
- Contractors use the dashboard regularly and benefit from a native mobile experience

---

## Recommended Architecture

### Option 1: Hybrid Approach (Recommended)

**Keep the Web App running for:**
- Landing page (`/`)
- Customer upload pages (`/upload/{token}`)
- Upload success confirmation

**Build Native Mobile App for:**
- Contractor authentication
- Dashboard (project management)
- Upload link creation/management
- Push notifications for new submissions

**Shared Backend:**
- Both web and mobile connect to the same Supabase backend
- Same database, same storage, same AI analysis service

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE BACKEND                         │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Auth   │  │   Database   │  │   Storage   │  │   Edge    │ │
│  │          │  │  (Postgres)  │  │   (Media)   │  │ Functions │ │
│  └──────────┘  └──────────────┘  └─────────────┘  └───────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌───────────────┐ ┌───────────┐ ┌───────────────┐
    │   WEB APP     │ │  MOBILE   │ │  GEMINI AI    │
    │ (Next.js)     │ │   APP     │ │  (Analysis)   │
    │               │ │           │ │               │
    │ - Landing     │ │ - Login   │ │ Called by     │
    │ - /upload/*   │ │ - Dashboard│ │ Edge Function │
    │ - Success     │ │ - Links   │ │ or Web API    │
    └───────────────┘ └───────────┘ └───────────────┘
         │                  │
         │                  │
    Customers          Contractors
    (Browser)          (iOS/Android)
```

---

## Implementation Strategy

### Step 1: Refactor Web App (Minimal Changes)

Keep the existing Next.js app but simplify it:

**Keep these pages:**
- `/` - Landing page (for marketing/SEO)
- `/upload/[token]` - Customer upload form
- Success confirmation after upload

**Remove or redirect these pages:**
- `/login` → Redirect to mobile app download or show "Use our mobile app"
- `/signup` → Same as above
- `/dashboard` → Same as above

**Modify the landing page:**
- Change CTAs from "Sign In" / "Sign Up" to "Download App"
- Add app store links (iOS App Store, Google Play)

### Step 2: Create API Layer for Mobile

Since the mobile app can't use Next.js Server Actions, you need API endpoints.

**Option A: Supabase Edge Functions (Recommended)**

Create Edge Functions for operations that need server-side logic:

```
supabase/functions/
├── analyze-media/       # Calls Gemini API (keeps API key secure)
├── create-project/      # Creates project with analysis
└── ...
```

**Option B: Add API Routes to Existing Next.js App**

```
app/api/
├── auth/
│   ├── signup/route.ts
│   └── signin/route.ts
├── projects/
│   ├── route.ts         # GET (list), POST (create)
│   └── [id]/route.ts    # GET, PUT, DELETE
├── upload-links/
│   ├── route.ts         # GET (list), POST (create)
│   └── [id]/route.ts    # DELETE
└── analyze/
    └── route.ts         # POST (analyze media)
```

**Most operations can use Supabase client directly from mobile** because:
- Row Level Security (RLS) handles authorization
- Supabase JS SDK works on mobile (React Native, Flutter, etc.)
- Only the AI analysis needs a server-side endpoint (to protect the API key)

### Step 3: Secure the AI Analysis

The Gemini API key must stay server-side. Options:

**A. Supabase Edge Function:**
```typescript
// supabase/functions/analyze-media/index.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

Deno.serve(async (req) => {
  const { fileUrls } = await req.json();

  // Verify authentication
  const authHeader = req.headers.get('Authorization');
  // ... validate JWT

  // Call Gemini
  const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY'));
  // ... perform analysis

  return new Response(JSON.stringify(analysis));
});
```

**B. Keep it in Next.js API route:**
```typescript
// app/api/analyze/route.ts
export async function POST(req: Request) {
  const { fileUrls } = await req.json();

  // Verify authentication via Supabase
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Call Gemini
  const analysis = await analyzeMultipleMedia(fileUrls);
  return Response.json(analysis);
}
```

### Step 4: Mobile App Architecture

**Recommended Framework:** React Native (with Expo) or Flutter

**Why React Native/Expo:**
- Shares JavaScript ecosystem with existing codebase
- Supabase has excellent React Native support
- Can reuse TypeScript types and some logic
- Expo simplifies builds and updates

**Mobile App Structure:**
```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ProjectDetailScreen.tsx
│   │   └── CreateLinkScreen.tsx
│   ├── components/
│   │   ├── ProjectCard.tsx
│   │   ├── UploadLinkCard.tsx
│   │   └── ...
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── projects.ts
│   │   ├── uploadLinks.ts
│   │   └── auth.ts
│   └── types/
│       └── index.ts  # Can copy from web app
├── app.json
└── package.json
```

**Supabase Client Setup (Mobile):**
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

---

## URL and Deep Linking Strategy

### Upload Links Stay Web-Based

When contractors create upload links, the URLs point to your web app:
```
https://firstlook.app/upload/abc123def456
```

Customers click these links → Opens in browser → Submits photos → Done.

### Mobile App Deep Links (Optional Enhancement)

For contractor convenience, you can add deep links to the mobile app:

**App Scheme:** `firstlook://`

**Examples:**
- `firstlook://dashboard` - Opens dashboard
- `firstlook://project/uuid` - Opens specific project

**Push Notification Flow:**
1. Customer submits photos on web
2. Backend triggers push notification to contractor
3. Contractor taps notification
4. Opens mobile app to new project

---

## Data Flow for Hybrid System

### Customer Upload Flow (Web)

```
1. Customer receives SMS/email with link
   └─> https://firstlook.app/upload/abc123

2. Opens in mobile browser (no app needed)

3. Enters name, uploads photos

4. Web app uploads to Supabase Storage

5. Web app calls API endpoint to create project
   └─> POST /api/projects (or Supabase Edge Function)

6. API calls Gemini for analysis

7. API saves project + analysis to database

8. Customer sees success screen

9. (Optional) Push notification sent to contractor's app
```

### Contractor Dashboard Flow (Mobile App)

```
1. Contractor opens mobile app

2. If not logged in:
   └─> Login screen
   └─> Supabase Auth (email/password)
   └─> Session stored in AsyncStorage

3. Dashboard screen loads:
   └─> supabase.from('projects').select('*')
   └─> RLS ensures only their projects returned

4. Create upload link:
   └─> supabase.from('upload_links').insert(...)
   └─> Generate link URL with web domain

5. Share link:
   └─> Native share sheet (SMS, email, etc.)

6. View project:
   └─> Navigate to detail screen
   └─> Show analysis, media, status

7. Update status:
   └─> supabase.from('projects').update(...)
```

---

## Migration Plan

### Phase 1: Prepare Backend (1 week)
- [ ] Create Supabase Edge Function for AI analysis
- [ ] Test Edge Function with existing web app
- [ ] Add API route fallback if needed

### Phase 2: Modify Web App (1 week)
- [ ] Update landing page with app download CTAs
- [ ] Add redirect from `/login` and `/signup` to app store
- [ ] Remove dashboard from web (or show "Use mobile app" message)
- [ ] Keep upload pages fully functional

### Phase 3: Build Mobile App (2-4 weeks)
- [ ] Set up React Native/Expo project
- [ ] Implement authentication screens
- [ ] Build dashboard screen
- [ ] Build upload link management
- [ ] Build project detail view
- [ ] Add push notifications

### Phase 4: Testing & Launch
- [ ] Test customer upload flow end-to-end
- [ ] Test contractor mobile app
- [ ] Submit to App Store and Google Play
- [ ] Gradual rollout to existing users

---

## Alternative Approaches

### Alternative 1: PWA for Both

Instead of a native mobile app, make the web app a Progressive Web App (PWA):

**Pros:**
- Single codebase
- No app store approval needed
- Instant updates

**Cons:**
- Less polished than native
- Limited push notification support on iOS
- No app store visibility

### Alternative 2: Keep Everything Web

Just optimize the existing web app for mobile:

**Pros:**
- Simplest approach
- No new codebase

**Cons:**
- No offline support
- No push notifications
- Less "app-like" feel

### Alternative 3: Full Native for Both Sides

Build native apps for both contractors AND customers:

**Pros:**
- Best user experience
- Full native capabilities

**Cons:**
- Customers must download app for one-time use
- Higher friction = fewer submissions
- Not recommended for your use case

---

## Recommendation Summary

**The hybrid approach is best for your use case:**

1. **Keep web app for customers** - Frictionless upload via links
2. **Build native mobile app for contractors** - Better daily-use experience
3. **Share Supabase backend** - No data duplication, single source of truth
4. **Use Edge Functions for AI** - Keep API keys secure

This gives customers the convenience of web links while giving contractors the native app experience they'll appreciate for daily use.

---

## Next Steps

1. Review this architecture with your team
2. Decide on mobile framework (React Native recommended)
3. Set up Supabase Edge Functions for AI analysis
4. Begin mobile app development using the MOBILE_APP_SPECIFICATION.md
5. Modify web app to redirect contractors to mobile app

The existing web app infrastructure remains valuable - you're not replacing it, you're extending the system with a mobile component for contractors.
