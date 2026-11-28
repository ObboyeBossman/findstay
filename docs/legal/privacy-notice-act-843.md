# FindStay Privacy Notice (Ghana Act 843)

- **Policy Version:** `1.0`
- **Effective Date:** 2026-11-15
- **Governing Law:** Data Protection Act, 2012 (Act 843), Republic of Ghana
- **Supervisory Authority:** Data Protection Commission (DPC), Ghana
- **Data Controller:** FindStay Technologies Limited, Accra, Ghana

---

## 1. Introduction & Overview

Welcome to FindStay. We provide a modern accommodation marketplace and property-management platform tailored for Ghana, serving guests, property owners, and managers.

We respect your fundamental right to privacy. This Privacy Notice explains in simple, transparent language how FindStay collects, uses, stores, and protects your personal data in strict compliance with Ghana's **Data Protection Act, 2012 (Act 843)**.

By creating an account, booking accommodation, or listing a property on FindStay, you consent to the data practices described in this notice.

---

## 2. Personal Information We Collect

In adherence to the **Data Minimisation Principle** (Act 843, Sections 19 & 21), we only collect information strictly necessary to provide and secure our services.

### A. All Users (Guests & Registered Users)
- **Account Data:** Full name, valid email address, Ghana phone number (in E.164 format, e.g., `+233XXXXXXXXX`), and preferred language (English, Twi, Ga, Ewe).
- **Security & Authentication Data:** Hashed passwords managed securely via cryptographic standards (Supabase Auth). We never see or store your raw password.
- **Booking & Financial Data:** Booking dates, room preferences, transaction references, and payment amounts in Ghana Pesewas (GHS). Payments are processed through regulated payment partners (e.g., Paystack); **FindStay never stores your Mobile Money PIN or debit card CVV**.
- **Technical & Consent Records:** IP address, browser type, and timestamp recorded when you accept this Privacy Notice (stored in `verification.consent_record`).

### B. Property Owners & Staff (Hosts)
- **Identity Verification Data:** Ghana Card Personal Identification Number (PIN), full name as registered on your Ghana Card, and verification selfie/document images to confirm identity under Ghana Tourism Authority (GTA) compliance rules.
- **Listing Data:** Property address, digital address (GhanaPost GPS), photographs, pricing, and room specifications.
- **Payout Details:** Verified Mobile Money phone number or Ghanaian bank account details for accommodation payout settlements.

---

## 3. Why We Process Your Data (Purpose Specification)

Under Section 18 of Act 843, we process personal information solely for lawful, specified purposes:

1. **Service Delivery:** To register your account, manage property listings, process reservations, and generate booking receipts.
2. **Account Security & Verification:** To verify that hosts and guests are real individuals, preventing fraud, scam listings, and unauthorized account takeovers.
3. **Transaction Settlement:** To facilitate Mobile Money and card payments in Ghanaian pesewas and disburse payouts to property owners.
4. **Service Communications:** To send transaction confirmations, one-time passwords (OTPs), check-in details, and security alerts.
5. **Legal & Regulatory Compliance:** To maintain financial audit records required by Ghanaian law and adhere to tourism safety regulations.

---

## 4. How We Share and Protect Your Data

### A. Zero Sale of Personal Data
**FindStay will never sell, rent, or trade your personal data to any third party for marketing or advertising purposes.**

### B. Controlled Disclosure Between Guests and Hosts
- **Before Booking:** Public listings display only the property's general location, amenities, pricing, and the host's display name. Personal phone numbers and email addresses are hidden.
- **After Booking Confirmation:** The guest receives the host's verified contact phone number for check-in coordination; the host receives the guest's name and contact phone number.

### C. Trusted Service Providers
We work only with vetted, security-compliant service providers bound by strict confidentiality:
- **Cloud Infrastructure & Database:** Encrypted databases hosted on secure, isolated cloud servers.
- **Payment Providers:** Regulated Mobile Money and card aggregators (Paystack) operating under Bank of Ghana guidelines.
- **Identity Storage:** Ghana Card documents and photos are stored in private Cloudflare R2 storage accessible only via short-lived, signed URLs authorized for verification officers.

---

## 5. Security & Data Retention

### A. Security Safeguards (Act 843, Sections 27 & 28)
- **Encryption:** All network communications use TLS 1.3 encryption. Database records are encrypted at rest using industry-standard AES-256.
- **Access Controls:** Organization-scoped access (`OrgScope`) ensures property managers can only access records belonging to their registered properties.
- **Audit Logging:** Sensitive actions (verifications, profile changes, payouts) are recorded in tamper-resistant audit logs (`audit.audit_event`).

### B. Data Retention
- We retain your personal data as long as your account remains active.
- If you close your account, personal identifiers are deleted or permanently anonymized within 30 days, except where statutory retention of financial transactions (typically 6 years under Ghana tax and accounting law) is required.

---

## 6. Your Rights Under Ghana Act 843

Sections 32 through 43 of Act 843 grant you specific, enforceable rights regarding your personal information:

1. **Right of Access (Section 32):** You have the right to request a copy of the personal data FindStay holds about you. You can review your profile anytime at `/profile`.
2. **Right to Rectification (Section 33):** You have the right to correct any inaccurate or incomplete data. You can update your name, phone number, and preferences directly via your profile settings.
3. **Right to Erasure & De-registration (Section 34):** You can request the deletion of your account and personal information when it is no longer needed for the purpose it was collected.
4. **Right to Object to Processing (Section 39):** You may object to the processing of your personal data on legitimate grounds.
5. **Right to Withdraw Consent:** You can withdraw your consent to data processing at any time by closing your FindStay account.
6. **Right to Complain:** If you believe your data protection rights have been violated, you have the right to lodge a complaint with the **Data Protection Commission (DPC) of Ghana** (https://www.dataprotection.org.gh).

---

## 7. Contact Us & Data Protection Officer (DPO)

If you have questions, feedback, or wish to exercise any of your rights under Act 843, please contact our Data Protection Officer:

- **Data Controller:** FindStay Technologies Limited
- **Attention:** Data Protection Officer
- **Email:** `privacy@findstay.com`
- **Location:** Accra, Ghana
- **Regulatory Authority:** Data Protection Commission (DPC), East Legon, Accra, Ghana

---

## 8. Policy Version & Updates

FindStay may update this Privacy Notice from time to time to reflect platform enhancements or changes in Ghanaian regulations. 

When material changes are made, the `policy_version` will be incremented (e.g., from `1.0` to `2.0`), and registered users will be prompted to review and re-consent upon their next sign-in.
