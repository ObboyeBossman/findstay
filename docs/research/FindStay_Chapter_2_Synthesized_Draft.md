# FindStay - Chapter Two: Literature Review and Existing-System Analysis

**Project context:** Proposed web-based accommodation marketplace and property-management system  
**Geographical focus:** Ghana, with Takoradi as the proposed initial local context  
**Status:** Synthesized working draft - not yet inserted into the project PDF

## 2.1 Introduction

This chapter reviews concepts and existing systems relevant to the proposed development of FindStay. It examines online accommodation marketplaces, accommodation booking systems, property-management systems, online payments, access control, property verification, reviews, complaints, and operational reporting. It also compares selected marketplace and property-management systems in order to identify a practical basis for FindStay's requirements and positioning.

The review distinguishes between evidence that is available at national or international level and matters that still require local field validation. Ghana is used as the national context, while Takoradi is treated as the proposed initial context rather than as the source of unsupported local claims.

## 2.2 Conceptual Review

### 2.2.1 Online accommodation marketplaces

An online accommodation marketplace connects people seeking short- or medium-stay accommodation with property owners or managers. It provides a shared digital environment in which providers publish listings and guests search, compare, book, and review accommodation. Airbnb and Booking.com demonstrate the general marketplace model by combining guest discovery with provider participation and reservation workflows.[^1][^2]

For FindStay, the marketplace concept supports a central directory for hotels, hostels, guesthouses, and serviced apartments. It enables property providers to present accommodation information while allowing guests to compare location, price, facilities, availability, and booking conditions before making a decision.

### 2.2.2 Accommodation discovery and booking systems

Accommodation discovery and booking systems help guests identify suitable places to stay and complete reservations electronically. Core functions generally include date-based availability searches, filtering, property and unit information, price display, booking records, confirmation, modification, cancellation, and guest communication. Cloudbeds describes its booking engine as a process through which guests can check availability, compare rates, provide booking details, and complete reservations.[^3]

These concepts establish the essential guest journey for FindStay: discover a property, assess relevant details, select available dates and units, complete a booking and payment workflow, receive confirmation, and manage the resulting reservation.

### 2.2.3 Property-management systems

A Property Management System (PMS) supports the day-to-day operations of accommodation establishments. Typical functions include room or unit inventory, availability calendars, reservations, guest records, check-in/check-out operations, payment records, staff access, and management reporting. Products such as Little Hotelier and Cloudbeds illustrate how a PMS can consolidate booking and operating activities for accommodation providers.[^4][^5]

FindStay draws on selected PMS concepts for its owner-facing functions. Property owners and authorised staff will manage properties, accommodation units, prices, availability, reservations, payments, income, expenses, and operational reports through a dedicated dashboard.

### 2.2.4 Payments, access control, and trust

Online payment systems support the electronic collection, recording, and reconciliation of booking payments. They also create a transaction record that can support confirmations, cancellations, refunds, and dispute handling. In a Ghana-oriented deployment, the actual payment providers, payment methods, transaction charges, and approval requirements must be selected and validated during implementation.

Role-Based Access Control (RBAC) is relevant to FindStay because the platform has users with different responsibilities. NIST defines RBAC as an approach in which permitted actions on resources are associated with roles.[^6] FindStay will therefore use differentiated access for guests, property owners/managers and staff, and platform administrators. This is necessary to isolate one property's operational and financial information from another's and to limit administrative actions to authorised personnel.

Trust mechanisms are equally important. Airbnb documents identity-verification processes, while Ghana Tourism Authority describes a tourism-enterprise process involving registration, inspection and assessment, and licensing.[^7][^8] These sources do not prescribe FindStay's final verification policy; rather, they provide a basis for designing owner and property submission, review, approval, and moderation workflows.

### 2.2.5 Reviews, complaints, and operational reporting

Reviews and ratings enable guests who have completed stays to communicate their experience and help future guests assess listings. Complaints and dispute-handling processes provide a traceable route for resolving issues involving bookings, payments, cancellations, inaccurate listings, or service delivery. FindStay will restrict reviews to eligible completed stays and give administrators a documented moderation and dispute-management workflow.

Operational reporting turns booking and financial records into information that property managers can use. Relevant measures include reservations, occupancy, revenue, expenses, payments, cancellations, and outstanding balances. Cloudbeds documents reports across financial, revenue, occupancy, payment, and reservation information; LodgeStatus also publicly describes finance, operational, and insight functions for hotels.[^9][^10] These examples support the inclusion of reporting and expense management in FindStay's owner tools.

## 2.3 Review of Existing Accommodation Platforms

### 2.3.1 Airbnb

Airbnb illustrates a guest-to-host accommodation marketplace. Its public host resources describe tools for managing listings, calendars, pricing, reservations, guest communication, and payouts.[^1] It also documents identity verification and review-related trust mechanisms.[^7] Airbnb demonstrates how a marketplace can combine property discovery, booking, payment handling, communication, and host participation. The publicly reviewed materials do not establish a complete income-and-expense accounting function for every host, nor do they establish a Ghana-specific administrative verification process. These are areas FindStay is designed to address through owner financial tools and locally appropriate review procedures.

