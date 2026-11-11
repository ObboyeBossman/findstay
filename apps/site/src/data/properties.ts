export interface RoomUnit {
  name: string;
  type: string;
  capacity: number;
  priceNight?: number;
  priceMonth?: number;
  priceSemester?: number;
}

export interface Property {
  id: number;
  title: string;
  tagline: string;
  type: 'Hotel' | 'Apartment' | 'Guesthouse' | 'Hostel';
  address: string;
  neighborhood: 'Beach Road' | 'Westline' | 'Chapel Hill' | 'Anaji' | 'Effia';
  city: string;
  rating: number;
  reviewsCount: number;
  primaryImage: string;
  gallery: string[];
  description: string;
  priceDisplay: string;
  pricePeriod: string;
  featured: boolean;
  amenities: string[];
  units: RoomUnit[];
  host: {
    name: string;
    organization: string;
    ghanaCardVerified: boolean;
    cardRef: string;
    responseRate: string;
  };
}

export const PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'Atlantic Haven Hotel & Suites',
    tagline: 'Oceanfront Luxury & Corporate Executive Retreat',
    type: 'Hotel',
    address: '12 Ocean Boulevard, Beach Road',
    neighborhood: 'Beach Road',
    city: 'Takoradi',
    rating: 4.9,
    reviewsCount: 128,
    primaryImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Oceanfront luxury hotel catering to corporate business travelers, offshore energy professionals, and weekend visitors in Takoradi. Features high-speed fiber Wi-Fi, swimming pool, executive conference suites, and fine dining Ghanaian & Continental restaurant.',
    priceDisplay: 'GH₵ 480',
    pricePeriod: 'night',
    featured: true,
    amenities: [
      'Swimming Pool',
      'Ocean View',
      'High-Speed Wi-Fi',
      'Restaurant & Bar',
      'Air Conditioning',
      '24/7 Security & CCTV',
      'Conference Room',
      'Standby Generator'
    ],
    units: [
      { name: 'Executive Ocean Deluxe (Suite 201)', type: 'Executive Suite', capacity: 2, priceNight: 480, priceMonth: 11000 },
      { name: 'Standard King Deluxe (Room 105)', type: 'King Deluxe', capacity: 2, priceNight: 350, priceMonth: 8500 }
    ],
    host: {
      name: 'Madam Grace Osei',
      organization: 'Atlantic Hospitality & Properties Ltd.',
      ghanaCardVerified: true,
      cardRef: 'GHA-987654321-4',
      responseRate: '100% within 15 mins'
    }
  },
  {
    id: 2,
    title: 'Oil City Executive Serviced Apartments',
    tagline: 'Contemporary Living for Expatriates & Visiting Families',
    type: 'Apartment',
    address: 'Plot 18, Palm Crescent, Westline',
    neighborhood: 'Westline',
    city: 'Takoradi',
    rating: 4.85,
    reviewsCount: 94,
    primaryImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Fully furnished 2-bedroom and studio serviced apartments with modern kitchenettes, private balconies, and dedicated parking. Tailored for corporate expatriates, project consultants, and visiting families seeking independence with hotel-style housekeeping.',
    priceDisplay: 'GH₵ 420',
    pricePeriod: 'night',
    featured: true,
    amenities: [
      'Fitted Kitchen',
      'Standby Generator',
      'Smart TV & DSTV',
      'Fiber Wi-Fi',
      'Air Conditioning',
      'Free Gated Parking',
      'Washing Machine',
      'Daily Housekeeping'
    ],
    units: [
      { name: '2-Bedroom Luxury Serviced Flat (Apt 3A)', type: '2-Bedroom Flat', capacity: 4, priceNight: 650, priceMonth: 5800 },
      { name: 'Executive Studio Suite (Apt 1B)', type: 'Studio Apartment', capacity: 2, priceNight: 420, priceMonth: 3900 }
    ],
    host: {
      name: 'Ing. Kofi Boateng',
      organization: 'Oil City Corporate Residences',
      ghanaCardVerified: true,
      cardRef: 'GHA-829104921-2',
      responseRate: '98% within 30 mins'
    }
  },
  {
    id: 3,
    title: 'Harbour View Boutique Guesthouse',
    tagline: 'Quiet Heritage Charm Overlooking Takoradi Port',
    type: 'Guesthouse',
    address: '5 Hill Street, Chapel Hill',
    neighborhood: 'Chapel Hill',
    city: 'Takoradi',
    rating: 4.78,
    reviewsCount: 76,
    primaryImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Charming, quiet heritage guesthouse on the scenic Chapel Hill ridge overlooking the bustling Takoradi Harbour. Perfect for business travellers, tourists, and short stays. Includes freshly prepared Ghanaian and Continental breakfast daily.',
    priceDisplay: 'GH₵ 280',
    pricePeriod: 'night',
    featured: true,
    amenities: [
      'Complimentary Breakfast',
      'Panoramic Harbour View',
      'Air Conditioning',
      'Work Desk & Chair',
      'Fast Wi-Fi',
      'Daily Housekeeping',
      'Garden Terrace'
    ],
    units: [
      { name: 'Harbour View Queen Room (Room 04)', type: 'Queen Room', capacity: 2, priceNight: 280, priceMonth: 6000 },
      { name: 'Garden Standard Room (Room 02)', type: 'Standard Room', capacity: 2, priceNight: 220, priceMonth: 4800 }
    ],
    host: {
      name: 'Mrs. Elizabeth Cudjoe',
      organization: 'Harbour View Hospitality',
      ghanaCardVerified: true,
      cardRef: 'GHA-194029482-7',
      responseRate: '100% within 10 mins'
    }
  },
  {
    id: 4,
    title: 'Anaji Royal Student Residency & Hostel',
    tagline: 'Premier Verified Student Living with Reliable Water & Power',
    type: 'Hostel',
    address: 'Plot 42, Queen of Peace Road, Anaji',
    neighborhood: 'Anaji',
    city: 'Takoradi',
    rating: 4.92,
    reviewsCount: 210,
    primaryImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Premier verified student residency located just 8 minutes from the Takoradi Technical University (TTU) campus. Features reliable 20,000L polytank water reserves, automatic standby generator, dedicated air-conditioned study halls, and biometric compound security.',
    priceDisplay: 'GH₵ 1,800',
    pricePeriod: 'semester',
    featured: true,
    amenities: [
      '20,000L Water Polytank',
      'Standby Generator',
      'High-Speed Campus Wi-Fi',
      'Biometric Compound Gate',
      'Quiet Study Hall',
      'Communal Kitchen',
      'Caretaker on Site'
    ],
    units: [
      { name: 'Master Self-Contain (Room 101)', type: 'Self-Contain', capacity: 1, priceMonth: 600, priceSemester: 2700 },
      { name: '2-in-1 Executive Shared (Room 102 - Bed A)', type: '2-in-a-Room', capacity: 1, priceMonth: 400, priceSemester: 1800 },
      { name: '2-in-1 Executive Shared (Room 102 - Bed B)', type: '2-in-a-Room', capacity: 1, priceMonth: 400, priceSemester: 1800 }
    ],
    host: {
      name: 'Mr. Kwabena Addo',
      organization: 'Royal Student Accommodations Takoradi',
      ghanaCardVerified: true,
      cardRef: 'GHA-394810294-1',
      responseRate: '100% within 5 mins'
    }
  },
  {
    id: 5,
    title: 'Effia Heritage Lodge & Student Flats',
    tagline: 'Affordable Campus Corridor Living with Zero Commute Friction',
    type: 'Hostel',
    address: 'Behind ECG Substation, Effia',
    neighborhood: 'Effia',
    city: 'Takoradi',
    rating: 4.70,
    reviewsCount: 115,
    primaryImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Affordable, secure student flats and self-contain units within direct walking distance of Takoradi Technical University and Effia-Nkwanta Regional Hospital. Individual self-meters, dedicated water reservoirs, and secure gated compound.',
    priceDisplay: 'GH₵ 2,500',
    pricePeriod: 'semester',
    featured: false,
    amenities: [
      'Water Tank Storage',
      'Private Self-Meter',
      'Security Gate',
      'Washing Area',
      'Walking Distance to TTU',
      'Quiet Residential Setting'
    ],
    units: [
      { name: 'Block A - Studio Unit 01', type: 'Self-Contain', capacity: 1, priceMonth: 550, priceSemester: 2500 },
      { name: 'Block A - Studio Unit 02', type: 'Self-Contain', capacity: 1, priceMonth: 550, priceSemester: 2500 }
    ],
    host: {
      name: 'Nana Yaa Darko',
      organization: 'Effia Residential Holdings',
      ghanaCardVerified: true,
      cardRef: 'GHA-583920194-8',
      responseRate: '95% within 1 hr'
    }
  },
  {
    id: 6,
    title: 'Palm Grove Coastal Resort & Villas',
    tagline: 'Tropical Beachfront Relaxation along Takoradi Coastline',
    type: 'Hotel',
    address: 'Beachway Drive, Off Cape Coast Road',
    neighborhood: 'Beach Road',
    city: 'Takoradi',
    rating: 4.88,
    reviewsCount: 88,
    primaryImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Tropical beachfront getaway offering private sea-view chalets, cocktail lounge terrace, outdoor swimming pool, and fresh seafood barbecue pavilion. Ideal for weekend holidays, honeymooners, and corporate relaxation.',
    priceDisplay: 'GH₵ 620',
    pricePeriod: 'night',
    featured: true,
    amenities: [
      'Private Beach Access',
      'Outdoor Swimming Pool',
      'Cocktail Terrace',
      'Seafood Restaurant',
      'Free Fiber Wi-Fi',
      'Air Conditioning',
      'Complimentary Breakfast'
    ],
    units: [
      { name: 'Oceanfront Beach Chalet (Villa 01)', type: 'Beach Villa', capacity: 2, priceNight: 620, priceMonth: 14000 },
      { name: 'Garden Deluxe Room (Room 08)', type: 'Garden Deluxe', capacity: 2, priceNight: 450, priceMonth: 10000 }
    ],
    host: {
      name: 'Mr. Andrews Tetteh',
      organization: 'Palm Grove Hospitality Group',
      ghanaCardVerified: true,
      cardRef: 'GHA-782910482-3',
      responseRate: '100% within 10 mins'
    }
  }
];
