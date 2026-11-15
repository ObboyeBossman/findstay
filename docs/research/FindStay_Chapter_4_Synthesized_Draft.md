# FindStay - Chapter Four: System Design (Streamlined Plain-English Edition)

**Project context:** Web-based accommodation marketplace and property-management platform for Ghana (Takoradi focus)  
**Academic context:** Advanced Java Programming capstone project  
**Status:** Approved system design baseline explained in accessible, plain English  

---

## 4.1 Introduction

This chapter explains how **FindStay** is designed and how its different parts work together. The system connects two main groups of people: travelers who need a reliable, verified place to stay in Takoradi, and property owners who need a simple way to manage their rooms, reservations, income, and everyday expenses. A platform administrator oversees the entire system to ensure trust, verify documents, and handle complaints.

To fulfill the requirements of our Advanced Java Programming course while keeping the website modern and easy to use, FindStay is divided into three clear layers:
1. **The User Website (Frontend):** A fast, modern web application built with **React** and **Vite** that looks great on mobile phones and computers alike.
2. **The Server & Business Engine (Backend):** A secure, robust system built in **Java** using the **Spring Boot** framework. It acts as the "brain," checking room availability, preventing double-bookings, calculating pricing, and enforcing security rules.
3. **The Data Storage & Payment Vault (Database & External Services):** A secure **PostgreSQL** database that safely holds all user, booking, and financial records, integrated with **Paystack** to handle Mobile Money (MTN MoMo, Telecel Cash, AT Money) and card payments in Ghanaian Cedis (GHS).

---

## 4.2 System Architecture: The Three Main Layers

FindStay uses a clean, three-layer structure that keeps the user interface separate from the business logic and database:

1. **Presentation Layer (What Users See):**
   - Built with React and Vite, styled with Tailwind CSS.
   - Provides three easy-to-use portals: one for **Guests** to search and book; one for **Property Owners** to view bookings and track expenses; and one for **Administrators** to review listings and verify identities.
   - Communicates with the backend server securely over the internet using simple, standard web requests (REST API).

2. **Application Layer (The Central Brain in Java Spring Boot):**
   - **Controllers:** Receive requests from the website (such as "search for guesthouses in Takoradi" or "book Room 3").
   - **Security Filter:** Verifies who is logged in and ensures guests cannot access owner accounts, and owners cannot see other properties' private finances.
   - **Service Logic:** Enforces the business rules—such as ensuring a room is not booked twice, applying cancellation policies, calculating total costs, and managing payment timers.
   - **Data Repositories:** Retrieve and save records to the database securely.

3. **Data and Services Layer (The Vault & Gateways):**
   - **PostgreSQL Database:** Safely stores all records with built-in protections so that information is never lost or corrupted.
   - **Paystack Payment Gateway:** Directly connects to local Ghanaian Mobile Money networks and banks to collect booking payments securely.
   - **Cloud Media Storage (Cloudinary):** Stores property photos and verification documents in the cloud, automatically shrinking image sizes so pages load fast on mobile data.

---

## 4.3 Technology Stack and Why We Chose It

Every technology was selected to balance course academic requirements with the everyday practicalities of mobile internet in Ghana:

| Component | Technology | Plain-English Purpose & Justification |
| :--- | :--- | :--- |
| **Backend Language** | **Java (LTS 17/21)** | The core requirement for our Advanced Java class. It provides rock-solid reliability, strong type safety, and high processing speed. |
| **Backend Framework** | **Spring Boot 3** | The industry standard for enterprise Java applications. It handles web requests, background tasks, and security with minimal hassle. |
| **Database Tool (ORM)** | **Spring Data JPA / Hibernate** | Automatically bridges Java code with the database, allowing us to manage rooms and bookings cleanly and lock records during reservations. |
| **Security & Login** | **Spring Security & JWT** | Keeps user accounts secure. When a user logs in, they receive an encrypted digital pass (token) that proves their identity and permissions. |
| **Build Tool** | **Apache Maven** | Manages all Java libraries and automatically runs test suites to make sure the software is bug-free before running. |
| **Database Engine** | **PostgreSQL** | A dependable relational database that guarantees records are saved accurately and prevents conflicts when multiple guests book at once. |
| **Frontend Framework** | **React + Vite** | A fast, modern web framework that delivers an instant, app-like experience in the browser without slow page reloads. |
| **Styling & Design** | **Tailwind CSS** | Ensures the website automatically adjusts to fit smartphone screens, tablets, and laptops cleanly. |
| **Payment Gateway** | **Paystack Ghana** | Enables seamless payment via MTN Mobile Money, Telecel Cash, AT Money, and bank cards in Ghanaian Cedis (GHS). |
| **Photo Hosting** | **Cloudinary** | Stores property photos online and optimizes them so they load quickly without using up the guest's mobile data. |

