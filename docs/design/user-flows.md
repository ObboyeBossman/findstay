# FindStay — User Flow Diagrams (`S1-01-T3`)

- **Task:** [`S1-01-T3`](../scrum/sprint-01/stories/S1-01/tasks/S1-01-T3.md) (Issue [#27](https://github.com/ObboyeBossman/findstay/issues/27))
- **Story:** [`S1-01`](../scrum/sprint-01/stories/S1-01/README.md) — Project Setup & System Design
- **Author:** Anthony Maclean (`@dztrb`)

This document maps every screen-to-screen path for FindStay's three core user journeys—**Guest**, **Property Owner**, and **Administrator**—including **happy paths**, **error paths**, and **empty states**.

> [!NOTE]
> **Sprint 1 Scope Note:** Sprint 1 delivers Foundation, Auth, Owner Onboarding/Verification, Property Listings, Availability Calendar, and Admin Approval. In the Guest journey below, steps **1–8** map directly to Sprint 1 foundations/listings, while steps **9–11** (Booking Details, Confirm Booking, Booking Confirmation) complete the end-to-end flow for upcoming booking/payment sprints.

---

## Legend

- **Rectangle `[Screen Name]`**: Application screen or view
- **Diamond `{Decision / Condition}`**: Branching check or user choice
- **Rounded `([State / Outcome])`**: Entry point, terminal state, or status
- **Dashed/Error nodes**: Error states (`wrong password`, `no internet`, `server down`, validation/conflict) and empty states (`nothing to show yet`)

---

## 1. Guest Journey (Updated Flow)

### Happy Path
1. Open Application → 2. Homepage (browse & search) → 3. Search Accommodation → 4. Search Results → 5. Select a Property → 6. Property Details (price, images, location, facilities) → 7. Click "Make a Booking" → 8. Authentication (Sign In or Create Account) → 9. Booking Details → 10. Confirm Booking → 11. Booking Confirmation.

```mermaid
flowchart TD
    Start(["1. Open Application"]) --> NetCheck{"Internet & Server<br/>Reachable?"}
    NetCheck -- "No (Offline / 5xx)" --> ErrOffline["Error Screen:<br/>No Internet / Server Down<br/>[Retry]"]
    ErrOffline -- "Retry" --> NetCheck

    NetCheck -- "Yes" --> Home["2. Homepage<br/>(Browse & Search)"]
    Home --> HomeEmpty{"Any Published<br/>Properties?"}
    HomeEmpty -- "No" --> EmptyHome["Empty State:<br/>No Accommodations Listed Yet"]
    HomeEmpty -- "Yes" --> Search["3. Search Accommodation<br/>(Location, Dates, Guests, Filters)"]

    Search --> SearchFetch{"Search Request<br/>Succeeded?"}
    SearchFetch -- "No (Network / 5xx)" --> ErrSearch["Error Banner:<br/>Unable to Load Results<br/>[Retry]"]
    ErrSearch -- "Retry" --> SearchFetch

    SearchFetch -- "Yes" --> HasResults{"Matching<br/>Properties > 0?"}
    HasResults -- "No (0 matches)" --> EmptyResults["Empty State:<br/>No Matching Accommodations<br/>[Clear Filters / Edit Search]"]
    EmptyResults --> Search

    HasResults -- "Yes" --> Results["4. Search Results<br/>(Display Available Accommodation)"]
    Results --> SelectProp["5. Select a Property"]
    SelectProp --> PropFetch{"Property Still<br/>Available?"}
    PropFetch -- "No (404 / Unlisted)" --> ErrPropGone["Error Screen:<br/>Property No Longer Available<br/>[Back to Results]"]
    ErrPropGone --> Results

    PropFetch -- "Yes" --> PropDetails["6. Property Details<br/>(Price in GHS, Images, Location, Facilities)"]
    PropDetails --> ClickBook["7. Click 'Make a Booking'"]
    ClickBook --> AuthCheck{"User Already<br/>Signed In?"}

    AuthCheck -- "Yes" --> BookingDetails
    AuthCheck -- "No" --> AuthScreen["8. Authentication<br/>(Sign In or Create Account)"]

    AuthScreen -- "Sign In" --> SignInForm["Sign In Screen<br/>(Email/Phone + Password)"]
    SignInForm --> SignInRes{"Credentials<br/>Valid?"}
    SignInRes -- "Wrong Password /<br/>Invalid" --> ErrWrongPass["Inline Error:<br/>Invalid Email or Password<br/>[Forgot Password?]"]
    ErrWrongPass --> SignInForm
    SignInRes -- "Network / 5xx" --> ErrAuthNet["Error Banner:<br/>Connection Failed [Retry]"]
    ErrAuthNet --> SignInForm
    SignInRes -- "Yes" --> BookingDetails

    AuthScreen -- "Create Account" --> SignUpForm["Create Account Screen<br/>(Name, Email/Phone, Password)"]
    SignUpForm --> SignUpRes{"Registration<br/>Valid?"}
    SignUpRes -- "Email Exists /<br/>Validation Error" --> ErrSignUp["Inline Error:<br/>Check Highlighted Fields"]
    ErrSignUp --> SignUpForm
    SignUpRes -- "Yes" --> VerifyAccount["Verify Email / OTP"]
    VerifyAccount --> VerifyRes{"Code Valid?"}
    VerifyRes -- "Invalid / Expired" --> ErrOTP["Inline Error:<br/>Invalid or Expired Code<br/>[Resend Code]"]
    ErrOTP --> VerifyAccount
    VerifyRes -- "Yes" --> BookingDetails

    BookingDetails["9. Booking Details<br/>(Dates, Guests, Guest Info, Total GHS)"] --> ValidateBooking{"Dates Available &<br/>Inputs Valid?"}
    ValidateBooking -- "Validation Error" --> ErrBookVal["Inline Error:<br/>Fix Invalid Booking Fields"]
    ErrBookVal --> BookingDetails

    ValidateBooking -- "Yes" --> ConfirmScreen["10. Confirm Booking<br/>(Summary & Confirm Action)"]
    ConfirmScreen --> SubmitBook{"Booking Request<br/>Succeeded?"}
    SubmitBook -- "Dates Taken / Conflict" --> ErrConflict["Error Notice:<br/>Dates Just Booked —<br/>Choose Different Dates"]
    ErrConflict --> BookingDetails
    SubmitBook -- "Network / 5xx" --> ErrBookNet["Error Banner:<br/>Could Not Confirm [Retry]"]
    ErrBookNet --> ConfirmScreen

    SubmitBook -- "Yes" --> Confirmation(["11. Booking Confirmation<br/>(Booking Reference & Summary)"])
```

---

## 2. Property Owner Journey

### Happy Path
1. Open the application → 2. Register or sign in → 3. Access the owner dashboard → 4. Select Add Property → 5. Enter property information → 6. Upload property images → 7. Submit the property → 8. View submission status → 9. Manage the property and bookings.

```mermaid
flowchart TD
    Start(["1. Open Application"]) --> NetCheck{"Internet & Server<br/>Reachable?"}
    NetCheck -- "No (Offline / 5xx)" --> ErrOffline["Error Screen:<br/>No Internet / Server Down<br/>[Retry]"]
    ErrOffline -- "Retry" --> NetCheck

    NetCheck -- "Yes" --> AuthChoice["2. Register or Sign In<br/>(Owner Portal)"]
    AuthChoice -- "Register" --> Register["Owner Registration<br/>(Account + Organisation Info)"]
    Register --> RegValid{"Valid &<br/>Confirmed?"}
    RegValid -- "Validation /<br/>Email Exists" --> ErrReg["Inline Error:<br/>Fix Registration Details"]
    ErrReg --> Register
    RegValid -- "Yes" --> OwnerDash

    AuthChoice -- "Sign In" --> SignIn["Owner Sign In"]
    SignIn --> SignInValid{"Credentials<br/>Valid?"}
    SignInValid -- "Wrong Password" --> ErrPass["Inline Error:<br/>Wrong Email or Password<br/>[Reset Password]"]
    ErrPass --> SignIn
    SignInValid -- "Session Expired /<br/>Network Error" --> ErrOwnerNet["Error Banner:<br/>Session or Network Error [Retry]"]
    ErrOwnerNet --> SignIn
    SignInValid -- "Yes" --> OwnerDash

    OwnerDash["3. Owner Dashboard"] --> HasProps{"Any Properties<br/>Added Yet?"}
    HasProps -- "No (0 properties)" --> EmptyDash["Empty State:<br/>No Properties Yet<br/>[+ Add Your First Property]"]
    EmptyDash --> AddProp
    HasProps -- "Yes" --> DashActions{"Owner Action"}

    DashActions -- "Add New Property" --> AddProp["4. Select 'Add Property'"]
    AddProp --> EnterInfo["5. Enter Property Information<br/>(Name, Type, Location, Rooms, GHS Price)"]
    EnterInfo --> InfoValid{"All Required<br/>Fields Valid?"}
    InfoValid -- "Missing / Invalid<br/>Price or Fields" --> ErrPropForm["Inline Error:<br/>Fix Highlighted Property Fields"]
    ErrPropForm --> EnterInfo

    InfoValid -- "Yes" --> UploadImgs["6. Upload Property Images<br/>(+ ID / GTA Docs if Unverified)"]
    UploadImgs --> UploadOK{"Upload<br/>Succeeded?"}
    UploadOK -- "File Too Large /<br/>Bad Format / Timeout" --> ErrUpload["Upload Error:<br/>Invalid File or Upload Failed<br/>[Retry Upload]"]
    ErrUpload --> UploadImgs

    UploadOK -- "Yes" --> SubmitProp["7. Submit the Property"]
    SubmitProp --> SubmitOK{"Submission<br/>Succeeded?"}
    SubmitOK -- "Network / 5xx" --> ErrSubNet["Error Banner:<br/>Submission Failed [Retry]"]
    ErrSubNet --> SubmitProp

    SubmitOK -- "Yes" --> ViewStatus["8. View Submission Status<br/>(Pending Review)"]
    ViewStatus --> ReviewOutcome{"Admin Review<br/>Outcome"}
    ReviewOutcome -- "Rejected" --> RejectedState["Status: Rejected<br/>(View Admin Reason)<br/>[Edit & Resubmit]"]
    RejectedState --> EnterInfo

    ReviewOutcome -- "Approved" --> Manage["9. Manage Property & Bookings<br/>(Availability Calendar, Edit Details, Bookings)"]
    DashActions -- "View Existing Property" --> Manage

    Manage --> HasBookings{"Any Bookings<br/>Received?"}
    HasBookings -- "No (0 bookings)" --> EmptyBookings["Empty State:<br/>No Bookings Received Yet"]
    HasBookings -- "Yes" --> BookingList(["View & Manage Active Bookings"])
```

---

## 3. Administrator Journey

### Happy Path
1. Open the administration portal → 2. Sign in → 3. Access the admin dashboard → 4. View submitted properties → 5. Review property information → 6. Approve or reject a property → 7. Manage users and platform activities.

```mermaid
flowchart TD
    Start(["1. Open Administration Portal"]) --> NetCheck{"Internet & Server<br/>Reachable?"}
    NetCheck -- "No (Offline / 5xx)" --> ErrOffline["Error Screen:<br/>No Internet / Server Down<br/>[Retry]"]
    ErrOffline -- "Retry" --> NetCheck

    NetCheck -- "Yes" --> AdminSignIn["2. Admin Sign In"]
    AdminSignIn --> AuthCheck{"Credentials Valid<br/>& Role = Admin?"}
    AuthCheck -- "Wrong Password" --> ErrPass["Inline Error:<br/>Invalid Credentials"]
    ErrPass --> AdminSignIn
    AuthCheck -- "Not an Admin (403)" --> ErrForbidden["Error Screen:<br/>403 Access Denied"]
    AuthCheck -- "Network / 5xx" --> ErrAuthNet["Error Banner:<br/>Sign-In Failed [Retry]"]
    ErrAuthNet --> AdminSignIn

    AuthCheck -- "Yes" --> AdminDash["3. Admin Dashboard"]
    AdminDash --> AdminSection{"Select Admin<br/>Section"}

    AdminSection -- "Property Approvals" --> QueueFetch{"Load Pending<br/>Queue OK?"}
    QueueFetch -- "Network / 5xx" --> ErrQueue["Error Banner:<br/>Failed to Load Queue [Retry]"]
    ErrQueue --> AdminDash

    QueueFetch -- "Yes" --> QueueEmpty{"Any Submitted<br/>Properties?"}
    QueueEmpty -- "No (0 pending)" --> EmptyQueue["Empty State:<br/>No Pending Property Submissions"]
    QueueEmpty -- "Yes" --> ViewSubmitted["4. View Submitted Properties<br/>(Pending Review Queue)"]

    ViewSubmitted --> ReviewProp["5. Review Property Information<br/>(Details, Images, Owner ID / GTA Docs)"]
    ReviewProp --> Decision{"6. Approve or<br/>Reject Property?"}

    Decision -- "Approve" --> ApproveReq{"Save Approval<br/>Succeeded?"}
    ApproveReq -- "Already Reviewed /<br/>Network Error" --> ErrApprove["Error Notice:<br/>Action Failed or Already Reviewed<br/>[Refresh Queue]"]
    ErrApprove --> ViewSubmitted
    ApproveReq -- "Yes" --> Approved(["Property Published<br/>& Owner Notified"])

    Decision -- "Reject" --> RejectReason["Enter Rejection Reason<br/>(Required)"]
    RejectReason --> ReasonValid{"Reason<br/>Provided?"}
    ReasonValid -- "Empty" --> ErrReason["Inline Error:<br/>Rejection Reason Is Required"]
    ErrReason --> RejectReason
    ReasonValid -- "Yes" --> RejectReq{"Save Rejection<br/>Succeeded?"}
    RejectReq -- "Network / 5xx" --> ErrReject["Error Notice:<br/>Failed to Reject [Retry]"]
    ErrReject --> RejectReason
    RejectReq -- "Yes" --> Rejected(["Property Rejected<br/>& Owner Notified"])

    AdminSection -- "Users & Platform<br/>Activities" --> ManageUsers["7. Manage Users & Platform Activities<br/>(User Accounts, Roles, Settings, Audit Log)"]
    ManageUsers --> UsersEmpty{"Any Records<br/>Match Filter?"}
    UsersEmpty -- "No" --> EmptyUsers["Empty State:<br/>No Users or Activity Found"]
    UsersEmpty -- "Yes" --> UsersList(["View / Update Users, Settings & Audit Log"])
```

---

## 4. Summary of Error Paths & Empty States

| Journey | Error Paths Covered | Empty States Covered |
| :--- | :--- | :--- |
| **Guest** | Offline / server down (`5xx`), search failure, property unavailable (`404`), wrong password, invalid/duplicate registration, invalid/expired OTP, booking validation error, date conflict | No published properties on Homepage; `0` matching accommodations in Search Results |
| **Property Owner** | Offline / server down (`5xx`), wrong password, session expired, registration/property form validation errors, image/document upload failure, submission failure, admin rejection | No properties added yet on Owner Dashboard; `0` bookings received yet |
| **Administrator** | Offline / server down (`5xx`), wrong password, `403 Access Denied` for non-admin, queue load failure, missing rejection reason, concurrent review conflict | No pending property submissions in queue; no matching users or activity logs |
