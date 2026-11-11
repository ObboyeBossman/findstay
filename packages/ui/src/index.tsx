import React from 'react';
import { PropertyCategory, UnitStatus } from '@findstay/types';
import { Hotel, Home, Compass, GraduationCap, CheckCircle2, Clock, Bed, AlertTriangle } from 'lucide-react';

export interface PropertyBadgeProps {
  category: PropertyCategory;
}

export const PropertyBadge: React.FC<PropertyBadgeProps> = ({ category }) => {
  switch (category) {
    case 'Hotel':
      return (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Hotel className="w-2.5 h-2.5" /> Hotel
        </span>
      );
    case 'Apartment':
      return (
        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Home className="w-2.5 h-2.5" /> Apartment
        </span>
      );
    case 'Guesthouse':
      return (
        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Compass className="w-2.5 h-2.5" /> Guesthouse
        </span>
      );
    case 'Hostel':
      return (
        <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <GraduationCap className="w-2.5 h-2.5" /> Hostel
        </span>
      );
  }
};

export interface StatusBadgeProps {
  status: UnitStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'BOOKED':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Booked
        </span>
      );
    case 'HELD':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3 animate-spin" /> Held (15m)
        </span>
      );
    case 'AVAILABLE':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          <Bed className="w-3 h-3" /> Available
        </span>
      );
    case 'MAINTENANCE':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Cleaning / Turn
        </span>
      );
  }
};
