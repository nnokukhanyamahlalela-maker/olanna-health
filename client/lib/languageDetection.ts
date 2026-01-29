export type SupportedLanguage = "en" | "zu" | "af" | "st" | "xh" | "ss";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", greeting: "Hello" },
  { code: "zu", name: "isiZulu", nativeName: "isiZulu", greeting: "Sawubona" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", greeting: "Hallo" },
  { code: "st", name: "Sesotho", nativeName: "Sesotho", greeting: "Dumela" },
  { code: "xh", name: "isiXhosa", nativeName: "isiXhosa", greeting: "Molo" },
  { code: "ss", name: "siSwati", nativeName: "siSwati", greeting: "Sawubona" },
];

export function getLanguageByCode(code: SupportedLanguage): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

export function getWelcomeMessage(language: SupportedLanguage): string {
  switch (language) {
    case "zu":
      return "Sawubona! Ngingu-assistant wakho we-Olanna Health. Ngingakusiza ngemibuzo mayelana nempilo yabesifazane, PCOS, endometriosis, impilo yocansi, nempilo jikelele.\n\nSicela uqaphele: Nginikeza ulwazi olujwayelekile lwezempilo kuphela futhi angithathi indawo yezeluleko zezokwelashwa zochwepheshe.";
    
    case "af":
      return "Hallo! Ek is jou Olanna Health-assistent. Ek kan vrae beantwoord oor menstruele gesondheid, vrugbaarheid, PCOS, endometriose, seksuele gesondheid en welstand.\n\nLet asseblief: Ek verskaf slegs algemene gesondheidsinligting en vervang nie professionele mediese advies nie.";
    
    case "st":
      return "Dumela! Ke mothusi wa hao wa Olanna Health. Nka o thusa ka dipotso mabapi le bophelo bo botle ba basadi, ho tswala, PCOS, endometriosis, bophelo bo botle ba thobalano, le boitekanelo.\n\nHlokomela: Ke fana ka tlhahisoleseding e akaretsang ya bophelo bo botle feela mme ha ke nke sebaka sa keletso ya bongaka.";
    
    case "xh":
      return "Molo! Ndingu-assistant wakho we-Olanna Health. Ndingakunceda ngemibuzo malunga nempilo yabasetyhini, ukuzala, i-PCOS, i-endometriosis, impilo yesondo, kunye nempilo.\n\nQaphela: Ndinika ulwazi olunxulumene nempilo kuphela kwaye andithathi indawo yengcebiso yezonyango zobungcali.";
    
    case "ss":
      return "Sawubona! Ngingu-assistant wakho we-Olanna Health. Ngingakusita ngemibuto mayelana nempilo yabesifazane, kutala, PCOS, endometriosis, impilo yetilwane, nempilo.\n\nCaphela: Nginiketa lwati lolubanzi lwempilo kuphela futsi angitatseli sikhundla seluleko lwetekwelashwa kwabobungcotfo.";
    
    default:
      return "Hello! I'm your Olanna Health assistant. I can answer questions about menstrual health, fertility, PCOS, endometriosis, sexual health, and wellness.\n\nPlease note: I provide general health information only and don't replace professional medical advice.";
  }
}

export function getSafetyMessage(language: SupportedLanguage): string {
  switch (language) {
    case "zu":
      return "Uma izimpawu zinzima noma ziqala ngokuzumayo, sicela ufune usizo lwezokwelashwa ngokushesha.";
    case "af":
      return "As simptome ernstig is of skielik begin, soek asseblief dringend mediese sorg.";
    case "st":
      return "Haeba matshwao a le matla kapa a qala ka potlako, re kopa o batle thuso ya bongaka ka potlako.";
    case "xh":
      return "Ukuba iimpawu zibingelela okanye ziqala ngequbuliso, nceda ufune uncedo lwezonyango ngokukhawuleza.";
    case "ss":
      return "Uma timpawu tikahle noma tichala ngekusheshisa, sicela ufunane lusito lwekwelapha ngekushesha.";
    default:
      return "If symptoms are severe or sudden, please seek urgent medical care.";
  }
}

export function getThinkingMessage(language: SupportedLanguage): string {
  switch (language) {
    case "zu": return "Ngicabanga...";
    case "af": return "Ek dink...";
    case "st": return "Ke nahana...";
    case "xh": return "Ndicinga...";
    case "ss": return "Ngicabanga...";
    default: return "Thinking...";
  }
}

export function getPlaceholder(language: SupportedLanguage): string {
  switch (language) {
    case "zu": return "Buza umbuzo wezempilo...";
    case "af": return "Vra 'n gesondheidsvraag...";
    case "st": return "Botsa potso ea bophelo bo botle...";
    case "xh": return "Buza umbuzo wempilo...";
    case "ss": return "Buta umbuto wempilo...";
    default: return "Ask a health question...";
  }
}

export function getErrorMessage(language: SupportedLanguage): string {
  switch (language) {
    case "zu": return "Ngiyaxolisa, kunenkinga. Sicela uzame futhi.";
    case "af": return "Jammer, daar was 'n probleem. Probeer asseblief weer.";
    case "st": return "Tshoarelo, ho na le bothata. Ka kopo leka hape.";
    case "xh": return "Uxolo, kukho ingxaki. Nceda uzame kwakhona.";
    case "ss": return "Ngiyacolisa, kunenkinga. Sicela utame futsi.";
    default: return "I'm sorry, there was an issue. Please try again.";
  }
}

export function getDisclaimer(language: SupportedLanguage): string {
  switch (language) {
    case "zu": return "Lo msizi we-AI unikeza ulwazi olujwayelekile kuphela.";
    case "af": return "Hierdie KI verskaf slegs algemene gesondheidsinligting.";
    case "st": return "Mothusi ona wa AI o fana ka tlhahisoleseding e akaretsang feela.";
    case "xh": return "Lo mcedisi we-AI unika ulwazi olunxulumene nempilo kuphela.";
    case "ss": return "Lomsiti we-AI uniketa lwati lolubanzi kuphela.";
    default: return "This AI provides general health information only.";
  }
}

const SYMPTOM_KEYWORDS = [
  "pain", "bleeding", "cramp", "dizzy", "faint", "emergency", "severe", "hospital",
  "buhlungu", "ubuhlungu", "igazi", "isiyezi", "pijn", "bloeding", "bohloko", "madi",
  "iintlungu", "ukophela", "buhlungu", "kuvuva"
];

export function containsSymptomKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SYMPTOM_KEYWORDS.some(keyword => lowerText.includes(keyword));
}
