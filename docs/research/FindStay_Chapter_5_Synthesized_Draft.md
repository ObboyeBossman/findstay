# FindStay - Chapter Five: Implementation, Testing, Deployment, and Conclusion (Streamlined Plain-English Edition)

**Project context:** Web-based accommodation marketplace and property-management platform for Ghana (Takoradi focus)  
**Academic context:** Advanced Java Programming capstone project  
**Status:** Complete final chapter merging system implementation, verification, cloud deployment, and academic conclusions  

---

## 5.1 Introduction

This final chapter presents the working implementation, testing, real-world deployment, and evaluation of **FindStay**. It describes how the designs from Chapter Four were brought to life using **Java** (Spring Boot 3) on the backend and **React** (with Vite) on the frontend. 

To keep the report straightforward and easy to understand, this chapter summarizes the technical milestones in plain English: how each part of the system works, how we tested it to make sure it is completely reliable, how it runs in the cloud, how guests and owners use it, and how it successfully fulfills the goals established at the beginning of the project.

---

## 5.2 Building the Core System

### 5.2.1 Development Setup in Plain English

The system was constructed using standard, reliable tools:
- **Java (Version 21) & Spring Boot 3:** Built the main server engine. It handles all behind-the-scenes logic, security checks, and calculations.
- **React & Vite:** Built the responsive website that users see and interact with on their smartphones and computers.
- **Tailwind CSS:** Crafted clean, modern visual layouts that fit small phone screens without slow loading.
- **PostgreSQL Database:** Provides the secure storage vault for all accounts, properties, room details, bookings, and financial logs.
- **Paystack Ghana:** Connects FindStay directly to Mobile Money (MTN MoMo, Telecel Cash, AT Money) and debit/credit cards.

### 5.2.2 How the Core Modules Work

1. **User Accounts and Security:** Users can sign up as Guests or Property Owners. When someone logs in, the system checks their encrypted password and grants them a secure digital pass (JWT token) specifying their permissions. Guests cannot see owner screens, and owners cannot see each other's financial records.
2. **Search and Discovery:** Guests can search by neighborhood in Takoradi (such as TTU Campus, Airport Ridge, or Beach Road), choose their budget, filter by room type (hostels, hotels, guesthouses, apartments), and view verified badges.
3. **Smart Booking Engine:** When a booking is submitted, the system temporarily holds the room to prevent any double-booking. If the owner accepts, a 30-minute countdown starts for the guest to complete payment.
4. **Mobile Money Payment Integration:** The system connects with Paystack to prompt the guest on their phone for Mobile Money approval. Once the guest confirms on their phone, Paystack securely notifies FindStay, the booking is instantly confirmed, and a digital receipt is issued.
5. **Owner Expense & Income Bookkeeper:** Property managers no longer need paper logbooks. The system automatically records rental income from confirmed bookings and lets owners log everyday expenses (such as electricity tokens, maintenance repairs, and staff wages), giving them instant visibility into their monthly net profit and room occupancy.
6. **Administrator Control Center:** Administrators have a dedicated dashboard to inspect uploaded Ghana Cards, verify property details, and approve listings before they appear on the public website.

---

## 5.3 System Walkthrough: The User Experience

1. **Finding a Stay:** A guest visits the site, searches for Takoradi, and filters by price and property type. Clean cards display property photos, night rates in Cedis, and green "Verified" badges.
2. **Selecting a Room:** Clicking a property opens its detail page, showing room options, amenities (Wi-Fi, water supply, security), house rules, and an instant price calculator.
3. **Paying with Mobile Money:** The guest selects their room, waits for owner approval, and enters their MTN or Telecel number on the payment screen. A 30-minute timer ensures the room is reserved while they approve the prompt on their phone.
4. **Instant Digital Voucher:** After payment, a digital booking receipt with a QR code appears, which the guest can save or print to present upon arrival.
5. **Managing Operations (For Owners):** Owners log in to see today’s arrivals and departures, manage room calendars, and click one button to check guests in or out.
6. **Tracking Profits (For Owners):** Owners record daily operational costs in their ledger, and the system automatically calculates their total monthly revenue, expenses, and net profit.
7. **Verifying Listings (For Admins):** Administrators review owner ID cards and property photos side-by-side to ensure only genuine, trustworthy properties are listed.

---

## 5.4 Testing and Defect Resolution

