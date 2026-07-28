/**
 * Lanna's Check-In — South African Care Directory
 *
 * Stubbed with representative data. Replace entries with live directory
 * data or a backend API call when available. The structure is intentionally
 * flat so it can be driven from a CMS or remote JSON without code changes.
 *
 * Deep-link strategy:
 *  - `bookingUrl`: opens in-app browser (WebView) or OS browser
 *  - `phoneNumber`: taps to call via `tel:` scheme
 *  - `whatsapp`: opens WhatsApp chat via `https://wa.me/` link
 */

export type CareProviderType =
  | "public_clinic"
  | "private_gp"
  | "gynaecologist"
  | "telehealth"
  | "support_org"
  | "pharmacy_clinic";

export type ConditionFocus =
  | "irregular_periods"
  | "pmos"
  | "endometriosis"
  | "menopause"
  | "general";

export interface CareProvider {
  id: string;
  name: string;
  type: CareProviderType;
  description: string;
  /** Which conditions this provider is especially relevant for */
  conditions: ConditionFocus[];
  /** Whether this option is free or low-cost */
  isFreeOrLowCost: boolean;
  /** Whether available nationally (vs specific region) */
  isNational: boolean;
  region?: string;
  bookingUrl?: string;
  phoneNumber?: string;
  whatsapp?: string;
  /** Cost note shown to user */
  costNote: string;
  /** Badge shown on card (e.g. "Free", "Telehealth", "Open now") */
  badge?: string;
}

