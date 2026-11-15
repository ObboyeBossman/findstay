# FindStay — Major Use Cases

## 1. Use Case Summary

| Use Case | Primary Actor | Preconditions | Success Outcome |
| :--- | :--- | :--- | :--- |
| **UC-01** Register and access account | Guest, owner/manager, administrator | User has a valid contact channel | Account is created or activated and the user receives the appropriate role access |
| **UC-02** Submit property for verification | Owner/manager | Owner account is authenticated | Property submission enters the administrator verification queue |
| **UC-03** Search and view accommodation | Guest | Published listings exist | Guest views filtered results and detailed listing information |
| **UC-04** Request, pay for, and confirm booking | Guest, owner/manager, payment provider | Guest is authenticated; selected unit is available | Accepted booking is paid, confirmed, receipted, and added to both dashboards |
| **UC-05** Manage property availability and bookings | Owner/manager or authorised staff | User has access to the property | Availability, booking status, and guest stay information are updated |
| **UC-06** Record financial activity and view reports | Owner/manager | User has access to the property | Income/expenses are recorded and date-filtered reports are generated |
| **UC-07** Review completed stay or report issue | Guest | Guest has an eligible completed booking or support need | Review, complaint, or dispute is recorded and routed for action |
| **UC-08** Verify, moderate, and administer platform | Administrator | Administrator is authenticated and authorised | Verification, moderation, account, complaint, dispute, or transaction action is completed and logged |

---

## 2. Detailed Flow — UC-04: Request, Pay for, and Confirm Booking

1. The guest selects a property unit, check-in date, check-out date, and number of guests.
2. The system validates capacity and availability and calculates the booking amount.
3. The guest submits the request and the system records it as **Pending**.
4. The owner/manager accepts or declines the request. On acceptance, the system changes it to **Awaiting Payment** and notifies the guest.
5. The guest selects a supported payment method (Mobile Money or card) and completes payment through Paystack.
6. The system verifies the payment result, records the transaction, changes the booking to **Confirmed**, and issues a confirmation and receipt.
7. If the request is declined, the payment fails, or the payment window expires, the system records the relevant status and notifies affected users.