### 2.3.2 Booking.com

Booking.com is an online travel marketplace serving travellers and accommodation partners. Its partner documentation describes partner registration and property-management activities, while its payment documentation describes different payment arrangements, including Payments by Booking and Pay at Property.[^2][^11] The platform demonstrates broad accommodation discovery, reservation management, guest reviews, and distribution. However, the reviewed documentation does not establish a full, Ghana-focused owner income-and-expense ledger or a local platform-administration process of the kind proposed for FindStay.

### 2.3.3 Hostelworld

Hostelworld is relevant because FindStay includes hostels and budget accommodation. It demonstrates the value of a platform tailored to hostel discovery and property participation. Its public documentation and integration guidance show that booking-payment collection arrangements can vary between the platform and the accommodation property.[^12] The available reviewed sources do not establish a comprehensive income-and-expense management system for participating hostel owners. FindStay will apply accommodation-unit and booking concepts across hostels, guesthouses, hotels, and serviced apartments rather than serving only one property type.

### 2.3.4 Ghana Tourism Marketplace

The Ghana Tourism Marketplace (GTM) is relevant national context. The Ghana Tourism Development Company states that GTM, managed in collaboration with the Ghana Tourism Authority, aggregates tourism and hospitality vendors in Ghana on a unified platform for distributing their products and services.[^13] This establishes that FindStay is not the first digital initiative in Ghana's tourism space. However, the reviewed official GTM description does not provide sufficient detail to establish its full accommodation-booking, payment, owner-management, and financial-reporting capabilities. That evidence limitation should not be presented as proof that those functions are absent.

## 2.4 Review of Existing Property-Management Systems

### 2.4.1 LodgeStatus

LodgeStatus presents a broad hotel-management platform. Its public feature information covers property and room configuration, booking calendars, direct booking, walk-ins and reservations, check-in/check-out, payments and refunds, receipts, staff roles, guest information, maintenance, and revenue analytics.[^10] It demonstrates that a locally relevant hospitality system can bring operational and financial activities together. It is principally presented as a system for a hotel's own operations rather than a public multi-property accommodation marketplace with a platform-level verification process.

### 2.4.2 NightsBridge

NightsBridge provides accommodation technology for providers in African markets. Its public information describes front-desk booking, a booking engine, channel management, payment solutions, PMS integration, guest communication, and availability updates across connected channels.[^14] It demonstrates the value of centralised availability and direct booking for accommodation businesses. It is focused on helping an individual accommodation provider manage and distribute its own inventory rather than operating as a Ghana-focused consumer marketplace with a centralised property-verification workflow.

### 2.4.3 Little Hotelier and Cloudbeds

Little Hotelier targets small accommodation businesses, while Cloudbeds serves accommodation operators with property-management, booking-engine, and reporting capabilities.[^4][^5] Both show the importance of availability control, direct booking, booking records, operational reporting, and user permissions for accommodation providers. Their public product descriptions are useful design references for FindStay's owner-facing functions. They are not presented as a Ghana-specific public marketplace with the platform-level local administration proposed for FindStay.

## 2.5 Comparative Analysis

| System | Category | Guest discovery and booking | Owner-management emphasis | Documented strength | Relevance to FindStay |
| --- | --- | --- | --- | --- | --- |
| Airbnb | Accommodation marketplace | Listings, reservations, communication, reviews, and payments | Listings, calendar, pricing, reservations, and payouts | Integrated guest-host marketplace | Informs marketplace, trust, and host-management design; reviewed sources do not establish complete owner expense accounting or Ghana-specific administration. |
| Booking.com | Accommodation marketplace/OTA | Search, availability, reservations, reviews, and multiple payment arrangements | Partner property and reservation tools | Broad distribution and partner workflow | Informs accommodation search and payment design; locally focused financial management is not established in the reviewed documentation. |
| Hostelworld | Hostel-focused marketplace | Hostel discovery, reservations, and reviews | Property participation and booking arrangements | Hostel and budget-accommodation focus | Informs bed/unit booking considerations; reviewed sources do not establish full income-and-expense management. |
| Ghana Tourism Marketplace | Tourism and hospitality marketplace initiative | Tourism and hospitality service aggregation | Vendor participation | National tourism-sector orientation | Establishes relevant national context; detailed accommodation and PMS functions require further investigation. |
| LodgeStatus | Hotel PMS | Direct booking for a property's own operations | Rooms, bookings, finance, operations, staff, and analytics | Broad operational and financial feature set | Informs owner operations; does not itself establish a multi-property discovery marketplace. |
| NightsBridge | Accommodation management and distribution | Direct booking and connected channels | Booking, availability, payments, communications, and distribution | African accommodation-provider focus | Informs availability, direct-booking, and communication design; not a Ghana-focused central marketplace. |
| Little Hotelier / Cloudbeds | Hotel PMS | Direct booking engines | Reservations, availability, reports, and property operations | Mature PMS workflows | Informs owner dashboards and reporting; not a Ghana-specific shared marketplace. |

