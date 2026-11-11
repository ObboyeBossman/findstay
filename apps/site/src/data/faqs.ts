export interface FAQItem {
  q: string;
  a: string;
  category: 'General' | 'Guests' | 'Hosts' | 'Payments & Policies';
}

export const FAQS: FAQItem[] = [
  {
    category: 'General',
    q: 'What is FindStay and who is it built for?',
    a: 'FindStay is Ghana’s integrated accommodation discovery marketplace and Property Management System (PMS), purpose-built for Takoradi and the greater Western Region. It serves short-stay travelers (hotels, guesthouses, serviced apartments) as well as university students and long-term residents (hostels and residential flats).'
  },
  {
    category: 'General',
    q: 'How does FindStay protect users from fake agents and scams?',
    a: 'FindStay completely eliminates unauthorized middlemen. Every accommodation provider on our platform is required to undergo strict identity verification, requiring a verified Ghana National Identification Card (Ghana Card) and property title/management deed. Verified hosts receive a prominent green verification badge.'
  },
  {
    category: 'Guests',
    q: 'What is the 15-Minute Guaranteed Concurrency Hold?',
    a: 'When you initiate a reservation on FindStay, our backend database issues a pessimistic row-level lock (SELECT ... FOR UPDATE) on that exact room unit. A 15-minute (900-second) countdown starts on your screen. During this window, no other guest anywhere in the world can reserve or book that room while you enter your Mobile Money PIN or card details.'
  },
  {
    category: 'Guests',
    q: 'Can students book hostel rooms for a full semester or academic year?',
    a: 'Yes. Hostels and student residencies on FindStay feature dedicated semester pricing (e.g. GH₵ 1,800 to GH₵ 2,700 per semester) alongside monthly options. You can reserve your specific room type (Master Self-Contain, 2-in-a-room, 3-in-a-room) well in advance of university reopening.'
  },
  {
    category: 'Hosts',
    q: 'What are the fees for property owners and hotels?',
    a: 'Listing on FindStay is completely free. We charge a modest 5% to 7% commission on completed, confirmed stays—compared to 15% to 20% charged by traditional booking sites and informal agents. Landlords keep over 93% of their rental revenue.'
  },
  {
    category: 'Hosts',
    q: 'How do property owners manage room availability and avoid overbooking?',
    a: 'Every verified host receives access to FindStay Host PMS. The PMS features an interactive room occupancy grid that updates in real time. Whenever a room is booked through FindStay, it is instantly marked as Booked or Held across the entire system.'
  },
  {
    category: 'Payments & Policies',
    q: 'What payment methods are supported on FindStay?',
    a: 'We support all major Ghanaian payment rails: MTN Mobile Money, Telecel Cash, and AT Money via instant USSD STK prompt, as well as Visa and Mastercard processed through our secure Paystack gateway.'
  },
  {
    category: 'Payments & Policies',
    q: 'What is the platform cancellation and refund policy?',
    a: 'For nightly hotel and apartment stays, cancellations made 48+ hours before the scheduled check-in time receive a 100% full refund. For student semester hostels, a 72-hour grace period applies; students unable to secure university admission receive a 100% deposit refund upon presenting proof of rejection.'
  },
  {
    category: 'Payments & Policies',
    q: 'Is my personal data protected under Ghanaian law?',
    a: 'Yes. FindStay is strictly architected in compliance with the Ghana Data Protection Act, 2012 (Act 843). Identification numbers and personal data are encrypted at rest using AES-256 and stored on isolated secure servers.'
  }
];
