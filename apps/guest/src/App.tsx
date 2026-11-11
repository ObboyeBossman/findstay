import React, { useState, useEffect } from 'react';
import { Unit } from '@findstay/types';
import { PropertyBadge } from '@findstay/ui';
import { ShieldCheck, CheckCircle, Clock, Smartphone, X, Download, Building } from 'lucide-react';

const SAMPLE_UNITS: Unit[] = [
  {
    id: 1,
    propertyTitle: 'Atlantic Haven Hotel & Suites',
    propertyType: 'Hotel',
    neighborhood: 'Beach Road',
    unitName: 'Executive Ocean Deluxe (Suite 201)',
    roomType: 'Executive Suite • King Bed',
    rateType: 'NIGHT',
    price: 480,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Pool', 'Ocean View', 'Wi-Fi', 'Breakfast', 'Air Conditioning'],
    isVerified: true,
  },
  {
    id: 2,
    propertyTitle: 'Oil City Executive Serviced Flats',
    propertyType: 'Apartment',
    neighborhood: 'Westline',
    unitName: '2-Bedroom Luxury Serviced Flat (Apt 3A)',
    roomType: '2-Bedroom Flat • Kitchen & Balcony',
    rateType: 'NIGHT',
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['Fitted Kitchen', 'Backup Gen', 'Free Parking', 'Balcony', 'Wi-Fi'],
    isVerified: true,
  },
  {
    id: 3,
    propertyTitle: 'Harbour View Boutique Guesthouse',
    propertyType: 'Guesthouse',
    neighborhood: 'Chapel Hill',
    unitName: 'Harbour View Queen Room (Room 04)',
    roomType: 'Queen Room • Harbour View',
    rateType: 'NIGHT',
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Complimentary Breakfast', 'Harbour View', 'Work Desk', 'Wi-Fi'],
    isVerified: true,
  },
  {
    id: 4,
    propertyTitle: 'Anaji Royal Student Residency',
    propertyType: 'Hostel',
    neighborhood: 'Anaji',
    unitName: 'Master Self-Contain (Room 101)',
    roomType: 'Self-Contain • Private Bath',
    rateType: 'SEMESTER',
    price: 600,
    pricePerSemester: 2700,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    amenities: ['Water Tank', 'Backup Gen', 'Wi-Fi', 'Security Guard'],
    isVerified: true,
  },
  {
    id: 5,
    propertyTitle: 'Anaji Royal Student Residency',
    propertyType: 'Hostel',
    neighborhood: 'Anaji',
    unitName: '2-in-1 Shared (Room 102 - Bed A)',
    roomType: '2-in-a-Room • Study Desk',
    rateType: 'SEMESTER',
    price: 400,
    pricePerSemester: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    amenities: ['Water Tank', 'Wi-Fi', 'Study Desk'],
    isVerified: true,
  },
  {
    id: 6,
    propertyTitle: 'Effia Heritage Lodge',
    propertyType: 'Hostel',
    neighborhood: 'Effia',
    unitName: 'Block A — Self-Contain Studio',
    roomType: 'Self-Contain Studio',
    rateType: 'SEMESTER',
    price: 550,
    pricePerSemester: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['Water Tank', 'Self-Meter', 'Security Gate'],
    isVerified: true,
  },
];

