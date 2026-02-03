# First Look - Mobile App Specification

## Complete Guide for Native Mobile App Development

This document provides a comprehensive specification for recreating the "First Look" web application as a native mobile app. It covers all functionality, UI/UX patterns, data models, API integrations, and implementation details.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [User Roles & Flows](#user-roles--flows)
3. [Screens & UI Specification](#screens--ui-specification)
4. [Database Schema](#database-schema)
5. [API/Backend Services](#apibackend-services)
6. [Authentication System](#authentication-system)
7. [File Upload System](#file-upload-system)
8. [AI Analysis Integration](#ai-analysis-integration)
9. [Third-Party Services](#third-party-services)
10. [Styling & Design System](#styling--design-system)
11. [Price Book Reference Data](#price-book-reference-data)

---

## App Overview

**First Look** is an AI-powered damage assessment tool designed for contractors. It enables:

- **Contractors** to create personalized upload links and manage customer projects
- **Customers** to upload photos/videos of property damage via shared links
- **AI** to automatically analyze damage and provide cost estimates

### Core Value Proposition
1. Contractors generate unique upload links for each customer/job
2. Customers upload photos/videos of damage through these links
3. AI analyzes the uploads and generates:
   - Damage type identification
   - Severity score (1-10)
   - Cost estimate range
   - Summary for the homeowner
4. Contractors view all projects in a dashboard and track status

---

## User Roles & Flows

### Role 1: Contractor (Authenticated User)

**Flow:**
1. Sign up with business name, email, password
2. Access dashboard after authentication
3. Create personalized upload links (with optional labels)
4. Share links with customers via text/email
5. View incoming customer projects
6. Review AI-generated damage assessments
7. Update project status (pending → analyzed → quoted → completed)
8. Delete projects or upload links as needed

### Role 2: Customer (Anonymous User)

**Flow:**
1. Receive upload link from contractor
2. Open link (no authentication required)
3. Enter their name
4. Upload photos/videos (max 5 files)
5. Submit for AI analysis
6. See success confirmation with project name

---

## Screens & UI Specification

### Screen 1: Landing Page (Public)
**Purpose:** Marketing page to attract contractors

**Sections:**
1. **Hero Section**
   - Title: "First Look"
   - Tagline: "AI-powered damage assessment for contractors. Let your customers upload photos, get instant estimates, and close more jobs."
   - CTA Buttons: "Get Started Free" → Sign Up, "Sign In" → Login

2. **How It Works** (3 cards)
   - Card 1: "Create Upload Link" - Icon: Link
   - Card 2: "Customer Uploads" - Icon: Camera
   - Card 3: "AI Analysis" - Icon: Sparkles

3. **Features Section** (4 feature cards)
   - "Instant Cost Estimates" - Icon: DollarSign (green)
   - "Damage Assessment" - Icon: Sparkles (blue)
   - "Personalized Links" - Icon: Link (purple)
   - "Project Dashboard" - Icon: CheckCircle (green)

4. **CTA Section**
   - Dark background (primary color)
   - "Ready to streamline your estimates?"
   - "Create Free Account" button

5. **Footer**
   - Simple text: "First Look - AI-Powered Damage Assessment for Contractors"

---

### Screen 2: Sign Up Page
**Purpose:** Register new contractor accounts

**Form Fields:**
- Business Name (text, required)
- Email (email, required)
- Password (password, required, min 6 characters)

**Actions:**
- Submit button: "Create Account"
- Link to Sign In page

**Behavior:**
- Show loading state during submission
- Display error messages inline
- On success: redirect to Dashboard

---

### Screen 3: Sign In Page
**Purpose:** Authenticate existing contractors

**Form Fields:**
- Email (email, required)
- Password (password, required)

**Actions:**
- Submit button: "Sign In"
- Link to Sign Up page

**Behavior:**
- Show loading state during submission
- Display error messages inline
- On success: redirect to Dashboard

---

### Screen 4: Contractor Dashboard
**Purpose:** Main workspace for contractors

**Layout:** Two-column layout (sidebar + main content)

#### Header
- App name: "First Look"
- User email display
- Sign Out button

#### Left Column: Upload Links Management

**Create Link Section:**
- Text input: "Label (optional)" placeholder
- Plus (+) button to create link

**Links List:**
- Scrollable list (max height ~250px)
- Each link shows:
  - Label (or "Unnamed link" if no label)
  - Creation date
  - Action buttons:
    - Copy link to clipboard
    - Open in new window
    - Delete link

**Empty State:**
- "No upload links yet"

#### Right Column: Projects List

**Header:**
- Title: "Projects"
- Description: "Customer uploads and AI assessments"

**Project Cards (list):**
Each project shows:
- Project name
- Status icon + status text
- Customer name
- Creation date
- Media count with icon (image or video)

**Status Icons:**
- Pending: Clock (yellow)
- Analyzed: FileText (blue)
- Quoted: DollarSign (green)
- Completed: CheckCircle (green)

**Expanded Project View (on tap):**
When a project is selected, expand to show:

1. **Media Preview**
   - Horizontal scroll of thumbnails (80x80px)
   - Images show actual preview
   - Videos show video icon placeholder

2. **Analysis Details**
   - Damage Type (in muted card)
   - Severity Score with color coding:
     - 1-3: Green (safe)
     - 4-6: Yellow (moderate)
     - 7-10: Red (urgent)
   - Cost Estimate (large, bold, primary color)
     - Format: "$X,XXX - $X,XXX"
   - Cost Reasoning (small text below estimate)
   - Summary (in bordered card)

3. **Actions**
   - Status dropdown (Pending/Analyzed/Quoted/Completed)
   - Delete button (red/destructive)

**Empty State:**
- FileText icon (large, faded)
- "No projects yet"
- "Share an upload link with a customer to get started"

---

### Screen 5: Customer Upload Page
**URL Pattern:** `/upload/{token}`
**Purpose:** Allow customers to submit damage photos/videos

**Header:**
- Business name (from contractor record)
- Link label (if provided)
- Instructions: "Upload photos or a video of your repair project"

**Form Card:**

1. **Title:** "Submit Your Photos"
2. **Description:** "Take clear photos or a short video from multiple angles to help us assess your project accurately."

3. **Customer Name Input**
   - Label: "Your Name *"
   - Placeholder: "Enter your full name"
   - Required field

4. **File Uploader Component**
   - Label: "Photos / Video *"
   - Drag-and-drop zone with dashed border
   - Click to browse option
   - Max 5 files
   - Accepted types: JPEG, PNG, GIF, WebP, MP4, WebM, MOV, AVI

5. **Upload Preview**
   - Grid of file previews
   - Each file shows:
     - Thumbnail (or video icon)
     - File name
     - File size
     - Remove (X) button
     - Progress bar during upload
     - Success checkmark after upload

6. **Submit Button**
   - Text: "Submit to {Business Name}"
   - Icon: Upload
   - Disabled until files are uploaded
   - Shows loading spinner during processing

7. **Disclaimer**
   - Small text: "By submitting, you agree to share these images with {Business Name} for assessment purposes."

**Error State:**
- Red background pill showing error message

**Processing State:**
- Spinner icon
- "Processing your submission..."

---

### Screen 6: Upload Success
**Purpose:** Confirm successful submission to customer

**Layout:** Centered card

**Content:**
- Green checkmark in circle (large)
- "Upload Complete!"
- "Thank you, {Customer Name}! Your photos have been submitted to {Business Name}."
- Project name in muted card
- "{Business Name} will review your submission and get back to you soon."

---

## Database Schema

### Table: contractors
```sql
id          UUID PRIMARY KEY (references auth.users.id)
email       TEXT NOT NULL
business_name TEXT (nullable)
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### Table: upload_links
```sql
id            UUID PRIMARY KEY DEFAULT uuid_generate_v4()
contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE
token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
label         TEXT (nullable)
expires_at    TIMESTAMPTZ (nullable, NULL = never expires)
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### Table: projects
```sql
id             UUID PRIMARY KEY DEFAULT uuid_generate_v4()
contractor_id  UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE
upload_link_id UUID REFERENCES upload_links(id) ON DELETE SET NULL
customer_name  TEXT NOT NULL
project_name   TEXT NOT NULL
status         TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'analyzed', 'quoted', 'completed'))
created_at     TIMESTAMPTZ DEFAULT NOW()
updated_at     TIMESTAMPTZ DEFAULT NOW()
```

### Table: project_media
```sql
id          UUID PRIMARY KEY DEFAULT uuid_generate_v4()
project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
file_url    TEXT NOT NULL
file_type   TEXT NOT NULL CHECK (file_type IN ('image', 'video'))
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### Table: project_analysis
```sql
id                UUID PRIMARY KEY DEFAULT uuid_generate_v4()
project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
damage_type       TEXT NOT NULL
severity_score    INTEGER NOT NULL CHECK (severity_score >= 0 AND severity_score <= 10)
cost_estimate_min INTEGER NOT NULL DEFAULT 0
cost_estimate_max INTEGER NOT NULL DEFAULT 0
cost_reasoning    TEXT
summary           TEXT NOT NULL
created_at        TIMESTAMPTZ DEFAULT NOW()
```

### Indexes
```sql
CREATE INDEX idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_upload_links_token ON upload_links(token);
CREATE INDEX idx_upload_links_contractor_id ON upload_links(contractor_id);
```

### Database Triggers

**Auto-create contractor on signup:**
```sql
CREATE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO contractors (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Auto-update updated_at:**
```sql
CREATE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## API/Backend Services

All backend operations are implemented as functions/services. Here are the required operations:

### Authentication Services

**signUp(email, password, businessName)**
- Create user in auth system
- Update contractor record with business_name
- Return success/error

**signIn(email, password)**
- Authenticate user
- Return session/token

**signOut()**
- End user session

**getUser()**
- Get current authenticated user

### Upload Links Services

**createUploadLink(label?)**
- Get current user
- Generate unique token (32 hex characters)
- Insert into upload_links
- Return: { success, link, uploadUrl }

**getUploadLinks()**
- Get current user
- Fetch all upload_links for contractor
- Order by created_at DESC
- Return: { links, error }

**deleteUploadLink(linkId)**
- Verify ownership
- Delete link
- Return: { success, error }

**getUploadLinkByToken(token)**
- Fetch link by token
- Check if expired (if expires_at is set)
- Join with contractors to get business_name
- Return: { link, contractor.business_name, error }

### Project Services

**createProject(input)**
Input:
```typescript
{
  contractorId: string;
  uploadLinkId?: string;
  customerName: string;
  fileUrls: string[];
}
```

Process:
1. Call analyzeMultipleMedia(fileUrls)
2. Get AI-generated project name from analysis
3. Insert into projects table
4. Insert each file into project_media
5. Insert analysis into project_analysis
6. Return: { success, projectId, projectName }

**getProjects()**
- Get current user
- Fetch all projects for contractor
- Include relations: project_media, project_analysis
- Order by created_at DESC
- Return: { projects, error }

**getProjectById(projectId)**
- Fetch single project with relations
- Verify ownership
- Return: { project, error }

**updateProjectStatus(projectId, status)**
- Verify ownership
- Update status field
- Trigger updated_at update
- Return: { success, error }

**deleteProject(projectId)**
- Verify ownership
- Delete project (cascades to media and analysis)
- Return: { success, error }

### Media Analysis Services

**analyzeMedia(fileUrl)**
- Fetch file from storage URL
- Validate file size (images max 10MB, videos max 100MB)
- Convert to base64
- Send to Google Gemini 2.5 Pro with system prompt
- Parse JSON response
- Return structured analysis

**analyzeMultipleMedia(fileUrls)**
- Process all files
- Combine into single analysis
- Return: { success, data } or { success: false, error }

---

## Authentication System

### Provider
Use Supabase Auth (or equivalent) with email/password authentication.

### Protected Routes
- `/dashboard/*` - requires authentication

### Public Routes
- `/` - landing page
- `/login` - sign in
- `/signup` - registration
- `/upload/{token}` - customer upload (no auth required)

### Session Management
- Cookie-based sessions
- Server-side session validation
- Auto-redirect authenticated users away from auth pages
- Auto-redirect unauthenticated users to login from protected routes

---

## File Upload System

### Storage Provider
Supabase Storage (or equivalent S3-compatible storage)

### Bucket Configuration
- Bucket name: "media"
- Public read access
- Authenticated write access (or public for customer uploads)

### File Naming Convention
```
uploads/{timestamp}-{random_hex}.{extension}
```

### Upload Function
```typescript
async function uploadToSupabase(file: File, bucket = "media") {
  const timestamp = Date.now();
  const randomHex = generateRandomHex(8);
  const extension = file.name.split('.').pop();
  const fileName = `uploads/${timestamp}-${randomHex}.${extension}`;

  // Upload to storage
  // Return public URL
}
```

### Supported File Types
**Images:** (max 10MB each)
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Videos:** (max 100MB each)
- MP4 (.mp4)
- WebM (.webm)
- MOV (.mov)
- AVI (.avi)

### File Validation
```typescript
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

function isValidFile(file: File): boolean {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) return false;

  if (isImage && file.size > MAX_IMAGE_SIZE) return false;
  if (isVideo && file.size > MAX_VIDEO_SIZE) return false;

  return true;
}
```

---

## AI Analysis Integration

### Provider
Google Gemini 2.5 Pro (Multimodal)

### API Key Environment Variable
```
GOOGLE_API_KEY=your_api_key_here
```

### System Prompt
```
You are a veteran general contractor with 30+ years of experience. Analyze the image(s)/video and provide your professional assessment of any damage or repair needed.

Respond with a JSON object containing:
{
  "damage_type": "Brief description of damage observed",
  "severity_score_1_to_10": 5,
  "cost_estimate_min": 500,
  "cost_estimate_max": 1500,
  "cost_reasoning": "2-3 sentences explaining your cost estimate factors",
  "summary_for_homeowner": "Friendly, clear explanation for the customer about what you see and what repairs may be needed",
  "suggested_project_name": "Short descriptive name for this project (3-5 words)"
}

Cost estimation guidelines based on severity:
- Severity 1-3: Minor repairs, typically $100-$1,000
- Severity 4-6: Moderate repairs, typically $1,000-$5,000
- Severity 7-8: Major repairs, typically $5,000-$15,000
- Severity 9-10: Critical/structural damage, typically $15,000+

Always respond with valid JSON only.
```

### Analysis Process
1. Fetch file from storage URL
2. Validate file size
3. Determine MIME type from file extension
4. Convert file buffer to base64
5. Create generative part for Gemini:
   ```typescript
   {
     inlineData: {
       data: base64String,
       mimeType: "image/jpeg" // or appropriate type
     }
   }
   ```
6. Send to Gemini with system prompt
7. Parse JSON response (handle markdown code blocks if present)
8. Validate and normalize response:
   - Clamp severity_score to 0-10
   - Ensure cost estimates are non-negative
9. Return structured analysis object

### Response Structure
```typescript
interface DamageAnalysis {
  damage_type: string;
  severity_score: number; // 0-10
  cost_estimate_min: number;
  cost_estimate_max: number;
  cost_reasoning: string;
  summary: string;
  suggested_project_name: string;
}
```

---

## Third-Party Services

### 1. Supabase
**Purpose:** Backend-as-a-Service

**Components Used:**
- **Auth:** Email/password authentication
- **Database:** PostgreSQL with Row Level Security
- **Storage:** File storage for uploads

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Google Generative AI (Gemini)
**Purpose:** Multimodal AI for damage analysis

**Model:** gemini-2.5-pro (or latest available)

**Environment Variables:**
```
GOOGLE_API_KEY=your_google_api_key
```

---

## Styling & Design System

### Color Palette

**Light Mode:**
```css
--background: #ffffff
--foreground: #0a0a0a
--card: #ffffff
--card-foreground: #0a0a0a
--primary: #18181b
--primary-foreground: #fafafa
--secondary: #f4f4f5
--secondary-foreground: #18181b
--muted: #f4f4f5
--muted-foreground: #71717a
--destructive: #ef4444
--destructive-foreground: #fafafa
--border: #e4e4e7
```

**Dark Mode:**
```css
--background: #0a0a0a
--foreground: #fafafa
--card: #0a0a0a
--card-foreground: #fafafa
--primary: #fafafa
--primary-foreground: #18181b
--secondary: #27272a
--secondary-foreground: #fafafa
--muted: #27272a
--muted-foreground: #a1a1aa
--destructive: #7f1d1d
--destructive-foreground: #fafafa
--border: #27272a
```

### Typography
- **Serif Font:** Geist (Google Font)
- **Monospace:** Geist Mono (Google Font)

### Border Radius
- Default: 8px (0.5rem)
- Small elements: 4px
- Buttons: 6px
- Cards: 8px

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Component Patterns

**Buttons:**
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: sm (h-9), default (h-10), lg (h-11), icon (h-10 w-10)
- Include hover states and disabled states

**Cards:**
- Background: card color
- Border: 1px solid border color
- Rounded corners: 8px
- Padding: 24px

**Inputs:**
- Border: 1px solid border color
- Rounded: 6px
- Padding: 8px 12px
- Focus: ring with primary color

**Status Badges:**
- Pending: Yellow background
- Analyzed: Blue background
- Quoted: Green background
- Completed: Dark green background

**Severity Colors:**
- Score 1-3: Green (#16a34a)
- Score 4-6: Yellow (#ca8a04)
- Score 7-10: Red (#dc2626)

---

## Price Book Reference Data

The app includes a comprehensive price book for contractor cost estimation. This data should be stored and accessible for reference.

### Trade Categories
- Plumbing
- Electrical
- Drywall & Paint
- Roofing
- HVAC
- Appliances
- General
- Carpentry
- Flooring
- Windows & Doors
- Concrete & Masonry
- Siding & Exterior
- Water & Mold Restoration
- Insulation

### Price Entry Structure
```typescript
interface PriceScenario {
  name: string;        // Display name
  low: number;         // Minimum price
  high: number;        // Maximum price
  unit: string;        // e.g., "per job", "per sq ft", "per hour"
  description: string; // Details about what's included
}
```

### Example Entries

**Plumbing:**
- Drain Clog (Sink/Tub): $150-$450 flat rate
- Toilet Replacement: $300-$600 per toilet
- Water Heater Replacement (Tank): $1,200-$2,500 per unit

**Electrical:**
- Outlet/Switch Repair: $125-$275 per visit
- Panel Upgrade: $2,500-$5,500 per job
- EV Charger Install: $500-$1,500 per install

**Roofing:**
- Shingle Repair (Minor): $350-$800 flat rate
- Leak Diagnostic: $250-$850 per leak
- Gutter Installation: $10-$20 per linear ft

See the full price book in `lib/price-book.updated.ts` for complete reference data.

---

## Implementation Notes for Mobile App

### Native Considerations

1. **Camera Integration**
   - Implement native camera access for photo/video capture
   - Support taking photos directly or selecting from gallery
   - Maintain same file type and size restrictions

2. **Push Notifications** (Future Enhancement)
   - Notify contractors when new projects are submitted
   - Notify on status changes

3. **Offline Support** (Future Enhancement)
   - Cache projects list for offline viewing
   - Queue uploads when offline

4. **Deep Linking**
   - Support opening upload links from SMS/email
   - URL scheme: `firstlook://upload/{token}`

5. **Biometric Authentication** (Future Enhancement)
   - Face ID / Touch ID for quick login
   - Keep session alive longer with biometric re-auth

### API Architecture for Mobile

Since the web app uses Next.js Server Actions, for mobile you'll need to:

1. **Option A: Create REST API endpoints**
   - Convert server actions to API routes
   - Use standard HTTP methods (GET, POST, PUT, DELETE)
   - Implement JWT or session-based auth

2. **Option B: Use Supabase directly**
   - Supabase client libraries work on mobile
   - RLS policies handle authorization
   - Direct database access with proper policies

### Recommended Mobile Approach

Use Supabase client SDK directly:
- Auth: `supabase.auth.signUp()`, `supabase.auth.signIn()`
- Database: `supabase.from('projects').select()`
- Storage: `supabase.storage.from('media').upload()`

For AI analysis, create a simple API endpoint or use Supabase Edge Functions to call Gemini, as API keys should not be exposed in mobile apps.

---

## Summary

This specification covers all functionality needed to recreate First Look as a native mobile app:

1. **Two user types:** Contractors (authenticated) and Customers (anonymous)
2. **6 main screens:** Landing, Sign Up, Sign In, Dashboard, Upload, Success
3. **5 database tables:** contractors, upload_links, projects, project_media, project_analysis
4. **Core features:**
   - Email/password authentication
   - Personalized upload link generation
   - Drag-and-drop file upload (images/videos)
   - AI-powered damage analysis with Google Gemini
   - Project management with status tracking
5. **Integrations:** Supabase (auth, database, storage) + Google Gemini AI

The mobile app should maintain feature parity with the web app while leveraging native capabilities like camera access and push notifications.
