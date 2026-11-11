import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Lock,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  PhoneCall,
  Mail,
  Building2
} from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const [activePolicyTab, setActivePolicyTab] = useState<'terms' | 'privacy' | 'refunds' | 'safety'>('terms');

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
            Legal &amp; Regulatory Framework
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            FindStay Policies &amp; Trust Center
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Formally drafted under the laws of the Republic of Ghana and compliant with the Ghana Data Protection Act, 2012 (Act 843).
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActivePolicyTab('terms')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activePolicyTab === 'terms'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActivePolicyTab('privacy')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activePolicyTab === 'privacy'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy (Act 843)</span>
          </button>

          <button
            onClick={() => setActivePolicyTab('refunds')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activePolicyTab === 'refunds'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Cancellation &amp; Refunds</span>
          </button>

          <button
            onClick={() => setActivePolicyTab('safety')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activePolicyTab === 'safety'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Trust &amp; Verification Standards</span>
          </button>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
          {/* TAB 1: TERMS OF SERVICE */}
          {activePolicyTab === 'terms' && (
            <div className="space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold uppercase">
                  Version 2.4 &bull; Effective November 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Terms of Service &amp; Platform Agreement
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Governs all access to FindStay website, Progressive Web Apps (PWAs), and APIs.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">1. Acceptance &amp; Platform Scope</h3>
                <p>
                  By accessing, browsing, or creating an account on FindStay (collectively, the &ldquo;Platform&rdquo;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service. FindStay operates as a two-sided technology platform connecting accommodation seekers (&ldquo;Guests&rdquo; or &ldquo;Students&rdquo;) directly with verified accommodation providers (&ldquo;Hosts&rdquo;, &ldquo;Hoteliers&rdquo;, or &ldquo;Landlords&rdquo;) within Takoradi and the Western Region of Ghana.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">2. User Eligibility &amp; National Identity Verification</h3>
                <p>
                  To complete reservations or publish listings, users must be at least 18 years of age. All Hosts and Property Managers are required to provide a valid, verifiable Ghana National Identification Card (Ghana Card) number (GHA-XXXXXXXXX-X) and proof of property management authority before listings are activated. Providing forged or misleading identification constitutes fraud under Section 131 of the Criminal Offences Act of Ghana (Act 29).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">3. The 15-Minute Concurrency Hold &amp; Booking Contracts</h3>
                <p>
                  When a Guest selects an available room and clicks &ldquo;Reserve&rdquo;, the Platform executes a database-level pessimistic lock (<code>SELECT ... FOR UPDATE</code>) on that specific unit record. The unit enters a temporary state of <code>HELD</code> for exactly nine hundred (900) seconds (15 minutes).
                </p>
                <p>
                  During this concurrency hold, no other user worldwide may reserve the same unit. If the Guest completes payment within the 15-minute window via Mobile Money or Card, the reservation transitions to <code>CONFIRMED</code>. If payment is not completed before the expiration of the timer, the hold automatically expires and the room is released back to <code>AVAILABLE</code>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">4. Guest Conduct &amp; Responsibilities</h3>
                <p>
                  Guests agree to treat accommodations, furnishings, utilities, and host premises with care. Guests must abide by stated house rules regarding check-in hours, noise levels, and non-smoking regulations. For student hostels, residents must abide by TTU and institutional code-of-conduct guidelines.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">5. Host Obligations &amp; Property Accuracy</h3>
                <p>
                  Hosts warrant that all photographs, amenity descriptions, and pricing displayed on FindStay are truthful and accurate. Hosts must maintain essential amenities (e.g. running water reserves, electricity supply, security locks) as represented. A Host who fails to honor a confirmed reservation without valid emergency justification will be subject to platform delisting and financial reimbursement obligations.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">6. Platform Commissions &amp; Payouts</h3>
                <p>
                  FindStay charges property owners a modest 5% to 7% platform service commission on completed bookings. Payouts are remitted to the Host’s verified Mobile Money or bank account upon guest check-in verification. Guests pay a 2.5% payment processing fee to cover telecom gateway charges.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">7. Governing Law &amp; Dispute Jurisdiction</h3>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the Courts of Ghana, with the High Court sitting in Sekondi-Takoradi as the primary venue for mediation.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY (ACT 843) */}
          {activePolicyTab === 'privacy' && (
            <div className="space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                    Ghana Act 843 Compliant
                  </span>
                  <span className="text-xs text-slate-400">Data Protection Act, 2012</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Privacy Policy &amp; Data Subject Protection
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  How FindStay collects, encrypts, and processes personal and identity records.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">1. Data Controller Information</h3>
                <p>
                  FindStay operates as a registered Data Controller under the <strong>Ghana Data Protection Act, 2012 (Act 843)</strong>. We are committed to upholding the eight foundational data protection principles: Lawfulness, Specificity, Transparency, Accuracy, Integrity, Retention Minimization, Security, and Data Subject Rights.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">2. Categories of Data Collected</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Identity Information:</strong> Full name, Ghana Card identification number (GHA-XXXXXXXXX-X), and student ID numbers (for student hostel reservations).</li>
                  <li><strong>Contact Details:</strong> Verified Ghanaian phone number (MTN, Telecel, AT) and email address.</li>
                  <li><strong>Financial Data:</strong> Mobile Money transaction references generated via Paystack. We do NOT store complete payment card credentials or Mobile Money PINs on our servers.</li>
                  <li><strong>System Audit Logs:</strong> Timestamped IP addresses, browser agents, and reservation audit trails required for security dispute resolution.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">3. Cryptographic Storage &amp; Encryption Standards</h3>
                <p>
                  Personal data stored in our PostgreSQL database is fortified through layered defenses:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>User passwords are encrypted with <strong>BCrypt adaptive hashing</strong> at work factor 12 with individual 128-bit salts.</li>
                  <li>All web and API traffic is strictly enforced over <strong>TLS 1.3 (Transport Layer Security)</strong> with HSTS enabled.</li>
                  <li>Sensitive identity references (such as Ghana Card numbers) are encrypted at rest using <strong>AES-256</strong>.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">4. Data Subject Rights Under Act 843</h3>
                <p>
                  Under Sections 35 to 43 of Act 843, Ghanaian citizens and residents possess explicit rights regarding their personal records:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block text-xs">Right to Access (Section 35)</strong>
                    Request a full copy of your personal records and transaction logs held by FindStay.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block text-xs">Right to Rectification (Section 37)</strong>
                    Demand immediate correction of outdated or inaccurate personal contact data.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block text-xs">Right to Erasure (Section 39)</strong>
                    Request account and data deletion once statutory transaction retention periods lapse.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <strong className="text-slate-900 block text-xs">Right to Prevent Processing (Section 40)</strong>
                    Opt out of promotional communications at any time.
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: CANCELLATIONS & REFUNDS */}
          {activePolicyTab === 'refunds' && (
            <div className="space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold uppercase">
                  Fair Refund Guidelines
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Cancellation &amp; Refund Policy
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Transparent rules tailored for short-stay hotels and semester-long student hostels.
                </p>
              </div>

              {/* Tier 1: Hotels & Apartments */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Tier 1: Short-Stay Bookings (Hotels, Apartments, Guesthouses)</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 block">48+ Hours Before Check-in: 100% Refund</strong>
                      Guests who cancel 48 hours or more before standard check-in time (2:00 PM GMT on check-in date) receive a full 100% refund remitted to their original Mobile Money or card account.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-950 block">24 to 48 Hours Before Check-in: 50% Refund</strong>
                      Cancellations made between 24 and 48 hours prior to check-in receive a 50% refund. The remaining 50% compensates the Host for room holding and preparation.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-950 block">Under 24 Hours or No-Show: Non-Refundable</strong>
                      Cancellations made with less than 24 hours notice or guest failure to arrive are non-refundable.
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 2: Student Hostels */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Tier 2: Student Semester Hostels &amp; Residencies</span>
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>72-Hour Cooling-Off Period:</strong> Students who reserve a hostel room may cancel within 72 hours of payment confirmation for a 100% full refund with zero penalty fees.
                  </li>
                  <li>
                    <strong>Academic Admission Dispute Protection:</strong> If a student has reserved a hostel room for Takoradi Technical University but is ultimately not admitted, FindStay guarantees a 100% deposit refund upon presenting the official university rejection notice at least 14 days before semester commencement.
                  </li>
                  <li>
                    <strong>Security Deposits:</strong> Refundable room caution deposits must be returned by the hostel management within seven (7) business days following end-of-semester room inspection.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: TRUST & SAFETY */}
          {activePolicyTab === 'safety' && (
            <div className="space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold uppercase">
                  Community Standards
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Trust, Safety &amp; Verification Standards
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  How we protect guests, students, and property owners from fraud and unsafe environments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Host Physical Verification
                  </h3>
                  <p className="text-xs text-slate-600">
                    FindStay conducts physical verification visits for student hostels and lodges in Takoradi before awarding the verified badge. We inspect water storage capacity, emergency power generation, and biometric or gated compound security.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-600" />
                    Zero Middleman Tolerance
                  </h3>
                  <p className="text-xs text-slate-600">
                    Unauthorized street agents are strictly barred from listing properties on FindStay. Any user attempting to collect informal &ldquo;viewing fees&rdquo; is immediately blacklisted, and their details are submitted to regional police authorities.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-teal-600" />
                    Student Safety Standards
                  </h3>
                  <p className="text-xs text-slate-600">
                    Hostels listed on FindStay must maintain functional fire safety equipment, well-lit perimeter lighting, reliable compound gate security, and emergency contact procedures for university security and local emergency services.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    24/7 Incident Escalation
                  </h3>
                  <p className="text-xs text-slate-600">
                    If an emergency or listing discrepancy arises upon arrival, our Takoradi support team responds via WhatsApp and direct telephone (+233 244 123 456) to re-accommodate guests or issue immediate refunds.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
