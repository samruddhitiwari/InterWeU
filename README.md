# InterWeU - All-in-One Placement Portal

A production-ready landing page for InterWeU, featuring Tinder-like job discovery, comprehensive recruitment features, and Supabase-powered lead capture.

## Features

- **Responsive Design**: Mobile-first, accessible (WCAG AA compliant)
- **Interactive Job Swipe Demo**: Pure front-end Tinder-style job discovery with drag/touch support
- **Lead Capture**: Supabase-powered email collection with RLS security
- **Modern UI**: Clean design with slate/blue palette, smooth animations, toast notifications
- **SEO Optimized**: Complete meta tags, Open Graph, Twitter cards
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Icons**: Inline SVG
- **Fonts**: System font stack (Inter/Segoe UI/SF Pro fallbacks)

## Quick Start

### 1. Clone and Run Locally

This is a static site. You can serve it with any HTTP server:

```bash
# Using Python 3
python -m http.server 5000

# Using Node.js (http-server)
npx http-server -p 5000

# Using PHP
php -S localhost:5000
```

Then open `http://localhost:5000` in your browser.

### 2. Set Up Supabase (Required for Lead Capture)

#### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the database to be provisioned

#### Step 2: Create the `leads` Table

Go to the SQL Editor in your Supabase dashboard and run this SQL:

```sql
-- Create the leads table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  role text not null check (role in ('student', 'recruiter', 'placement')),
  org text,
  created_at timestamptz default now()
);

-- Create index on email for faster lookups
create index leads_email_idx on public.leads(email);

-- Create index on created_at for analytics
create index leads_created_at_idx on public.leads(created_at desc);
```

#### Step 3: Set Up Row Level Security (RLS)

**IMPORTANT**: The anon key is public and exposed in the frontend. RLS policies ensure anonymous users can ONLY insert leads, not read or modify them.

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable Row Level Security
alter table public.leads enable row level security;

-- Allow anonymous users to INSERT leads only
create policy "anon can insert leads only"
on public.leads
for insert
to anon
with check (true);

-- Prevent anonymous users from reading leads
create policy "no read for anon"
on public.leads
for select
to anon
using (false);

-- Prevent anonymous users from updating leads
create policy "no update for anon"
on public.leads
for update
to anon
using (false);