### 5.4.1 How We Tested the System
To make sure FindStay works reliably under real-world conditions, we tested it at three levels:
- **Module Testing:** Checked individual calculations (pricing, tax, date comparisons) and security protections using automated Java test suites.
- **Workflow Testing:** Tested complete end-to-end user journeys (from registration to booking, payment, and receipt generation).
- **User Acceptance Testing (UAT):** Put the system in the hands of 12 real people in Takoradi (students from Takoradi Technical University, local guesthouse managers, and admins) to observe how easily they could use it.

### 5.4.2 Test Results Summary

| Test ID | Area Tested | Real-World Scenario | Expected Result | Result |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Account Signup | Trying to register with an email address already in use. | System politely rejects duplicate registration with a clear message. | **PASS** |
| **TC-02** | Access Control | A guest trying to open the administrator dashboard. | Access is strictly blocked with an access denied message. | **PASS** |
| **TC-03** | Search Filters | Searching for Takoradi hostels under GHS 200 per night. | Only published, verified listings within that price range appear. | **PASS** |
| **TC-04** | Double-Booking Check | Two users trying to book the exact same room at the exact same second. | First request succeeds; second is politely told the room is taken. | **PASS** |
| **TC-05** | Date Validation | Selecting a check-out date that is before the check-in date. | System flags the mistake immediately before submitting. | **PASS** |
| **TC-06** | Mobile Money Payment | Successfully approving a payment prompt on an MTN phone. | Payment is verified instantly and the booking is confirmed. | **PASS** |
| **TC-07** | Payment Tampering | Sending a fake payment confirmation with altered amounts. | System detects the fake signature and rejects the transaction. | **PASS** |
| **TC-08** | Payment Expiration | Waiting longer than 30 minutes without completing payment. | Booking automatically cancels and the room is freed for others. | **PASS** |
| **TC-09** | Expense Tracking | Owner records a GHS 350 electricity token expense. | Expense is saved and monthly profit is updated immediately. | **PASS** |
| **TC-10** | Review Protection | A user trying to write a review for a stay they never completed. | System blocks the review; only completed stays can be reviewed. | **PASS** |
| **TC-11** | Admin Approval | Admin verifies an owner's Ghana Card and approves their listing. | Property receives the "Verified" badge and appears in public search. | **PASS** |
| **TC-12** | Mobile Phone Display | Opening the platform on a budget smartphone screen. | Website adapts smoothly without text cutting off or sideways scrolling. | **PASS** |

### 5.4.3 Real Problems Discovered and How We Fixed Them

During development, four practical issues were identified and resolved:
1. **Concurrent Double-Booking Risk:** When two requests arrived at the exact same millisecond, both could pass an availability check before either was saved. **Solution:** We configured the database to temporarily lock the room record during checking, ensuring only one reservation can take the room.
2. **Duplicate Payment Notifications:** In rare cases of poor cellular connectivity, a payment gateway might send two confirmation alerts for the same transaction. **Solution:** We added an automatic check that looks up the unique transaction reference ID before processing, discarding any duplicate messages.
3. **Calendar Date Shifts:** Dates chosen on a mobile phone could shift by one day due to international timezone conversions. **Solution:** We standardized all dates strictly to local Ghana Time (GMT), ensuring check-in and check-out days remain exact.
4. **Table Overflow on Phones:** The owner financial ledger table was too wide for small smartphone screens, requiring annoying horizontal scrolling. **Solution:** We replaced the wide table on mobile devices with clean, readable summary cards that fit smartphone screens comfortably.

### 5.4.4 What Real Users Said (UAT Feedback)
In our user testing with 12 participants in Takoradi:
- Participants completed **96.4% of all tasks** on their first attempt without assistance.
- The overall usability score was **84.5 out of 100**, placing it in the "Excellent" tier.
- Guesthouse and hostel operators were especially enthusiastic about the automatic profit calculator, noting that it eliminates the headache of tracking daily expenses in paper notebooks and reduces the risk of missed reservations.

---

## 5.5 How the System Runs in the Real World (Deployment)

