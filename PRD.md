# Frame Art — Product Requirements Document

> A mobile-first PWA for controlling Samsung Frame TVs with custom art, AI generation, and one-tap display.

---

## 1. Overview

Frame Art is a Progressive Web App that gives Yoav full control over his six Samsung Frame TVs from his phone. The app connects to an existing backend (OpenClaw server reachable via Tailscale) that can push images to any TV via SSH and the `samsungtvws` Python library.

The app lets you upload photos, generate AI art from text prompts or reference images, and push artwork to any combination of TVs instantly. It also maintains a history of all displayed art for easy re-display, supports occasion-based presets, and can schedule themed art for different days of the week.

**Single-user, single-household. No auth required.**

---

## 2. Goals

| # | Goal |
|---|------|
| G1 | Push any image to any combination of 6 TVs in under 5 seconds from tap |
| G2 | Generate gallery-quality AI art from text prompts with zero friction |
| G3 | Transform personal photos into styled artwork (Pixar, watercolour, Van Gogh, etc.) |
| G4 | Maintain a persistent art history with one-tap re-display |
| G5 | Support occasion-based and scheduled art themes |
| G6 | Feel premium, minimal, and native on iPhone — installable as PWA |

---

## 3. Out of Scope (v1)

- Multi-user / authentication / sharing
- Samsung TV power on/off or volume control
- Art marketplace or community features
- Android-specific optimisations (works, but iPhone is primary)
- TV status monitoring (online/offline detection)
- Art cropping/editing within the app (upload as-is or AI-generated)
- Integration with third-party art services (Unsplash, etc.)

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, PWA manifest + service worker |
| **Backend API** | Next.js API routes (deployed on Vercel) |
| **AI — Image Gen** | OpenAI DALL-E 3 (`dall-e-3`, 1024×1024 or 1792×1024) |
| **AI — Prompt Enhancement** | OpenAI GPT-4o (refines user prompts into art-quality descriptions) |
| **AI — Style Transfer** | OpenAI GPT-4o with vision (reference image + style instruction → DALL-E prompt) |
| **TV Control** | API route → SSH to `sshuser@100.75.229.76` via Tailscale → Python script using `samsungtvws` |
| **Image Storage** | Vercel Blob (primary) or Supabase Storage (fallback) |
| **Hosting** | Vercel (frontend + API) |

---

## 5. TV Inventory

| Name | Size | IP Address | Notes |
|------|------|-----------|-------|
| Bottom Right | 32" | `10.0.0.82` | Portrait orientation |
| Top Right | 32" | `10.0.0.138` | Portrait orientation |
| Top Left | 32" | `10.0.0.160` | Portrait orientation |
| Bottom Left | 32" | `10.0.0.198` | Portrait orientation |
| Centre | 43" | `10.0.0.41` | **Landscape — images must be rotated 90° before push** |
| Mega Frame | — | `10.0.0.111` | Large format display |

### TV Push Mechanism

```
Vercel API Route
  → SSH to sshuser@100.75.229.76 (Tailscale)
    → Python script on home PC
      → samsungtvws library
        → upload_jpeg(image_data)
        → select_image(image_id)
```

The 43" Centre TV requires a 90° rotation applied server-side before push. All other TVs receive images as-is.

---

## 6. File Structure

