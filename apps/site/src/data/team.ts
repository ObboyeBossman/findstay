export interface TeamMember {
  name: string;
  indexNumber: string;
  role: string;
  focus: string;
  avatar: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Bossman Abraham - N. O.',
    indexNumber: 'BC/ITS/24/197',
    role: 'Project Leader & Lead Architect',
    focus: 'Overall coordination, system architecture, requirements synthesis, and defense alignment.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Joseph Osei-Bonsu',
    indexNumber: 'BC/ITS/24/168',
    role: 'Backend Developer (Java)',
    focus: 'Spring Boot REST APIs, database transactions, and pessimistic reservation locking.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'David Ofori',
    indexNumber: 'BC/ITS/24/263',
    role: 'Frontend Developer (React)',
    focus: 'Client user interfaces, responsive booking workflows, and component architecture.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Solomon Fummey',
    indexNumber: 'BC/ITD/24/014',
    role: 'Database Designer',
    focus: 'PostgreSQL 3NF schema design, index optimization, and data integrity constraints.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Emmanuel Rockson',
    indexNumber: 'BC/ITN/24/153',
    role: 'Deployment & Cloud Hosting',
    focus: 'Cloud hosting, Vercel multi-project deployments, DNS routing, and CI/CD automation.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Sampson Badu',
    indexNumber: 'BC/ITS/24/161',
    role: 'Payment Integration Specialist',
    focus: 'Mobile Money (MTN MoMo, Telecel Cash) STK push and Paystack gateway settlement.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Seidu Afeadzi',
    indexNumber: 'BC/ITS/24/152',
    role: 'System Security & Compliance',
    focus: 'Stateless JWT auth, BCrypt-12 hashing, RBAC, and Ghana Data Protection Act 843 compliance.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Mashkura Tahiru',
    indexNumber: 'BC/ITS/24/265',
    role: 'Property Management Module (PMS)',
    focus: 'Landlord room grids, daily check-in workflows, and operational income/expense ledgers.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Anthony Maclean',
    indexNumber: 'BC/ITS/24/151',
    role: 'Booking & Reservation Module',
    focus: '15-minute concurrency hold timer, reservation status lifecycle, and digital receipts.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Bright Afedi',
    indexNumber: 'BC/ITS/24/156',
    role: 'System Testing & QA Lead',
    focus: 'Unit tests, end-to-end booking verification, user acceptance testing (UAT), and bug logs.',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Okyere Ankomah - Julius',
    indexNumber: 'BC/ITS/24/164',
    role: 'Project Documentation Lead',
    focus: 'Academic chapter compilation (Chapters 1-5), user manuals, and defense slide preparation.',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80'
  }
];
