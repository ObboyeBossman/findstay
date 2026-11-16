# FineStay — Design System & Theme Documentation

FineStay is a web-based accommodation booking and property management platform designed for regional urban centers (initial deployment: Takoradi, Ghana).

This design system directly implements the attached HTML reference design architecture:
- **Red (`--r: #C60026`)**: Primary action, CTA buttons ("Reserve", "Search Stays"), active tab indicator, urgent flags, delete actions, stat highlights.
- **Blue (`--b: #004BA0`)**: Structure & nav, headers, navigation links, focus rings, info badges, active nav items, secondary buttons, card hover borders.
- **White (`--w: #FFFFFF`)**: Clean card surfaces and inputs.
- **Night / Dark (`--n900: #0d1117`)**: High-contrast text and dark nav base.
- **Light Neutral Canvas (`--n50: #f6f8fa`)**: Ambient background canvas.

---

## 1. Brand Color Palette & Hex Tokens

| Variable | HEX Code | Role in Design Reference | FineStay Platform Placement |
| :--- | :--- | :--- | :--- |
| `--r` | `#C60026` | **Primary Action (Red)** | Primary buttons (`.btn-primary`), "Reserve Now", active tab bottom border, stat highlights, error/danger states. |
| `--r-light` | `#FF1A46` | Red Light | Active state accent. |
| `--r-dim` | `#8C001A` | Red Dim | Hover state for `.btn-primary`, border-color for primary buttons, text for `.badge-red`. |
| `--r-bg` | `#fff0f2` | Red Tint Background | Background for urgent badges (`.badge-red`), alert danger surfaces (`.alert-danger`), error input focus rings. |
| `--b` | `#004BA0` | **Structure & Nav (Blue)** | Top navigation bars, secondary buttons (`.btn-secondary`), links, active nav items, card hover border, input focus ring. |
| `--b-light` | `#4D9FFF` | Blue Light | Dark-mode links, interactive accents. |
| `--b-dim` | `#003578` | Blue Dim | Hover state for `.btn-secondary`, text for `.badge-blue`, text for `.alert-info`. |
| `--b-bg` | `#EFF5FF` | Blue Tint Background | Background for info badges (`.badge-blue`), `.alert-info`, input focus glow (`0 0 0 3px #EFF5FF`). |
| `--w` | `#FFFFFF` | **White Surface** | Card surfaces (`.comp-card`, `.prop-card`), form inputs (`.inp`), modals, tables. |
| `--n900` | `#0d1117` | **Dark Nav Base** | Top header bar background, darkest headings, dark mode page canvas. |
| `--n800` | `#161b22` | **Primary Text** | Body text, titles, table content. |
| `--n700` | `#21262d` | Slate Gray | Form labels, intermediate text. |
| `--n600` | `#30363d` | Mid Slate | Secondary text, property descriptions. |
| `--n400` | `#6e7681` | Muted Gray | Captions, timestamps, location subtitles, inactive tabs. |
| `--n200` | `#c9d1d9` | Default Border | Input border (`.inp`), card hover borders, tab dividers. |
| `--n100` | `#e6edf3` | Subtle Border / Divider | Card borders (`.comp-card`), table row borders, section divider lines. |
| `--n50` | `#f6f8fa` | **Page Canvas** | Page background, table header row background (`th`). |
| `--green` | `#1a7f37` | **Success Green** | Confirmed bookings, room "Available" status badge, online status dot. |
| `--green-bg`| `#dafbe1` | Green Tint Background | Background for `.badge-green` and `.alert-success`. |
| `--amber` | `#9a6700` | **Warning Amber** | Pending payment via MoMo, room under cleaning/maintenance, unverified documents. |
| `--amber-bg`| `#fff8c5` | Amber Tint Background | Background for `.badge-amber` and `.alert-warn`. |

---

## 2. Component System (HTML & CSS)

### Tabs & Navigation
```html
<div class="tabs">
  <div class="tab on" onclick="show('guest', this)">Guest Interface</div>
  <div class="tab" onclick="show('owner', this)">Owner / Manager</div>
  <div class="tab" onclick="show('admin', this)">Administrator</div>
</div>
```

### Buttons
- **Primary Action (Red)**: `<button class="btn btn-primary">Reserve</button>`
- **Secondary (Blue)**: `<button class="btn btn-secondary">Manage</button>`
- **Outline**: `<button class="btn btn-outline">Details</button>`
- **Ghost**: `<button class="btn btn-ghost">Learn More</button>`
- **Danger**: `<button class="btn btn-danger">Reject</button>`
- **Sizes**: `.btn-sm`, `.btn-lg`

### Badges & Status Indicators
```html
<span class="badge badge-blue">✓ Verified Property</span>
<span class="badge badge-green"><span class="dot-indicator" style="background:var(--green)"></span>Available</span>
<span class="badge badge-amber">Pending MoMo</span>
<span class="badge badge-red"><span class="dot-indicator" style="background:var(--r)"></span>Urgent</span>
```

### Form Inputs
```html
<input class="inp" type="text" placeholder="Enter neighborhood..." />
<input class="inp inp-err" type="text" placeholder="Error field..." />
```

### Alerts
```html
<div class="alert alert-info">New booking received.</div>
<div class="alert alert-success">Payment received via MoMo.</div>
<div class="alert alert-warn">Document inspection pending.</div>
<div class="alert alert-danger">Double-booking collision locked.</div>
```

---

## 3. FineStay Application Interfaces

1. **Guest Interface**:
   - Location search (Airport Ridge, TTU Campus, Beach Road)
   - Filter chips (`badge-blue`, `badge-gray`, `badge-red`)
   - Property listing cards with verified badge, pricing in GH₵, and direct "Reserve" buttons
   - Mobile Money payment summary (MTN MoMo / Telecel Cash)
2. **Property Owner / Manager Interface**:
   - Revenue and occupancy metrics (`GH₵ 24,850 Revenue`, `92% Occupancy`)
   - Active booking roster table with status indicators
   - Room availability toggles with automated concurrency locks
   - Operational expense logger
3. **Administrator Interface**:
   - Listing verification queue for Ghana Card and business permits
   - User account status and platform dispute management
   - Commission monitoring and transaction logs

---

## 4. React Integration

In React components (e.g. `App.jsx` or `src/main.jsx`), import the stylesheets:

```jsx
import './theme.css';
import './global.css';
```

And structure your JSX using the standard component class names:

```jsx
export function PropertyCard({ title, location, price, isVerified, isAvailable }) {
  return (
    <div className="prop-card">
      <div className="prop-img-box">
        <img src="/sample.jpg" alt={title} className="prop-img" />
        {isVerified && (
          <div className="prop-badge-top">
            <span className="badge badge-blue">✓ Verified Property</span>
          </div>
        )}
      </div>
      <div className="prop-body">
        <div className="prop-title">{title}</div>
        <div className="prop-loc">{location}</div>
        <div className="prop-footer">
          <div className="prop-price">
            GH₵ {price} <span className="prop-unit">/ night</span>
          </div>
          <button className="btn btn-primary btn-sm">Reserve</button>
        </div>
      </div>
    </div>
  );
}
```
