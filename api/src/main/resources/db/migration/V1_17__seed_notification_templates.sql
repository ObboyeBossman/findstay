-- V1_17__seed_notification_templates.sql
-- Seeds canonical notification templates for all Sprint 1 lifecycle events (staff invites, verification, listing lifecycle, account events)
-- Uses fixed UUIDv7 identifiers and ON CONFLICT (event_type, channel) DO NOTHING for strict idempotency.

INSERT INTO notification.notification_template (id, event_type, channel, subject_template, body_template, is_active)
VALUES
    -- 1. ORG_STAFF_INVITED
    ('01934e60-0001-7000-8000-000000000001', 'ORG_STAFF_INVITED', 'IN_APP',
     'Team Invitation: {{companyName}}',
     'You have been invited to join {{companyName}} on FindStay.', true),
    ('01934e60-0001-7000-8000-000000000002', 'ORG_STAFF_INVITED', 'EMAIL',
     'You are invited to join {{companyName}} on FindStay',
     'Hello, you have been invited to join {{companyName}} on FindStay. Click here to accept your invitation: {{invitationLink}}. This link will expire in 48 hours.', true),
    ('01934e60-0001-7000-8000-000000000003', 'ORG_STAFF_INVITED', 'SMS',
     NULL,
     'FindStay: You have been invited to join {{companyName}}. Accept invitation at: {{invitationLink}}', true),

    -- 2. VERIFICATION_SUBMITTED (Admin alert)
    ('01934e60-0002-7000-8000-000000000001', 'VERIFICATION_SUBMITTED', 'IN_APP',
     'New Verification Submitted: {{ownerName}}',
     'Owner {{ownerName}} has submitted verification documents (Case: {{caseId}}).', true),
    ('01934e60-0002-7000-8000-000000000002', 'VERIFICATION_SUBMITTED', 'EMAIL',
     'FindStay Admin Alert: New Verification Submitted (Case {{caseId}})',
     'Hello Admin, owner {{ownerName}} ({{ownerEmail}}) has submitted verification documents for review. Case ID: {{caseId}}. Review documents here: {{adminReviewLink}}', true),

    -- 3. VERIFICATION_APPROVED (Owner alert)
    ('01934e60-0003-7000-8000-000000000001', 'VERIFICATION_APPROVED', 'IN_APP',
     'Verification Approved',
     'Congratulations! Your owner verification has been approved. {{notes}}', true),
    ('01934e60-0003-7000-8000-000000000002', 'VERIFICATION_APPROVED', 'EMAIL',
     'FindStay - Your Owner Verification Has Been Approved!',
     'Hello {{ownerName}}, your owner verification on FindStay has been reviewed and approved. {{notes}} You are now authorized to publish and manage listings on the platform.', true),
    ('01934e60-0003-7000-8000-000000000003', 'VERIFICATION_APPROVED', 'SMS',
     NULL,
     'FindStay: Your owner verification has been approved! You can now publish listings in your owner portal.', true),

    -- 4. VERIFICATION_REJECTED (Owner alert)
    ('01934e60-0004-7000-8000-000000000001', 'VERIFICATION_REJECTED', 'IN_APP',
     'Verification Action Required',
     'Your verification submission could not be approved. Reason: {{reason}}. {{notes}}', true),
    ('01934e60-0004-7000-8000-000000000002', 'VERIFICATION_REJECTED', 'EMAIL',
     'FindStay - Verification Decision Update',
     'Hello {{ownerName}}, our verification team reviewed your submission and could not approve it at this time. Reason: {{reason}}. Review notes: {{notes}}. Please log in and resubmit the required documentation: {{resubmitLink}}', true),
    ('01934e60-0004-7000-8000-000000000003', 'VERIFICATION_REJECTED', 'SMS',
     NULL,
     'FindStay: Your verification requires attention. Reason: {{reason}}. Please check your portal to resubmit.', true),

    -- 5. LISTING_SUBMITTED (Admin alert)
    ('01934e60-0005-7000-8000-000000000001', 'LISTING_SUBMITTED', 'IN_APP',
     'New Listing Submitted for Review',
     'Listing ''{{propertyName}}'' has been submitted by {{ownerName}} for review.', true),
    ('01934e60-0005-7000-8000-000000000002', 'LISTING_SUBMITTED', 'EMAIL',
     'FindStay Admin Alert: Listing Submitted for Approval - {{propertyName}}',
     'Hello Admin, owner {{ownerName}} has submitted listing ''{{propertyName}}'' (ID: {{listingId}}) for review. Open review queue: {{adminReviewLink}}', true),

    -- 6. LISTING_APPROVED (Owner alert)
    ('01934e60-0006-7000-8000-000000000001', 'LISTING_APPROVED', 'IN_APP',
     'Listing Approved & Live',
     'Great news! Your listing ''{{propertyName}}'' has been approved and is now live on FindStay.', true),
    ('01934e60-0006-7000-8000-000000000002', 'LISTING_APPROVED', 'EMAIL',
     'FindStay - Your Listing ''{{propertyName}}'' is Now Live!',
     'Hello {{ownerName}}, your listing ''{{propertyName}}'' has been approved by our review team and is now published and bookable. View live listing: {{listingUrl}}', true),
    ('01934e60-0006-7000-8000-000000000003', 'LISTING_APPROVED', 'SMS',
     NULL,
     'FindStay: Your listing ''{{propertyName}}'' is now approved and live on FindStay!', true),

    -- 7. LISTING_CORRECTIONS_REQUESTED (Owner alert)
    ('01934e60-0007-7000-8000-000000000001', 'LISTING_CORRECTIONS_REQUESTED', 'IN_APP',
     'Corrections Requested for Listing',
     'Changes requested for ''{{propertyName}}''. Reason: {{reason}}. {{notes}}', true),
    ('01934e60-0007-7000-8000-000000000002', 'LISTING_CORRECTIONS_REQUESTED', 'EMAIL',
     'FindStay - Changes Requested for ''{{propertyName}}''',
     'Hello {{ownerName}}, our review team requested changes for your listing ''{{propertyName}}''. Reason: {{reason}}. Review notes: {{notes}}. Please make the corrections and resubmit: {{editListingUrl}}', true),
    ('01934e60-0007-7000-8000-000000000003', 'LISTING_CORRECTIONS_REQUESTED', 'SMS',
     NULL,
     'FindStay: Changes requested for ''{{propertyName}}''. Please see review notes in your owner portal.', true),

    -- 8. LISTING_REJECTED (Owner alert)
    ('01934e60-0008-7000-8000-000000000001', 'LISTING_REJECTED', 'IN_APP',
     'Listing Declined',
     'Your listing ''{{propertyName}}'' could not be approved. Reason: {{reason}}.', true),
    ('01934e60-0008-7000-8000-000000000002', 'LISTING_REJECTED', 'EMAIL',
     'FindStay - Listing Application Declined: ''{{propertyName}}''',
     'Hello {{ownerName}}, your listing application for ''{{propertyName}}'' could not be approved. Reason: {{reason}}. Review notes: {{notes}}. Contact support at {{supportEmail}} for questions.', true),

    -- 9. USER_SUSPENDED (Account alert)
    ('01934e60-0009-7000-8000-000000000001', 'USER_SUSPENDED', 'IN_APP',
     'Account Suspended',
     'Your account has been suspended. Reason: {{reason}}.', true),
    ('01934e60-0009-7000-8000-000000000002', 'USER_SUSPENDED', 'EMAIL',
     'Important Notice: Your FindStay Account Has Been Suspended',
     'Hello {{userName}}, your FindStay account has been suspended by administration. Reason: {{reason}}. Contact our compliance team at {{supportEmail}} for assistance.', true),

    -- 10. USER_RESTORED (Account alert)
    ('01934e60-0010-7000-8000-000000000001', 'USER_RESTORED', 'IN_APP',
     'Account Restored',
     'Your account access has been restored. Welcome back to FindStay!', true),
    ('01934e60-0010-7000-8000-000000000002', 'USER_RESTORED', 'EMAIL',
     'FindStay - Your Account Has Been Restored',
     'Hello {{userName}}, your FindStay account has been reviewed and reinstated. You may now log back in: {{loginUrl}}', true)
ON CONFLICT (event_type, channel) DO NOTHING;
