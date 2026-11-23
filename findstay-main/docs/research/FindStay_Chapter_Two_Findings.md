# FindStay --- Chapter Two Findings

## Literature Review and Existing-System Analysis

**Project:** FindStay --- Proposed Web-Based Accommodation Marketplace
and Property-Management System\
**Proposed initial context:** Takoradi, Ghana\
**Status:** Proposed system; not yet deployed

> **Research note:** This document is a research draft based on publicly
> available sources. FindStay must not be described as an existing,
> deployed, or proven system. Takoradi-specific claims require local
> field research. Where a feature could not be established from the
> reviewed official documentation, it is marked "not publicly
> confirmed"; this does not prove that the feature is absent.

------------------------------------------------------------------------

## 2.1 Introduction

This chapter reviews concepts, technologies, and existing systems
relevant to the proposed development of FindStay. It establishes the
conceptual foundations of the project, examines selected accommodation
marketplaces and property-management systems, and identifies
opportunities for adapting their capabilities to the Ghanaian
accommodation sector.

The review covers online accommodation marketplaces, reservation
systems, property management, electronic payments, access control,
verification, customer reviews, complaint handling, and financial
reporting. It considers Airbnb, Booking.com, Hostelworld, the Ghana
Tourism Marketplace, LodgeStatus, NightsBridge, Little Hotelier, and
Cloudbeds.

The findings will inform FindStay's requirements, architecture, and
design. Since FindStay is proposed, its suitability and effectiveness
must be assessed through implementation, testing, and feedback from
intended users.

## 2.2 Conceptual Review

### 2.2.1 Online accommodation marketplace

An online accommodation marketplace connects people seeking temporary
accommodation with property owners or managers offering rooms and
facilities. It provides an online environment in which providers can
publish property information while guests search, compare, and reserve
accommodation.