```
frame-art/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/                    # PWA icons (192, 512)
│   └── occasions/                # Occasion preset thumbnails
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, dark theme, bottom nav
│   │   ├── page.tsx              # Generate tab (default landing)
│   │   ├── upload/
│   │   │   └── page.tsx          # Upload & display
│   │   ├── history/
│   │   │   └── page.tsx          # Art history gallery
│   │   ├── settings/
│   │   │   └── page.tsx          # Scheduled themes, occasions, preferences
│   │   └── api/
│   │       ├── generate/
│   │       │   └── route.ts      # DALL-E 3 generation
│   │       ├── style/
│   │       │   └── route.ts      # Reference image + style transfer
│   │       ├── push/
│   │       │   └── route.ts      # Push image to selected TVs
│   │       ├── history/
│   │       │   └── route.ts      # CRUD for art history
│   │       ├── occasions/
│   │       │   └── route.ts      # Occasion preset generation
│   │       └── schedule/
│   │           └── route.ts      # Scheduled theme config
│   ├── components/
│   │   ├── TVGrid.tsx            # 6-TV selector grid
│   │   ├── TVCard.tsx            # Individual TV toggle card
│   │   ├── BottomNav.tsx         # Generate | Upload | History | Settings
│   │   ├── ArtCard.tsx           # History gallery item
│   │   ├── StylePicker.tsx       # Style selection for reference image flow
│   │   ├── OccasionGrid.tsx      # Occasion preset buttons
│   │   ├── PromptInput.tsx       # Text input with enhance toggle
│   │   ├── ImageUploader.tsx     # Camera roll / file picker
│   │   └── PushButton.tsx        # "Push to TVs" action button
│   ├── lib/
│   │   ├── openai.ts             # OpenAI client (DALL-E 3, GPT-4o)
│   │   ├── tv-push.ts            # SSH + samsungtvws push logic
│   │   ├── storage.ts            # Vercel Blob / Supabase storage
│   │   ├── image-utils.ts        # Rotation, resizing, format conversion
│   │   ├── tv-config.ts          # TV inventory, IPs, display properties
│   │   └── occasions.ts          # Occasion presets and prompt templates
│   ├── hooks/
│   │   ├── useTVSelection.ts     # TV toggle state management
│   │   ├── useArtHistory.ts      # History fetch + pagination
│   │   └── usePush.ts            # Push state, loading, error handling
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
├── PRD.md                        # This document
└── README.md
```

---

## 7. Features & Requirements

### 7.1 TV Selector Grid

The TV grid is a persistent UI element visible on all primary screens (Generate, Upload). It displays all 6 TVs in a spatial layout reflecting their physical arrangement.

| Req | Description |
|-----|------------|
| TV-1 | Display 6 TV cards in a 3×2 grid: top row (TL, Centre, TR), bottom row (BL, Mega, BR) |
| TV-2 | Each card shows TV name, size label, and a thumbnail of the last-pushed image |
| TV-3 | Tap to toggle selection — selected TVs have a glowing accent border |
| TV-4 | "Select All" / "Deselect All" quick actions |
| TV-5 | Centre TV card shows a landscape icon indicator (rotation handled automatically) |
| TV-6 | Persist last selection in localStorage |

### 7.2 Upload & Display

| Req | Description |
|-----|------------|
| UP-1 | Tap to open device file picker (camera roll on mobile) |
| UP-2 | Support JPEG, PNG, HEIC — convert to JPEG before push |
| UP-3 | Show image preview after selection |
| UP-4 | "Push to TVs" button sends to all selected TVs |
| UP-5 | Show per-TV push status (pending → pushing → done / error) |
| UP-6 | Auto-rotate image 90° for Centre TV |
| UP-7 | Save pushed image to art history |

### 7.3 Text to Art (Generate)

| Req | Description |
|-----|------------|
| GEN-1 | Text input field for art prompt (max 1000 chars) |
| GEN-2 | "Enhance prompt" toggle — when on, GPT-4o refines the prompt for better art output |
| GEN-3 | Generate button calls DALL-E 3 (1024×1024 default, 1792×1024 for landscape TVs) |
| GEN-4 | Show generation progress (spinner with "Creating your art...") |
| GEN-5 | Preview generated image before pushing |
| GEN-6 | Option to regenerate (new seed) without retyping |
| GEN-7 | Push to selected TVs after confirmation |
| GEN-8 | Save prompt + generated image to history |

### 7.4 Reference Image + AI Style

| Req | Description |
|-----|------------|
| STY-1 | Upload a reference photo from camera roll |
| STY-2 | Choose a style from a visual picker: Pixar, Watercolour, Van Gogh, Cartoon, Oil Painting, Pencil Sketch, Pop Art, Anime, Minimalist, Stained Glass |
| STY-3 | GPT-4o with vision analyses the reference image and generates a DALL-E prompt combining the image description with the chosen style |
| STY-4 | DALL-E 3 generates the styled version |
| STY-5 | Side-by-side preview: original vs styled |
| STY-6 | Push styled image to selected TVs |
| STY-7 | Save reference + style + result to history |

### 7.5 Art History