## 2.6 Identified Gap

The reviewed systems show that accommodation marketplaces and property-management systems serve complementary purposes. Marketplaces such as Airbnb, Booking.com, and Hostelworld emphasise public discovery, reservations, reviews, and provider participation. PMS products such as LodgeStatus, NightsBridge, Little Hotelier, and Cloudbeds emphasise operational management, availability, direct booking, payments, and reporting. GTM establishes a Ghanaian tourism-platform context, but the reviewed official description does not provide sufficient detail to assess the full set of accommodation-management functions it offers.

FindStay is proposed to combine relevant capabilities from these categories in one coordinated Ghana-oriented platform. Its intended contribution is not that every feature is new; rather, it is the coordinated provision of guest discovery, booking and payments, verified property participation, owner operational tools, income and expense management, post-stay feedback, and platform administration. The proposed design is particularly intended to support small and medium accommodation providers alongside guests seeking hotels, hostels, guesthouses, or serviced apartments.

## 2.7 Proposed System Positioning

FindStay is positioned as a two-sided accommodation marketplace with integrated property-management and administrative capabilities. A guest-facing marketplace enables users to discover properties, compare information, book, pay, communicate, and review eligible stays. An owner-facing management area enables providers to operate listings, units, availability, bookings, payments, income, expenses, and reports. An administrative area enables verification, moderation, complaints, disputes, and platform oversight.

This positioning differentiates FindStay from a standalone PMS, whose focus is typically one property's operation and distribution, and from a marketplace that focuses principally on discovery and reservations. The system is proposed for deployment in Ghana, with Takoradi as its initial local context. Its effectiveness and suitability must be assessed through implementation, testing, and feedback from intended users.

## 2.8 Areas Requiring Local Validation

The following must be investigated through questionnaires, interviews, observation, or consultation before they are presented as local findings:

- How guests in Takoradi currently discover and book accommodation.
- The booking, availability, and financial-recording methods used by local property managers.
- Preferred payment methods among guests and property providers.
- The documents and criteria appropriate for owner and property verification.
- Common causes of booking complaints, payment disputes, or inaccurate listing information.
- The affordability, training, connectivity, and support needs of smaller accommodation providers.

## 2.9 Chapter Summary

The literature review establishes that the core functions planned for FindStay are grounded in established marketplace and PMS practices. Existing systems provide useful patterns for discovery, bookings, availability, payments, communication, verification, reporting, and property operations. The findings support FindStay's proposed combination of a public accommodation marketplace, owner-management features, and administrative governance. They also identify the need for local field research before making claims about the practices or preferences of guests and providers in Takoradi.

## References

[^1]: Airbnb. (n.d.). *Exploring your hosting tools.* https://www.airbnb.com/resources/hosting-homes/a/exploring-your-hosting-tools-738  
[^2]: Booking.com. (n.d.). *List your apartment, hotel, holiday home or B&B on Booking.com.* https://join.booking.com/faq.html  
[^3]: Cloudbeds. (n.d.). *Cloudbeds Booking Engine overview and features.* https://myfrontdesk.cloudbeds.com/hc/en-us/articles/218512197-Cloudbeds-Booking-Engine-overview-and-features  
[^4]: Little Hotelier. (n.d.). *Small hotel management software.* https://www.littlehotelier.com/  
[^5]: Cloudbeds. (n.d.). *Property management system.* https://www.cloudbeds.com/property-management-system/  
[^6]: National Institute of Standards and Technology. (n.d.). *Role-based access control.* https://csrc.nist.gov/glossary/term/role_based_access_control  
[^7]: Airbnb. (n.d.). *Verifying your identity on Airbnb.* https://www.airbnb.com/help/article/1237  
[^8]: Ghana Tourism Authority. (n.d.). *Standards, classification and certification.* https://ghana.travel/standards-classification-and-certification/  
[^9]: Cloudbeds. (n.d.). *Cloudbeds Reports: Hotel reporting for operational, financial, revenue, occupancy analysis.* https://myfrontdesk.cloudbeds.com/hc/en-us/articles/41695559811611-Cloudbeds-Reports-Hotel-Reporting-for-Operational-Financial-Revenue-Occupancy-Analysis  
[^10]: LodgeStatus. (n.d.). *Every capability a hotel needs to run.* https://lodgestatus.com/features/  
[^11]: Booking.com. (n.d.). *Understanding the Payments API.* https://developers.booking.com/connectivity/docs/payments-api/understanding-the-payments-api  
[^12]: Cloudbeds. (n.d.). *Hostelworld FAQ.* https://myfrontdesk.cloudbeds.com/hc/en-us/articles/5908743117595-Hostelworld-FAQ  
[^13]: Ghana Tourism Development Company. (n.d.). *Ghana Tourism Marketplace - GTM.* https://gtdc.gov.gh/service/ghana-tourism-marketplace-gtm/  
[^14]: NightsBridge. (n.d.). *All-in-one property management solution.* https://site.nightsbridge.com/