export const CARE_DIRECTORY: CareProvider[] = [
  // ── Telehealth ──────────────────────────────────────────────────────────────
  {
    id: "hello-doctor",
    name: "Hello Doctor",
    type: "telehealth",
    description:
      "24/7 telehealth consultations with South African-registered doctors via app or WhatsApp. No appointment needed for most consultations.",
    conditions: ["general", "irregular_periods", "pmos", "menopause"],
    isFreeOrLowCost: false,
    isNational: true,
    bookingUrl: "https://hellodoctor.co.za",
    whatsapp: "https://wa.me/27860436633",
    costNote: "From R85 per consultation",
    badge: "Telehealth",
  },
  {
    id: "dr-connect",
    name: "DrConnect",
    type: "telehealth",
    description:
      "Video and chat consultations with doctors and specialists, including gynaecologists. Available via the DrConnect app.",
    conditions: ["general", "pmos", "endometriosis", "menopause"],
    isFreeOrLowCost: false,
    isNational: true,
    bookingUrl: "https://drconnect.co.za",
    costNote: "From R250 per specialist consultation",
    badge: "Telehealth",
  },
  {
    id: "medihelp-telemedicine",
    name: "Medihelp Telemedicine",
    type: "telehealth",
    description:
      "For Medihelp members: free telemedicine consultations available through the Medihelp app.",
    conditions: ["general", "irregular_periods", "pmos"],
    isFreeOrLowCost: true,
    isNational: true,
    bookingUrl: "https://www.medihelp.co.za",
    costNote: "Free for Medihelp members",
    badge: "Free for members",
  },

  // ── Public Clinics ──────────────────────────────────────────────────────────
  {
    id: "public-clinic-general",
    name: "Government Health Clinics",
    type: "public_clinic",
    description:
      "Primary healthcare clinics operated by the Department of Health provide free reproductive health consultations. Bring your ID and clinic card.",
    conditions: ["general", "irregular_periods", "pmos", "endometriosis"],
    isFreeOrLowCost: true,
    isNational: true,
    bookingUrl: "https://www.health.gov.za/clinic-finder/",
    phoneNumber: "0800 029 999",
    costNote: "Free for all South African citizens",
    badge: "Free",
  },
  {
    id: "groote-schuur-gyn",
    name: "Groote Schuur Gynaecology Clinic",
    type: "gynaecologist",
    description:
      "Public gynaecology outpatient clinic at Groote Schuur Hospital. Referral from a GP or clinic typically required.",
    conditions: ["endometriosis", "pmos", "irregular_periods"],
    isFreeOrLowCost: true,
    isNational: false,
    region: "Cape Town",
    phoneNumber: "+27 21 404 9111",
    costNote: "Free with referral letter",
    badge: "Public hospital",
  },
  {
    id: "charlotte-maxeke-gyn",
    name: "Charlotte Maxeke Gynaecology Clinic",
    type: "gynaecologist",
    description:
      "Gynaecology outpatient services at Charlotte Maxeke Johannesburg Academic Hospital. Referral required.",
    conditions: ["endometriosis", "pmos", "irregular_periods", "menopause"],
    isFreeOrLowCost: true,
    isNational: false,
    region: "Johannesburg",
    phoneNumber: "+27 11 488 3911",
    costNote: "Free with referral letter",
    badge: "Public hospital",
  },

  // ── Support Organisations ──────────────────────────────────────────────────
  {
    id: "endosa",
    name: "Endometriosis South Africa (ENDOSA)",
    type: "support_org",
    description:
      "Non-profit support and advocacy organisation for women with endometriosis in South Africa. Offers peer support, information, and clinic referrals.",
    conditions: ["endometriosis"],
    isFreeOrLowCost: true,
    isNational: true,
    bookingUrl: "https://www.endosa.co.za",
    phoneNumber: "+27 11 791 0498",
    costNote: "Free support and information",
    badge: "Support org",
  },
  {
    id: "pcos-sa",
    name: "PCOS Support SA",
    type: "support_org",
    description:
      "Community support group for women navigating PMOS/PCOS in South Africa. Peer connections, information evenings, and provider recommendations.",
    conditions: ["pmos"],
    isFreeOrLowCost: true,
    isNational: true,
    bookingUrl: "https://www.pcossupport.co.za",
    costNote: "Free community support",
    badge: "Support org",
  },
  {
    id: "she-conquers",
    name: "She Conquers Campaign",
    type: "support_org",
    description:
      "Government-backed health initiative for young South African women, covering reproductive health, family planning, and access to care.",
    conditions: ["general", "irregular_periods"],
    isFreeOrLowCost: true,
    isNational: true,
    bookingUrl: "https://www.sheconquers.org.za",
    costNote: "Free resources and referrals",
    badge: "Free",
  },

  // ── Pharmacy Clinics ────────────────────────────────────────────────────────
  {
    id: "clicks-clinic",
    name: "Clicks Clinic",
    type: "pharmacy_clinic",
    description:
      "Walk-in clinic nurses at Clicks stores across South Africa can provide initial health assessments and referrals for reproductive health concerns.",
    conditions: ["general", "irregular_periods"],
    isFreeOrLowCost: false,
    isNational: true,
    bookingUrl: "https://www.clicks.co.za/clinic",
    costNote: "From R80 for nurse consultation",
    badge: "Walk-in",
  },
  {
    id: "dischem-clinic",
    name: "Dis-Chem Pharmacy Clinic",
    type: "pharmacy_clinic",
    description:
      "In-store nurse consultations available at most Dis-Chem branches. Can assist with initial screening and GP referrals.",
    conditions: ["general", "irregular_periods"],
    isFreeOrLowCost: false,
    isNational: true,
    bookingUrl: "https://www.dischem.co.za/clinic",
    costNote: "From R75 for nurse consultation",
    badge: "Walk-in",
  },
];

/** Get providers most relevant for a given condition, sorted by accessibility */
export function getProvidersForCondition(
  conditionId: string,
  preferFreeOnly = false
): CareProvider[] {
  return CARE_DIRECTORY.filter((p) => {
    const matchesCondition =
      p.conditions.includes(conditionId as ConditionFocus) ||
      p.conditions.includes("general");
    const matchesCost = preferFreeOnly ? p.isFreeOrLowCost : true;
    return matchesCondition && matchesCost;
  }).sort((a, b) => {
    // Telehealth first (most accessible), then support orgs, then clinics
    const order: CareProviderType[] = [
      "telehealth",
      "support_org",
      "pharmacy_clinic",
      "public_clinic",
      "private_gp",
      "gynaecologist",
    ];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });
}

/** Get just telehealth options (fastest path to care) */
export function getTelehealthProviders(): CareProvider[] {
  return CARE_DIRECTORY.filter((p) => p.type === "telehealth");
}