-- Prevent anonymous users from deleting leads
create policy "no delete for anon"
on public.leads
for delete
to anon
using (false);
```

**Optional**: Allow authenticated admins to view leads:

```sql
-- Allow authenticated users (admins) to read all leads
create policy "authenticated can read leads"
on public.leads
for select
to authenticated
using (true);
```

#### Step 4: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (starts with `eyJ...`)

#### Step 5: Configure the Application

Open `index.html` and find the `<body>` tag (around line 30):

```html
<body data-supabase-url="YOUR_SUPABASE_URL" data-supabase-key="YOUR_SUPABASE_ANON_KEY">
```

Replace with your actual values:

```html
<body data-supabase-url="https://xxxxx.supabase.co" data-supabase-key="eyJhbGc...your-actual-key">
```

#### Step 6: Test Lead Capture

1. Reload your page
2. Scroll to "Join the Waitlist" section
3. Fill out the form and submit
4. You should see a success toast message
5. Check your Supabase dashboard → Table Editor → `leads` to see the new entry

### 3. Verify RLS is Working

To ensure anonymous users can't read your leads:

1. Open browser console (F12)
2. Run this test:

```javascript
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY');
const { data, error } = await supabase.from('leads').select('*');
console.log(data); // Should be null
console.log(error); // Should show permission denied
```

If you see an error about permission denied, RLS is working correctly! ✅

## Deployment on Replit

This project is configured to run on Replit:

1. The site is served on port 5000 (required for Replit webview)
2. Access your site via the webview preview
3. Supabase credentials are configured in the HTML file (no server-side code needed)

## File Structure

```
.
├── index.html          # Main HTML file with all sections
├── styles.css          # All styling (mobile-first, responsive)
├── script.js           # JavaScript (Supabase, interactions, analytics)
└── README.md           # This file
```

## Security Notes

⚠️ **Important Security Information**:

- The Supabase anon key is **intentionally public** and safe to expose in frontend code
- Row Level Security (RLS) policies ensure anonymous users can ONLY insert data
- Never expose your Supabase service role key in frontend code
- The anon key cannot be used to read, update, or delete existing leads
- All data in transit is encrypted with TLS 1.3
- Data at rest is encrypted with AES-256

## Features Breakdown

### 1. Navigation
- Sticky navbar with hide-on-scroll-down behavior
- Smooth scroll to sections
- Mobile-responsive menu

### 2. Hero Section
- Clear value proposition
- Dual CTAs (Get Early Access + Book Demo)
- Feature badges with icons

### 3. Interactive Swipe Demo
- 5 mock job cards
- Drag/swipe support (mouse + touch)
- Visual feedback (stamps, animations)
- Button controls for pass/apply

### 4. Features Grid
- 9 core features with icons
- Hover effects
- Responsive grid layout

### 5. How It Works
- 3-column workflow (Students, Recruiters, Placement Cells)
- Numbered step indicators

### 6. Security & Compliance
- Trust badges
- Security features list
- Links to privacy/terms

### 7. Pricing
- 4 pricing tiers
- Monthly/Annual toggle (UI only)
- Clear feature comparison

### 8. Lead Capture Form
- Email validation
- Role selection (Student/Recruiter/Placement)
- Optional organization field
- Duplicate detection
- Toast notifications for feedback
- Loading states

### 9. FAQ Accordion
- 8 questions with answers
- Keyboard accessible
- ARIA attributes
- Smooth expand/collapse

### 10. Contact & Footer
- Email CTAs
- Social links (placeholders)
- Footer navigation
- Copyright notice

## Analytics

The site includes a placeholder `track()` function that logs events to the console:

- Page loads
- Navigation clicks
- Job swipes
- FAQ interactions
- Form submissions
- CTA clicks

To integrate real analytics (Google Analytics, Mixpanel, etc.), modify the `track()` function in `script.js`.

## Customization

### Change Brand Name

Search and replace "InterWeU" in `index.html` with your brand name.

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --color-primary: #3b82f6;        /* Main brand color */
  --color-primary-hover: #2563eb;  /* Hover state */
  --color-primary-light: #dbeafe;  /* Light variant */
  /* ... other colors */
}
```

### Add More Job Cards

Edit the `mockJobs` array in `script.js`:

```javascript
const mockJobs = [
  {
    company: 'Your Company',
    role: 'Your Role',
    ctc: '₹XX LPA',
    tags: ['Tag1', 'Tag2', 'Tag3']
  },
  // Add more...
];
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 12+
- Chrome Mobile: Latest

## Performance

- No external CSS frameworks (fast load)
- Minimal JavaScript (< 10KB)
- System fonts (no web font downloads)
- Optimized for Core Web Vitals

## Accessibility

- Semantic HTML5
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast ratios meet WCAG AA

## License

© 2024 InterWeU. All rights reserved.

## Support

For questions or issues:
- Email: hello@interweu.com
- Demo requests: demo@interweu.com

## Troubleshooting

### Lead form not working

1. Check browser console for errors
2. Verify Supabase credentials are correct in `index.html`
3. Ensure RLS policies are set up correctly
4. Test Supabase connection in browser console

### Supabase errors

- **Error 23505**: Email already exists (duplicate) - This is expected behavior
- **Permission denied**: Check RLS policies are set up correctly
- **Invalid API key**: Double-check your anon key in `index.html`

### Styling issues

- Clear browser cache (Ctrl+F5 / Cmd+Shift+R)
- Ensure `styles.css` is loading correctly
- Check browser console for CSS errors

---

Built with ❤️ using vanilla HTML, CSS, and JavaScript.
