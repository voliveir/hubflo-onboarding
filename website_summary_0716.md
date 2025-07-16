# Website Change Summary – 2024-07-16

## Major Changes

- **Removed the Hubflo Onboarding Portal:**
  - The onboarding portal is no longer used; all onboarding is now handled directly in the client portal page (`/client/[slug]`).

- **Persistent Task Checklist:**
  - Added a persistent, interactive onboarding checklist to the client portal page.
  - Checklist supports main tasks and subtasks, with completion state persisting in real time.
  - Each subtask can expand to show video tutorials and support articles.
  - Checklist adapts to the "projects enabled" toggle (shows/hides project board tasks).
  - The checklist replaces the "How to Access Your Onboarding Portal" section.

- **UI/UX Improvements:**
  - Checklist and all buttons now match the modern, gold/brand-themed UI (no white backgrounds).
  - Used gold-filled and gold-outlined button styles for all checklist actions.
  - Improved card, badge, and section styling for consistency with integration cards.
  - Removed the "Need Help with Your Setup?" call-to-action card from the checklist.

- **Section Reorganization & Removals:**
  - Moved the "Next Steps" section above the onboarding checklist for better flow.
  - Removed the "Helpful Resources & Tutorials" section (all resources are now in the checklist).
  - Removed the "Onboarding Progress" tracker (progress is now shown in the checklist itself).
  - Hid the "Visual Workflows by Industry" and "Blueprint Your Process" sections.

- **Button & Link Behavior:**
  - The "Start Setup" button in "Next Steps" now scrolls smoothly to the section instead of opening a new page.
  - All anchor links use smooth scrolling; external links still open in a new tab.

## Files Modified or Created
- `app/client/[slug]/page.tsx`
- `components/client-checklist.tsx`
- `components/portal/ActionCards.tsx`
- `components/ui/button-variants.tsx`

## Summary
These changes streamline the onboarding experience, reduce confusion, and unify the UI for a more modern, client-friendly portal. All onboarding, support, and progress tracking is now handled in a single, persistent checklist within the client portal. 