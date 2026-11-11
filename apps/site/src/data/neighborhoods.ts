export interface Neighborhood {
  name: 'Beach Road' | 'Westline' | 'Chapel Hill' | 'Anaji' | 'Effia';
  tagline: string;
  description: string;
  image: string;
  popularFor: string[];
}

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    name: 'Beach Road',
    tagline: 'Waterfront Serenity & Executive Resorts',
    description: 'Takoradi’s premier coastal avenue. Home to luxury beach hotels, breezy oceanfront restaurants, and executive accommodations for business travelers and tourists.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    popularFor: ['Luxury Hotels', 'Ocean Views', 'Seafood Dining', 'Weekend Retreats']
  },
  {
    name: 'Westline',
    tagline: 'The Commercial Heart & Modern Living',
    description: 'A thriving commercial sector featuring contemporary serviced flats, banking headquarters, restaurants, and close proximity to Takoradi Harbour logistics corridors.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    popularFor: ['Serviced Apartments', 'Expatriate Stays', 'Business Hub', 'Fast Transit']
  },
  {
    name: 'Chapel Hill',
    tagline: 'Historic Ridge with Panoramic Harbour Vistas',
    description: 'An elevated, tranquil residential enclave with colonial architecture, quiet boutique guesthouses, and scenic overlooking views of the Atlantic maritime bay.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    popularFor: ['Boutique Guesthouses', 'Peaceful Ambience', 'Harbour Scenery', 'Tourists']
  },
  {
    name: 'Anaji',
    tagline: 'Upscale Suburb with Modern Student Residencies',
    description: 'One of Takoradi’s fastest-growing residential communities. Renowned for spacious, verified student hostels with 24/7 security and reliable water systems.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    popularFor: ['Premier Hostels', 'Quiet Study Environs', 'Supermarkets', 'Water Reliability']
  },
  {
    name: 'Effia',
    tagline: 'The Campus Hub: Direct Access to TTU',
    description: 'The energetic educational corridor directly neighboring Takoradi Technical University and Effia-Nkwanta Regional Hospital. Ideal for budget-conscious students and medical staff.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    popularFor: ['Walking Distance to TTU', 'Affordable Rooms', 'Student Cafes', 'Hospital Proximity']
  }
];
