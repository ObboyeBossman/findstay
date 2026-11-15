# FindStay — Chapter 1 Research Material

*School software-engineering project | Takoradi Technical University | Brayline Tech*

---

## Section 1 · Background of the Study

### 1.1 Draft (≈ 580 words)

The global travel and accommodation industry has undergone a profound transformation driven by the rapid growth of digital platforms. What was once a process reliant on telephone enquiries, travel agents, and walk-in visits has migrated almost entirely online. According to Eurostat, more than 678 million guest nights were spent in short-stay accommodation in Europe alone in 2023 — booked through platforms such as Airbnb, Booking.com, Expedia, and TripAdvisor — representing a 13.8 % increase from 2022 and a 32.6 % rise from pre-pandemic levels in 2019 (Eurostat, 2024). In the first quarter of 2024, that figure grew a further 28.3 % year-on-year, confirming that digital booking has become the standard, not the exception (Eurostat, July 2024). Supporting this shift, D-EDGE's 2024 Hotel Distribution Report found that digital channels now account for 60 % of global hotel distribution revenue on average — a steadily increasing share over the five years from 2019 to 2023.

Despite these global advances, Sub-Saharan Africa — and Ghana specifically — has not fully captured the benefits of digital accommodation discovery. A 2023 digital diagnostic of Ghana's tourism sector, conducted by Cenfri in partnership with the Mastercard Foundation and the Ghana Tourism Federation, found that digital technology adoption among Ghanaian tourism operators remains nascent. Of the accommodation establishments surveyed, only 50 % of hotels had claimed their Google Business Profile, and a mere 29 % had their own websites. The same study noted that Ghanaian tourism businesses with a digital presence earn, on average, five times higher revenue than those without — illustrating the economic cost of the digital gap (Cenfri / World Bank firm-level data, 2023).

Ghana's accommodation sector has grown considerably in scale. According to the Ghana Tourism Information System (GTIS), the number of registered accommodation establishments rose from 540 in 1995 to 5,424 by 2025 (Voyages Afriq / GTDC, 2025). Ghana recorded approximately 8.8 million domestic overnight visitors in 2023, with 97 % of trips self-arranged and over 90 % of visitors staying in non-commercial accommodation such as the homes of family and friends (Ghana Statistical Service Domestic Overnight Visitors Report, December 2025). This pattern indicates a substantial, underserved market of travellers who lack access to reliable, verified commercial accommodation options.

In Takoradi, the capital of Ghana's Western Region and an active port and commercial hub, the accommodation market includes a mix of hotels, guesthouses, hostels, and serviced apartments. Nationally, Ghana Statistical Service data for November 2024 to February 2025 shows hostels operating at room occupancy rates of 91–99 %, while some hotel categories lag behind — signalling strong demand for lower-cost accommodation that is nonetheless difficult for travellers to discover and book reliably through a single platform (GSS Accommodation Unit Survey, 2025).

For property owners and managers, the absence of integrated management tools compounds these challenges. Research on small accommodation providers across Africa confirms that manual booking management — through spreadsheets, phone calls, and unconnected channel updates — leads to recurring problems including double-bookings, inconsistent availability information, unreliable revenue tracking, and an inability to generate meaningful occupancy or financial reports (OtelMS, 2024; HotelRunner, 2026; SmartOrder, 2026). These inefficiencies reduce competitiveness and make it difficult for smaller establishments to participate effectively in a market increasingly dominated by properties that have adopted digital systems.

A platform that combines searchable, verified accommodation listings for guests with practical management tools for property owners — purpose-built for the Ghanaian context — therefore addresses a real and demonstrable gap. FindStay is proposed as such a system: a two-sided academic prototype designed for the Takoradi/Ghana market, enabling guests to discover and book accommodation and providing owners with tools to manage listings, reservations, income, expenses, and reports under one accessible interface.

### 1.2 Key Points (Bullet Summary)

