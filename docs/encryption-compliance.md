# Olanna Health — Export Compliance & Encryption Documentation

**App Name:** Olanna Health
**Bundle Identifier:** com.olannahealth.app
**Developer:** Olanna Health
**Contact:** admin@olanna.health
**Document Date:** March 4, 2026
**Document Version:** 1.0

---

## 1. Purpose

This document provides a formal record of encryption usage within the Olanna Health iOS application, in compliance with the U.S. Export Administration Regulations (EAR) administered by the Bureau of Industry and Security (BIS). It supports the self-classification exemption declaration submitted through Apple App Store Connect.

---

## 2. ECCN Classification

**ECCN:** 5D992
**License Exception:** ENC (Section 740.17(b)(1))
**Classification Basis:** Mass-market software using standard encryption for authentication, data protection, and secure communication — no proprietary or non-standard cryptographic algorithms.

---

## 3. Encryption Usage Summary

Olanna Health uses encryption exclusively through standard, platform-provided mechanisms. The app does not implement any custom or proprietary encryption algorithms.

### 3.1 HTTPS / TLS (Transport Layer Security)

- **Purpose:** Secure communication between the mobile client and the backend server.
- **Implementation:** All API requests use HTTPS via the standard iOS networking stack. The API base URL enforces HTTPS protocol.
- **Standard:** TLS 1.2 / 1.3 (managed by the iOS operating system).
- **Relevant File:** `client/lib/query-client.ts` — `getApiUrl()` constructs HTTPS URLs for all server communication.

### 3.2 iOS Keychain via expo-secure-store

- **Purpose:** Encrypted local storage of sensitive health data (user profile, cycle data, daily logs).
- **Implementation:** The app uses `expo-secure-store`, which delegates to the iOS Keychain Services API. Data is encrypted at rest using AES-256 encryption managed entirely by iOS.
- **Data Stored:** User profile information, menstrual cycle data, daily health logs, and app preferences.
- **Chunking:** Data exceeding the 2KB SecureStore limit is automatically split into chunks, each individually encrypted by the Keychain.
- **Fallback:** On web (development only), AsyncStorage is used as an unencrypted fallback. Production iOS builds always use SecureStore.
- **Relevant File:** `client/lib/secureStorage.ts`

### 3.3 API Key Authentication

- **Purpose:** Authenticate API requests to protected server endpoints.
- **Implementation:** The client sends the `SESSION_SECRET` value in the `x-api-key` HTTP header. The server validates this header against the stored environment variable. This is a simple string comparison, not a cryptographic operation, but it is transmitted over TLS (see 3.1).
- **Relevant File:** `server/middleware/apiAuth.ts`

### 3.4 SHA-256 Hashing (Partner Mode)

- **Purpose:** Secure storage of partner invite codes.
- **Implementation:** 6-character invite codes are hashed using SHA-256 (via Node.js built-in `crypto` module) before storage in the database. This is a one-way hash — invite codes cannot be recovered from the stored hash.
- **Standard:** SHA-256, a FIPS 180-4 compliant algorithm provided by the Node.js runtime.
- **Relevant File:** `server/partnerSharedView.ts`

### 3.5 Partner Token Generation

- **Purpose:** Generate secure authentication tokens for linked partners.
- **Implementation:** 48-byte cryptographically random tokens generated using Node.js `crypto.randomBytes()`. Tokens are stored server-side and validated via the `x-partner-token` HTTP header.
- **Standard:** OS-level CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) via Node.js `crypto` module.

---

## 4. Encryption the App Does NOT Use

- No proprietary or custom encryption algorithms
- No encryption algorithms that are not accepted as international standards
- No encryption for the purpose of obscuring app functionality
- No encryption beyond what is necessary for authentication, secure communication, and local data protection
- No government-classified or restricted encryption technology

---

## 5. Apple App Store Connect — Export Compliance Answers

When submitting through App Store Connect, the following answers apply:

| Question | Answer |
|----------|--------|
| Does your app use encryption? | **Yes** |
| Does your app qualify for any of the exemptions provided in Category 5, Part 2 of the U.S. Export Administration Regulations? | **Yes** |
| Does your app implement any encryption algorithms that are proprietary or not accepted as international standards? | **No** |
| Does your app use encryption only for calling the operating system's built-in encryption, authentication, digital signing, HTTPS/TLS, or the use of encryption functionality limited to operating system or platform provided services? | **Yes** |

---

## 6. Exemption Justification

Olanna Health qualifies for the EAR exemption under **Note 4 to Category 5, Part 2** and **Section 740.17(b)(1)** because:

1. **All encryption is standard and platform-provided.** The app relies exclusively on iOS Keychain (AES-256), TLS 1.2/1.3, SHA-256, and OS-level CSPRNG — all internationally recognized standards.

2. **No custom cryptographic implementations.** The app does not contain any self-developed encryption code. All cryptographic operations are performed by the iOS operating system, the Node.js runtime, or standard libraries.

3. **Encryption serves only permitted purposes.** All encryption usage falls within the categories of: secure communication (HTTPS), authentication (API keys, partner tokens), data protection at rest (Keychain), and integrity verification (SHA-256 hashing).

4. **The app is a mass-market consumer application.** Olanna Health is a consumer health and wellness application available to the general public, with no restricted distribution.

---

## 7. Compliance Declaration

I hereby declare that the information provided in this document is accurate and complete. Olanna Health uses encryption solely through standard, platform-provided mechanisms for the purposes of secure communication, authentication, and local data protection. The application qualifies for the mass-market encryption exemption under the U.S. Export Administration Regulations.

**Signed:** ____________________________

**Name:** ____________________________

**Title:** ____________________________

**Date:** ____________________________

---

## 8. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 4, 2026 | Initial document |