| Req | Description |
|-----|------------|
| HIS-1 | Scrollable masonry grid of all previously pushed images |
| HIS-2 | Each card shows thumbnail, timestamp, source (Upload / Generated / Styled / Occasion) |
| HIS-3 | Tap to expand: full preview + metadata (prompt, style, TVs pushed to) |
| HIS-4 | "Re-display" button pushes to currently selected TVs |
| HIS-5 | Swipe to delete from history |
| HIS-6 | Filter by source type |
| HIS-7 | Lazy-load with infinite scroll |

### 7.6 Occasion Art

| Req | Description |
|-----|------------|
| OCC-1 | Grid of occasion presets: Birthday, Christmas, Hanukkah, Easter, Movie Night, Date Night, Party, Shabbat |
| OCC-2 | Each preset has a curated prompt template and thumbnail |
| OCC-3 | Tap an occasion → generates themed art via DALL-E 3 |
| OCC-4 | Option to customise before generation (e.g., "Birthday — add the name 'Maya'") |
| OCC-5 | Push to selected TVs |
| OCC-6 | Save to history with occasion tag |

### 7.7 Scheduled Themes

| Req | Description |
|-----|------------|
| SCH-1 | Settings page to configure weekday vs weekend art themes |
| SCH-2 | Theme options: Calm/Nature, Abstract, Classic Art, Family Photos, Fun/Colourful, Seasonal |
| SCH-3 | Set time for daily art refresh (e.g., 7:00 AM) |
| SCH-4 | Cron job (Vercel Cron or OpenClaw cron) generates and pushes art at scheduled time |
| SCH-5 | Preview what the next scheduled push will look like |
| SCH-6 | Enable/disable scheduling per-TV |

### 7.8 Design System

| Req | Description |
|-----|------------|
| DES-1 | Dark theme — background `#0A0A0A`, card surfaces `#1A1A1A`, accent `#6366F1` (indigo) |
| DES-2 | Typography: Inter or SF Pro, clean hierarchy |
| DES-3 | Bottom navigation: Generate (sparkle icon) \| Upload (arrow-up icon) \| History (clock icon) \| Settings (gear icon) |
| DES-4 | Smooth transitions and micro-animations (Framer Motion) |
| DES-5 | Haptic feedback on push confirmation (where supported) |
| DES-6 | PWA: installable, splash screen, full-screen mode, app icon |
| DES-7 | Safe area insets for iPhone notch/Dynamic Island |

---

## 8. API Routes

### `POST /api/generate`

```typescript
Request:  { prompt: string, enhance: boolean, size: "square" | "landscape" }
Response: { imageUrl: string, enhancedPrompt?: string }
```

### `POST /api/style`

```typescript
Request:  { referenceImageBase64: string, style: string }
Response: { imageUrl: string, description: string }
```

### `POST /api/push`

```typescript
Request:  { imageUrl: string, tvIds: string[] }
Response: { results: { tvId: string, status: "success" | "error", error?: string }[] }
```

### `GET /api/history`

```typescript
Response: { items: ArtHistoryItem[], nextCursor?: string }
```

### `POST /api/occasions`

```typescript
Request:  { occasion: string, customisation?: string }
Response: { imageUrl: string, prompt: string }
```

### `PUT /api/schedule`

```typescript
Request:  { weekdayTheme: string, weekendTheme: string, time: string, enabledTvIds: string[] }
Response: { success: boolean }
```

---

## 9. Milestones

### M1 — Foundation (Week 1–2)

**Goal:** App shell, TV grid, and manual image push working end-to-end.

