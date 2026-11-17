import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

/**
 * Shared shell page: an area or screen entry that intentionally has no
 * functionality yet. It says which story fills it, so nobody mistakes the
 * skeleton for a shipped screen.
 */
export const ShellPage: React.FC<Props> = ({ eyebrow, title, children }) => (
  <section aria-labelledby="shell-page-title">
    <p className="text-caption font-medium uppercase tracking-wide text-terracotta">
      {eyebrow}
    </p>
    <h1 id="shell-page-title" className="text-heading-4 mt-1">
      {title}
    </h1>
    <div className="mt-4 max-w-2xl">{children}</div>
  </section>
);

type PlaceholderProps = {
  story: string;
  summary: string;
};

/** The "this screen arrives with its story" card. */
export const StoryPlaceholder: React.FC<PlaceholderProps> = ({ story, summary }) => (
  <div className="mt-6 max-w-2xl rounded-lg border border-dashed border-earth/30 bg-white/60 p-5">
    <p className="text-label font-bold">Empty on purpose</p>
    <p className="text-body-2 mt-1">
      This screen arrives with <span className="font-bold">{story}</span>. {summary}
    </p>
  </div>
);

/** Link card used by the area directories. */
export const AreaCard: React.FC<{ to: string; title: string; children: React.ReactNode }> = ({
  to,
  title,
  children,
}) => (
  <Link
    to={to}
    className="block rounded-lg border border-earth/15 bg-white/70 p-5 no-underline transition hover:border-olive hover:bg-white"
  >
    <h2 className="text-heading-5 font-display">{title}</h2>
    <p className="text-body-2 mt-1">{children}</p>
  </Link>
);
