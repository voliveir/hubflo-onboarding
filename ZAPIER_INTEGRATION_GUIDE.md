# Zapier Integration Guide for White Label Approval Workflow

This guide explains how to set up Zapier automations for the white label approval workflow.

## Database Fields for Zapier Triggers

The following fields are available in the `clients` table for Zapier triggers:

### Approval Request Trigger
- **Field**: `white_label_approval_requested_at`
- **Type**: TIMESTAMP
- **Trigger**: When implementation team changes status to "client_approval"
- **Use Case**: Send email notification to client to review their app

### Client Approval Trigger
- **Field**: `white_label_implementation_manager_notified_at`
- **Type**: TIMESTAMP
- **Trigger**: When client clicks "Approve"
- **Use Case**: Notify implementation manager that client approved

### Client Feedback Trigger
- **Field**: `white_label_approval_feedback_at`
- **Type**: TIMESTAMP
- **Trigger**: When client clicks "Request Changes" and provides feedback
- **Use Case**: Send email to implementation manager with client feedback

## Zapier Setup Instructions

### 1. Client Notification Zap (When Approval Requested)

**Trigger**: PostgreSQL - New Row
- **Table**: `clients`
- **Filter**: `white_label_approval_requested_at` is not null
- **Trigger**: When `white_label_approval_requested_at` changes from null to a timestamp

**Action**: Email (Gmail, Outlook, etc.)
- **To**: `{{client_email}}`
- **Subject**: "Your App is Ready for Review - [Client Name]"
- **Body**: Include client portal link and instructions

### 2. Implementation Manager Notification Zap (When Client Approves)

**Trigger**: PostgreSQL - New Row
- **Table**: `clients`
- **Filter**: `white_label_implementation_manager_notified_at` is not null
- **Trigger**: When `white_label_implementation_manager_notified_at` changes from null to a timestamp

**Action**: Email (Gmail, Outlook, etc.)
- **To**: Implementation manager email
- **Subject**: "Client Approved App - [Client Name]"
- **Body**: Include client details and next steps

### 3. Client Feedback Zap (When Changes Requested)

**Trigger**: PostgreSQL - New Row
- **Table**: `clients`
- **Filter**: `white_label_approval_feedback_at` is not null
- **Trigger**: When `white_label_approval_feedback_at` changes from null to a timestamp

**Action**: Email (Gmail, Outlook, etc.)
- **To**: Implementation manager email
- **Subject**: "Client Requested Changes - [Client Name]"
- **Body**: Include client feedback from `white_label_approval_feedback` field

## Database Schema Reference

```sql
-- Key fields for Zapier integration
white_label_approval_requested_at TIMESTAMP WITH TIME ZONE
white_label_approval_notification_sent_at TIMESTAMP WITH TIME ZONE
white_label_approval_feedback TEXT
white_label_approval_feedback_at TIMESTAMP WITH TIME ZONE
white_label_implementation_manager_notified_at TIMESTAMP WITH TIME ZONE
white_label_client_approval_status TEXT -- 'pending', 'approved', 'changes_requested'
white_label_client_approval_at TIMESTAMP WITH TIME ZONE
```

## Example Zapier Filters

### For Client Notification
```
white_label_approval_requested_at IS NOT NULL
AND white_label_approval_requested_at > NOW() - INTERVAL '1 minute'
```

### For Implementation Manager Approval Notification
```
white_label_implementation_manager_notified_at IS NOT NULL
AND white_label_implementation_manager_notified_at > NOW() - INTERVAL '1 minute'
AND white_label_client_approval_status = 'approved'
```

### For Client Feedback Notification
```
white_label_approval_feedback_at IS NOT NULL
AND white_label_approval_feedback_at > NOW() - INTERVAL '1 minute'
AND white_label_client_approval_status = 'changes_requested'
AND white_label_approval_feedback IS NOT NULL
```

## Email Templates

### Client Review Request Email
```
Subject: Your App is Ready for Review - [Client Name]

Hi [Client Name],

Your white label app is ready for your review! We've completed all the setup steps and need your approval before submitting to the app stores.

Please review your app details at: [Client Portal URL]

You can:
- Review your app name, description, and assets
- Approve the app as-is
- Request changes with specific feedback

Please complete your review within 48 hours so we can proceed with app store submission.

Best regards,
[Implementation Manager Name]
```

### Implementation Manager Approval Notification
```
Subject: Client Approved App - [Client Name]

Hi [Implementation Manager Name],

Great news! [Client Name] has approved their white label app.

Client: [Client Name]
App Name: [App Name]
Approved: [Date/Time]

You can now proceed with app store submission.

Next steps:
1. Submit to Apple App Store
2. Submit to Google Play Store
3. Update status to "submitted"

Best regards,
Hubflo System
```

### Implementation Manager Feedback Notification
```
Subject: Client Requested Changes - [Client Name]

Hi [Implementation Manager Name],

[Client Name] has requested changes to their white label app.

Client: [Client Name]
App Name: [App Name]
Feedback Date: [Date/Time]

Client Feedback:
[Client Feedback Text]

Please review the feedback and make the requested changes, then update the app details and set status back to "client_approval" for another review.

Best regards,
Hubflo System
```

## Testing Your Zaps

1. **Test Client Notification**: Change a client's status to "client_approval" in the admin dashboard
2. **Test Approval**: Have a client approve an app in their portal
3. **Test Feedback**: Have a client request changes with feedback

## Troubleshooting

- **Zap not triggering**: Check that the PostgreSQL trigger is set to "New Row" and the filter conditions are correct
- **Missing data**: Ensure the database fields are being populated correctly
- **Email not sending**: Verify email credentials and recipient addresses
- **Duplicate emails**: Add additional filters to prevent duplicate triggers

## Support

For technical support with Zapier integration, contact the development team with:
- Zap configuration screenshots
- Database field values
- Error messages from Zapier
