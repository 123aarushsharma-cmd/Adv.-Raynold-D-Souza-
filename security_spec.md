# Security Specification: Olive Law Firm

This security specification establishes the Attribute-Based Access Control (ABAC) and Zero-Trust model for Olive Law Firm's Firestore database, conforming to strict security standards to ensure complete data integrity, client privilege security, and protection against unauthorized data access.

---

## 1. Data Invariants

1. **Client Intake Confidentiality**: A consultation intake file contains Personally Identifiable Information (PII) protected under attorney-client privilege. It MUST NOT be readable by any user unless they are a verified administrator (`isAdmin()`) or the authenticated owner of that consultation (`resource.data.userId == request.auth.uid`).
2. **Strict Identity Integrity**: Any client session setting `userId` MUST match the authenticated caller (`request.auth.uid`). Identity spoofing is completely blocked.
3. **Immutability of Historical Evidence**: Fields like `createdAt` and `userId` are strictly immutable after creation.
4. **Verified Admin Trust**: Administrative access is restricted to verified email addresses (`email_verified == true`) matching the firm's domains and designated personnel. No unverified emails can spoof administrator roles.
5. **No Blind State Transitions**: Only administrators can transition consultation status or append legal advisory notes. Any status change must follow valid states.
6. **Volumetric Protection**: Hard size limits are enforced on every string to prevent resource abuse and Denial of Wallet (DoW) attacks.

---

## 2. The "Dirty Dozen" Payloads

The following malicious payloads must be rejected by the security rules:

### Payload 1: Volumetric Poisoning (DoS)
- **Target**: `create /consultations/malicious_doc`
- **Violation**: Message content is abnormally large (e.g., 2MB) to abuse storage quota.
- **Payload**:
  ```json
  {
    "name": "Attacker",
    "email": "attacker@evil.com",
    "phone": "123",
    "practiceArea": "civil",
    "message": "A".repeat(1000000), 
    "createdAt": "request.time",
    "status": "pending"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (due to message size boundary checks <= 5000 chars).

### Payload 2: State Step Bypass / Status Hijack
- **Target**: `create /consultations/status_hijack`
- **Violation**: Setting initial status directly to `completed` or `reviewed` to skip intake screening.
- **Payload**:
  ```json
  {
    "name": "Intruder",
    "email": "intruder@evil.com",
    "phone": "555-1234",
    "practiceArea": "family",
    "message": "Bypassing the queue",
    "createdAt": "request.time",
    "status": "completed"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (creation status must strictly be `pending`).

### Payload 3: Identity Spoofing
- **Target**: `create /consultations/identity_spoof`
- **Violation**: Attempting to set `userId` to a target victim's UID to read or link their cases.
- **Payload**:
  ```json
  {
    "userId": "victim_uid_12345",
    "name": "Intruder",
    "email": "intruder@evil.com",
    "phone": "555-1234",
    "practiceArea": "family",
    "message": "Spoofing identity",
    "createdAt": "request.time",
    "status": "pending"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (if `userId` is present, it must equal `request.auth.uid`).

### Payload 4: Future/Past Temporal Manipulation
- **Target**: `create /consultations/temporal_abuse`
- **Violation**: Forging a custom client timestamp to manipulate records or escape SLA deadlines.
- **Payload**:
  ```json
  {
    "name": "Time Traveler",
    "email": "traveler@evil.com",
    "phone": "555-1234",
    "practiceArea": "civil",
    "message": "Backdating or future dating",
    "createdAt": "2030-01-01T00:00:00Z",
    "status": "pending"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (`createdAt` must exactly match `request.time`).

### Payload 5: Admin Email Spoofing (Unverified Email)
- **Target**: `get /consultations/some_intake`
- **Violation**: Trying to read confidential data with an email ending in `@olivelawchambers.com` but with `email_verified = false`.
- **Auth State**: `{ uid: "evil_admin", token: { email: "fake_admin@olivelawchambers.com", email_verified: false } }`
- **Expectation**: `PERMISSION_DENIED` (`email_verified` must be `true` for administrators).

### Payload 6: Resource Poisoning / Injection Attack
- **Target**: `create /consultations/../../malicious` or extremely long ID
- **Violation**: Path transversal or resource poisoning via document ID.
- **Payload**: Standard valid schema but targeting a non-alphanumeric or excessively large document ID.
- **Expectation**: `PERMISSION_DENIED` (ID must match `isValidId` patterns).

### Payload 7: Client Profile PII Data Leak / Unauthenticated List
- **Target**: `list /consultations`
- **Violation**: A guest/unauthenticated user tries to read all consultations.
- **Expectation**: `PERMISSION_DENIED` (guest reads are strictly forbidden).

### Payload 8: Unauthorized Client Read
- **Target**: `get /consultations/client_doc_abc`
- **Violation**: A logged-in user tries to fetch a consultation belonging to another user.
- **Auth State**: `{ uid: "other_user_uid" }`
- **Doc State**: `{ userId: "victim_user_uid", ... }`
- **Expectation**: `PERMISSION_DENIED`.

### Payload 9: Unauthorized Status Escalation
- **Target**: `update /consultations/client_doc_abc`
- **Violation**: A client attempts to update their own status to `completed` or modify notes.
- **Auth State**: `{ uid: "client_doc_abc_owner_uid" }`
- **Payload**: `{ status: "completed", notes: "Forged positive resolution notes" }`
- **Expectation**: `PERMISSION_DENIED` (only admins can execute updates).

### Payload 10: Unauthorized Notification Creation
- **Target**: `create /notifications/spam_note`
- **Violation**: Injecting notifications that bypass validation standards.
- **Payload**:
  ```json
  {
    "title": "Malicious Notification",
    "message": "Falsified system alert",
    "createdAt": "request.time",
    "read": true,
    "type": "malicious"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (initial `read` status must be `false` during user creation).

### Payload 11: Unauthorized Notification Read
- **Target**: `get /notifications/some_note`
- **Violation**: Standard user attempting to list or read system admin notifications.
- **Auth State**: `{ uid: "client_uid" }`
- **Expectation**: `PERMISSION_DENIED` (notifications are strictly restricted to admin eyes).

### Payload 12: Administrative Shadow Field Attack (Ghost Field)
- **Target**: `update /consultations/client_doc_abc`
- **Violation**: Attempting to inject a "ghost" or un-allowlisted field during an update.
- **Auth State**: `{ uid: "admin_uid", token: { email: "admin@olivelawchambers.com", email_verified: true } }`
- **Payload**:
  ```json
  {
    "status": "reviewed",
    "notes": "Advisory written.",
    "ghostField": "malicious_injection"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (update operations strictly validate keys using `hasOnly`).

---

## 3. The Test Runner Configuration

Security rules are validated locally and programmatically to ensure 100% of the above "Dirty Dozen" payloads fail. Any future rules updates must continue to satisfy these assertions.
