---
name: storage API
description: Correct method names on the client-side storage object
---

**Rule:** Use `storage.setUserProfile(profile)` — NOT `storage.saveUserProfile()` (doesn't exist).

**Why:** The `storage` object in `client/lib/storage.ts` exposes `setUserProfile` / `getUserProfile`. The name `saveUserProfile` does not exist and throws a runtime TypeError.

**How to apply:** Any screen that saves the user profile after onboarding should call `await storage.setUserProfile(profile)`.