---

## 4.4 How Core Workflows Work

### 4.4.1 Who Uses the System
- **Guests:** Look for places to stay in Takoradi, filter by price and facilities, book a room, pay with Mobile Money, download digital receipts, and leave reviews after their stay.
- **Property Owners / Managers:** Submit property details and identity documents (Ghana Card) for verification, manage room pricing and availability, accept or decline booking requests, and log operating expenses to see monthly profits.
- **Property Staff:** Help with day-to-day operations like checking guests in and out and confirming room readiness.
- **Platform Administrators:** Review and approve owner documents, publish verified listings, handle complaints, and inspect system audit logs to ensure fair play.
- **Payment Gateway (Paystack):** Sends payment prompts to guests' phones and notifies FindStay immediately when a payment succeeds.

### 4.4.2 How a Booking Happens (Step-by-Step)
1. **Search & Select:** The guest searches for accommodation in Takoradi (e.g., near TTU Campus or Beach Road), chooses dates, selects a room, and clicks "Book Now."
2. **Instant Availability & Lock:** The Java backend instantly verifies that the room is available for those exact dates. To ensure fairness, it temporarily locks the record so no other guest can book it at that exact second.
3. **Owner Review:** The booking is saved as *Pending*. The property owner gets an alert and either accepts or declines the booking.
4. **Payment Window (30 Minutes):** Once accepted, the status changes to *Awaiting Payment*. The guest has 30 minutes to pay.
5. **Mobile Money Settlement:** The guest enters their Mobile Money number (MTN, Telecel, AT) on the Paystack screen and approves the prompt on their phone.
6. **Confirmation & Digital Receipt:** Paystack notifies FindStay of the successful payment. The system immediately confirms the reservation, locks the calendar, and issues a printable digital receipt with a QR code.
7. **Expiration Safety:** If the 30 minutes run out without payment, the booking automatically cancels, and the room becomes free for other guests to book.

### 4.4.3 Preventing Double-Bookings
In busy travel seasons or school reopening periods in Takoradi, two guests might try to book the last available hostel room at the very same second. 

FindStay solves this in plain English: **The first request temporarily locks the room's record in the database while it completes its availability check.** If a second request arrives at the same moment, it must wait for a fraction of a second. Once the first booking completes, the second request immediately sees that the room is taken and politely informs the guest that the room is no longer available. This guarantees that double-booking is physically impossible.

---

## 4.5 Database Design: What Information We Store

Rather than cluttering the report with repetitive technical code, the table below clearly summarizes the essential records FindStay manages:

