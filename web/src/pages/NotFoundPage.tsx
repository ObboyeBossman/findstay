import React from 'react';
import { Link } from 'react-router-dom';
import { ShellPage } from '../components/ShellPage';

export const NotFoundPage: React.FC = () => (
  <ShellPage eyebrow="404" title="This page does not exist (yet)">
    <p className="text-body-2">
      The Sprint 1 shell routes the guest, account, owner and admin areas. If
      you expected a screen here, it arrives with its story — check the{' '}
      <Link to="/" className="font-medium underline">
        guest home
      </Link>{' '}
      for the area map.
    </p>
  </ShellPage>
);
