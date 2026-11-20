import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Heart,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Waves,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui';
import { useAuth } from '../features/identity';

type RegionKey = 'all' | 'accra' | 'kumasi' | 'aburi' | 'coast';

type PreviewStay = {
  id: string;
  region: Exclude<RegionKey, 'all'>;
  section: string;
  title: string;
  area: string;
  priceTwoNights: string;
  rating: string;
  badge?: string;
  tone: 'olive' | 'terracotta' | 'sand' | 'earth';
  icon: 'home' | 'building' | 'trees' | 'waves';
};

const CATEGORIES: Array<{ key: RegionKey; label: string }> = [
  { key: 'all', label: 'All stays' },
  { key: 'accra', label: 'Accra & Adenta' },
  { key: 'kumasi', label: 'Kumasi' },
  { key: 'aburi', label: 'Aburi & Hills' },
  { key: 'coast', label: 'Cape Coast' },
];

const PREVIEW_STAYS: PreviewStay[] = [
  {
    id: 'stay-1',
    region: 'accra',
    section: 'Popular stays in Accra & Adenta',
    title: 'Condo in Adenta',
    area: 'Adenta, Greater Accra',
    priceTwoNights: 'GH₵ 2,450 for 2 nights',
    rating: '4.92',
    badge: 'Guest favorite',
    tone: 'olive',
    icon: 'building',
  },
  {
    id: 'stay-2',
    region: 'accra',
    section: 'Popular stays in Accra & Adenta',
    title: 'Villa in East Legon',
    area: 'East Legon, Accra',
    priceTwoNights: 'GH₵ 4,200 for 2 nights',
    rating: '4.98',
    badge: 'Verified host',
    tone: 'terracotta',
    icon: 'home',
  },
  {
    id: 'stay-3',
    region: 'accra',
    section: 'Popular stays in Accra & Adenta',
    title: 'Studio in Osu',
    area: 'Osu, Accra',
    priceTwoNights: 'GH₵ 1,850 for 2 nights',
    rating: '4.87',
    tone: 'sand',
    icon: 'building',
  },
  {
    id: 'stay-4',
    region: 'accra',
    section: 'Popular stays in Accra & Adenta',
    title: 'Townhouse in Cantonments',
    area: 'Cantonments, Accra',
    priceTwoNights: 'GH₵ 3,600 for 2 nights',
    rating: '4.95',
    badge: 'Guest favorite',
    tone: 'earth',
    icon: 'home',
  },
  {
    id: 'stay-5',
    region: 'kumasi',
    section: 'Available in Kumasi this weekend',
    title: 'Apartment in Ahodwo',
    area: 'Ahodwo, Kumasi',
    priceTwoNights: 'GH₵ 1,430 for 2 nights',
    rating: '4.93',
    badge: 'Guest favorite',
    tone: 'terracotta',
    icon: 'building',
  },
  {
    id: 'stay-6',
    region: 'kumasi',
    section: 'Available in Kumasi this weekend',
    title: 'Condo in Nhyiaeso',
    area: 'Nhyiaeso, Kumasi',
    priceTwoNights: 'GH₵ 1,680 for 2 nights',
    rating: '4.96',
    badge: 'Verified host',
    tone: 'olive',
    icon: 'home',
  },
  {
    id: 'stay-7',
    region: 'kumasi',
    section: 'Available in Kumasi this weekend',
    title: 'Suite near KNUST',
    area: 'Bomso, Kumasi',
    priceTwoNights: 'GH₵ 1,040 for 2 nights',
    rating: '4.88',
    tone: 'sand',
    icon: 'building',
  },
  {
    id: 'stay-8',
    region: 'kumasi',
    section: 'Available in Kumasi this weekend',
    title: 'Townhouse in Danyame',
    area: 'Danyame, Kumasi',
    priceTwoNights: 'GH₵ 1,920 for 2 nights',
    rating: '4.84',
    tone: 'earth',
    icon: 'home',
  },
  {
    id: 'stay-9',
    region: 'aburi',
    section: 'Escape to Aburi & the Coast',
    title: 'Hillside Retreat in Aburi',
    area: 'Aburi Ridge, Eastern',
    priceTwoNights: 'GH₵ 2,750 for 2 nights',
    rating: '4.97',
    badge: 'Guest favorite',
    tone: 'olive',
    icon: 'trees',
  },
  {
    id: 'stay-10',
    region: 'aburi',
    section: 'Escape to Aburi & the Coast',
    title: 'Garden Cottage in Peduase',
    area: 'Peduase, Eastern',
    priceTwoNights: 'GH₵ 2,180 for 2 nights',
    rating: '4.91',
    tone: 'sand',
    icon: 'trees',
  },
  {
    id: 'stay-11',
    region: 'coast',
    section: 'Escape to Aburi & the Coast',
    title: 'Oceanfront Villa in Cape Coast',
    area: 'Cape Coast, Central',
    priceTwoNights: 'GH₵ 3,120 for 2 nights',
    rating: '4.94',
    badge: 'Verified host',
    tone: 'terracotta',
    icon: 'waves',
  },
  {
    id: 'stay-12',
    region: 'coast',
    section: 'Escape to Aburi & the Coast',
    title: 'Beach House in Elmina',
    area: 'Elmina, Central',
    priceTwoNights: 'GH₵ 2,540 for 2 nights',
    rating: '4.89',
    tone: 'earth',
    icon: 'waves',
  },
];

const TONE_SURFACE: Record<PreviewStay['tone'], string> = {
  olive: 'bg-olive/15 text-olive',
  terracotta: 'bg-terracotta/15 text-terracotta-dark',
  sand: 'bg-sand/50 text-earth',
  earth: 'bg-surface-muted text-earth',
};

