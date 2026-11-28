-- =====================================================================
-- FindStay V1_17 — Sprint 1 notification templates (S1-10-T4)
--
-- Additive and idempotent: fixed UUIDv7 identifiers and
-- ON CONFLICT (event_type, channel) DO NOTHING.
-- Matches the exact V1_11__notification.sql schema:
--   (id, event_type, channel, title_template, body_template, is_active, updated_at)
-- =====================================================================

INSERT INTO notification.notification_template
    (id, event_type, channel, title_template, body_template, is_active, updated_at)
VALUES
    -- 1. ORG_STAFF_INVITED
    ('01934e60-0001-7000-8000-000000000001', 'ORG_STAFF_INVITED', 'IN_APP',
     'Team Invitation: {{companyName}}',
     'You have been invited to join {{companyName}} on FindStay.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0001-7000-8000-000000000002', 'ORG_STAFF_INVITED', 'EMAIL',
     'You are invited to join {{companyName}} on FindStay',
     'Hello, you have been invited to join {{companyName}} on FindStay. Accept your invitation here: {{invitationLink}}.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0001-7000-8000-000000000003', 'ORG_STAFF_INVITED', 'SMS',
     'Team Invitation',
     'FindStay: You have been invited to join {{companyName}}. Accept at: {{invitationLink}}',
     true, '2026-11-28T00:00:00Z'),

    -- 2. VERIFICATION_SUBMITTED (Admin alert)
    ('01934e60-0002-7000-8000-000000000001', 'VERIFICATION_SUBMITTED', 'IN_APP',
     'New Verification Submitted: {{ownerName}}',
     'Owner {{ownerName}} submitted verification documents (Case {{caseId}}).',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0002-7000-8000-000000000002', 'VERIFICATION_SUBMITTED', 'EMAIL',
     'FindStay Admin Alert: New Verification Submitted (Case {{caseId}})',
     'Owner {{ownerName}} submitted verification documents for review. Case ID: {{caseId}}. Review here: {{adminReviewLink}}',
     true, '2026-11-28T00:00:00Z'),

    -- 3. VERIFICATION_APPROVED (Owner alert)
    ('01934e60-0003-7000-8000-000000000001', 'VERIFICATION_APPROVED', 'IN_APP',
     'Verification Approved',
     'Your owner verification has been approved. You can now publish listings on FindStay.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0003-7000-8000-000000000002', 'VERIFICATION_APPROVED', 'EMAIL',
     'FindStay: Your Owner Verification Is Approved',
     'Hello {{ownerName}}, your owner verification on FindStay has been approved. {{notes}} You can now publish listings.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0003-7000-8000-000000000003', 'VERIFICATION_APPROVED', 'SMS',
     'Verification Approved',
     'FindStay: Your owner verification is approved! You can now publish listings in your Owner Portal.',
     true, '2026-11-28T00:00:00Z'),

    -- 4. VERIFICATION_REJECTED (Owner alert)
    ('01934e60-0004-7000-8000-000000000001', 'VERIFICATION_REJECTED', 'IN_APP',
     'Verification Action Required',
     'Your verification could not be approved. Reason: {{reason}}.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0004-7000-8000-000000000002', 'VERIFICATION_REJECTED', 'EMAIL',
     'FindStay: Verification Action Required',
     'Hello {{ownerName}}, our review team could not approve your verification. Reason: {{reason}}. Resubmit here: {{resubmitLink}}',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0004-7000-8000-000000000003', 'VERIFICATION_REJECTED', 'SMS',
     'Verification Action Required',
     'FindStay: Verification needs attention. Reason: {{reason}}. Check your Owner Portal to resubmit.',
     true, '2026-11-28T00:00:00Z'),

    -- 5. LISTING_SUBMITTED (Admin alert)
    ('01934e60-0005-7000-8000-000000000001', 'LISTING_SUBMITTED', 'IN_APP',
     'New Listing Submitted for Review',
     'Listing ''{{propertyName}}'' has been submitted by {{ownerName}} for review.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0005-7000-8000-000000000002', 'LISTING_SUBMITTED', 'EMAIL',
     'FindStay Admin Alert: Listing Submitted - {{propertyName}}',
     'Owner {{ownerName}} submitted listing ''{{propertyName}}'' ({{listingId}}) for approval. Review: {{adminReviewLink}}',
     true, '2026-11-28T00:00:00Z'),

    -- 6. LISTING_APPROVED (Owner alert)
    ('01934e60-0006-7000-8000-000000000001', 'LISTING_APPROVED', 'IN_APP',
     'Listing Approved & Live',
     'Your listing ''{{propertyName}}'' has been approved and is now live on FindStay.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0006-7000-8000-000000000002', 'LISTING_APPROVED', 'EMAIL',
     'FindStay: Your Listing ''{{propertyName}}'' Is Live',
     'Hello {{ownerName}}, your listing ''{{propertyName}}'' is approved and published. View it here: {{listingUrl}}',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0006-7000-8000-000000000003', 'LISTING_APPROVED', 'SMS',
     'Listing Approved',
     'FindStay: Your listing ''{{propertyName}}'' is approved and now live!',
     true, '2026-11-28T00:00:00Z'),

    -- 7. LISTING_CORRECTIONS_REQUESTED (Owner alert)
    ('01934e60-0007-7000-8000-000000000001', 'LISTING_CORRECTIONS_REQUESTED', 'IN_APP',
     'Listing Changes Requested',
     'Changes were requested for ''{{propertyName}}'': {{notes}}',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0007-7000-8000-000000000002', 'LISTING_CORRECTIONS_REQUESTED', 'EMAIL',
     'FindStay: Changes Requested for ''{{propertyName}}''',
     'Hello {{ownerName}}, please update ''{{propertyName}}'' before approval. Notes: {{notes}}',
     true, '2026-11-28T00:00:00Z'),

    -- 8. LISTING_REJECTED (Owner alert)
    ('01934e60-0008-7000-8000-000000000001', 'LISTING_REJECTED', 'IN_APP',
     'Listing Not Approved',
     'Your listing ''{{propertyName}}'' was not approved. Reason: {{reason}}.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0008-7000-8000-000000000002', 'LISTING_REJECTED', 'EMAIL',
     'FindStay: Listing Decision for ''{{propertyName}}''',
     'Hello {{ownerName}}, your listing ''{{propertyName}}'' was not approved. Reason: {{reason}}.',
     true, '2026-11-28T00:00:00Z'),

    -- 9. ACCOUNT_SUSPENDED
    ('01934e60-0009-7000-8000-000000000001', 'ACCOUNT_SUSPENDED', 'IN_APP',
     'Account Suspended',
     'Your FindStay account has been suspended. Reason: {{reason}}.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-0009-7000-8000-000000000002', 'ACCOUNT_SUSPENDED', 'EMAIL',
     'FindStay: Important Account Notice',
     'Hello {{userName}}, your FindStay account has been suspended. Reason: {{reason}}.',
     true, '2026-11-28T00:00:00Z'),

    -- 10. ACCOUNT_RESTORED
    ('01934e60-000a-7000-8000-000000000001', 'ACCOUNT_RESTORED', 'IN_APP',
     'Account Restored',
     'Your FindStay account access has been restored. You can sign in normally.',
     true, '2026-11-28T00:00:00Z'),
    ('01934e60-000a-7000-8000-000000000002', 'ACCOUNT_RESTORED', 'EMAIL',
     'FindStay: Your Account Has Been Restored',
     'Hello {{userName}}, your FindStay account has been restored and is active again.',
     true, '2026-11-28T00:00:00Z')
ON CONFLICT (event_type, channel) DO NOTHING;