- [ ] Next.js 14 project scaffold with Tailwind, PWA manifest, service worker
- [ ] Dark theme design system + component library (TVCard, BottomNav, PushButton)
- [ ] TV selector grid with toggle, select all, localStorage persistence
- [ ] `/api/push` route: receives image URL + TV IDs, SSHs to home PC, runs push script
- [ ] Image upload flow: file picker → preview → push to TVs
- [ ] Auto-rotation for Centre TV (43")
- [ ] Basic error handling and push status indicators

**Acceptance:** Upload a photo on iPhone → select 3 TVs → tap push → image appears on all 3 TVs within 10 seconds.

---

### M2 — AI Generation (Week 3–4)

**Goal:** Text-to-art and style transfer fully functional.

- [ ] `/api/generate` route: GPT-4o prompt enhancement + DALL-E 3 generation
- [ ] Generate tab UI: prompt input, enhance toggle, preview, regenerate
- [ ] `/api/style` route: GPT-4o vision analysis + DALL-E 3 styled generation
- [ ] Style picker component with 10 visual style options
- [ ] Side-by-side preview for style transfer
- [ ] Loading states and error handling for AI operations

**Acceptance:** Type "a cosy cabin in autumn" → toggle enhance → generate → preview appears in ~15s → push to TVs. Upload a selfie → pick "Pixar" → get a Pixar-styled version → push to TVs.

---

### M3 — History & Occasions (Week 5–6)

**Goal:** Persistent art history and occasion presets.

- [ ] Vercel Blob (or Supabase Storage) integration for image persistence
- [ ] `/api/history` route with cursor-based pagination
- [ ] History tab: masonry grid, expand to detail, re-display, delete
- [ ] All push actions save to history automatically
- [ ] Occasion presets UI with 8 preset options
- [ ] `/api/occasions` route with curated prompt templates
- [ ] Occasion customisation flow

**Acceptance:** Browse history → see all previously pushed art → tap any item → re-display on TVs. Tap "Movie Night" occasion → themed art generates → pushes to all TVs.

---

### M4 — Scheduling & Polish (Week 7–8)

**Goal:** Automated art scheduling, PWA polish, production readiness.

- [ ] Scheduled themes settings UI
- [ ] `/api/schedule` route + Vercel Cron (or OpenClaw cron) for daily art refresh
- [ ] PWA install prompt, splash screen, offline fallback page
- [ ] Framer Motion transitions on all screens
- [ ] Performance optimisation: image compression, lazy loading, caching
- [ ] Error boundary and retry logic for all API calls
- [ ] End-to-end testing on iPhone Safari
- [ ] Production deployment to Vercel

**Acceptance:** Set weekday theme to "Calm/Nature" at 7 AM → next morning, all enabled TVs show a new nature artwork. App is installable as PWA on iPhone, feels native, loads in <2s.

---

## 10. Acceptance Criteria (Global)

| # | Criterion |
|---|----------|
| AC-1 | Image push completes in <10 seconds for any single TV |
| AC-2 | AI generation (DALL-E 3) returns in <20 seconds |
| AC-3 | App loads in <2 seconds on 4G connection |
| AC-4 | PWA installable on iOS Safari and Chrome |
| AC-5 | All images in history are persistent across sessions |
| AC-6 | Centre TV images are correctly rotated (no manual intervention) |
| AC-7 | TV grid selection persists across app reloads |
| AC-8 | No authentication required — app is immediately usable |
| AC-9 | Dark theme is consistent across all screens |
| AC-10 | Works offline for history browsing (cached images) |

---

## 11. Open Questions

| # | Question | Impact |
|---|---------|--------|
| Q1 | Should we add TV online/offline status detection via ping? | UX — avoids pushing to unreachable TVs |
| Q2 | Vercel Blob vs Supabase Storage — cost and size limits for art history? | Architecture — storage choice affects API design |
| Q3 | Should DALL-E generation size adapt per TV (portrait for 32", landscape for 43")? | Quality — optimal resolution per display |
| Q4 | Rate limiting on AI generation to control OpenAI costs? | Cost — DALL-E 3 is ~$0.04–0.08 per image |
| Q5 | Should the app support video/slideshow on Frame TVs? | Scope — `samsungtvws` may support slideshows |
| Q6 | Backup push mechanism if Tailscale tunnel is down? | Reliability — fallback path needed? |
| Q7 | How should the Mega Frame be treated — same resolution as 32" panels or higher? | Quality — may need different image sizes |
| Q8 | Should scheduled art be unique each day or drawn from a curated pool? | Cost vs variety tradeoff |

---

## 12. Security Notes

- No user auth (household-only app). If exposed publicly, add a simple PIN or passphrase.
- SSH credentials for the home PC are stored as environment variables on Vercel (never client-side).
- OpenAI API key stored as Vercel environment variable.
- Tailscale provides encrypted tunnel — no ports exposed to public internet.
- Image uploads are validated (type, size) before processing.

---

## 13. Signature

*PRD authored by Archie — claude-opus-4-6 — March 2026*
