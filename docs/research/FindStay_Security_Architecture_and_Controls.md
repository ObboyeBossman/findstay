# FindStay - Security Architecture and System Protection Controls

**Project Context:** Web-based accommodation marketplace and property-management platform for Ghana (Takoradi focus)  
**Academic Context:** Advanced Java Programming capstone project  
**Document Purpose:** Comprehensive specification of platform security, defense-in-depth architecture, payment safety, and data protection compliance.

---

## 1. Security Overview and Philosophy

FindStay operates as a two-sided marketplace handling personal identity information (Ghana Cards, contact numbers), real-time booking schedules, and financial transactions via Mobile Money (MTN MoMo, Telecel Cash, AT Money). A security breach could result in fraudulent room listings, compromised user credentials, payment interception, or double-booking conflicts.

To mitigate these risks, FindStay implements a **Defense-in-Depth (Multi-Layered) Security Architecture**. Security is enforced across five distinct tiers:
1. **Edge & Transport Layer:** Transport Layer Security (TLS 1.3), Cloudflare DDoS mitigation, and HTTP security response headers.
2. **Client Presentation Layer (React + Vite):** Input sanitization, contextual HTML escaping against Cross-Site Scripting (XSS), and secure cookie/local storage management.
3. **API & Authentication Layer (Spring Security 6):** Stateless JSON Web Token (JWT) validation, adaptive password hashing (BCrypt), and fine-grained Role-Based Access Control (RBAC).
4. **Application Logic & Transaction Layer:** Concurrency write locking preventing double-booking race conditions and cryptographic HMAC-SHA512 webhook signature verification.
5. **Data Persistence & Compliance Layer (PostgreSQL):** Parameterized queries preventing SQL injection, encryption of sensitive identification records at rest, and compliance with the **Ghana Data Protection Act, 2012 (Act 843)**.

---

## 2. Authentication, Token Lifecycle, and Password Security

### 2.1 Cryptographic Password Hashing
User passwords are treated as zero-trust secrets and are never stored in plaintext or reversibly encrypted:
- Passwords are hashed using the **BCrypt** adaptive hashing algorithm via Spring Security's `BCryptPasswordEncoder`.
- A work factor (cost parameter) of **12** is enforced, requiring approximately 250–350 milliseconds per hash calculation on server hardware. This deliberately slows down offline dictionary attacks and rainbow table exploitation.
- A unique, cryptographically random salt (128-bit) is generated per user and embedded in the resulting hash string.

### 2.2 Stateless JWT Token Architecture
User sessions are managed without server-side session memory, ensuring scalability and preventing session fixation:
- Upon successful authentication (`POST /api/v1/auth/login`), the backend issues an access token signed using **HMAC-SHA256 (HS256)** with a 256-bit cryptographically random secret key.
- The JWT payload contains only essential non-sensitive claims: user ID, email address, role (`ROLE_GUEST`, `ROLE_OWNER`, `ROLE_STAFF`, `ROLE_ADMIN`), issuance timestamp, and expiration timestamp.
- **Token Lifespan:** Access tokens are strictly time-limited to **2 hours**.
- **Filter Enforcement:** Every incoming protected request passes through a custom `JwtAuthenticationFilter` extending Spring's `OncePerRequestFilter`. The filter parses the `Bearer` token from the `Authorization` header, verifies the cryptographic signature, checks that the token is not expired, and populates the `SecurityContextHolder`.

---

## 3. Role-Based Access Control (RBAC) Architecture

FindStay enforces a strict authorization model across all API endpoints and service methods:

| Primary Role | Authority Name | Permitted Capabilities & Boundaries |
| :--- | :--- | :--- |
| **Anonymous** | Unauthenticated | Browse published listings, filter by price/amenities, view property details, register, and log in. |
| **Guest** | `ROLE_GUEST` | Create reservation requests, initiate Mobile Money payments, view personal receipts, download vouchers, and submit post-stay reviews for completed stays. |
| **Property Owner** | `ROLE_OWNER` | Submit property details and Ghana Card for verification, manage unit inventory and pricing, accept/decline bookings, log operational expenses, and view monthly revenue/occupancy reports for own properties. |
| **Property Staff** | `ROLE_STAFF` | Restricted operational access to assigned properties: view arrival/departure lists and toggle guest check-in/check-out status. No access to financial ledger or owner payout details. |
| **Administrator** | `ROLE_ADMIN` | Inspect verification queues, review uploaded Ghana Cards, publish or suspend listings, moderate reported reviews, resolve complaints, and inspect immutable system audit logs. |

Spring Security enforces these boundaries declaratively using method-level security:
```java
@PreAuthorize("hasRole('OWNER') and @propertySecurityService.isPropertyOwner(authentication, #propertyId)")
public ExpenseResponseDto recordExpense(Long propertyId, ExpenseCreateDto dto) { ... }
```

---

