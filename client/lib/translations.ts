import AsyncStorage from "@react-native-async-storage/async-storage";

export type SupportedLanguage = "en" | "zu" | "xh" | "af";

const STORAGE_KEY = "@olanna_app_language";

export interface TranslationStrings {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    back: string;
    next: string;
    done: string;
    yes: string;
    no: string;
  };
  nav: {
    home: string;
    checkIn: string;
    health: string;
    learn: string;
    profile: string;
  };
  home: {
    todayIs: string;
    cycleDay: string;
    daysUntilPeriod: string;
    periodIn: string;
    days: string;
    fertileWindow: string;
    ovulationDay: string;
  };
  checkIn: {
    dailyCheckIn: string;
    howAreYouFeeling: string;
    logSymptoms: string;
    bodyMap: string;
    addNote: string;
    favorites: string;
    categories: string;
  };
  health: {
    healthModules: string;
    pcos: string;
    endometriosis: string;
    sexualHealth: string;
    cervicalScreening: string;
    aiAssistant: string;
  };
  fertility: {
    fertilityTracking: string;
    basalBodyTemp: string;
    cervicalMucus: string;
    lhTest: string;
    hormones: string;
    ovulationWindow: string;
    fertileWindow: string;
  };
  privacy: {
    privacySettings: string;
    anonymousMode: string;
    exportData: string;
    deleteData: string;
    dataSharing: string;
    offlineMode: string;
    lowDataMode: string;
  };
  insights: {
    insights: string;
    patterns: string;
    recommendations: string;
    trends: string;
    noInsightsYet: string;
    keepTracking: string;
  };
}