export const App: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [stayDuration, setStayDuration] = useState<number>(2);
  const [bookingStep, setBookingStep] = useState<'details' | 'momo_prompt' | 'success'>('details');
  const [momoNumber, setMomoNumber] = useState<string>('0244123456');
  const [momoNetwork, setMomoNetwork] = useState<string>('MTN');
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (selectedUnit && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [selectedUnit, timeLeft]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      alert('To install FindStay on your phone, tap Share or Menu and select "Add to Home Screen".');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredUnits = SAMPLE_UNITS.filter((u) => {
    const matchesType = selectedType === 'All' || u.propertyType === selectedType;
    const matchesNeighborhood = selectedNeighborhood === 'All' || u.neighborhood === selectedNeighborhood;
    return matchesType && matchesNeighborhood;
  });

  const calculateBookingTotal = (unit: Unit, duration: number) => {
    if (unit.rateType === 'NIGHT') {
      return unit.price * duration;
    } else if (unit.rateType === 'SEMESTER' && unit.pricePerSemester) {
      return unit.pricePerSemester;
    } else {
      return unit.price;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Find<span className="text-teal-600">Stay</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                app.findstay.com &bull; PWA
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
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
        {/* Subtitle & Filter Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Takoradi Accommodation Directory
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Instant reservation with 15-minute row locks and Mobile Money confirmation.
            </p>
          </div>

          {/* Property Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['All', 'Hotel', 'Apartment', 'Guesthouse', 'Hostel'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedType === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'All' ? 'All Stays' : `${t}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Neighborhood Filter */}
        <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Location:</span>
          {['All', 'Beach Road', 'Westline', 'Chapel Hill', 'Anaji', 'Effia'].map((nb) => (
            <button
              key={nb}
              onClick={() => setSelectedNeighborhood(nb)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedNeighborhood === nb
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {nb}
            </button>
          ))}
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={unit.imageUrl}
                  alt={unit.unitName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <PropertyBadge category={unit.propertyType} />
                  {unit.isVerified && (
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-2.5 h-2.5 text-teal-400" /> Verified
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                  {unit.neighborhood}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{unit.propertyTitle}</p>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5 line-clamp-1">{unit.unitName}</h3>
                  <p className="text-xs text-teal-700 font-semibold mt-1">{unit.roomType}</p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {unit.amenities.map((am) => (
                      <span key={am} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {unit.rateType === 'NIGHT' ? (
                      <div>
                        <span className="text-base font-extrabold text-slate-900">
                          GHS {unit.price}
                          <span className="text-xs font-normal text-slate-500"> /night</span>
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-base font-extrabold text-slate-900">
                          GHS {unit.pricePerSemester || unit.price}
                          <span className="text-xs font-normal text-slate-500"> /sem</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUnit(unit);
                      setBookingStep('details');
                      setTimeLeft(900);
                      setStayDuration(unit.rateType === 'NIGHT' ? 2 : 1);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs transform active:scale-95"
                  >
                    Reserve Unit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Booking Checkout Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
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

                <div className="flex items-center gap-2 mb-1">
                  <PropertyBadge category={selectedUnit.propertyType} />
                  <span className="text-xs font-bold text-slate-500">{selectedUnit.neighborhood}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUnit.propertyTitle}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{selectedUnit.unitName}</p>

                {selectedUnit.rateType === 'NIGHT' && (
                  <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Nights):</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="14"
                        value={stayDuration}
                        onChange={(e) => setStayDuration(parseInt(e.target.value))}
                        className="w-full accent-teal-600"
                      />
                      <span className="font-mono font-bold text-sm bg-white border border-slate-300 px-2.5 py-1 rounded-md">
                        {stayDuration} {stayDuration === 1 ? 'Night' : 'Nights'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 my-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {selectedUnit.rateType === 'NIGHT'
                        ? `Rate (${stayDuration} nights @ GHS ${selectedUnit.price}):`
                        : 'Academic Semester Rent:'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      GHS {calculateBookingTotal(selectedUnit, stayDuration)}.00
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ghana Act 843 Security &amp; Concurrency Engine:</span>
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Amount to Authorize:</span>
                    <span className="text-teal-700">
                      GHS {calculateBookingTotal(selectedUnit, stayDuration)}.00
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setBookingStep('momo_prompt')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Proceed to Mobile Money Checkout</span>
                </button>
              </div>
            )}

            {bookingStep === 'momo_prompt' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mobile Money USSD Prompt</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Pay directly to reserve <strong>{selectedUnit.unitName}</strong>.
                </p>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Network</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['MTN', 'TELECEL', 'AT'].map((net) => (
                        <button
                          key={net}
                          onClick={() => setMomoNetwork(net)}
                          className={`py-2 px-3 rounded-lg border font-bold text-center transition ${
                            momoNetwork === net
                              ? 'border-teal-600 bg-teal-50 text-teal-800'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                        >
                          {net === 'AT' ? 'AT Money' : `${net} Cash`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Money Number</label>
                    <input
                      type="text"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g., 0244123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setBookingStep('details')}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBookingStep('success')}
                    className="w-2/3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Authorize MoMo GHS {calculateBookingTotal(selectedUnit, stayDuration)}.00</span>
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 'success' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Reservation Confirmed!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Mobile Money transaction confirmed ref <strong>PSTK_984712</strong>. Database lock converted to confirmed booking.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-5 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Property:</span>
                    <strong className="text-slate-900">{selectedUnit.propertyTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit:</span>
                    <strong className="text-slate-900">{selectedUnit.unitName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Host Contact:</span>
                    <strong className="text-teal-700">020-987-6543 (Madam Grace Osei)</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                    <span>Paid via {momoNetwork} MoMo:</span>
                    <span className="text-emerald-700">
                      GHS {calculateBookingTotal(selectedUnit, stayDuration)}.00 [PAID]
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUnit(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs"
                >
                  Done &bull; Return to Marketplace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