- Global online accommodation bookings grew 13.8 % in 2023 and 28.3 % in Q1 2024 (Eurostat)
- Digital channels account for 60 % of global hotel distribution revenue (D-EDGE, 2024)
- Only 50 % of Ghanaian hotels have claimed their Google Business Profile; 29 % have websites (Cenfri/Mastercard Foundation, 2023)
- Ghanaian tourism businesses with a digital presence earn 5× more revenue than those without (World Bank / Cenfri)
- Ghana's registered accommodation establishments grew from 540 (1995) to 5,424 (2025)
- 8.8 million domestic overnight visitors in Ghana in 2023; 97 % self-arranged (GSS, 2025)
- Ghanaian hostels ran at 91–99 % room occupancy (Nov 2024–Feb 2025), showing strong demand for affordable accommodation
- Manual booking management causes double-bookings, availability errors, and poor financial visibility across small properties in Africa
- FindStay addresses a gap: combining guest discovery with owner management, tailored for smaller Ghanaian accommodation providers

### 1.3 Verified Sources

| Source | Link |
| --- | --- |
| Eurostat — 678 million guest nights 2023 | https://ec.europa.eu/eurostat/en/web/products-eurostat-news/w/DDN-20240403-1 |
| Eurostat — Q1 2024 bookings up 28.3 % | https://ec.europa.eu/eurostat/en/web/products-eurostat-news/w/ddn-20240729-1 |
| D-EDGE Hotel Distribution Report 2024 | https://www.d-edge.com/wp-content/uploads/2024/04/Hotel-Distribution-Report-2024-EN.pdf |
| Cenfri — Digitising destinations: Ghana tourism digital diagnostic | https://cenfri.org/articles/digitising-destinations-a-tourists-journey-starts-online |
| Cenfri — Catalysing data and digital technology for tourism in Ghana (2023) | https://cenfri.org/articles/catalysing-data-and-digital-technology-for-tourism-in-ghana |
| GTDC / GTIS — 5,424 accommodation establishments | https://voyagesafriq.com/?p=35651 |
| GSS — Domestic Overnight Visitors Report (Dec 2025) | https://statsghana.gov.gh/gssmain/fileUpload/pressrelease/Domestic\_Overnight\_Visitors\_Final%20Report\_16\_DECEMBER\_2025.pdf |
| GSS Accommodation Unit Survey — Hostel occupancy (2025) | https://www.myjoyonline.com/hostels-outperform-hotels-as-accommodation-demand-shifts-to-lower-cost-options-gss/ |
| OtelMS — Manual booking & double-booking problems | https://otelms.com/?p=30390 |
| HotelRunner — 10 signs hotel has outgrown manual bookings | https://hotelrunner.com/en/?p=143922 |

### 1.4 Claims Needing Local Research or Primary Data Collection

- Percentage of accommodation providers in Takoradi/Western Region currently using digital booking tools
- Proportion of TTU or other Ghanaian university students who struggle to find verified off-campus accommodation
- Survey data on how guests in Takoradi currently discover and book accommodation (word-of-mouth, walk-in, phone, online)
- Specific revenue loss estimates attributable to double-bookings or manual errors among Takoradi property owners
- Whether any locally-built booking platform currently serves Takoradi specifically (as opposed to global OTAs listing some Takoradi properties)

---

## Section 2 · Problem Statement

### 2.1 Formal Problem Statement (≈ 220 words)

The discovery and booking of accommodation in Ghana, particularly in mid-size commercial cities such as Takoradi, is characterised by fragmentation, unreliability, and a lack of integrated management support for property owners. Prospective guests — including business travellers, domestic tourists, university students, and event attendees — have no single trusted platform through which to search, compare, and verify accommodation options across hotels, guesthouses, hostels, and apartments. Available information on pricing, real-time availability, and facilities is often scattered across informal channels such as phone referrals, social media posts, and word-of-mouth, creating uncertainty and increasing the risk of arriving to find that a booking is unavailable or never formally confirmed.