const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      back: "Back",
      next: "Next",
      done: "Done",
      yes: "Yes",
      no: "No",
    },
    nav: {
      home: "Home",
      checkIn: "Check-in",
      health: "Health",
      learn: "Learn",
      profile: "Profile",
    },
    home: {
      todayIs: "Today is",
      cycleDay: "Cycle Day",
      daysUntilPeriod: "days until period",
      periodIn: "Period in",
      days: "days",
      fertileWindow: "Fertile Window",
      ovulationDay: "Ovulation Day",
    },
    checkIn: {
      dailyCheckIn: "Daily Check-in",
      howAreYouFeeling: "How are you feeling today?",
      logSymptoms: "Log Symptoms",
      bodyMap: "Body Map",
      addNote: "Add Note",
      favorites: "Favorites",
      categories: "Categories",
    },
    health: {
      healthModules: "Health Modules",
      pcos: "PCOS Management",
      endometriosis: "Endometriosis Care",
      sexualHealth: "Sexual Health",
      cervicalScreening: "Cervical Screening",
      aiAssistant: "AI Health Assistant",
    },
    fertility: {
      fertilityTracking: "Fertility Tracking",
      basalBodyTemp: "Basal Body Temperature",
      cervicalMucus: "Cervical Mucus",
      lhTest: "LH/Ovulation Test",
      hormones: "Hormone Levels",
      ovulationWindow: "Ovulation Window",
      fertileWindow: "Fertile Window",
    },
    privacy: {
      privacySettings: "Privacy Settings",
      anonymousMode: "Anonymous Mode",
      exportData: "Export My Data",
      deleteData: "Delete My Data",
      dataSharing: "Data Sharing",
      offlineMode: "Offline Mode",
      lowDataMode: "Low Data Mode",
    },
    insights: {
      insights: "Insights",
      patterns: "Patterns",
      recommendations: "Recommendations",
      trends: "Trends",
      noInsightsYet: "No insights yet",
      keepTracking: "Keep tracking to discover your patterns",
    },
  },
  zu: {
    common: {
      save: "Gcina",
      cancel: "Khansela",
      delete: "Susa",
      edit: "Hlela",
      loading: "Iyalayisha...",
      error: "Iphutha",
      success: "Kuphumelele",
      back: "Emuva",
      next: "Okulandelayo",
      done: "Kuqediwe",
      yes: "Yebo",
      no: "Cha",
    },
    nav: {
      home: "Ikhaya",
      checkIn: "Bhalisa",
      health: "Ezempilo",
      learn: "Funda",
      profile: "Iphrofayela",
    },
    home: {
      todayIs: "Namuhla ku",
      cycleDay: "Usuku lwe-cycle",
      daysUntilPeriod: "izinsuku kuze kufike isikhathi",
      periodIn: "Isikhathi ngo",
      days: "izinsuku",
      fertileWindow: "Isikhathi sokukhulelwa",
      ovulationDay: "Usuku loku-ovulate",
    },
    checkIn: {
      dailyCheckIn: "Ukubhalisa kwansuku zonke",
      howAreYouFeeling: "Uzizwa kanjani namuhla?",
      logSymptoms: "Bhala izimpawu",
      bodyMap: "Imephu yomzimba",
      addNote: "Engeza inothi",
      favorites: "Ezithandwayo",
      categories: "Izigaba",
    },
    health: {
      healthModules: "Izingxenye zezempilo",
      pcos: "Ukuphathwa kwe-PCOS",
      endometriosis: "Ukunakekelwa kwe-Endometriosis",
      sexualHealth: "Impilo yezocansi",
      cervicalScreening: "Ukuhlolwa kwesibeletho",
      aiAssistant: "Umsizi wezempilo we-AI",
    },
    fertility: {
      fertilityTracking: "Ukulandelela ukutholakala kwezingane",
      basalBodyTemp: "Izinga lokushisa lomzimba",
      cervicalMucus: "Amanzi esibeletho",
      lhTest: "Ukuhlolwa kwe-LH",
      hormones: "Amazinga e-hormone",
      ovulationWindow: "Isikhathi soku-ovulate",
      fertileWindow: "Isikhathi sokukhulelwa",
    },
    privacy: {
      privacySettings: "Izilungiselelo zobumfihlo",
      anonymousMode: "Imodi engaziwa",
      exportData: "Khipha idatha yami",
      deleteData: "Susa idatha yami",
      dataSharing: "Ukwabelana ngedatha",
      offlineMode: "Imodi engaxhunyiwe",
      lowDataMode: "Imodi yedatha encane",
    },
    insights: {
      insights: "Ukuqonda",
      patterns: "Amaphethini",
      recommendations: "Izincomo",
      trends: "Izitayela",
      noInsightsYet: "Akukho ukuqonda okwamanje",
      keepTracking: "Qhubeka ulandelela ukuthola amaphethini akho",
    },
  },
  xh: {
    common: {
      save: "Gcina",
      cancel: "Rhoxisa",
      delete: "Cima",
      edit: "Hlela",
      loading: "Iyalayisha...",
      error: "Impazamo",
      success: "Impumelelo",
      back: "Emva",
      next: "Elandelayo",
      done: "Kugqityiwe",
      yes: "Ewe",
      no: "Hayi",
    },
    nav: {
      home: "Ekhaya",
      checkIn: "Bhalisela",
      health: "Impilo",
      learn: "Funda",
      profile: "Iprofayile",
    },
    home: {
      todayIs: "Namhlanje yi",
      cycleDay: "Usuku lwe-cycle",
      daysUntilPeriod: "iintsuku phambi kwexesha",
      periodIn: "Ixesha ngo",
      days: "iintsuku",
      fertileWindow: "Ixesha lokumitha",
      ovulationDay: "Usuku loku-ovulate",
    },
    checkIn: {
      dailyCheckIn: "Ukubhalisela kwemihla ngemihla",
      howAreYouFeeling: "Uziva njani namhlanje?",
      logSymptoms: "Bhala iimpawu",
      bodyMap: "Imephu yomzimba",
      addNote: "Yongeza inowuthi",
      favorites: "Ezithandwayo",
      categories: "Iindidi",
    },
    health: {
      healthModules: "Iimodyuli zempilo",
      pcos: "Ulawulo lwe-PCOS",
      endometriosis: "Ukhathalelo lwe-Endometriosis",
      sexualHealth: "Impilo yesondo",
      cervicalScreening: "Ukuvavanywa kwesibeletho",
      aiAssistant: "Umncedisi wempilo we-AI",
    },
    fertility: {
      fertilityTracking: "Ukulandelela ukuchuma",
      basalBodyTemp: "Ubushushu bomzimba",
      cervicalMucus: "Amanzi esibeletho",
      lhTest: "Uvavanyo lwe-LH",
      hormones: "Amanqanaba e-hormone",
      ovulationWindow: "Ixesha loku-ovulate",
      fertileWindow: "Ixesha lokumitha",
    },
    privacy: {
      privacySettings: "Iisetingi zobumfihlo",
      anonymousMode: "Imowudi engaziwayo",
      exportData: "Khupha idatha yam",
      deleteData: "Cima idatha yam",
      dataSharing: "Ukwabelana ngedatha",
      offlineMode: "Imowudi engaphandle kwe-intanethi",
      lowDataMode: "Imowudi yedatha ephantsi",
    },
    insights: {
      insights: "Ulwazi",
      patterns: "Iipatheni",
      recommendations: "Iingcebiso",
      trends: "Iithrendi",
      noInsightsYet: "Akukho lwazi okwangoku",
      keepTracking: "Qhubeka ulandelela ukufumana iipatheni zakho",
    },
  },
  af: {
    common: {
      save: "Stoor",
      cancel: "Kanselleer",
      delete: "Skrap",
      edit: "Wysig",
      loading: "Laai...",
      error: "Fout",
      success: "Sukses",
      back: "Terug",
      next: "Volgende",
      done: "Klaar",
      yes: "Ja",
      no: "Nee",
    },
    nav: {
      home: "Tuis",
      checkIn: "Teken in",
      health: "Gesondheid",
      learn: "Leer",
      profile: "Profiel",
    },
    home: {
      todayIs: "Vandag is",
      cycleDay: "Siklus Dag",
      daysUntilPeriod: "dae tot periode",
      periodIn: "Periode oor",
      days: "dae",
      fertileWindow: "Vrugbare Venster",
      ovulationDay: "Ovulasie Dag",
    },
    checkIn: {
      dailyCheckIn: "Daaglikse Intekenning",
      howAreYouFeeling: "Hoe voel jy vandag?",
      logSymptoms: "Teken simptome aan",
      bodyMap: "Liggaamskaart",
      addNote: "Voeg nota by",
      favorites: "Gunstelinge",
      categories: "Kategorieë",
    },
    health: {
      healthModules: "Gesondheidsmodules",
      pcos: "PCOS Bestuur",
      endometriosis: "Endometriose Sorg",
      sexualHealth: "Seksuele Gesondheid",
      cervicalScreening: "Servikale Sifting",
      aiAssistant: "KI Gesondheidsassistent",
    },
    fertility: {
      fertilityTracking: "Vrugbaarheid Opsporing",
      basalBodyTemp: "Basale Liggaamstemperatuur",
      cervicalMucus: "Servikale Mukus",
      lhTest: "LH/Ovulasie Toets",
      hormones: "Hormoonvlakke",
      ovulationWindow: "Ovulasie Venster",
      fertileWindow: "Vrugbare Venster",
    },
    privacy: {
      privacySettings: "Privaatheidinstellings",
      anonymousMode: "Anonieme Modus",
      exportData: "Voer my data uit",
      deleteData: "Skrap my data",
      dataSharing: "Data deling",
      offlineMode: "Vanlyn Modus",
      lowDataMode: "Lae Data Modus",
    },
    insights: {
      insights: "Insigte",
      patterns: "Patrone",
      recommendations: "Aanbevelings",
      trends: "Tendense",
      noInsightsYet: "Nog geen insigte nie",
      keepTracking: "Hou aan naspoor om jou patrone te ontdek",
    },
  },
};

export const languageStorage = {
  async getLanguage(): Promise<SupportedLanguage> {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEY);
      return (lang as SupportedLanguage) || "en";
    } catch {
      return "en";
    }
  },

  async setLanguage(lang: SupportedLanguage): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  },
};

export function getTranslations(lang: SupportedLanguage): TranslationStrings {
  return translations[lang] || translations.en;
}

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "zu", label: "isiZulu", native: "isiZulu" },
  { value: "xh", label: "isiXhosa", native: "isiXhosa" },
  { value: "af", label: "Afrikaans", native: "Afrikaans" },
];
