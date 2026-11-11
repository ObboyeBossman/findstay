import React, { useState } from 'react';
import { Plus, Users, DollarSign, Bed, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface Room {
  id: number;
  property: string;
  roomNumber: string;
  type: string;
  price: number;
  tenantName: string | null;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'MAINTENANCE';
}

const INITIAL_ROOMS: Room[] = [
  { id: 1, property: 'Anaji Royal Student Hostel', roomNumber: 'Room 101', type: 'Self-Contain', price: 600, tenantName: 'Kwame Mensah', status: 'BOOKED' },
  { id: 2, property: 'Anaji Royal Student Hostel', roomNumber: 'Room 102 (Bed A)', type: '2-in-1 Shared', price: 400, tenantName: 'Yaw Boateng', status: 'BOOKED' },
  { id: 3, property: 'Anaji Royal Student Hostel', roomNumber: 'Room 102 (Bed B)', type: '2-in-1 Shared', price: 400, tenantName: null, status: 'AVAILABLE' },
  { id: 4, property: 'Anaji Royal Student Hostel', roomNumber: 'Room 103', type: 'Self-Contain', price: 600, tenantName: 'Checkout in progress', status: 'HELD' },
  { id: 5, property: 'Effia Heritage Lodge', roomNumber: 'Block A - 01', type: 'Self-Contain', price: 550, tenantName: 'Amina Salifu', status: 'BOOKED' },
  { id: 6, property: 'Effia Heritage Lodge', roomNumber: 'Block A - 02', type: 'Self-Contain', price: 550, tenantName: null, status: 'MAINTENANCE' },
];

export const LandlordPortal: React.FC = () => {
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [filter, setFilter] = useState<string>('ALL');

  const filteredRooms = filter === 'ALL' ? rooms : rooms.filter((r) => r.status === filter);

  const getStatusBadge = (status: Room['status']) => {
    switch (status) {
      case 'BOOKED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Booked</span>;
      case 'HELD':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3 animate-spin" /> Held (15m)</span>;
      case 'AVAILABLE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"><Bed className="w-3 h-3" /> Available</span>;
      case 'MAINTENANCE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Maintenance</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              host.findstay.com
            </span>
            <span className="text-xs text-slate-500 font-medium">Landlord &amp; Property Manager Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Property Portfolio &bull; Madam Grace Osei
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage your Takoradi hostel units, occupancy records, and automated Paystack MoMo payouts.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow transition">
          <Plus className="w-4 h-4" />
          <span>Add New Hostel Unit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Units</span>
            <Bed className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">15 Rooms</div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">2 Active Takoradi Properties</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Occupancy Rate</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">86.7%</div>
          <div className="text-[11px] text-green-700 font-semibold mt-1">13 Confirmed Students</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Monthly Rent Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">GHS 7,410.00</div>
          <div className="text-[11px] text-slate-500 mt-1">Net after 5% FindStay Fee</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Direct MoMo Wallet</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">020-987-6543</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">Auto-Settlement Active</div>
        </div>
      </div>

      {/* Room Directory & Management Table */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 text-sm">Synchronized Room &amp; Unit Matrix</h2>
          <div className="flex gap-1.5">
            {['ALL', 'AVAILABLE', 'HELD', 'BOOKED', 'MAINTENANCE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  filter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Unit / Room</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Monthly Rent</th>
                <th className="px-6 py-3">Active Tenant</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5 text-slate-800 font-bold">{room.property}</td>
                  <td className="px-6 py-3.5 text-slate-900 font-mono font-semibold">{room.roomNumber}</td>
                  <td className="px-6 py-3.5 text-slate-600">{room.type}</td>
                  <td className="px-6 py-3.5 text-slate-900 font-bold">GHS {room.price}.00</td>
                  <td className="px-6 py-3.5 text-slate-600">{room.tenantName || '—'}</td>
                  <td className="px-6 py-3.5">{getStatusBadge(room.status)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-teal-700 hover:text-teal-900 font-bold text-xs underline">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
