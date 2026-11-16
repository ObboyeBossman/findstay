# FineStay Design System & Theme Documentation

FineStay is a modern web-based accommodation booking and property management platform designed for regional urban centers (initial context: Takoradi, Ghana).

This design system establishes a cohesive visual language inspired by the FineStay brand mark—balancing **Deep Forest Green** (trust, foundation, architectural stability) with **Vibrant Leaf Green** (hospitality, energy, vacancy/availability, action).

---

## 1. Brand Color Palette & Hex Codes

| Token Name | HEX Code | Role & Description | Where It Is Used On FineStay |
| :--- | :--- | :--- | :--- |
| `--brand-forest-950` | `#042509` | **Deep Forest Dark** | Owner & Admin sidebar backgrounds, footer background, deepest contrast areas. |
| `--brand-forest-800` | `#0B4A14` | **Main Primary Brand** | House structure from reference logo; primary buttons (`.btn-primary`), primary headers, active tab underlines, main brand logos. |
| `--brand-forest-700` | `#0E5D1B` | **Primary Hover** | Hover state for primary buttons and interactive dark green elements. |
| `--brand-forest-100` | `#D6F3DC` | **Primary Tint Surface** | Subtle tag backgrounds, active menu item highlights, light container headers. |
| `--brand-forest-50` | `#EFF9F1` | **Primary Subtle Wash** | Verified badge background, subtle icon container fills (`.stat-icon`). |
| `--brand-leaf-500` | `#1BAC04` | **Main Accent (Vibrant Green)** | Window panes & dynamic swoosh from reference logo; "Book Now" / "Instant Reserve" CTAs (`.btn-accent`), toggle switches, availability dots. |
| `--brand-leaf-600` | `#189904` | **Accent Hover** | Hover state for accent buttons and active green interactive elements. |
| `--brand-leaf-100` | `#DAFBD5` | **Accent Pill Background** | Success banners, "Instant Confirmation" badge background. |
| `--brand-slate-700` | `#254034` | **Secondary Neutral** | Secondary action buttons, owner/admin section headers, subtle icon fills. |
| `--neutral-900` | `#121C15` | **Text Primary** | High-contrast body text and headings. Meets WCAG AAA standard (15.2:1 contrast ratio against white). |
| `--neutral-600` | `#4D5D52` | **Text Secondary** | Subtitles, property amenity descriptions, table header text, timestamps. |
| `--neutral-500` | `#697A6F` | **Text Muted** | Placeholders, inactive breadcrumbs, disclaimers. |
| `--neutral-200` | `#D9E2DC` | **Border Medium** | Input borders, card borders, table dividers. |
| `--neutral-100` | `#F0F4F1` | **Muted Surface** | Input backgrounds, table `<thead>` backgrounds, inactive filter chips. |
| `--neutral-50` | `#F7FAF8` | **Background Base** | Page background ambient (sampled from clean soft background of reference logo). |
| `--neutral-0` | `#FFFFFF` | **Surface Crisp White** | Property cards, modal dialogs, dashboard stat widgets, dropdown menus. |

---

## 2. Semantic & Status Feedback Colors

| Semantic State | Base HEX | Background HEX | Border HEX | Purpose on FineStay |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#127003` | `#EFFDEF` | `#9CF08D` | Booking confirmed, Mobile Money payment received, room marked "Available", property verified. |
| **Warning** | `#D97706` | `#FFFBEB` | `#FDE68A` | Pending owner approval, reservation hold expiring, unverified KYC documents, payment pending webhook. |
| **Error / Danger** | `#DC2626` | `#FEF2F2` | `#FECACA` | Double-booking conflict prevented, reservation cancelled, payment declined, suspended account. |
| **Info** | `#0284C7` | `#F0F9FF` | `#BAE6FD` | Student discount notices (TTU), seasonal pricing tips, platform check-in policies. |

---

## 3. Typography & Elevation Tokens

### Font Families
- **Primary Body & Display**: `system-ui, -apple-system, "Segoe UI", Roboto, "Plus Jakarta Sans", "Inter", sans-serif`
- **Monospace (Pricing, Codes, Receipts)**: `ui-monospace, "Cascadia Code", "Roboto Mono", Consolas, monospace`

