import React from 'react';
import { ShellPage, StoryPlaceholder } from '../components/ShellPage';

type Props = {
  title: string;
  story: string;
  note: string;
};

/** An account-area screen entry: routed, titled, and honest about being empty. */
export const AuthScreenPage: React.FC<Props> = ({ title, story, note }) => (
  <div className="mx-auto max-w-md">
    <ShellPage eyebrow="Account area" title={title}>
      <p className="text-body-2">{note}</p>
    </ShellPage>
    <StoryPlaceholder story={story} summary="The working screen — form, validation and Supabase wiring — arrives with that story." />
  </div>
);
