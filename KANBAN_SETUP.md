# Kanban Board Setup Guide

## Overview

The kanban board system provides a visual way to track clients through their success package workflows. Each package (Light, Premium, Gold, Elite) has its own workflow with different stages.

## Workflow Stages

### Light Package
- **New Client** → **Onboarding Call** → **Graduation**

### Premium Package  
- **New Client** → **1st Onboarding Call** → **2nd Onboarding Call** → **Graduation**

### Gold Package
- **New Client** → **1st Onboarding Call** → **2nd Onboarding Call** → **3rd Onboarding Call** → **Graduation**

### Elite Package
- **New Client** → **1st Onboarding Call** → **2nd Onboarding Call** → **3rd Onboarding Call** → **Graduation**

## Database Setup

The kanban system requires several new database tables. You can set them up in two ways:

### Option 1: Run the SQL Script (Recommended)

1. Navigate to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/022-create-kanban-system.sql`
4. Run the script

### Option 2: Automatic Initialization

The system will automatically try to initialize basic workflow data when you first access the kanban board. However, this requires the tables to already exist.

## Usage

### Accessing the Kanban Board

1. Navigate to `/admin/kanban` in your application
2. Or click "Project Management" in the admin sidebar

### Features

- **Package Tabs**: Switch between Light, Premium, Gold, and Elite packages
- **Client Cards**: View client information including progress, days in stage, and call status
- **Drag & Drop**: Move clients between stages by clicking the move button
- **Quick Actions**: Click on client cards to view details and access quick actions
- **Stuck Detection**: Clients stuck in a stage for more than 7 days are highlighted

### Moving Clients

1. Click the move button (↔️) on any client card
2. Select the new stage from the dropdown
3. Add optional notes about the move
4. Click "Move Client"

### Client Information Displayed

- Client name and email
- Success package type
- Number of users
- Project completion percentage
- Days in current stage
- Call completion status
- Creation date

## Integration with Existing System

The kanban board integrates with your existing:
- Client management system
- Project tracking functionality
- Call scheduling and completion tracking
- Progress calculation system

## Troubleshooting

### "Failed to load kanban board" Error

This usually means the database tables don't exist. Run the SQL setup script first.

### Empty Kanban Board

If you see an empty board:
1. Check that you have active clients in the database
2. Verify that clients have the correct `success_package` values
3. Ensure clients have `status = 'active'`

### Client Stages Not Updating

The system automatically determines client stages based on:
- Success package type
- Number of completed calls
- Current project status

You can manually override stages using the move functionality.

## Customization

### Adding New Stages

To add new stages to a package:
1. Update the `kanban_workflows` table
2. Modify the workflow logic in the application
3. Update the stage icons and colors as needed

### Modifying Stage Names

Edit the `stage_name` and `stage_description` fields in the `kanban_workflows` table.

### Changing Colors

Update the `color` field in the `kanban_workflows` table with hex color codes.

## Technical Details

### Database Tables

- `kanban_workflows`: Defines workflow stages for each package
- `client_stages`: Tracks current stage for each client
- `kanban_activities`: Logs activities within each stage

### Key Functions

- `getKanbanWorkflows()`: Get workflow stages for a package
- `getAllClientsWithStages()`: Get all clients with their current stages
- `moveClientToStage()`: Move a client to a new stage
- `initializeKanbanSystem()`: Set up basic workflow data

### Components

- `KanbanBoard`: Main kanban board component
- `ClientCard`: Individual client card display
- `KanbanColumn`: Column for each workflow stage 