import React, { useState } from 'react';
import { Property } from '../data/properties';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Users,
  Bed,
  ArrowRight,
  ExternalLink,
  Lock,
  PhoneCall
} from 'lucide-react';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  guestUrl: string;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  guestUrl
}) => {
  if (!property) return null;

  const [activeImage, setActiveImage] = useState(property.primaryImage);
  const [selectedUnit, setSelectedUnit] = useState<number>(0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scroll Container */}
        <div className="max-h-[85vh] overflow-y-auto">
          {/* Main Hero Gallery */}
          <div className="relative h-72 sm:h-96 w-full bg-slate-900">
            <img
              src={activeImage}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shadow-md">
                {property.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 flex items-center gap-1 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {property.neighborhood}, Takoradi
              </span>
            </div>

            {/* Title on Image */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="ml-1 text-sm font-bold text-white">{property.rating}</span>
                </div>
                <span className="text-xs text-slate-300">({property.reviewsCount} verified reviews)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{property.title}</h2>
              <p className="text-xs sm:text-sm text-slate-200">{property.tagline}</p>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {property.gallery.length > 1 && (
            <div className="flex gap-2 p-4 bg-slate-100 overflow-x-auto border-b border-slate-200">
              {property.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    activeImage === img ? 'border-teal-600 ring-2 ring-teal-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Modal Content Details */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Rates & Booking Callout Banner */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-teal-800">
                  Starting Rate
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">{property.priceDisplay}</span>
                  <span className="text-sm font-semibold text-slate-600">/ {property.pricePeriod}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 mt-1">
                  <Lock className="w-3 h-3 text-teal-600" /> 15-Minute Concurrency Reservation Lock Guaranteed
                </span>
              </div>

              <a
                href={guestUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <span>Book Now in Guest App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">About this Property</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {property.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{property.address}, Takoradi, Western Region, Ghana</span>
              </div>
            </div>

            {/* Available Room Units */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Bed className="w-4 h-4 text-teal-600" />
                <span>Available Units &amp; Room Options</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.units.map((unit, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedUnit(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedUnit === idx
                        ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{unit.name}</span>
                        <span className="text-xs text-slate-500">{unit.type}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5" /> {unit.capacity}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-slate-500">Rate:</span>
                      <div className="text-right">
                        {unit.priceNight && (
                          <span className="text-sm font-bold text-teal-700">GH₵ {unit.priceNight} / night </span>
                        )}
                        {unit.priceSemester && (
                          <span className="text-sm font-bold text-teal-700">GH₵ {unit.priceSemester} / semester </span>
                        )}
                        {unit.priceMonth && (
                          <span className="text-xs text-slate-500 block">or GH₵ {unit.priceMonth} / month</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Host Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-black text-lg flex items-center justify-center shrink-0">
                    {property.host.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{property.host.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Ghana Card Verified
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">{property.host.organization}</span>
                    <span className="text-[11px] font-mono text-slate-400">KYC Ref: {property.host.cardRef}</span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[11px] text-slate-500 block">Host Response</span>
                  <span className="text-xs font-bold text-teal-700">{property.host.responseRate}</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Included Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