### Typography Scale
- **Display 1 / Page Title (`h1`)**: `2.25rem` (36px) — Bold
- **Section Heading (`h2`)**: `1.875rem` (30px) — Bold
- **Card / Widget Heading (`h3`)**: `1.5rem` (24px) — Bold
- **Sub-heading (`h4`)**: `1.25rem` (20px) — SemiBold
- **Body (`p`, base)**: `1rem` (16px) — Regular, Line-height 1.625
- **Small (`small`, `.text-small`)**: `0.875rem` (14px) — Regular/Medium
- **Micro / Badges (`.text-xs`)**: `0.75rem` (12px) — SemiBold / Uppercase

### Elevation Shadows
- **Card Base**: `0 2px 4px rgba(12, 19, 14, 0.06), 0 1px 2px rgba(12, 19, 14, 0.04)`
- **Hover Lift**: `0 14px 30px -4px rgba(11, 74, 20, 0.12), 0 4px 12px -2px rgba(12, 19, 14, 0.06)`
- **Search Widget / Modal**: `0 20px 35px -8px rgba(12, 19, 14, 0.14)`
- **Accent Glow**: `0 0 16px rgba(27, 172, 4, 0.35)`

---

## 4. Applying Theme Across the 3 FineStay User Portals

### 1. Guest Interface (Booking & Discovery)
- **Navigation Bar**: Crisp white with blurred backdrop (`rgba(255, 255, 255, 0.95)`), `#0B4A14` logo text with `#1BAC04` accent dot.
- **Hero Search Widget**: High-elevation floating bar (`.hero-search-box`) with intuitive segmented inputs: Location (e.g. Takoradi Airport Ridge, TTU), Check-In, Check-Out, and Guests, ended by `.btn-accent` search button.
- **Filter Chips**: Pill-shaped categories (`.filter-chip`) toggling between All Stays, TTU Hostels, Executive Apartments, and Beachfront Guesthouses.
- **Property Listing Cards**: High-definition image with 16:10 aspect ratio, overlay badge (`.badge-verified`), pricing prominently displayed in Ghana Cedis (`GH₵`), and direct "Reserve" button.
- **Checkout Modal**: Clean input groups with currency prefixes (`GH₵`), Mobile Money selector (MTN MoMo, Telecel Cash), and clear price breakdown.

### 2. Property Owner / Manager Interface (Operations & Finance)
- **Sidebar**: Grounded Deep Forest (`#042509`) with high-contrast navigation links. Active menu item illuminated with Leaf Green (`#1BAC04`).
- **Metric Cards (`.stat-card`)**: Surface white cards with green icon containers, clear numbers (e.g., "GH₵ 24,850 Revenue", "92% Occupancy"), and percentage trend tags (`.trend-up`).
- **Availability & Inventory Manager**: Room categories with real-time toggle switches (`.toggle-switch`), preventing double-booking through visual status flags.
- **Income/Expense Tracker**: Clear table listing maintenance costs, utility payments, and net profit margins.

### 3. Administrator Interface (Oversight & Compliance)
- **Verification Queue**: Dedicated moderation cards displaying owner identity documents (Ghana Card, Business Permit) with one-click **Approve** (`.btn-accent`) or **Reject** (`.btn-danger`) actions.
- **User & Dispute Console**: Responsive data table (`.table`) with status pills (`.badge-verified`, `.badge-warning`, `.badge-danger`) and transaction audit logs.

---

## 5. Integrating with React Components

In your React project root (`src/main.jsx` or `src/index.jsx`):

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme.css';   // 1. Central Design Tokens
import './global.css';  // 2. Global Styles & Component Classes

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Example React Component: PropertyCard

```jsx
// src/components/PropertyCard.jsx
import React from 'react';

export default function PropertyCard({ title, location, price, rating, image, isVerified }) {
  return (
    <div className="property-card">
      <div className="property-image-container">
        <img src={image} alt={title} className="property-image" />
        {isVerified && (
          <div className="property-badge-overlay">
            <span className="badge badge-verified">✓ FineStay Verified</span>
          </div>
        )}
      </div>
      <div className="property-content">
        <div className="flex items-center justify-between">
          <span className="property-location">{location}</span>
          <span className="rating-badge">★ {rating}</span>
        </div>
        <h4 className="property-title">{title}</h4>
        <div className="property-price">
          <span className="price-amount">GH₵ {price}</span>
          <span className="price-unit">/ night</span>
          <button className="btn btn-accent btn-sm" style={{ marginLeft: 'auto' }}>
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. How to View the Interactive Showcase

Open `design-system-showcase.html` in any web browser to explore:
1. Interactive color swatch cards with live contrast scores.
2. Full button, input, toggle, and alert component library.
3. Live mockups for the Guest Portal, Owner Dashboard, and Admin Console.
