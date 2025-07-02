# Hubflo Onboarding Platform

## Overview
A modern onboarding and implementation management platform for Hubflo clients, built with Next.js, React, and Supabase. It provides admin tools, client portals, analytics, kanban workflows, and more.

## Features
- Admin dashboard for client and workflow management
- Client onboarding portal with progress tracking
- Kanban board for project and client stage management
- Analytics dashboard (conversion, feature usage, revenue, satisfaction)
- Feature and integration management
- Customizable workflows and templates
- Email notifications and integrations

## Directory Structure
```
app/           # Main application (admin, client, API routes)
components/    # Reusable UI and feature components
lib/           # Database, Supabase integration, types, utilities
scripts/       # Database setup and migration scripts
public/        # Static assets (images, logos)
styles/        # Global styles (Tailwind CSS)
```

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd hubflo-onboarding
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` (if available) or create `.env.local`.
   - Add the following variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```
4. **Set up the database:**
   - Run the setup scripts in the `scripts/` directory as needed (see Analytics and Kanban setup guides).
   - Example:
     ```bash
     node scripts/run-analytics-setup.js
     node scripts/run-kanban-setup.js
     ```

## Onboarding Guide

### For Developers
- **Project Structure:** Review the Directory Structure and Key Components sections for an overview.
- **Environment Setup:**
  - Install [pnpm](https://pnpm.io/) if not already installed.
  - Ensure you have Node.js 18+ and a Supabase project ready.
  - Configure `.env.local` as described above.
- **Running Locally:**
  - Start the development server:
    ```bash
    pnpm dev
    ```
  - Access the app at [http://localhost:3000](http://localhost:3000).
- **Database Migrations:**
  - Use the scripts in the `scripts/` directory to set up or update the database schema.
- **Coding Standards:**
  - Use TypeScript and follow the existing code style.
  - Run `pnpm lint` to check for linting issues.
- **Testing:**
  - Add tests as needed (unit, integration, or E2E).
- **Deployment:**
  - See the Deployment Guide section for Vercel deployment steps.

### For Admins/Users
- **Accessing the Admin Dashboard:**
  - Go to `/admin` in your deployed app.
  - Enter the admin password (see project owner for credentials).
- **Managing Clients:**
  - Use the admin dashboard to add, edit, or track clients.
  - Access client details, onboarding progress, and integrations.
- **Using the Kanban Board:**
  - Navigate to `/admin/kanban` to manage client workflows and stages.
- **Analytics Dashboard:**
  - Access `/admin/analytics` for onboarding and feature usage analytics.
- **Client Portal:**
  - Clients access their onboarding portal via a unique link (see onboarding emails or admin dashboard).
- **Support:**
  - For help, contact the development team or refer to the Support & Troubleshooting section below.

## Launch Plan

### Pre-Launch Checklist
- [ ] Complete all QA and user acceptance testing
- [ ] Review accessibility and performance (Lighthouse, etc.)
- [ ] Ensure all environment variables are set in Vercel
- [ ] Confirm database migrations and sample data are in place
- [ ] Set up monitoring and error tracking (e.g., Sentry)
- [ ] Prepare support and feedback channels
- [ ] Review privacy policy and terms of service

### Announcement Templates

**Email Announcement**
```
Subject: Introducing the New Hubflo Onboarding Platform!

Hi [Recipient],

We're excited to announce the launch of the new Hubflo Onboarding Platform! Designed to streamline client onboarding, track progress, and provide actionable analytics, this platform is now live and ready for you to explore.

Key features include:
- Admin dashboard for client management
- Kanban board for workflow tracking
- Real-time analytics and reporting
- Customizable onboarding experiences

Get started today at: [your-app-url]

Best,
The Hubflo Team
```

**Social Media Post**
```
🚀 We've launched the new Hubflo Onboarding Platform! Streamline client onboarding, track progress, and unlock powerful analytics. Check it out: [your-app-url] #SaaS #Onboarding #Hubflo
```

**Press Release**
```
FOR IMMEDIATE RELEASE

Hubflo Launches Next-Gen Onboarding Platform for Modern SaaS Teams

[City, Date] — Hubflo is proud to announce the launch of its new Onboarding Platform, designed to help SaaS companies deliver seamless onboarding experiences, track client progress, and gain actionable insights. The platform features an admin dashboard, kanban workflow, analytics, and more.

For more information, visit [your-app-url] or contact [press contact email].
```

### Post-Launch Steps
- [ ] Monitor user feedback and support channels
- [ ] Track analytics and user engagement
- [ ] Address any critical bugs or issues
- [ ] Plan for future feature releases and improvements

## Deployment Guide (Vercel)
1. **Push your code to GitHub or GitLab.**
2. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com/) and import your project.
   - Set the environment variables in the Vercel dashboard.
3. **Deploy:**
   - Vercel will automatically build and deploy your app on every push to the main branch.

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)

## Architecture Overview
- **Frontend:** Next.js (React, TypeScript, Tailwind CSS)
- **Backend:** Supabase (Postgres, Auth, Storage)
- **API:** Next.js API routes, Supabase client/server SDK
- **State Management:** React hooks, context, and Supabase real-time
- **Deployment:** Vercel (CI/CD, preview deployments)

## Key Components
- `components/kanban-board.tsx`: Kanban board UI and logic
- `components/admin-dashboard.tsx`: Admin dashboard
- `components/client-checklist.tsx`: Client onboarding checklist
- `components/features-manager.tsx`: Feature management
- `components/client-integrations-manager.tsx`: Integration management
- `components/onboarding-access-guide.tsx`: Client onboarding guide
- `lib/database.ts`: Database queries and logic
- `lib/supabase.ts`: Supabase client (browser)
- `lib/supabaseAdmin.ts`: Supabase admin client (server)

## Support & Troubleshooting
- Check environment variables and Supabase configuration
- Review setup scripts and database migrations
- For analytics or kanban issues, see `ANALYTICS_SETUP.md` and `KANBAN_SETUP.md`
- For further help, contact the development team or open an issue

---

© Hubflo. All rights reserved. 