## 4. Payment Security & Paystack Webhook Cryptographic Verification

Online payments involve financial settlement in Ghanaian Cedis (GHS). Because transactions occur over public networks, FindStay implements rigorous transaction integrity measures:

### 4.1 Cryptographic Signature Validation
Payment confirmation does not rely on client-side confirmation. Confirmation occurs exclusively through asynchronous webhooks transmitted from Paystack's servers to `/api/v1/payments/webhook`:
1. Paystack signs each webhook payload using the platform's private secret key and includes the signature in the HTTP header `x-paystack-signature`.
2. When the Spring Boot webhook receiver receives a payload, it computes an **HMAC-SHA512** hash of the raw JSON request body using the same private key.
3. The computed signature is compared against the incoming header using `MessageDigest.isEqual()`, which executes in constant time to prevent side-channel timing attacks.
4. If the signatures do not match, the request is immediately dropped with HTTP 401 Unauthorized, and an alert is recorded in the security audit log.

### 4.2 Webhook Idempotency (Replay Attack Prevention)
Under poor network conditions, a payment provider may retry webhooks multiple times:
- Each Paystack event carries a globally unique `reference` code.
- Before updating any booking status, `PaymentService` queries `paymentRepository.existsByPaystackRef(reference)`.
- If the transaction has already been recorded, the service immediately returns HTTP 200 OK without executing redundant state transitions or duplicate receipt generations.

---

## 5. Concurrency Control & Double-Booking Elimination

A critical integrity requirement is guaranteeing that two travelers cannot confirm reservations for the exact same accommodation unit and dates simultaneously.

### 5.1 Pessimistic Database Write Locking
Rather than optimistic concurrency (which only detects conflicts after the fact), FindStay employs **Pessimistic Write Locking** in PostgreSQL:
1. When a booking request is initiated, the service issues:
   ```sql
   SELECT u FROM Unit u WHERE u.id = :unitId FOR UPDATE
   ```
2. The database places an exclusive lock on that specific unit record for the duration of the `@Transactional` boundary.
3. Any competing thread attempting to book the same unit is forced to wait in the database queue.
4. The active transaction checks date overlaps:
   ```sql
   SELECT COUNT(b) FROM Booking b 
   WHERE b.unit.id = :unitId 
     AND b.status IN ('CONFIRMED', 'AWAITING_PAYMENT')
     AND b.checkInDate < :checkOutDate 
     AND b.checkOutDate > :checkInDate
   ```
5. If an overlap exists, the transaction rolls back immediately and throws a `BookingConflictException` (HTTP 409 Conflict).
6. Once the transaction commits or rolls back, the lock is released, and the second thread safely discovers that the unit is occupied.

---

## 6. Web Application Vulnerability Mitigations (OWASP Top 10)

| Vulnerability Threat | Risk in FindStay | Engineering Defense & Mitigation |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Attackers injecting malicious SQL fragments to extract data or bypass authentication. | Enforce 100% parameterized queries via Spring Data JPA and Hibernate. No raw string concatenation is used in database operations. |
| **Cross-Site Scripting (XSS)** | Malicious scripts injected into property descriptions or review comments. | React's JSX virtual DOM natively encodes and escapes all rendered data. Input text is validated on the backend using `jakarta.validation` constraints (`@NotBlank`, `@Size`). |
| **Cross-Site Request Forgery (CSRF)** | Unauthorized commands transmitted from a trusted user. | Stateless REST APIs utilize Bearer tokens in HTTP headers (`Authorization: Bearer <token>`) rather than automatic ambient browser cookies, neutralizing standard CSRF attack vectors. |
| **Insecure Direct Object Reference (IDOR)** | A property owner changing the URL ID to view or edit another owner's private financial records. | Custom permission evaluators check whether the authenticated user's ID matches the `owner_id` of the requested property before returning data. |
| **Brute Force & Credential Stuffing** | Automated dictionary attacks against user login endpoints. | Rate limiting implemented on authentication endpoints, combined with progressive delays and temporary IP throttling. |

---

## 7. Data Privacy and Legal Compliance (Ghana Act 843)

FindStay operates in accordance with the **Data Protection Act, 2012 (Act 843)** of the Republic of Ghana:
1. **Lawful Basis & Purpose Limitation:** Personal identification (Ghana Cards, contact numbers) is collected strictly for identity verification, anti-fraud compliance, and reservation fulfilment.
2. **Storage Security & Access Minimization:** Ghana Card numbers and document scans uploaded by property owners are stored with encryption at rest. Direct access is restricted exclusively to authorized platform compliance administrators.
3. **No Raw Card Storage:** FindStay **never** collects, logs, or stores raw credit/debit card numbers or Mobile Money PINs. All payment credential handling is offloaded entirely to Paystack, a certified PCI-DSS Level 1 compliant processor.
4. **User Rights:** Registered users retain the right to inspect their personal data, request corrections to profile records, and request account deactivation.
