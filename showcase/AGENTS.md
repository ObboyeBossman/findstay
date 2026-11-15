# Showcase agent guide

`showcase/` is a standalone Vite presentation site for sprint progress. It is not bundled with the production `web/` app and must not become a dependency of it.

Keep presentation data and static sprint artefacts under this directory (especially `public/`), preserve the distinction between planned work and demonstrated work, and run `npm run build:showcase` from the repository root after changes. Do not edit generated `dist/` output.