Property owners and managers face equally significant challenges on the operational side. Without integrated digital tools, many establishments manage reservations through disconnected methods — telephone calls, paper registers, and unlinked spreadsheets — that increase the probability of double-bookings, lost reservations, and inaccurate availability information. The manual tracking of income and expenses makes it difficult to assess financial performance or occupancy trends, and the absence of structured reporting limits owners' ability to make informed decisions.

FindStay is proposed as an academic prototype system that addresses these interconnected problems by providing guests with a verified, searchable accommodation directory and reservation system, and providing property owners with integrated tools for listing management, reservation handling, income and expense tracking, and report generation.

### 2.2 Short Presentation Version (≈ 85 words)

In Takoradi and similar Ghanaian cities, guests have no single reliable platform to find, compare, and book verified accommodation across hotels, guesthouses, hostels, and apartments. At the same time, property owners rely on disconnected manual methods — phone bookings, paper records, and spreadsheets — that lead to double-bookings, inaccurate availability, and poor financial visibility. FindStay is an academic prototype that solves both sides of this problem: a two-sided web platform enabling guests to search and reserve accommodation, and owners to manage listings, bookings, revenue, and reports in one place.

### 2.3 Problems by User Group

| User | Specific Problem |
| --- | --- |
| **Guest** | No single verified directory to search and compare hotels, guesthouses, hostels, and apartments in one place |
| **Guest** | Inability to confirm real-time availability before travelling |
| **Guest** | Unclear or inconsistent pricing and facility information |
| **Guest** | Risk of making a booking that is not properly recorded or confirmed |
| **Property Owner / Manager** | Managing reservations manually across phone, paper, and spreadsheets leads to double-bookings and lost records |
| **Property Owner / Manager** | No centralised calendar or availability tool to prevent overbooking |
| **Property Owner / Manager** | Inability to track income, expenses, and occupancy in a structured way |
| **Property Owner / Manager** | Lack of reporting tools to understand business performance or support decision-making |
| **Administrator** | No formal verification process to confirm that listed properties meet basic standards |
| **Administrator** | Difficulty managing user accounts, handling disputes or complaints, and maintaining data integrity |

### 2.4 Supporting Evidence