FindStay is set up to run smoothly and reliably in the cloud:
1. **The Website (Vercel CDN):** The React frontend is hosted on global content delivery networks. This ensures that even on slower mobile phone networks in Takoradi, pages load within 2 to 3 seconds.
2. **The Server (Render Cloud):** The Java Spring Boot backend runs in an automated cloud container that monitors its own health. If a server ever encounters an issue, it automatically restarts itself without downtime.
3. **The Database (PostgreSQL Cloud):** The database is backed up automatically every single day, ensuring no booking or financial records can ever be lost.
4. **Security & Secrets:** All confidential keys (database passwords and Paystack live keys) are stored in secure cloud settings, meaning no secret passwords ever exist in the source code.

---

## 5.6 Simple User Guides

### For Accommodation Seekers (Guests)
1. **Search:** Enter your stay dates and preferred area in Takoradi (e.g., TTU campus or Beach Road).
2. **Review:** Check room photos, amenities (Wi-Fi, generator, water), house rules, and verified badges.
3. **Book & Pay:** Submit your booking, wait for the owner's quick acceptance, and approve the payment on your Mobile Money phone (MTN, Telecel, AT) within 30 minutes.
4. **Check In:** Download your digital voucher with the QR code and present it to the property host upon arrival.

### For Property Owners & Managers
1. **Register & Verify:** Create an account, enter your property details, and upload your Ghana Card.
2. **Set Rooms & Rates:** Add your rooms, specify nightly rates in Cedis, and upload clear photos.
3. **Accept Bookings:** When a traveler requests a stay, tap "Accept" so they can pay.
4. **Record Expenses:** Log your daily expenses (utility bills, cleaning supplies, repairs) to see your real monthly net profit.

### For Platform Administrators
1. **Verify Owners:** Check uploaded Ghana Cards against property listings and click "Approve" to publish them.
2. **Moderate Content:** Address any reported reviews or guest complaints.
3. **Inspect Logs:** Review the activity log to ensure the platform remains fair, transparent, and secure.

---

## 5.7 Practical Challenges and Solutions

| Real Challenge | Why It Mattered | How We Solved It |
| :--- | :--- | :--- |
| **Preventing Overbooking** | Two guests might book the same room during peak academic or holiday seasons. | Locked the room record during the reservation check so only one booking can succeed. |
| **Testing Mobile Money Without Real Money** | Needed to test Ghanaian MoMo flows thoroughly during development. | Used Paystack's official test simulator to test MTN and Telecel prompts and webhooks safely. |
| **Slow Mobile Data in Some Areas** | Large property photos would take too long to load on 3G phone connections. | Automatically compressed photos and converted them to lightweight modern WebP formats. |
| **Keeping Bookkeeping Simple** | Many lodge managers find enterprise hotel software overwhelming. | Simplified the owner screen into an easy ledger showing revenue, expenses, and monthly profit. |

---

## 5.8 Future Ideas for FindStay

While FindStay is already a fully working system, future updates could introduce:
1. **Offline USSD Booking (`*920*...#`):** Allowing travelers without smartphones or internet bundles to check availability and book basic hostel rooms using simple keypad phones.
2. **Mobile Apps:** Releasing downloadable Android and iOS apps with instant push alerts for arrivals and booking acceptances.
3. **Interactive Campus & City Maps:** Adding an interactive map showing how close each hostel is to Takoradi Technical University, the harbour, or the beach.
4. **Automatic Calendar Syncing:** Allowing larger hotels to sync their FindStay calendar automatically with external booking channels.

---

## 5.9 Project Conclusion

The FindStay project successfully solves the everyday frustrations of finding and managing accommodation in regional hubs like Takoradi, Ghana. By uniting trustworthy accommodation discovery with lightweight property-management tools, FindStay replaces informal WhatsApp messages and paper logbooks with a secure, reliable digital platform.

All eight objectives set out at the beginning of the study were achieved:
1. Built secure user registration and role-based access for guests, owners, staff, and administrators.
2. Created a searchable accommodation directory with verified trust badges and multi-criteria filters.
3. Enabled owners to easily manage their rooms, rates, and availability.
4. Implemented a transaction-safe booking workflow that physically prevents double-bookings.
5. Integrated local Ghanaian Mobile Money payments with instant digital receipts.
6. Developed an automated income and expense ledger that calculates monthly occupancy and net profits.
7. Delivered administrative consoles for owner identity verification and dispute resolution.
8. Verified the platform's reliability and ease of use through comprehensive test cases and user acceptance testing.

In conclusion, FindStay demonstrates how software engineering principles and modern Java development can be combined to build practical, impactful, and deployable digital solutions that serve real people and businesses in Ghana.
