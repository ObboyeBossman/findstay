import React from 'react';
import { AreaCard, ShellPage, StoryPlaceholder } from '../components/ShellPage';

const featureMap: Array<{ folder: string; module: string; fills: string }> = [
  { folder: 'identity', module: 'identity', fills: 'Sign-up, sign-in, profile (S1-04, S1-05) and consent capture (S1-11)' },
  { folder: 'organization', module: 'organization', fills: 'Company space, staff invitations (S1-07)' },
  { folder: 'verification', module: 'verification', fills: 'Ghana Card & property verification uploads (S1-12)' },
  { folder: 'listing', module: 'listing', fills: 'Create properties, rooms, prices (S1-13)' },
  { folder: 'availability', module: 'availability', fills: 'Room availability calendar (S1-14)' },
  { folder: 'media', module: 'media', fills: 'Photo & document uploads (S1-09)' },
  { folder: 'audit', module: 'audit', fills: 'Permanent activity log (S1-08)' },
  { folder: 'notification', module: 'notification', fills: 'Alerts centre, preferences (S1-10)' },
  { folder: 'admin', module: 'admin', fills: 'Listing review, users, platform settings (S1-15, S1-16)' },
];

/** Guest area entry: the marketplace home. Search, stays and booking screens land here with their stories. */
export const GuestHomePage: React.FC = () => (
  <>
    <ShellPage eyebrow="Guest area" title="Find trusted stays across Ghana">
      <p className="text-body-1">
        FindStay is a Ghana-focused accommodation marketplace: verified stays,
        real availability, and local payments — for guests, owners and platform
        administrators.
      </p>
      <p className="text-body-2 mt-3">
        This is the Sprint 1 starter shell. Each area below opens and routes
        today; its screens arrive with their stories.
      </p>
    </ShellPage>

    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <AreaCard to="/" title="Guest area">
        Search and compare verified stays, see real availability, book and pay
        (S1-03 onward).
      </AreaCard>
      <AreaCard to="/owner" title="Owner area">
        Company space, verification, properties, rooms, prices and the
        availability calendar (S1-07 – S1-14).
      </AreaCard>
      <AreaCard to="/admin" title="Admin area">
        Listing review and approval, user management, platform settings
        (S1-15, S1-16).
      </AreaCard>
    </div>

    <section aria-labelledby="feature-map" className="mt-10">
      <h2 id="feature-map" className="text-heading-5">
        One folder per backend module
      </h2>
      <p className="text-body-2 mt-1 max-w-2xl">
        Screens are built inside <code>src/features/&lt;module&gt;/</code> — one
        folder per backend module, so frontend and backend ownership stay
        aligned:
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full max-w-3xl border-collapse text-caption">
          <thead>
            <tr className="border-b border-earth/20 text-left">
              <th scope="col" className="py-2 pr-4 font-bold">Folder</th>
              <th scope="col" className="py-2 pr-4 font-bold">Backend module</th>
              <th scope="col" className="py-2 font-bold">What lands there</th>
            </tr>
          </thead>
          <tbody>
            {featureMap.map((f) => (
              <tr key={f.folder} className="border-b border-earth/10">
                <td className="py-2 pr-4 font-mono">{f.folder}</td>
                <td className="py-2 pr-4 font-mono">{f.module}</td>
                <td className="py-2">{f.fills}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <StoryPlaceholder
      story="S1-03 — Mobile & Desktop Page Layouts"
      summary="Search results, stay pages and the booking flow fill this area from Story S1-03 onward."
    />
  </>
);