- Cenfri (2023): Only 29 % of Ghanaian hotels have websites; digital tools remain underutilised in accommodation (https://cenfri.org/articles/digitising-destinations-a-tourists-journey-starts-online)
- GSS (2025): 97 % of domestic overnight trips in Ghana were self-arranged, suggesting limited access to or trust in formal booking channels
- OtelMS (2024): Manual booking management and lack of channel synchronisation are the leading causes of double-bookings in small properties
- HotelRunner (2026): A pattern of double-bookings is a systems failure, not individual error; manual reservation workflows break down as properties list on more than one channel

---

## Section 3 · Project Aim and Objectives

**Project Aim:** To design and develop FindStay, a web-based two-sided accommodation platform that enables guests in Ghana to search, compare, and reserve verified accommodation, while providing property owners with integrated tools to manage listings, availability, reservations, income, expenses, and reports, and enabling administrators to verify listings and manage platform users.

### Objectives Table

| # | Objective Statement | Expected Evidence of Completion |
| --- | --- | --- |
| 1 | Design and implement a secure user registration and role-based authentication system supporting guest, property owner/manager, and administrator roles | Functional login/register flow; role-specific dashboards accessible only to authorised users; session management tested across roles |
| 2 | Develop a searchable and filterable accommodation discovery interface enabling guests to find and compare listings by property type, location, price range, and available facilities | Search and filter components returning relevant results; listing detail pages displaying property information, images, pricing, and availability |
| 3 | Implement a property listing management module allowing owners to create, update, and deactivate accommodation listings with detailed descriptions, photo uploads, and pricing information | CRUD operations on listings confirmed; image upload functional; listing status (active/inactive) correctly reflected in guest search results |
| 4 | Develop a real-time availability and reservation calendar enabling owners to manage room or unit availability and preventing double-bookings | Availability calendar updates correctly on new reservation; simultaneous booking of the same unit on overlapping dates is blocked by the system |
| 5 | Implement a reservation management module enabling guests to submit booking requests and owners to confirm, modify, or cancel reservations with automated status notifications | Full reservation lifecycle (request → confirmation → cancellation/completion) functional; status notifications delivered to both parties |
| 6 | Develop an income and expense tracking module allowing property owners to record revenue from reservations and log operational expenses with categorisation | Income entries generated from confirmed bookings; expense records stored with category and date; running balance or summary computable from records |
| 7 | Implement a reporting and dashboard module providing property owners with occupancy summaries, revenue totals, and expense breakdowns over selectable date ranges | Dashboard displays occupancy rate, total revenue, and expense summary; reports filterable by date range and exportable or printable |
| 8 | Develop an administration module enabling platform administrators to verify property submissions, approve or reject listings, manage user accounts, and handle reported complaints | Admin dashboard functional; listing approval workflow operational; user account management (activate/suspend) working; complaint/ticket log accessible |

---

## Section 4 · Significance of the Project

### 4.1 Academic Draft (≈ 420 words)

FindStay addresses a gap at the intersection of digital tourism infrastructure and practical accommodation management — a gap that is particularly pronounced in mid-size Ghanaian cities such as Takoradi. The significance of the project can be examined across four stakeholder dimensions.

**For guests and accommodation seekers**, FindStay is expected to reduce the time and uncertainty involved in finding and reserving accommodation. Travellers — whether domestic tourists, business visitors, university students, or event attendees — currently rely on informal networks, phone referrals, or general-purpose international platforms that do not comprehensively represent smaller local properties. By aggregating verified listings with real-time availability, FindStay gives guests access to accurate information and a formal booking channel, reducing the risk of arriving at an unconfirmed or unavailable accommodation.

**For property owners and managers**, the platform is expected to reduce operational errors, improve financial visibility, and lower the administrative burden of managing reservations. The income and expense tracking module, alongside occupancy reports, provides smaller establishments — which typically lack access to expensive enterprise property management systems — with structured financial data to support day-to-day decisions. This aligns with wider evidence that Ghanaian businesses with digital tools earn significantly higher revenue than those without (Cenfri/World Bank, 2023).

**For platform administrators**, FindStay provides a structured system for verifying accommodation providers before they can list properties, reducing the risk of fraudulent or sub-standard listings that could harm guest trust. The complaints and user management module supports accountability within the platform ecosystem.

**For the academic and research community**, the project demonstrates a practical application of two-sided marketplace design, role-based access control, and integrated financial tracking in the context of Ghana's tourism and hospitality sector. As a school software-engineering project, it also contributes a documented prototype that future researchers or developers could extend, adapt, or use as a reference model for similar platforms in other Ghanaian cities or in comparable Sub-Saharan African markets.

More broadly, FindStay contributes, at a small scale, to Ghana's stated policy goal of accelerating digital transformation in the tourism sector — a goal articulated by the Ministry of Tourism, Culture and Creative Arts and reinforced by the launch of digital initiatives such as the Ghana Tourism Marketplace and the Ghana Tourism Information System in 2024–2025.

### 4.2 Stakeholder Benefit Table

| Stakeholder | Expected Benefit |
| --- | --- |
| **Guest / Accommodation Seeker** | Single verified directory; real-time availability checking; formal booking confirmation; reduced risk of double-booking or misinformation |
| **Property Owner / Manager** | Reduced double-bookings; centralized reservation calendar; income and expense tracking; occupancy and financial reports |
| **Platform Administrator** | Structured listing verification workflow; user management tools; complaints resolution system |
| **Academic Institution** | Documented prototype demonstrating applied software engineering; potential basis for further research |
| **Tourism / Digital Economy** | Small-scale contribution to Ghana's digital tourism transformation agenda; model replicable in similar markets |

### 4.3 Contextual Sources

- Ghana Tourism Minister calls for accelerated digital transformation (GNA, Sept 2026): https://gna.org.gh/2026/09/tourism-minister-calls-for-accelerated-digital-transformation-of-ghanas-tourism-sector/
- Ghana Tourism Information System launched (Voyages Afriq, 2025): https://voyagesafriq.com/?p=35651
- Ghana Tourism Marketplace gaining traction (MyJoyOnline): https://www.myjoyonline.com/gtdc-calls-for-synergy-as-its-marketplace-gains-global-traction/
- Cenfri: businesses with digital presence earn 5× more revenue: https://cenfri.org/articles/digitising-destinations-a-tourists-journey-starts-online

---

## Section 5 · Scope of the Project

### 5.1 In-Scope Users

- **Guests / accommodation seekers** — registered users who search, compare, and reserve accommodation
- **Property owners / managers** — registered users who list and manage one or more accommodation properties, manage availability and bookings, and track income and expenses
- **Platform administrators** — backend users who verify listings, manage user accounts, and handle complaints

### 5.2 In-Scope Property Types

- Hotels
- Guesthouses
- Hostels (dormitory and private rooms)
- Serviced apartments / short-stay apartments

### 5.3 Guest / Customer Features

- Register and log in with a verified account
- Search and filter accommodation by type, location, price range, facilities, and check-in/check-out dates
- View detailed listing pages with photos, descriptions, amenities, pricing, and availability
- Submit a reservation request and receive a booking confirmation
- View and manage personal booking history and status
- Submit a complaint or enquiry about a listing

### 5.4 Property Owner / Manager Features

- Register as a property owner and submit verification documents
- Create, edit, and deactivate accommodation listings (photos, description, pricing, amenities)
- Manage room or unit availability through a calendar view
- Receive, confirm, modify, or cancel reservation requests
- Record income from confirmed reservations and log operational expenses with categories
- View occupancy summaries and financial reports over selectable date ranges

### 5.5 Administrator Features

- Review and approve or reject property listing submissions
- Verify property owner identity/documents
- Manage guest and owner user accounts (activate, suspend, delete)
- Review and respond to complaints or disputes
- Access platform-level overview statistics (total listings, users, reservations)

### 5.6 Technical Boundaries

- **Platform type:** Web application (desktop and mobile-responsive browser)
- **Tech stack (assumed):** Next.js / TypeScript front-end; Supabase backend (PostgreSQL + authentication); Vercel deployment
- **Authentication:** Email/password with role-based access; no third-party OAuth required in v1
- **Storage:** Supabase Storage for property images
- **Notifications:** In-platform status updates; basic email notifications via Supabase if feasible
- **Geography:** Prototype scoped to Ghana, with Takoradi as the primary test context
- **Language:** English only in v1

### 5.7 Explicitly Out-of-Scope Features (v1 Prototype)

- Live payment processing or escrow (reservations are confirmed by owner; payments handled offline)
- Native mobile applications (iOS / Android)
- Real-time map integration or GPS-based discovery
- AI-powered recommendations or personalisation engine
- Multi-language support
- Third-party channel manager integration (Booking.com, Airbnb API sync)
- Review and rating system (noted as future enhancement)
- Dynamic pricing or yield management tools
- Loyalty or rewards programme

---

## Section 6 · Limitations and Assumptions

### 6.1 Limitations

| # | Limitation | Effect on Project | Mitigation |
| --- | --- | --- | --- |
| 1 | Limited development time (academic semester) | Feature set must be prioritised; not all desirable features will be implemented in v1 | Strict scope definition (Section 5); future-enhancement list maintained |
| 2 | No live payment processing | Cannot demonstrate full commercial transaction flow; reservation confirmation is manual between owner and guest | Clearly documented as out-of-scope; system designed with payment integration point for future extension |
| 3 | Prototype-level security and performance testing | System has not undergone professional penetration testing or load testing for production volumes | Basic security practices applied (parameterised queries, role-based access, HTTPS); limitations documented |
| 4 | Limited real user data and test properties | Listings and reservations in the prototype use fabricated or simulated test data | Test data designed to be representative; real stakeholder testing recommended as next step |
| 5 | No real-time channel synchronisation | Availability shown on FindStay may not reflect bookings made directly with the owner through other channels | Owners advised to update availability manually; documented limitation |
| 6 | Geographic coverage limited to Ghana / Takoradi context | Platform not tested or optimised for other countries or languages | Scope explicitly defined; stated as future enhancement |
| 7 | Single-developer project | Bug fixes, design iterations, and feature additions are limited by one person's capacity | Modular architecture to allow incremental development; MVP features prioritised |

### 6.2 Assumptions

| # | Assumption | Why It Is Necessary | Risk If Untrue |
| --- | --- | --- | --- |
| 1 | Users (guests and owners) have access to the internet via smartphone or computer | The platform is web-based; without internet access it cannot be used | Platform would be inaccessible to users in areas with poor connectivity |
| 2 | Property owners provide accurate and up-to-date listing information (descriptions, photos, pricing, availability) | The platform relies on owner-submitted data; there is no independent data source | Inaccurate listings would damage guest trust and reduce platform value |
| 3 | Administrators actively review and approve listing submissions within a reasonable time | Listings cannot appear on the platform until approved; delays affect owner experience | Slow verification would discourage owners from registering; backlog would grow |
| 4 | Owners update their availability calendar after reservations made outside the platform | Without synchronisation, the system could show availability that does not exist | Guests could attempt to book already-occupied rooms; double-booking risk reintroduced |
| 5 | Guests have a valid email address for account registration and notifications | Account creation and booking confirmations require a reachable email | Users without email access could not register; scope of platform would narrow |
| 6 | Test users (simulated guests and owners) can be found among peers, classmates, or project stakeholders for user acceptance testing | Functional testing requires at least some simulated end-user interaction | Without any test users, evaluation of the user interface and booking workflow would be incomplete |
| 7 | Supabase's free-tier infrastructure is sufficient for prototype-scale usage | The project is developed on Supabase free tier; production traffic could exceed these limits | Performance or feature degradation if usage exceeds free-tier limits during testing |

---

## Section 7 · Existing-System Comparison

### 7.1 Comparison Table

| System | Primary Users | Key Search / Booking Features | Key Owner-Management Features | Notable Strengths | Limitations / Gap Relevant to FindStay | Official Source |
| --- | --- | --- | --- | --- | --- | --- |
| **Airbnb** | Guests seeking unique/private stays; individual hosts | Property search with map, filters (type, dates, amenities, price); instant or request booking; guest reviews | Listing creation; availability calendar; pricing tools; host messaging; payout management | Extremely large inventory; strong trust/verification layer; well-known globally | High service fees (up to 20 % for hosts; guest fees vary); primarily peer-to-peer/private rentals; limited tools for professional hotel/hostel operators; not focused on West Africa small properties | https://www.airbnb.com |
| **Booking.com** | All accommodation types; broad traveller audience | Extensive filters; free cancellation options; real-time availability; reviews and ratings; loyalty programme | Extranet for availability/rate management; reservation overview; analytics | Largest global inventory; strong brand trust; free to list (commission on booking) | High commission rates (typically 15–25 %); complex extranet for small operators; designed for properties with reliable internet and staff capacity; global/not locally tailored | https://www.booking.com |
| **Hostelworld** | Budget travellers, backpackers, solo travellers | Hostel-focused search; dorm and private room booking; social/community features (in-app chat) | Hostelworld Inbox (booking and guest communication management); PMS integration options | Largest hostel-specific platform (36,000+ properties, 170 countries); strong community features | Narrow scope (hostels only); commission-based model; no income/expense tracking for owners; not tailored to Ghanaian/West African market | https://www.hostelworld.com |
| **Ghana Tourism Marketplace (GTM)** | Domestic and inbound tourists in Ghana; vetted local vendors | Aggregates accommodation, tours, transport, cultural experiences from verified Ghanaian vendors | Vendor-side listing tools (scope not fully documented publicly) | Nationally focused; government-backed; covers more than accommodation; gaining international traction | Primarily a marketing/discovery platform; lightweight owner-side management; no documented income/expense tracking or occupancy reporting | https://voyagesafriq.com/?p=33771 |
| **Little Hotelier / Cloudbeds / NightsBridge** | Small independent hotels, guesthouses, B&Bs (operations focus) | Direct booking engine for property's own website; not a consumer-facing discovery marketplace | Full PMS: reservation calendar, channel manager, rate management, reporting, payment processing | Purpose-built for small properties; prevents double-bookings; real-time channel sync; African-market focus (NightsBridge) | Subscription cost (typically $75+/month); requires existing digital presence; not a discovery/search platform for guests who don't already know the property | https://www.littlehotelier.com / https://site.nightsbridge.com |

### 7.2 Gap FindStay Addresses

Existing platforms fall into two distinct categories: **consumer-facing discovery platforms** (Airbnb, Booking.com, Hostelworld) that help guests find accommodation but provide limited or costly management tools for smaller operators; and **property management systems** (Little Hotelier, Cloudbeds, NightsBridge) that serve operators well but are not public-facing search directories for new guests.

Ghana's own Ghana Tourism Marketplace addresses discovery nationally but does not provide structured reservation workflows, income/expense tracking, or occupancy reporting that smaller accommodation providers need.

FindStay targets the gap between these categories: a **single platform that combines guest-facing accommodation search, comparison, and reservation with owner-facing management tools** — availability calendars, booking management, income/expense tracking, and financial reports — built specifically for smaller accommodation providers in Takoradi/Ghana, and accessible without subscription fees or high commission rates in its academic prototype form.

### 7.3 Sources

| System | Source |
| --- | --- |
| Airbnb features and fees | https://zeevou.com/compare/airbnb-vs-booking-com/ |
| Booking.com commission rates | https://hotelrunner.com/en/?p=143922 |
| Hostelworld — 36,000 properties, 170 countries | https://hostelmanagement.com/travel-tips/best-booking-platforms-hostels |
| Hostelworld Inbox | https://www.revfine.com/?p=34861 |
| GTM overview | https://voyagesafriq.com/?p=33771 |
| Little Hotelier pricing/features | https://www.littlehotelier.com |
| NightsBridge (African-market PMS) | https://site.nightsbridge.com |
| OTA commission rates 15–25 % | https://hotelrunner.com/en/?p=143922 |

---

## ⚠️ Points to Verify or Remove Before Final Document

- All Eurostat figures are EU-only — do not generalise to Africa without qualification
- The Cenfri (2023) digital diagnostic is for Ghana nationally, not Takoradi specifically — note this when citing
- GSS domestic overnight visitor data (8.8 million, 2023) is from the Dec 2025 GSS report — confirm this report is publicly accessible and cite fully
- The 97 % self-arranged trips figure describes domestic tourism broadly; it does not prove there is no booking platform in Takoradi — frame carefully
- LI 2239 (2016) Accommodation Enterprises Regulation — referenced in GTIS launch article; could be cited as the legal/regulatory backdrop but should be read directly before citing in text
- Hostel occupancy figures (91–99 %) are national GSS data for Nov 2024–Feb 2025, not Takoradi-specific
- GTM owner-side feature details are not fully publicly documented — do not over-claim its capabilities