| Record Group | What It Stores | Why It Is Important |
| :--- | :--- | :--- |
| **Users** | Full name, email, phone number, encrypted password, and user role (Guest, Owner, Staff, Admin). | Manages account access, login permissions, and contact details. |
| **Owner Profiles** | Ghana Card number, uploaded ID photos, verification status, and review notes. | Ensures only verified, genuine property owners can publish listings on the platform. |
| **Properties** | Title, accommodation type (hotel, hostel, guesthouse, apartment), address, Takoradi neighborhood, description, and verification badge. | Holds the core information travelers search for and read before booking. |
| **Rooms / Units** | Room name, occupant capacity, price per night in Cedis (GHS), and total quantity available. | Manages the actual inventory of rooms or dorm beds that can be booked. |
| **Bookings** | Booking code, guest name, check-in date, check-out date, total cost, current status, and payment timer. | Tracks reservations from the initial request through payment, check-in, and check-out. |
| **Payments** | Paystack reference code, amount paid in Cedis, Mobile Money channel used, and payment timestamp. | Keeps an official financial record of all completed customer transactions. |
| **Financial Ledger** | Property ID, expense or income type, category (utilities, repairs, wages, supplies), amount, and date. | Replaces paper notebooks with an automated ledger showing monthly expenses and net profits. |
| **Reviews & Complaints** | Star rating (1 to 5), written comments, owner replies, and dispute resolution notes. | Builds trust; only guests who actually completed a stay are permitted to write reviews. |
| **Audit Logs** | Date and time, user ID, action taken (e.g., approved listing, issued refund), and computer IP address. | Maintains a permanent, tamper-proof history of important administrative actions. |

---

## 4.6 User Interface: The Key Screens

The website is designed to be clean and simple, working seamlessly on mobile phones (which most guests and owners use) and desktop screens:

1. **Search & Discovery Page:** A simple search bar asking *Where in Takoradi?*, *When are you staying?*, and *How many guests?*. Results appear as cards showing clear photos, prices in Cedis, neighborhood names, and green "Verified" badges.
2. **Property Details Page:** Displays photo galleries, room types, verified host badges, amenities (Wi-Fi, water, generator, AC), house rules, and an instant price calculator.
3. **Mobile Money Payment Screen:** A clean payment screen showing the total amount, a countdown timer (30 minutes), and a network selector for MTN MoMo, Telecel Cash, or bank cards.
4. **Digital Receipt & Voucher:** A confirmation screen with a printable receipt, check-in instructions, host phone number, and a QR code for quick check-in at the property.
5. **Property Owner Dashboard:** A command center showing today’s arrivals and departures, current room occupancy, and single-click buttons to check guests in or accept new bookings.
6. **Owner Expense & Income Ledger:** A simple bookkeeping screen where owners enter their daily costs (like electricity tokens, cleaning supplies, or plumbing repairs) and instantly see their monthly profit.
7. **Admin Verification Center:** A clean dashboard where administrators review owner Ghana Cards and property photos side-by-side to approve listings or request changes.

---

## 4.7 Security and Privacy Made Simple

- **Role-Based Access:** Guests only see their own bookings; property owners only see their own properties and finances; and only admins can approve listings or inspect audit logs.
- **Scrambled Passwords:** Passwords are encrypted using strong mathematical hashing (BCrypt) before saving. No human, including administrators, can ever see a user's plaintext password.
- **Tamper-Proof Payments:** When a payment is made on Paystack, Paystack signs the confirmation message with a secret digital signature. FindStay checks this signature before marking any booking confirmed, preventing anyone from faking a payment.
- **Privacy Protection:** Follows Ghana’s **Data Protection Act, 2012 (Act 843)**. Ghana Card numbers and personal details are encrypted and kept strictly confidential.

---

## 4.8 Booking State Machine: The Lifecycle of a Reservation

Every booking follows a clear, predictable path from start to finish:
- **Pending:** The guest has requested a stay; waiting for the property owner to accept.
- **Awaiting Payment:** The owner accepted; the room is held for 30 minutes while the guest pays.
- **Confirmed:** Payment succeeded via Mobile Money; the room is officially locked for those dates.
- **Completed:** The guest finished their stay and checked out; they can now leave a verified review.
- **Cancelled:** The 30-minute timer ran out without payment, or the guest cancelled under property rules. The room is immediately freed for others.
- **Declined:** The owner was unable to accommodate the request; the room remains open.

---

## 4.9 Chapter Summary

This chapter detailed the system design of FindStay in clear, accessible terms. By pairing a robust **Java Spring Boot** backend with a responsive **React** frontend and a secure **PostgreSQL** database, FindStay solves the real-world problems of double-booking, unverified listings, and manual paper bookkeeping. This design serves as the direct foundation for the implementation and testing described in Chapter Five.
