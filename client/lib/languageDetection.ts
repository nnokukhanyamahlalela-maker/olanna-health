export type LanguageMode = "auto" | "en" | "zu";
export type DetectedLanguage = "en" | "zu";

const ISIZULU_MARKERS = [
  "ngiy",
  "ngicela",
  "sawubona",
  "unjani",
  "ngikhathazekile",
  "ubuhlungu",
  "izinsuku",
  "umjikelezo",
  "ukuya",
  "esikhathini",
  "igazi",
  "namuhla",
  "kusasa",
  "ngabe",
  "yebo",
  "cha",
  "kakhulu",
  "kancane",
  "phesheya",
  "lapha",
  "ngingakusiza",
  "ngifuna",
  "ngithanda",
  "usizo",
  "lwezempilo",
  "izimpawu",
  "umkhuhlane",
  "ngikhulelwe",
  "ngiyawa",
  "eliningi",
  "obukhulu",
];

const ENGLISH_SYMPTOM_KEYWORDS = [
  "bleeding heavy",
  "heavy bleeding",
  "severe pain",
  "faint",
  "fainting",
  "pregnant",
  "pregnancy",
  "fever",
  "emergency",
  "urgent",
];

const ZULU_SYMPTOM_KEYWORDS = [
  "igazi eliningi",
  "ubuhlungu obukhulu",
  "ngiyawa",
  "ngikhulelwe",
  "umkhuhlane",
  "ukusheshe",
  "ngokushesha",
];

export function detectLanguage(text: string, lastDetectedLanguage?: DetectedLanguage): DetectedLanguage {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  if (words.length < 3 && lastDetectedLanguage) {
    return lastDetectedLanguage;
  }

  for (const marker of ISIZULU_MARKERS) {
    if (lowerText.includes(marker.toLowerCase())) {
      return "zu";
    }
  }

  return "en";
}

export function containsSymptomKeywords(text: string, language: DetectedLanguage): boolean {
  const lowerText = text.toLowerCase();
  
  if (language === "en") {
    return ENGLISH_SYMPTOM_KEYWORDS.some(keyword => lowerText.includes(keyword));
  } else {
    return ZULU_SYMPTOM_KEYWORDS.some(keyword => lowerText.includes(keyword));
  }
}

export function getSafetyMessage(language: DetectedLanguage): string {
  if (language === "zu") {
    return "Uma izimpawu zinzima noma ziqala ngokuzumayo, sicela ufune usizo lwezokwelashwa ngokushesha.";
  }
  return "If symptoms are severe or sudden, please seek urgent medical care.";
}

export function getLanguageDisplayName(language: DetectedLanguage | "auto"): string {
  switch (language) {
    case "en":
      return "English";
    case "zu":
      return "isiZulu";
    case "auto":
      return "Auto";
  }
}

export function getWelcomeMessage(language: DetectedLanguage): string {
  if (language === "zu") {
    return "Sawubona! Ngingu-assistant wakho we-Olanna Health. Ngingakusiza ngemibuzo mayelana nempilo yabesifazane, PCOS, endometriosis, impilo yocansi, nempilo jikelele.\n\nSicela uqaphele: Nginikeza ulwazi olujwayelekile lwezempilo kuphela futhi angithathi indawo yezeluleko zezokwelashwa zochwepheshe.";
  }
  return "Hello! I'm your Olanna Health assistant. I can answer questions about menstrual health, PCOS, endometriosis, sexual health, and wellness. How can I help you today?\n\nPlease note: I provide general health information only and don't replace professional medical advice.";
}
