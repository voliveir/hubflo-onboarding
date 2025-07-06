# Hubflo Website Summary (v2)

## Branding & Design System
- Uses Hubflo brand colors: deep navy, gold gradients (#F2C94C, #F2994A), and white.
- UI features glassmorphism, gradients, card hover effects, and high-contrast accessibility.
- Fonts: Inter, SF Pro, Roboto, Poppins (polished, modern, readable).
- Buttons: 8–12px rounded corners, gold gradients, icon+label combos, glowing accent effects.
- Layout: Mobile-responsive, large bold headings, soft glows, ample padding, grouped info.
- Visual flair: Subtle neumorphism, ripple/glow animations, sharp/stylized images, soft glow on battery text, visual charge ring, and bonus UI elements (status, toggles, etc).

## Client Portal (app/client/[slug]/page.tsx)
- Homepage and all main sections refactored for modern, branded, accessible UI.
- Section wrappers and cards use glassy, dark-gradient, or gold-accented styles.
- All cards and action blocks use flat gradients or glassmorphism, with consistent spacing and hover effects.
- Dynamic logic for implementation manager: manager name and all four calendar links (contact success, schedule call, integrations call, upgrade consultation) are editable in admin and per-client, and used throughout the portal.
- Upsell section:
  - Only visible for Light, Premium, or Gold clients (not Elite).
  - Shows only the next available packages (e.g., Gold sees only Elite).
  - Cards use dark-glass style, gold border, and no price line.
  - Single gold "Schedule a Consultation" button below cards, using the correct manager-specific link.
- All CTAs (onboarding, integrations, upsell, etc.) use the correct dynamic links.
- Feedback board, workflow builder, integrations, features, and white label progress all use consistent, branded UI and dynamic data.

## Admin Dashboard
- Implementation managers and their default calendar links are editable in `/admin/settings`.
- New/edit client forms fetch managers from DB, prefill all four calendar links, and allow reset-to-default.
- Clients can be filtered by implementation manager.
- All manager and calendar link logic is DB-driven and reflected throughout the portal.

## Technical/Implementation Details
- Uses Next.js (App Router), React, Tailwind CSS, and Lucide icons.
- Uses pnpm for package management.
- All major UI/UX changes are mobile-responsive and tested for accessibility/contrast.
- Linting and Prettier run after major changes.
- All images and assets are in `/public` and referenced with correct paths.
- All dynamic logic (manager, links, upsell, etc.) is implemented in a DRY, maintainable way.

## Notable Fixes & QA
- Fixed server/client rendering issues with useReveal by using client wrappers.
- Fixed Tailwind vendor chunk error by clearing .next and node_modules, then reinstalling.
- Diagnosed and fixed broken image issues (path/code, not missing files).
- Restored all DB-driven manager logic, editable admin UI, client forms, portal logic, and upsell features after accidental revert.
- All linter errors resolved and site is fully restored to the desired state.

---

**This summary should be referenced for future prompts to ensure all UI, branding, and dynamic logic is consistent with the current state of the Hubflo platform.** 