const StayIcon: React.FC<{ icon: PreviewStay['icon'] }> = ({ icon }) => {
  switch (icon) {
    case 'building':
      return <Building2 className="h-12 w-12 opacity-75" aria-hidden="true" />;
    case 'trees':
      return <Trees className="h-12 w-12 opacity-75" aria-hidden="true" />;
    case 'waves':
      return <Waves className="h-12 w-12 opacity-75" aria-hidden="true" />;
    default:
      return <Home className="h-12 w-12 opacity-75" aria-hidden="true" />;
  }
};

/** Guest marketplace home: curated Ghana stays preview + account/host entry points. */
export const GuestHomePage: React.FC = () => {
  const { showToast } = useToast();
  const { session, sessionContext } = useAuth();
  const [activeRegion, setActiveRegion] = useState<RegionKey>('all');
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const groupedSections = useMemo(() => {
    const filtered =
      activeRegion === 'all'
        ? PREVIEW_STAYS
        : PREVIEW_STAYS.filter((s) => s.region === activeRegion);

    const groups = new Map<string, PreviewStay[]>();
    for (const stay of filtered) {
      const list = groups.get(stay.section) ?? [];
      list.push(stay);
      groups.set(stay.section, list);
    }
    return Array.from(groups.entries());
  }, [activeRegion]);

  const toggleSaved = (stay: PreviewStay, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = !prev[stay.id];
      showToast({
        variant: 'info',
        title: next ? 'Saved to preview' : 'Removed from preview',
        message: `${stay.title} — persistent wishlists arrive in Sprint 2.`,
      });
      return { ...prev, [stay.id]: next };
    });
  };

  const openPreviewCard = (stay: PreviewStay) => {
    showToast({
      variant: 'info',
      title: stay.title,
      message: `${stay.area} · ${stay.priceTwoNights}. Live listing details & booking launch in Sprint 2.`,
    });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-caption font-semibold text-olive">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ghana Stays Preview · Live booking launches in Sprint 2</span>
          </div>
          <h1 className="mt-3 font-display text-heading-2 text-earth">
            {sessionContext
              ? `Welcome back, ${sessionContext.profile.fullName}`
              : 'Find verified stays across Ghana'}
          </h1>
          <p className="mt-1 max-w-2xl text-body-2 text-earth/75">
            Explore curated homes, apartments, and villas in Accra, Kumasi, Aburi, and
            Cape Coast with Ghana Card verified hosts and Mobile Money payments.
          </p>
        </div>

        {!session ? (
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/auth/sign-in"
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover"
            >
              Sign in
            </Link>
            <Link
              to="/auth/sign-up"
              className="inline-flex min-h-touch items-center justify-center rounded-xl bg-olive px-4 py-2 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive-hover"
            >
              Create account
            </Link>
          </div>
        ) : null}
      </section>

      <nav aria-label="Destination filters" className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = activeRegion === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveRegion(cat.key)}
              aria-pressed={active}
              className={`min-h-touch rounded-full px-4 py-2 text-caption font-semibold transition-colors ${
                active
                  ? 'bg-earth text-on-brand'
                  : 'border border-border-subtle bg-surface-card text-earth hover:bg-surface-hover'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-10">
        {groupedSections.map(([sectionTitle, stays]) => (
          <section key={sectionTitle} aria-label={sectionTitle}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-heading-4 text-earth">
                {sectionTitle}
              </h2>
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-earth/70">
                <span>Sample preview</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stays.map((stay) => {
                const isSaved = Boolean(savedIds[stay.id]);
                return (
                  <article
                    key={stay.id}
                    onClick={() => openPreviewCard(stay)}
                    className="group cursor-pointer"
                  >
                    <div
                      className={`relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border-subtle transition-transform duration-normal group-hover:scale-105 ${TONE_SURFACE[stay.tone]}`}
                    >
                      <StayIcon icon={stay.icon} />
                      <span className="mt-2 inline-flex items-center gap-1 text-caption font-medium opacity-80">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {stay.area}
                      </span>

                      {stay.badge ? (
                        <span className="absolute left-3 top-3 rounded-full bg-surface-card/95 px-2.5 py-1 text-micro font-semibold text-earth shadow-sm">
                          {stay.badge}
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => toggleSaved(stay, e)}
                        aria-label={isSaved ? `Unsave ${stay.title}` : `Save ${stay.title}`}
                        className="absolute right-2 top-2 inline-flex min-h-touch min-w-touch items-center justify-center rounded-full bg-surface-card/85 text-earth transition-colors hover:bg-surface-card"
                      >
                        <Heart
                          className={`h-5 w-5 ${isSaved ? 'fill-terracotta text-terracotta' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <div className="mt-2.5 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-body-2 font-semibold text-earth">
                          {stay.title}
                        </h3>
                        <span className="inline-flex shrink-0 items-center gap-1 text-caption font-semibold text-earth">
                          <Star className="h-3.5 w-3.5 fill-earth" aria-hidden="true" />
                          {stay.rating}
                        </span>
                      </div>
                      <p className="text-caption text-earth/75">
                        {stay.priceTwoNights}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-border-subtle bg-ivory p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-caption font-semibold text-olive">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>For Property Owners & Administrators</span>
            </div>
            <h2 className="font-display text-heading-4 text-earth">
              Host your stay on FindStay
            </h2>
            <p className="max-w-xl text-body-2 text-earth/75">
              Manage your organisation, complete Ghana Card verification, and list
              apartments, villas, or guesthouses with real-time availability.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/owner"
              className="inline-flex min-h-touch items-center justify-center rounded-xl bg-terracotta px-4 py-2 text-body-2 font-semibold text-on-brand transition-colors hover:bg-terracotta-dark"
            >
              Open Owner Portal
            </Link>
            <Link
              to="/admin"
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
