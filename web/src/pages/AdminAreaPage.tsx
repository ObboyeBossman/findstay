import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShellPage, StoryPlaceholder } from '../components/ShellPage';

/**
 * Administrator area entry. Serves both /admin and any /admin/... subpath,
 * so the area is routable end to end before its screens exist.
 */
export const AdminAreaPage: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <>
      <ShellPage eyebrow="Admin area" title="Platform administration">
        <p className="text-body-2">
          Administrators review owner verification documents, approve or reject
          listings before they go live, manage user accounts, and maintain
          platform settings — including the feature flags and the privacy
          policy version.
        </p>
      </ShellPage>
      <StoryPlaceholder
        story="S1-15, S1-16"
        summary={`The review queue, user management and settings screens fill this area. You are at ${pathname} — every admin route already resolves to this area entry.`}
      />
    </>
  );
};
