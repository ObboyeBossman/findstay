import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Clock, Smartphone, X } from 'lucide-react';

interface Unit {
  id: number;
  propertyTitle: string;
  neighborhood: string;
  unitName: string;
  roomType: string;
  pricePerMonth: number;
  pricePerSemester: number;
  imageUrl: string;
  amenities: string[];
  isVerified: boolean;
}

const SAMPLE_UNITS: Unit[] = [
  {
    id: 1,
    propertyTitle: 'Anaji Royal Student Hostel',
    neighborhood: 'Anaji',
    unitName: 'Room 101 — Master Self-Contain',
    roomType: 'Self-Contain',
    pricePerMonth: 600,
    pricePerSemester: 2700,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    amenities: ['Water Tank', 'Backup Gen', 'Wi-Fi', 'Security Guard'],
    isVerified: true,
  },
  {
    id: 2,
    propertyTitle: 'Anaji Royal Student Hostel',
    neighborhood: 'Anaji',
    unitName: 'Room 102 — 2 in a Room (Bed A)',
    roomType: '2-in-a-Room',
    pricePerMonth: 400,
    pricePerSemester: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    amenities: ['Water Tank', 'Wi-Fi', 'Study Desk'],
    isVerified: true,
  },
  {
    id: 3,
    propertyTitle: 'Effia Heritage Lodge',
    neighborhood: 'Effia',
    unitName: 'Block A — Self-Contain Studio',
    roomType: 'Self-Contain',
    pricePerMonth: 550,
    pricePerSemester: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['Water Tank', 'Self-Meter', 'Security Gate'],
    isVerified: true,
  },
  {
    id: 4,
    propertyTitle: 'Westline Palms Executive Lodge',
    neighborhood: 'Westline',
    unitName: 'Penthouse Unit 3A',
    roomType: 'Self-Contain',
    pricePerMonth: 850,
    pricePerSemester: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['Air Condition', 'Wi-Fi', 'Polytank', 'Parking'],
    isVerified: true,
  },
];

export const GuestMarketplace: React.FC = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'momo_prompt' | 'success'>('details');
  const [momoNumber, setMomoNumber] = useState<string>('0244123456');
  const [momoNetwork, setMomoNetwork] = useState<string>('MTN');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15-minute hold timer (in seconds)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (selectedUnit && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [selectedUnit, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredUnits = selectedNeighborhood === 'All'
    ? SAMPLE_UNITS
    : SAMPLE_UNITS.filter((u) => u.neighborhood === selectedNeighborhood);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Subdomain Pill Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              app.findstay.com
            </span>
            <span className="text-xs text-slate-500 font-medium">Tertiary Student Accommodation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find &amp; Book Verified Student Stays in Takoradi
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Zero middleman fees. Direct verified landlords. Automated Ghana Mobile Money checkout.
          </p>
        </div>

        {/* Neighborhood Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Anaji', 'Effia', 'Westline', 'Beach Road'].map((nb) => (
            <button
              key={nb}
              onClick={() => setSelectedNeighborhood(nb)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedNeighborhood === nb
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {nb}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Verified Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img src={unit.imageUrl} alt={unit.unitName} className="w-full h-full object-cover" />
              {unit.isVerified && (
                <div className="absolute top-3 left-3 bg-teal-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded">
                {unit.neighborhood}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{unit.propertyTitle}</p>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{unit.unitName}</h3>
                <p className="text-xs text-teal-700 font-semibold mt-1">{unit.roomType}</p>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {unit.amenities.map((am) => (
                    <span key={am} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    GHS {unit.pricePerMonth}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                  <div className="text-[10px] text-slate-500">GHS {unit.pricePerSemester}/semester</div>
                </div>

                <button
                  onClick={() => {
                    setSelectedUnit(unit);
                    setBookingStep('details');
                    setTimeLeft(900);
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  Book Unit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking & Mobile Money Checkout Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedUnit(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingStep === 'details' && (
              <div>
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mb-4 text-xs font-semibold">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                  <span>
                    15-Minute Concurrency Hold Active: <strong className="font-mono text-amber-900">{formatTimer(timeLeft)}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">Complete Reservation</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedUnit.propertyTitle} &bull; {selectedUnit.unitName}
                </p>

                {/* Price Breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 my-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>1 Month Stay Deposit:</span>
                    <span className="font-semibold text-slate-800">GHS {selectedUnit.pricePerMonth}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Verification Fee (5%):</span>
                    <span className="font-semibold text-teal-700">+ GHS {(selectedUnit.pricePerMonth * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Amount Payable:</span>
                    <span>GHS {(selectedUnit.pricePerMonth * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                {/* Mobile Money Details Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select MoMo Network</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['MTN', 'Telecel', 'AT Money'].map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setMomoNetwork(net)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                            momoNetwork === net
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Money Number</label>
                    <input
                      type="text"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. 0244123456"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setBookingStep('momo_prompt')}
                  className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Initiate Paystack MoMo Payment</span>
                </button>
              </div>
            )}

            {bookingStep === 'momo_prompt' && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Check Your Phone for MoMo Prompt</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                  We sent an authorization prompt of <strong>GHS {(selectedUnit.pricePerMonth * 1.05).toFixed(2)}</strong> to{' '}
                  <span className="font-mono text-slate-900">{momoNumber}</span>. Enter your MoMo PIN to authorize.
                </p>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setBookingStep('success')}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    Simulate Payment Approval (Webhook)
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 'success' && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Booking Confirmed!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                  HMAC-SHA512 webhook verified. Your reservation for <strong>{selectedUnit.unitName}</strong> is locked with zero conflict.
                </p>
                <div className="bg-slate-100 p-2.5 rounded-lg text-xs font-mono text-slate-700 my-4 text-left">
                  Booking Ref: FS-TAK-2026-0842<br />
                  Paystack Ref: pstk_live_9847120489<br />
                  Status: CONFIRMED
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs"
                >
                  Done &bull; View in Student Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
