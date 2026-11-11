import React, { useState } from 'react';
import { Plus, Users, DollarSign, Bed, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Hotel, Home, Compass, GraduationCap } from 'lucide-react';

interface Room {
  id: number;
  property: string;
  category: 'Hotel' | 'Apartment' | 'Guesthouse' | 'Hostel';
  roomNumber: string;
  type: string;
  rateDisplay: string;
  tenantName: string | null;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'MAINTENANCE';
}

const INITIAL_ROOMS: Room[] = [
  { id: 1, property: 'Atlantic Haven Hotel & Suites', category: 'Hotel', roomNumber: 'Suite 201 (Ocean Deluxe)', type: 'Executive Suite', rateDisplay: 'GHS 480/night', tenantName: 'Dr. Frank Appiah (Offshore Consultant)', status: 'BOOKED' },
  { id: 2, property: 'Atlantic Haven Hotel & Suites', category: 'Hotel', roomNumber: 'Room 105 (King Deluxe)', type: 'King Deluxe', rateDisplay: 'GHS 350/night', tenantName: 'Checkout in progress', status: 'HELD' },
  { id: 3, property: 'Oil City Executive Serviced Flats', category: 'Apartment', roomNumber: 'Flat 3A (2-Bedroom Luxury)', type: '2-Bedroom Flat', rateDisplay: 'GHS 650/night', tenantName: 'Sarah Mensah & Family', status: 'BOOKED' },
  { id: 4, property: 'Oil City Executive Serviced Flats', category: 'Apartment', roomNumber: 'Flat 1B (Studio Suite)', type: 'Studio Apartment', rateDisplay: 'GHS 420/night', tenantName: null, status: 'AVAILABLE' },
  { id: 5, property: 'Harbour View Boutique Guesthouse', category: 'Guesthouse', roomNumber: 'Room 04 (Harbour View)', type: 'Queen Room', rateDisplay: 'GHS 280/night', tenantName: null, status: 'MAINTENANCE' },
  { id: 6, property: 'Anaji Royal Student Residency', category: 'Hostel', roomNumber: 'Room 101 (Master Self-Contain)', type: 'Self-Contain', rateDisplay: 'GHS 2,700/sem', tenantName: 'Kwame Mensah (TTU)', status: 'BOOKED' },
  { id: 7, property: 'Anaji Royal Student Residency', category: 'Hostel', roomNumber: 'Room 102 (Bed A)', type: '2-in-1 Shared', rateDisplay: 'GHS 1,800/sem', tenantName: 'Yaw Boateng (TTU)', status: 'BOOKED' },
  { id: 8, property: 'Anaji Royal Student Residency', category: 'Hostel', roomNumber: 'Room 102 (Bed B)', type: '2-in-1 Shared', rateDisplay: 'GHS 1,800/sem', tenantName: null, status: 'AVAILABLE' },
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
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Cleaning / Turn</span>;
    }
  };

  const getCategoryIcon = (cat: Room['category']) => {
    switch (cat) {
      case 'Hotel':
        return <Hotel className="w-3.5 h-3.5 text-blue-600 inline mr-1" />;
      case 'Apartment':
        return <Home className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />;
      case 'Guesthouse':
        return <Compass className="w-3.5 h-3.5 text-amber-600 inline mr-1" />;
      case 'Hostel':
        return <GraduationCap className="w-3.5 h-3.5 text-teal-600 inline mr-1" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              host.findstay.com
            </span>
            <span className="text-xs text-slate-500 font-medium">Property Management System (PMS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Property Portfolio &bull; Madam Grace Osei
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Managing Hotels, Serviced Apartments, Guesthouses &amp; Student Residencies in Sekondi-Takoradi.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm self-start md:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add New Unit / Suite</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Inventory</span>
            <Bed className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">8 Units</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 4 Takoradi properties</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Live Occupancy Rate</span>
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-black text-green-700">75%</div>
          <p className="text-[11px] text-slate-500 mt-1">6 of 8 units occupied / held</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">MoMo Payouts Disbursed</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">GHS 14,850</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Direct to MTN 0209***543
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pessimistic Hold Status</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">1 Unit Active</div>
          <p className="text-[11px] text-slate-500 mt-1">King Deluxe &bull; 15m MoMo checkout</p>
        </div>
      </div>

      {/* Room Inventory Table */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Accommodation Inventory &bull; Real-time PMS Grid</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated lock status synchronized with PostgreSQL row-level locks</p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'AVAILABLE', 'BOOKED', 'HELD', 'MAINTENANCE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Property &bull; Category</th>
                <th className="py-3 px-4">Unit / Suite</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Rate</th>
                <th className="py-3 px-4">Current Guest / Tenant</th>
                <th className="py-3 px-4">PMS Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {getCategoryIcon(room.category)}
                    <span>{room.property}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{room.roomNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{room.type}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{room.rateDisplay}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {room.tenantName ? (
                      <span className="font-medium text-slate-900">{room.tenantName}</span>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(room.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
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
