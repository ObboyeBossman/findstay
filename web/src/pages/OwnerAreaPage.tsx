import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShellPage, StoryPlaceholder } from '../components/ShellPage';

/**
 * Owner/company area entry. Serves both /owner and any /owner/... subpath,
 * so the area is routable end to end before its screens exist.
 */
export const OwnerAreaPage: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <>
      <ShellPage eyebrow="Owner / company area" title="Your properties, in one place">
        <p className="text-body-2">
          Owners and staff manage the company space, submit verification
          documents (Ghana Card, ownership proof, GTA licence), build listings
          with photos, units and prices, and keep the availability calendar
          that prevents double bookings.
        </p>
      </ShellPage>
      <StoryPlaceholder
        story="S1-07, S1-12, S1-13, S1-14"
        summary={`The dashboard, verification, listing and calendar screens fill this area. You are at ${pathname} — every owner route already resolves to this area entry.`}
      />
    </>
  );
};
