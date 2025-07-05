# Features in Hubflo Onboarding Platform

This note summarizes all the features implemented or referenced in the codebase, based on database schema, code, and documentation.

---

## Core Features (from README & code)
- **Admin dashboard for client and workflow management**
- **Client onboarding portal with progress tracking**
- **Kanban board for project and client stage management**
- **Analytics dashboard** (conversion, feature usage, revenue, satisfaction)
- **Feature and integration management**
- **Customizable workflows and templates**
- **Email notifications and integrations**

---

## Features Table (from database & code)

### AI & Automation
- **AI Agents**
  - Intelligent automation agents that can handle complex workflows and decision-making processes
  - Status: development
  - Pricing: Premium ($299.00)
  - Target Packages: premium, gold, elite

### Analytics
- **Advanced Reporting Dashboard**
  - Comprehensive analytics and reporting with custom dashboards and data visualization
  - Status: beta
  - Pricing: Enterprise ($199.00)
  - Target Packages: gold, elite

### Branding
- **White Label Mobile App**
  - Custom branded mobile app for your clients with your logo and branding
  - Status: released
  - Pricing: Addon ($2999.00)
  - Target Packages: premium, gold, elite

### Developer Tools
- **API Access & Webhooks**
  - Full API access with webhook integrations for custom development
  - Status: released
  - Pricing: Enterprise ($99.00)
  - Target Packages: elite

### Support
- **Priority Support Channel**
  - 24/7 priority support with dedicated account manager
  - Status: released
  - Pricing: Premium ($149.00)
  - Target Packages: premium, gold, elite

### Integrations
- **Custom Integrations**
  - Bespoke integrations built specifically for your business needs
  - Status: development
  - Pricing: Addon ($1999.00)
  - Target Packages: gold, elite

---

## Package Features (from create-client-form)

### Light
- One Zoom call with a product specialist
- Video tutorials
- Chat support

### Premium
- 2 Zoom calls with a product specialist
- Workflow mapping & workspace structuring
- Setup of a basic Zapier integration
- Help setting up workspace templates
- Up to 2 forms and/or SmartDocs setup
- Priority support during onboarding

### Gold
- Everything in Premium, plus:
- Up to 3 Zoom calls with a product specialist
- Advanced Zapier integrations & workflows
- Up to 4 forms and/or SmartDocs setup
- Direct access to your account manager via Slack

### Elite
- Everything in Gold, plus:
- Unlimited Onboarding Calls
- Unlimited Forms
- Unlimited SmartDocs
- Unlimited integrations
- Migration assistance (contacts, workspaces, clients)
- Custom integration setup (via API or partner tools)
- Full onboarding project managed by our team

---

## Feature Statuses (from code)
- development
- beta
- released
- deprecated

## Client Feature Statuses
- proposed
- interested
- approved
- implementing
- completed
- declined

---

## Notes
- Features can be categorized as: feature, integration, tool, or service.
- Features can be assigned to clients and tracked by status.
- Analytics and feature usage are tracked in the database.

---

This list is based on the current codebase and may evolve as new features are added or released. 