export interface Testimonial {
  name: string;
  role: string;
  category: string;
  location: string;
  quote: string;
  rating: number;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Kofi Annan Mensah',
    role: 'Subsea Project Consultant, Tullow Oil',
    category: 'Corporate Guest',
    location: 'Westline, Takoradi',
    quote: 'Booking serviced apartments in Takoradi used to mean dealing with shady middlemen taking 15% viewing fees. On FindStay, I booked Oil City Serviced Apartments in 2 minutes, verified the host’s Ghana Card, and received an instant MoMo receipt. Absolute game changer.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Akosua Frimpong',
    role: 'Level 200 HND Student, Takoradi Technical University',
    category: 'Student Resident',
    location: 'Anaji, Takoradi',
    quote: 'Every semester, students get scammed by fake hostel agents outside TTU gates. With FindStay, the 15-minute concurrency lock held my room at Anaji Royal Residency while my mother sent the MTN MoMo payment. When I arrived, my key was waiting.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Madam Grace Osei',
    role: 'Managing Director, Atlantic Haven Hotel',
    category: 'Property Host',
    location: 'Beach Road, Takoradi',
    quote: 'International booking websites charge up to 20% commission plus foreign exchange markups. FindStay charges only 6% commission and pays out instantly to our Mobile Money merchant account. The room occupancy grid eliminates all double-bookings.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
  }
];
