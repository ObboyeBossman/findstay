import React, { useState } from 'react';
import { LandlordVerification } from '@findstay/types';
import { CheckCircle, UserCheck, Activity, AlertCircle, Shield, Building } from 'lucide-react';

const SAMPLE_VERIFICATIONS: LandlordVerification[] = [
  { id: 1, name: 'Kofi Mensah Annan', phone: '0244998877', propertyTitle: 'Beach Road Executive Suites', neighborhood: 'Beach Road', ghanaCard: 'GHA-789012345-3', status: 'PENDING_REVIEW' },
  { id: 2, name: 'Madam Grace Osei', phone: '0209876543', propertyTitle: 'Anaji Royal Student Residency', neighborhood: 'Anaji', ghanaCard: 'GHA-987654321-4', status: 'VERIFIED' },
];

export const App: React.FC = () => {
  const [verifications, setVerifications] = useState<LandlordVerification[]>(SAMPLE_VERIFICATIONS);

  const approveLandlord = (id: number) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'VERIFIED' } : v))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                FindStay <span className="text-purple-600">Admin</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                admin.findstay.com &bull; Governance
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono">
              Admin: Bossman Abraham
            </span>
            <a
              href="http://localhost:3000"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
            >
              Public Site
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Operations &amp; Compliance Console
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Ghana Data Protection Act (Act 843) compliance monitoring, landlord KYC authentication, and unit economics.
          </p>
        </div>

        {/* Financial Sustainability & Break-even Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Break-Even Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">42 / 36</span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Achieved (+116%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full w-full"></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Monthly operating cost of GHS 4,500 fully covered by booking fees.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Platform Revenue (MTN/Telecel)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">GHS 5,250.00</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Net 5% platform commission retained after Paystack fees.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Ghana Act 843 Security Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-lg font-bold text-slate-900">100% Encrypted &amp; Audited</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              BCrypt cost=12 &bull; AES-256 phone tokens
            </p>
          </div>
        </div>

        {/* Landlord KYC Verification Queue */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Host Identity &amp; Property Verification Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Mandatory verification under Ghana Data Protection Act</p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 1 Pending Review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Property Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Ghana Card Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      {v.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{v.phone}</td>
                    <td className="py-3 px-4 text-slate-800">{v.propertyTitle}</td>
                    <td className="py-3 px-4 text-slate-600">{v.neighborhood}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{v.ghanaCard}</td>
                    <td className="py-3 px-4">
                      {v.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {v.status === 'PENDING_REVIEW' ? (
                        <button
                          onClick={() => approveLandlord(v.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition"
                        >
                          Approve KYC
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Act 843 Immutable Audit Logs */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-slate-900 text-sm">Security Audit Trail (Ghana Act 843)</h2>
          </div>
          <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-4 rounded-lg space-y-1 overflow-x-auto">
            <div>[2026-11-11 01:42:01 UTC] [AUTH_LOGIN] User id=1 (ROLE_GUEST) IP=102.176.64.12 [OK]</div>
            <div>[2026-11-11 01:43:18 UTC] [BOOKING_HOLD] Unit id=1 locked with PESSIMISTIC_WRITE for 15 mins [OK]</div>
            <div>[2026-11-11 01:44:05 UTC] [PAYSTACK_WEBHOOK] HMAC-SHA512 verified signature header ref=pstk_984712 [OK]</div>
            <div>[2026-11-11 01:44:06 UTC] [BOOKING_CONFIRM] Unit id=1 status &rarr; CONFIRMED, MoMo payout dispatched [OK]</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