Airbnb and Booking.com demonstrate this marketplace model by connecting
accommodation suppliers with prospective guests
([Airbnb](https://www.airbnb.com/);
[Booking.com](https://www.booking.com/)).

For FindStay, this concept provides the foundation for connecting guests
with hotels, hostels, guesthouses, and serviced apartments. Property
providers will be able to publish accommodation information, while
guests will be able to compare prices, facilities, locations, and
availability.

### 2.2.2 Accommodation discovery and booking systems

Accommodation discovery and booking systems help users identify suitable
accommodation and complete reservations electronically. Typical
functions include searching by location, specifying check-in and
check-out dates, filtering available properties, viewing accommodation
details, and submitting reservations.

A booking process should communicate availability, pricing, reservation
status, and cancellation conditions clearly. Cloudbeds' booking-engine
documentation describes a workflow for checking availability, comparing
accommodation and rates, entering booking details, and completing
reservations ([Cloudbeds Booking Engine
documentation](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/218512197-Cloudbeds-Booking-Engine-overview-and-features)).

FindStay is intended to provide searchable listings, filtering, booking
management, reservation notifications, and digital booking records.

### 2.2.3 Property Management Systems (PMS)

A Property Management System is software designed to support the
administrative and operational activities of accommodation
establishments. Typical functions include room inventory, reservation
calendars, guest records, check-in and check-out, housekeeping
coordination, payment records, and management reporting.

Cloudbeds and Little Hotelier illustrate how PMS products consolidate
accommodation operations. Little Hotelier, for example, advertises
reservation calendars, front-desk tools, booking engines, channel
management, and operational reporting ([Little
Hotelier](https://www.littlehotelier.com/)).

FindStay is intended to incorporate selected PMS capabilities into a
property-owner dashboard. Owners and managers will be able to manage
accommodation units, availability, prices, bookings, guest records, and
financial information.

### 2.2.4 Online payment systems in accommodation booking

Online payment systems facilitate electronic transactions between
customers, businesses, financial institutions, and payment service
providers. In accommodation booking, they can support reservation
payments, payment confirmation, refunds, and transaction records.

Ghana's digital-payment environment provides relevant national context.
The National Development Planning Commission's 2024 National Annual
Progress Report reported approximately 73 million registered
mobile-money accounts and 23.5 million active accounts in 2024. These
figures refer to accounts, not unique individuals ([NDPC, 2024
report](https://ndpc.gov.gh/media/30_june_2024_National_APR.pdf)).

This supports investigating mobile-money-compatible payment arrangements
for a Ghana-oriented booking platform. FindStay is intended to support
appropriate electronic payment options, subject to payment-provider
integration, availability, and operational requirements.

### 2.2.5 Role-based access control

Role-Based Access Control (RBAC) is an access-management approach in
which permissions are assigned according to users' organisational roles.
NIST describes RBAC as a model in which permitted actions on resources
are associated with roles ([NIST RBAC
glossary](https://csrc.nist.gov/glossary/term/role_based_access_control)).

RBAC is relevant because FindStay's guests, property owners or managers,
and administrators have different responsibilities. Guests will manage
their accounts and reservations; property managers will administer their
own properties and bookings; administrators will oversee verification,
user management, complaints, and platform activities.

### 2.2.6 Listing and property verification

Property verification involves examining submitted information and
supporting evidence to establish whether an accommodation listing or its
operator satisfies specified requirements.

Verification is an important trust mechanism because guests make booking
decisions based on information supplied by providers. Airbnb documents
identity verification for hosts and guests, while Booking.com provides
partner guidance on property verification ([Airbnb identity
verification](https://www.airbnb.com/help/article/1237); [Booking.com
partner information](https://join.booking.com/faq.html)).

In Ghana, the Ghana Tourism Authority describes registration,
inspection, assessment, and licensing processes for tourism enterprises
([GTA standards, classification and
certification](https://ghana.travel/standards-classification-and-certification/);
[Tourism Regulations, 2019, L.I.
2389](https://ghana.travel/wp-content/uploads/2023/03/GTA-TRAVEL-LI-2389.pdf)).

FindStay is intended to include an administrative verification process
for owners and properties. The exact documents, approval criteria, and
relationship with official licensing requirements must be established
with the relevant Ghanaian authorities.

### 2.2.7 Ratings, reviews, complaints, and dispute handling

Ratings and reviews allow customers to communicate their experiences
with a service. In accommodation marketplaces, they can help prospective
guests evaluate property quality, cleanliness, service, and other
aspects of a stay.

Booking.com documents a guest-review process, while Airbnb also provides
review features ([Booking.com](https://www.booking.com/);
[Airbnb](https://www.airbnb.com/)). Complaints and dispute-handling
mechanisms provide structured channels for reporting problems involving
reservations, payments, cancellations, property descriptions, or service
delivery.

FindStay is intended to provide reviews for eligible completed stays,
complaint submission, and administrative dispute-management functions.

### 2.2.8 Occupancy, revenue, expense, and reporting management

Occupancy management involves monitoring how much of a property's
available accommodation capacity is occupied over a specified period.
Revenue management concerns income generated from bookings and other
services, while expense management involves recording and monitoring
operational costs.

Reporting systems turn operational and financial records into summaries
for management decisions. Relevant reports may include booking
histories, occupancy rates, revenue summaries, expenses, outstanding
payments, and cancellations.

Cloudbeds documents reporting capabilities covering financial, revenue,
occupancy, payment, and reservation information ([Cloudbeds reporting
documentation](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/41695559811611-Cloudbeds-Reports-Hotel-Reporting-for-Operational-Financial-Revenue-Occupancy-Analysis)).
LodgeStatus also advertises financial and operational functions
([LodgeStatus features](https://lodgestatus.com/features/)).

FindStay is intended to provide basic reporting tools to help property
owners monitor bookings, income, expenses, and accommodation
performance.

## 2.3 Review of Existing Accommodation Platforms

### 2.3.1 Airbnb

**Primary users:** Guests, hosts, co-hosts, and platform administrators.

**Guest-facing features:** Search, property descriptions and
photographs, prices, availability, reservations, host communication,
account management, cancellations, and reviews.

**Owner-management features:** Hosts can create listings and manage
photographs, prices, availability, reservation information, and guest
communication through hosting tools ([Airbnb hosting
tools](https://www.airbnb.com/resources/hosting-homes/a/exploring-your-hosting-tools-738)).

**Payment and booking:** Airbnb supports electronic booking payments and
host payouts. Available payout methods depend on the host's location and
account configuration ([Airbnb host
payouts](https://www.airbnb.com/resources/hosting-homes/a/how-youll-get-paid-for-hosting-20)).

**Strengths:** - Established guest-to-host marketplace model. -
Integrated reservation and communication functions. -
Identity-verification and review mechanisms. - Host tools for listings
and reservations.

**Limitations relevant to FindStay:** Airbnb's marketplace is
internationally oriented. The reviewed public hosting documentation does
not establish that it provides every accounting and expense-management
function proposed for FindStay. Its suitability for smaller Ghanaian
providers and locally specific verification requirements requires field
research.

Official website: <https://www.airbnb.com/>

### 2.3.2 Booking.com

**Primary users:** Travellers, accommodation partners, property
managers, and platform administrators.

**Guest-facing features:** Accommodation search, property information,
photographs, pricing, availability, reservations, and reviews.

**Owner-management features:** Accommodation partners use the Extranet
to manage property information, reservations, and related operational
details. Booking.com provides partner tools and property-verification
procedures ([Booking.com partner
FAQ](https://join.booking.com/faq.html)).

**Payment and booking:** Booking.com documents different payment
arrangements, including Payments by Booking and Pay at Property
([Booking.com Payments API
documentation](https://developers.booking.com/connectivity/docs/payments-api/understanding-the-payments-api)).

**Strengths:** - Broad accommodation discovery and distribution. -
Reservation-management tools for accommodation providers. - Multiple
documented payment arrangements. - Guest-review and
property-verification mechanisms.

**Limitations relevant to FindStay:** Booking.com primarily operates as
a marketplace and distribution intermediary. Its partner tools are
designed around participation in its marketplace. The reviewed public
documentation does not establish a complete, locally tailored
income-and-expense management solution for small Ghanaian properties.

Official website: <https://www.booking.com/>

### 2.3.3 Hostelworld

**Primary users:** Budget travellers, hostel operators, property
managers, and affiliate partners.

**Guest-facing features:** Hostel discovery, accommodation information,
reservation options, reviews, and travel-related features.

**Owner-management features:** Hostelworld provides property-manager
registration and tools for accommodation providers. The exact scope of
every management function is not fully established by the public
documentation.

**Payment and booking:** Its distribution arrangements include Channel
Collect, where Hostelworld collects payment, and Hotel Collect, where
the property collects payment. These arrangements are described in
Cloudbeds' Hostelworld integration guidance ([Cloudbeds Hostelworld
FAQ](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/5908743117595-Hostelworld-FAQ)).

**Strengths:** - Focused accommodation discovery for hostel users. -
Property-manager participation. - Established booking and payment
arrangements. - Review and travel-community features.

**Limitations relevant to FindStay:** Its positioning is particularly
relevant to hostels and budget accommodation. The reviewed documentation
does not confirm a comprehensive owner-side income-and-expense
management system comparable to FindStay's proposed scope.

Official website: <https://www.hostelworld.com/>

### 2.3.4 Ghana Tourism Marketplace (GTM)

The Ghana Tourism Marketplace is a tourism-sector initiative associated
with the Ghana Tourism Development Company (GTDC) and Ghana Tourism
Authority. GTDC describes the marketplace as an initiative intended to
aggregate tourism and hospitality vendors in Ghana and provide a
platform for distributing their products and services ([GTDC Ghana
Tourism
Marketplace](https://gtdc.gov.gh/service/ghana-tourism-marketplace-gtm/)).

**Primary users:** Tourism and hospitality vendors and consumers seeking
tourism-related products and services.

**Guest-facing features:** The official description establishes the
intended aggregation of tourism and hospitality services. The complete
operational booking, payment, and accommodation-search functionality
could not be independently confirmed from the reviewed documentation.

**Owner-management features:** Vendor participation and aggregation are
documented objectives. Detailed property-management functions, including
room-level availability, expense tracking, and financial reporting, are
not publicly confirmed.

**Payment and booking:** The precise accommodation reservation and
payment workflow was not sufficiently documented in the reviewed source.

**Strengths:** - Ghanaian tourism-sector orientation. - Institutional
involvement through GTDC and GTA. - Intended aggregation of tourism and
hospitality providers. - Relevance to the national tourism ecosystem.

**Limitations relevant to FindStay:** The available official description
does not provide enough detail to establish whether the marketplace
offers the complete accommodation reservation and property-management
functions proposed for FindStay. This is an evidence limitation, not
proof that such functions do not exist.

## 2.4 Review of Existing Property-Management Systems

### 2.4.1 LodgeStatus

**Primary users:** Hotel owners, managers, receptionists, front-desk
personnel, and hospitality staff.

**Reservation and availability management:** LodgeStatus advertises room
and property configuration, reservation calendars, walk-in bookings,
online booking engines, channel management, and check-in/check-out
management.

**Financial and reporting features:** Advertised capabilities include
invoicing, receipts, payment processing, refunds, payouts, sales
ledgers, and revenue analytics.

**Payment and operational features:** The platform advertises payment
and refund management, point-of-sale functionality, housekeeping,
maintenance, guest communication, and staff permissions ([LodgeStatus
features](https://lodgestatus.com/features/)).

**Strengths:** - Combines several hotel-management functions. - Provides
booking and financial-management tools. - Supports housekeeping and
other operational activities. - Includes staff roles and permissions.

**Limitations relevant to FindStay:** LodgeStatus is primarily
positioned as a hotel-operational platform rather than a broad
guest-facing accommodation marketplace. Its public descriptions do not
establish the extent of Ghana-specific verification and local
administrative arrangements.

Official website: <https://lodgestatus.com/>

### 2.4.2 NightsBridge

**Primary users:** Independent accommodation providers, hotel owners,
property managers, and reception staff.

**Reservation and availability management:** NightsBridge provides a
front-desk booking system, online booking engine, and channel-management
tools. Its channel manager is intended to synchronise room rates and
availability across connected booking platforms.

**Financial and reporting features:** Payment solutions are advertised.
However, the full scope of income-and-expense accounting and reporting
capabilities is not established by the general product overview.

**Payment and operational features:** Its offering includes payment
solutions, guest communications, reservation notifications, and
integrations with other PMS products.

**Strengths:** - Designed for accommodation providers operating in
African markets. - Integrates direct bookings with external distribution
channels. - Provides centralised availability and rate management. -
Offers training and support.

**Limitations relevant to FindStay:** NightsBridge primarily provides
operational and distribution technology. Its public documentation does
not establish that it provides FindStay's intended Ghana-focused,
multi-property consumer marketplace and local verification
administration as one integrated service.

Official website: <https://site.nightsbridge.com/>

### 2.4.3 Little Hotelier

**Primary users:** Small hotels, guesthouses, bed-and-breakfast
establishments, and accommodation managers.

**Reservation and availability management:** Little Hotelier advertises
a reservation calendar, front-desk management, direct booking engine,
and channel manager. Property managers can update rates and availability
across connected booking channels.

**Financial and reporting features:** Its advertised functions include
invoicing and transactional and operational reports, including booking
and housekeeping reports.

**Payment and operational features:** The platform provides guest
communication, reservation management, invoicing, and an optional
payment solution subject to eligibility and configuration.

**Strengths:** - Targets smaller accommodation businesses. - Combines
reservations and channel management. - Provides reporting and
invoicing. - Offers mobile access and guest communication tools.

**Limitations relevant to FindStay:** Its principal purpose is helping
individual accommodation businesses manage operations and distribution.
It is not presented as a Ghana-specific marketplace with centralised
local property verification and administration. Payment availability and
commercial suitability in Ghana require confirmation.

Official website: <https://www.littlehotelier.com/>

### 2.4.4 Cloudbeds

**Primary users:** Hotels, hostels, independent accommodation providers,
and multi-property operators.

**Reservation and availability management:** Cloudbeds provides
reservation calendars, booking management, direct booking engines, and
channel-management tools.

**Financial and reporting features:** Cloudbeds documents financial,
occupancy, revenue, payment, and reservation reporting ([Cloudbeds
reporting
documentation](https://myfrontdesk.cloudbeds.com/hc/en-us/articles/41695559811611-Cloudbeds-Reports-Hotel-Reporting-for-Operational-Financial-Revenue-Occupancy-Analysis)).

**Payment and operational features:** Its platform supports payment
processing, reservation-linked transactions, guest management,
housekeeping, and check-in/check-out operations.

**Strengths:** - Broad integration of hospitality-management
functions. - Supports multiple accommodation distribution channels. -
Provides financial and occupancy reporting. - Supports operational
management and configurable user roles.

**Limitations relevant to FindStay:** Cloudbeds is primarily a
hospitality-management technology solution for accommodation operators.
Its capabilities do not by themselves establish the availability of a
Ghana-oriented public marketplace and local administrative verification
model matching FindStay's proposed scope. Payment-provider availability
and pricing for Ghanaian users require investigation.

Official website: <https://www.cloudbeds.com/>

## 2.5 Comparative Analysis

The table summarises the reviewed systems according to their publicly
documented capabilities. "Not publicly confirmed" means the reviewed
sources did not provide sufficient evidence to establish the feature; it
does not mean the feature is necessarily absent.

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  System name    System category   Target users    Guest               Owner-management   Payment         Verification/trust     Key strength             Limitation/gap       Official source
                                                   discovery/booking   features           features        features                                        relevant to FindStay 
                                                   features                                                                                                                    
  -------------- ----------------- --------------- ------------------- ------------------ --------------- ---------------------- ------------------------ -------------------- --------------------------------------------------------------------
  Airbnb         Accommodation     Guests and      Search, listings,   Listings,          Online payments Identity verification  Integrated guest-host    Ghana-specific       [Airbnb](https://www.airbnb.com/)
                 marketplace       hosts           reservations,       calendar, pricing, and host        and reviews            marketplace              administrative       
                                                   reviews             reservations,      payouts                                                         verification and     
                                                                       guest                                                                              complete owner       
                                                                       communication                                                                      accounting are not   
                                                                                                                                                          established          

  Booking.com    Accommodation     Travellers and  Search,             Extranet, property Payments by     Property and review    Broad accommodation      Complete locally     [Booking.com](https://www.booking.com/)
                 marketplace/OTA   accommodation   availability,       information,       Booking and Pay verification           distribution             tailored financial   
                                   partners        reservations,       reservation        at Property                                                     and administrative   
                                                   reviews             management                                                                         management is not    
                                                                                                                                                          established          

  Hostelworld    Hostel-focused    Budget          Hostel discovery,   Property-manager   Channel Collect Reviews and            Hostel-focused           Full                 [Hostelworld](https://www.hostelworld.com/)
                 marketplace       travellers and  reservations,       account and        and Hotel       booking-related        accommodation discovery  income-and-expense   
                                   hostel          reviews             listing management Collect         controls                                        management is not    
                                   operators                                                                                                              confirmed            

  Ghana Tourism  Tourism           Tourism vendors Tourism and         Vendor             Detailed        Institutional          Ghanaian tourism-sector  Complete operational [GTDC](https://gtdc.gov.gh/service/ghana-tourism-marketplace-gtm/)
  Marketplace    marketplace       and consumers   hospitality service aggregation;       accommodation   involvement; detailed  orientation              capabilities require 
                 initiative                        aggregation;        detailed PMS       payment process listing-verification                            further              
                                                   detailed booking    features not       not publicly    workflow not confirmed                          investigation        
                                                   functionality not   confirmed          confirmed                                                                            
                                                   publicly confirmed                                                                                                          

  LodgeStatus    Hotel PMS         Hotel owners    Direct booking      Reservations,      Payments,       Staff roles and        Broad hotel-operational  Consumer marketplace [LodgeStatus](https://lodgestatus.com/features/)
                                   and staff       website and booking rooms, finance,    refunds,        permissions advertised functions                and Ghana-specific   
                                                   engine              housekeeping,      invoices,                                                       verification not     
                                                                       reporting          payouts                                                         established          

  NightsBridge   Accommodation     African         Direct booking      Front desk,        Payment         Not publicly confirmed African accommodation    Integrated           [NightsBridge](https://site.nightsbridge.com/)
                 management and    accommodation   engine and          channel and        solutions       in reviewed overview   distribution and         Ghana-focused        
                 distribution      providers       connected booking   availability                                              integration              consumer marketplace 
                                                   channels            management                                                                         and local            
                                                                                                                                                          verification not     
                                                                                                                                                          established          

  Little         Small-property    Small           Direct booking      Calendar,          Optional        Not publicly confirmed Tools designed for       Ghana-specific       [Little Hotelier](https://www.littlehotelier.com/)
  Hotelier       PMS               accommodation   engine              reservations,      payment         in reviewed overview   smaller accommodation    marketplace and      
                                   operators                           channels,          solution                               providers                local administrative 
                                                                       operational                                                                        verification not     
                                                                       reports                                                                            established          

  Cloudbeds      Integrated        Hotels,         Direct booking      Reservations,      Integrated      User roles and         Extensive integrated     Local marketplace    [Cloudbeds](https://www.cloudbeds.com/)
                 hospitality PMS   hostels,        engine and          availability,      payment         permissions; property  hospitality-management   and Ghana-specific   
                                   property        connected           housekeeping,      capabilities    verification not       capabilities             verification model   
                                   operators       distribution        reporting,                         established in                                  not established      
                                                   channels            property                           reviewed overview                                                    
                                                                       operations                                                                                              
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 2.6 Identified Gap

The comparative analysis shows that existing accommodation marketplaces
and property-management systems provide several capabilities relevant to
FindStay.

Airbnb, Booking.com, and Hostelworld demonstrate how guests can discover
accommodation, examine property information, make reservations, and
access customer reviews. They also provide property owners with tools
for managing listings and reservations.

LodgeStatus, NightsBridge, Little Hotelier, and Cloudbeds demonstrate
how accommodation businesses can manage room availability, bookings,
payments, operational activities, and financial reports.

The Ghana Tourism Marketplace provides a national reference because its
stated objective is to aggregate tourism and hospitality vendors within
Ghana. However, the available official documentation does not establish
the full extent of its accommodation-management and financial-reporting
capabilities.

Based on these observations, FindStay is proposed as an integrated
platform that combines relevant marketplace and property-management
capabilities while adapting them to its intended Ghanaian operating
context.

The practical opportunity addressed by FindStay is to provide the
following functions within one coordinated platform:

1.  **Centralised accommodation discovery and booking:** Guests will be
    able to discover hotels, hostels, guesthouses, and serviced
    apartments, compare available options, and make reservations.
2.  **Integrated property-owner management:** Owners and managers will
    have tools for managing properties, rooms, availability, prices,
    photographs, amenities, reservations, and guest communication.
3.  **Ghana-oriented property verification:** The platform will provide
    an administrative process for verifying owners and accommodation
    listings, taking relevant Ghana Tourism Authority requirements into
    consideration.
4.  **Integrated financial management:** Property managers will be able
    to monitor booking payments, record income and expenses, and
    generate financial summaries.
5.  **Administrative oversight:** Platform administrators will manage
    users, property approvals, complaints, reviews, disputes, and
    platform records.
6.  **Support for smaller accommodation providers:** The proposed
    platform will consider the operational requirements of smaller
    hotels, guesthouses, hostels, and serviced apartments.

FindStay does not claim to create an entirely new category of
accommodation technology. Rather, it seeks to combine established
marketplace and property-management concepts into a coordinated solution
suited to its intended users and geographical context.

## 2.7 Proposed System Positioning

FindStay is positioned as a web-based accommodation marketplace with
integrated property-management and administrative capabilities.

Unlike a conventional accommodation marketplace, whose primary emphasis
is connecting guests with accommodation providers, FindStay will also
provide property owners and managers with tools for managing daily
accommodation operations and financial records.

Similarly, unlike a conventional standalone PMS, FindStay will
incorporate a public-facing accommodation discovery and booking
environment through which guests can search for properties, make
reservations, and communicate with property managers.

The proposed system will serve three principal user groups: guests,
property owners or managers, and platform administrators. Each group
will access functions appropriate to its responsibilities through
role-based access control.

The initial implementation will focus on Takoradi, Ghana, while the
proposed architecture and system design will consider possible extension
to other parts of the country.

FindStay will therefore combine accommodation discovery, reservation
management, property administration, payment processing, financial
reporting, and local verification within one web-based platform. Its
suitability and effectiveness will be assessed through implementation,
testing, and feedback from intended users.

## 2.8 Claims Requiring Local Validation

The following matters cannot be established adequately through the
reviewed online documentation. They should be investigated through
interviews, questionnaires, and discussions with accommodation
providers, guests, and relevant institutions in Takoradi.

  -----------------------------------------------------------------------
  Area requiring          Questions to            Suggested method
  investigation           investigate             
  ----------------------- ----------------------- -----------------------
  Accommodation discovery How do guests currently Guest questionnaires
                          find and compare        
                          accommodation in        
                          Takoradi?               

  Booking practices       Do properties accept    Owner interviews
                          online, telephone,      
                          WhatsApp, walk-in, or   
                          other reservations?     

  Property management     How are room            Owner interviews and
                          availability, bookings, observation
                          and guest records       
                          currently managed?      

  Financial               How do owners record    Owner interviews
  administration          income, expenses, and   
                          payments?               

  Digital payments        Which payment methods   Guest and owner
                          do guests and property  questionnaires
                          owners prefer?          

  Verification            What documents and      GTA and relevant
                          procedures are          authority consultation
                          appropriate for         
                          verifying owners and    
                          facilities?             

  Reviews and trust       What concerns do guests Guest questionnaires
                          have when choosing      
                          unfamiliar              
                          accommodation?          

  Complaints              What                    Guest and owner
                          accommodation-related   interviews
                          complaints are commonly 
                          encountered?            

  Affordability           What technology costs   Owner interviews
                          would smaller           
                          accommodation providers 
                          consider affordable?    

  Internet accessibility  What connectivity       Field observation and
                          challenges affect       interviews
                          providers and           
                          customers?              
  -----------------------------------------------------------------------

These questions should not be presented as established findings. Their
answers should only be included in the final report after fieldwork has
been conducted and analysed.

The local investigation should also establish whether accommodation
providers already use existing digital marketplaces or PMS products and
identify practical challenges associated with those arrangements.

## 2.9 Summary of Literature Review and Existing-System Analysis

The review establishes that online accommodation marketplaces and
property-management systems provide complementary capabilities within
the hospitality industry.

Airbnb, Booking.com, and Hostelworld demonstrate the use of online
marketplaces for accommodation discovery, reservations, reviews, and
property-provider participation. LodgeStatus, NightsBridge, Little
Hotelier, and Cloudbeds demonstrate the use of digital systems for
managing reservations, availability, payments, and accommodation
operations.

The Ghana Tourism Marketplace provides a relevant national reference for
the aggregation of tourism and hospitality services. Ghana Tourism
Authority licensing information also provides an institutional basis for
considering property verification in the proposed system.

The review provides a foundation for designing FindStay as a combined
accommodation marketplace and property-management platform. The
identified requirements will guide the next stage of the project,
particularly system requirements analysis, architectural design,
database design, and implementation planning.

------------------------------------------------------------------------

# Research Quality Assessment

## A. Strong verified evidence

The following findings have support in official or institutional
documentation and are suitable for cautious academic use:

  -----------------------------------------------------------------------
  Finding                 Source                  Relevance
  ----------------------- ----------------------- -----------------------
  Airbnb supports         Airbnb                  Trust and verification
  identity verification                           concepts
  for hosts and guests.                           

  Booking.com documents   Booking.com             Booking and payment
  partner payment                                 models
  arrangements and                                
  property-partner                                
  processes.                                      

  Hostelworld supports    Hostelworld / Cloudbeds Hostel-oriented
  different payment       integration             marketplace comparison
  collection              documentation           
  arrangements.                                   

  Ghana has a             Ghana Tourism Authority Local verification
  tourism-enterprise                              requirements
  registration and                                
  licensing framework.                            

  Ghana Tourism           GTDC                    National industry
  Marketplace is intended                         context
  to aggregate tourism                            
  and hospitality                                 
  vendors.                                        

  NightsBridge provides   NightsBridge            African industry
  accommodation                                   relevance
  technology for African                          
  providers.                                      

  Little Hotelier targets Little Hotelier         Small-provider design
  smaller accommodation                           considerations
  businesses.                                     

  Cloudbeds provides      Cloudbeds               PMS reporting
  operational, financial,                         capabilities
  and occupancy                                   
  reporting.                                      

  Ghana recorded          NDPC, 2024              National
  approximately 73                                digital-payment context
  million registered and                          
  23.5 million active                             
  mobile-money accounts                           
  in 2024, according to                           
  the cited national                              
  report.                                         

  RBAC is an established  NIST                    Access-control design
  access-control model.                           
  -----------------------------------------------------------------------

## B. Claims that should be removed or softened

  -----------------------------------------------------------------------
  Avoid claiming                      Better academic wording
  ----------------------------------- -----------------------------------
  FindStay is Ghana's first           FindStay is a proposed
  accommodation marketplace.          accommodation marketplace designed
                                      for the Ghanaian context.

  No existing system combines         Existing products provide different
  bookings and property management.   combinations of marketplace and
                                      property-management capabilities.

  Small accommodation providers in    The accessibility and adoption of
  Takoradi cannot access digital      digital management tools among
  management tools.                   smaller Takoradi accommodation
                                      providers require investigation.

  Airbnb does not support financial   The reviewed Airbnb documentation
  reporting.                          does not establish a complete
                                      property income-and-expense
                                      accounting solution.

  The Ghana Tourism Marketplace has   The reviewed GTDC documentation
  no booking functionality.           does not sufficiently establish its
                                      complete accommodation booking
                                      workflow.

  All Ghanaian guests prefer mobile   Ghana's digital-payment environment
  money.                              makes mobile-money integration
                                      worth investigating.

  Existing platforms are too          The affordability of existing
  expensive for local property        platforms among local property
  owners.                             owners requires field validation.

  FindStay will eliminate             FindStay will introduce
  accommodation fraud.                verification and moderation
                                      mechanisms intended to strengthen
                                      trust.
  -----------------------------------------------------------------------

## C. Recommended facts to use in the final document

1.  **Marketplaces and PMS products serve complementary purposes.**
    Airbnb and Booking.com demonstrate accommodation discovery and
    booking, while Cloudbeds, Little Hotelier, and NightsBridge
    demonstrate operational property-management capabilities.
2.  **Ghana already has a tourism-sector digital marketplace
    initiative.** The Ghana Tourism Marketplace should be acknowledged
    when positioning FindStay.
3.  **Property verification has an institutional basis in Ghana.** Ghana
    Tourism Authority registration, inspection, and licensing processes
    provide a reference for developing FindStay's verification
    requirements.
4.  **Digital payments are relevant to Ghana.** The 2024 national
    mobile-money indicators support investigating appropriate
    digital-payment integration.
5.  **The proposed system combines complementary capabilities.**
    FindStay's intended contribution is its combination of guest
    discovery, booking, owner management, financial tracking, and local
    administrative oversight.

## D. Recommendations before submission

1.  **Conduct local field research.** Interview accommodation owners and
    managers in Takoradi about how they currently manage bookings, room
    availability, payments, income, and expenses.
2.  **Investigate the Ghana Tourism Marketplace further.** Establish its
    current operational capabilities before making claims about its
    limitations.
3.  **Distinguish proposed features from implemented features.** Use
    expressions such as "the proposed system will provide," "FindStay is
    intended to support," and "the system is designed to incorporate."
    Do not write as though the system has already been deployed or its
    benefits measured.
4.  **Verify references before final submission.** Confirm that each
    source URL remains accessible, that its content supports the
    associated claim, and that publication dates and titles are correct.

------------------------------------------------------------------------

# References

*APA 7th edition-style reference list. Where a page has no clearly
stated publication date, "n.d." (no date) is used. Verify page titles,
dates, and source availability before final submission.*

Airbnb. (n.d.-a). *Verifying your identity on Airbnb*. Airbnb Help
Centre. https://www.airbnb.com/help/article/1237

Airbnb. (n.d.-b). *Booking requirements for reservations*. Airbnb Help
Centre. https://www.airbnb.com/help/article/1170

Airbnb. (2025, December 10). *Exploring your hosting tools*. Airbnb
Resource Center.
https://www.airbnb.com/resources/hosting-homes/a/exploring-your-hosting-tools-738

Airbnb. (2026). *How you'll get paid for hosting*. Airbnb Resource
Center.
https://www.airbnb.com/resources/hosting-homes/a/how-youll-get-paid-for-hosting-20

Booking.com. (n.d.-a). *List your apartment, hotel, holiday home or B&B
on Booking.com*. https://join.booking.com/faq.html

Booking.com. (n.d.-b). *Understanding the Payments API*. Booking.com
Connectivity Documentation.
https://developers.booking.com/connectivity/docs/payments-api/understanding-the-payments-api

Cloudbeds. (n.d.-a). *Property management system*.
https://www.cloudbeds.com/property-management-system/

Cloudbeds. (n.d.-b). *Hostelworld FAQ*. Cloudbeds Help Centre.
https://myfrontdesk.cloudbeds.com/hc/en-us/articles/5908743117595-Hostelworld-FAQ

Cloudbeds. (2026a, September 15). *Cloudbeds Booking Engine overview and
features*. Cloudbeds Help Centre.
https://myfrontdesk.cloudbeds.com/hc/en-us/articles/218512197-Cloudbeds-Booking-Engine-overview-and-features

Cloudbeds. (2026b, July 6). *Cloudbeds reports: Hotel reporting for
operational, financial, revenue and occupancy analysis*. Cloudbeds Help
Centre.
https://myfrontdesk.cloudbeds.com/hc/en-us/articles/41695559811611-Cloudbeds-Reports-Hotel-Reporting-for-Operational-Financial-Revenue-Occupancy-Analysis

Ghana Tourism Authority. (n.d.). *Standards, classification and
certification*.
https://ghana.travel/standards-classification-and-certification/

Ghana Tourism Authority. (2019). *Tourism (Travel Trade Enterprise
Registration and Licensing) Regulations, 2019 (L.I. 2389).*
https://ghana.travel/wp-content/uploads/2023/03/GTA-TRAVEL-TRADE-LI-2389.pdf

Ghana Tourism Development Company. (n.d.). *Ghana Tourism Marketplace
(GTM).* https://gtdc.gov.gh/service/ghana-tourism-marketplace-gtm/

LodgeStatus. (n.d.). *Hotel features: PMS, free website, QR ordering,
Smart TV and POS*. https://lodgestatus.com/features/

Little Hotelier. (n.d.). *The easy all-in-one software for small
properties*. https://www.littlehotelier.com/

National Development Planning Commission. (2024). *2024 National Annual
Progress Report*.
https://ndpc.gov.gh/media/30_june_2024_National_APR.pdf

National Institute of Standards and Technology. (n.d.). *Role-based
access control (RBAC)*. Computer Security Resource Center.
https://csrc.nist.gov/glossary/term/role_based_access_control

NightsBridge. (n.d.). *Accommodation technology solutions*.
https://site.nightsbridge.com/

NightsBridge. (n.d.). *Channel management*.
https://site.nightsbridge.com/features/channel-management/
