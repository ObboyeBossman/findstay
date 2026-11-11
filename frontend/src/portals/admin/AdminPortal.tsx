import React, { useState } from 'react';
import { CheckCircle, UserCheck, Activity, AlertCircle } from 'lucide-react';

interface LandlordVerification {
  id: number;
  name: string;
  phone: string;
  propertyTitle: string;
  neighborhood: string;
  ghanaCard: string;
  status: 'PENDING_REVIEW' | 'VERIFIED';
}

const SAMPLE_VERIFICATIONS: LandlordVerification[] = [
  { id: 1, name: 'Kofi Mensah Annan', phone: '0244998877', propertyTitle: 'Beach Road Student Heights', neighborhood: 'Beach Road', ghanaCard: 'GHA-789012345-3', status: 'PENDING_REVIEW' },
  { id: 2, name: 'Madam Grace Osei', phone: '0209876543', propertyTitle: 'Anaji Royal Student Hostel', neighborhood: 'Anaji', ghanaCard: 'GHA-987654321-4', status: 'VERIFIED' },
];

export const AdminPortal: React.FC = () => {
  const [verifications, setVerifications] = useState<LandlordVerification[]>(SAMPLE_VERIFICATIONS);

  const approveLandlord = (id: number) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'VERIFIED' } : v))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Subdomain Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              admin.findstay.com
            </span>
            <span className="text-xs text-slate-500 font-medium">Platform Governance &amp; Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Administration &bull; Ghana Act 843 Controls
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Verify landlord Ghana Cards, monitor Paystack financial reconciliations, and review immutable security audit logs.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase">Break-Even Tracker (Pilot)</div>
          <div className="text-2xl font-black text-slate-900 mt-2">24 / 36 Bookings</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-teal-600 h-full w-2/3"></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">66.7% toward monthly cloud self-sufficiency</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase">Active Verified Listings</div>
          <div className="text-2xl font-black text-slate-900 mt-2">12 Hostels</div>
          <div className="text-[11px] text-green-700 font-semibold mt-1">100% Validated Deeds &amp; Ghana Cards</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase">Paystack MoMo Volume</div>
          <div className="text-2xl font-black text-slate-900 mt-2">GHS 14,400.00</div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">GHS 720.00 (5% platform take)</div>
        </div>
      </div>

      {/* Landlord Verification Queue */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <h2 className="font-bold text-slate-900 text-sm">Landlord &amp; Property Verification Queue</h2>
          </div>
          <span className="text-xs text-slate-500">Preventing rental scams before listings appear publicly</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-6 py-3">Landlord Name</th>
                <th className="px-6 py-3">Ghana Card ID</th>
                <th className="px-6 py-3">Property Title</th>
                <th className="px-6 py-3">Neighborhood</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {verifications.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 text-slate-900 font-bold">{item.name}</td>
                  <td className="px-6 py-3.5 text-slate-600 font-mono">{item.ghanaCard}</td>
                  <td className="px-6 py-3.5 text-slate-800 font-semibold">{item.propertyTitle}</td>
                  <td className="px-6 py-3.5 text-slate-600">{item.neighborhood}</td>
                  <td className="px-6 py-3.5">
                    {item.status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {item.status === 'PENDING_REVIEW' ? (
                      <button
                        onClick={() => approveLandlord(item.id)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1 rounded shadow"
                      >
                        Approve &amp; Publish
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Live on app.</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Act 843 Immutable Audit Logs */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-purple-600" />
          <h2 className="font-bold text-slate-900 text-sm">Security Audit Trail (Ghana Act 843)</h2>
        </div>
        <div className="font-mono text-[11px] text-slate-700 bg-slate-900 text-slate-200 p-4 rounded-lg space-y-1 overflow-x-auto">
          <div>[2026-11-11 01:42:01 UTC] [AUTH_LOGIN] User id=1 (ROLE_GUEST) IP=102.176.64.12 [OK]</div>
          <div>[2026-11-11 01:43:18 UTC] [BOOKING_HOLD] Unit id=1 locked with PESSIMISTIC_WRITE for 15 mins [OK]</div>
          <div>[2026-11-11 01:44:05 UTC] [PAYSTACK_WEBHOOK] HMAC-SHA512 verified signature header ref=pstk_984712 [OK]</div>
          <div>[2026-11-11 01:44:06 UTC] [BOOKING_CONFIRM] Unit id=1 status &rarr; CONFIRMED, MoMo payout dispatched [OK]</div>
        </div>
      </div>
    </div>
  );
};
