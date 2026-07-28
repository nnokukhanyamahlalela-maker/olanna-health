/**
 * Lanna's Check-In — Condition Content Layer
 *
 * All user-facing copy lives here. Edit this file to update messages,
 * explainers, and escalation text without touching any logic code.
 *
 * Tone rules (from spec):
 *  - Tier 1: casual, curious, no urgency
 *  - Tier 2: warm + informative, soft nudge
 *  - Tier 3: clear and direct (drops playful register), never fear-based
 *  - Never: diagnostic claims, shame language, guilt language
 *  - Brand voice: "It's your cycle. We just help you understand it."
 */

export type ConditionId =
  | "irregular_periods"
  | "pmos"
  | "endometriosis"
  | "menopause";

export type NudgeTier = 1 | 2 | 3;

export interface TierContent {
  /** Short headline shown on the nudge card */
  headline: string;
  /** Lanna's conversational opener (mascot speech bubble) */
  lannaMessage: string;
  /** 3–5 sentence plain-language explainer for the condition */
  explainer: string;
  /** The CTA button label */
  ctaLabel: string;
  /** Optional secondary CTA (e.g. Learn more) */
  secondaryCtaLabel?: string;
  /** Avoidance follow-up — shown if tier 2/3 user hasn't acted in postpone window */
  followUpMessage: string;
}

export interface ConditionContent {
  id: ConditionId;
  conditionName: string;
  /** Short label shown in pattern summary */
  shortLabel: string;
  tiers: Record<NudgeTier, TierContent>;
}

export const LANNA_CONDITION_CONTENT: Record<ConditionId, ConditionContent> = {
  irregular_periods: {
    id: "irregular_periods",
    conditionName: "Irregular Periods",
    shortLabel: "Cycle variation",
    tiers: {
      1: {
        headline: "Your cycle has been a bit unpredictable",
        lannaMessage:
          "Hey, I've noticed your cycles have been a bit all over the place lately — want to see what that might mean?",
        explainer:
          "It's pretty common for cycle lengths to vary by a few days from month to month. A difference of up to 7 days is usually considered normal. When cycles vary more widely — shorter than 21 days or longer than 35 days regularly — it can sometimes be worth paying attention to. Stress, travel, illness, and changes in weight can all shift your cycle temporarily. Tracking a few more cycles will give us a clearer picture.",
        ctaLabel: "Tell me more",
        secondaryCtaLabel: "Got it",
        followUpMessage:
          "Just checking in — your cycle pattern is still a bit uneven. No rush, but I'm here when you're ready to look at this together.",
      },
      2: {
        headline: "Your cycles have been irregular for a while",
        lannaMessage:
          "I've been tracking your cycle lengths and there's a pattern worth understanding. It's not alarming, but it is something worth looking into with a provider.",
        explainer:
          "Consistently irregular periods — varying by more than 7 days across multiple cycles — can sometimes point to underlying hormonal shifts. This might include thyroid changes, stress responses, or conditions like PMOS. It's not a diagnosis, just a signal worth investigating. A simple conversation with a doctor or nurse can help clarify what's happening for you specifically. The earlier you understand your pattern, the easier it is to act.",
        ctaLabel: "Find out what to ask a provider",
        secondaryCtaLabel: "Not now",
        followUpMessage:
          "Still noticing that irregular pattern. I know life gets busy — this is just a gentle reminder that I'm keeping an eye on things for you.",
      },
      3: {
        headline: "This pattern is worth discussing with a provider",
        lannaMessage:
          "Your cycle data shows a consistent irregularity over several months. This is the kind of thing a healthcare provider can help you understand and manage.",
        explainer:
          "Persistent cycle irregularity — particularly when it's been present for 3 or more months — warrants a clinical conversation. A provider can run simple hormone tests and help identify whether this is a lifestyle factor or something that needs support. This isn't an emergency, but it's genuinely worth booking an appointment. You deserve clear answers about what's happening in your body.",
        ctaLabel: "Find care near me",
        secondaryCtaLabel: "Remind me later",
        followUpMessage:
          "I haven't forgotten. Your cycle pattern is still irregular. When you're ready, finding a provider to discuss it is a good next step — and I can help you get there.",
      },
    },
  },

  pmos: {
    id: "pmos",
    conditionName: "PMOS",
    shortLabel: "PMOS indicators",
    tiers: {
      1: {
        headline: "A few symptoms caught my attention",
        lannaMessage:
          "I've noticed a handful of things you've been logging that sometimes show up together. Curious about what they might mean?",
        explainer:
          "PMOS (Polycystic Morphology Ovarian Syndrome) is a hormonal condition that affects how your ovaries work. It's one of the most common hormonal conditions — affecting around 1 in 10 women — and it often goes undiagnosed for years. Symptoms like irregular cycles, hormonal acne, excess hair, and changes in weight or energy can all point toward it. The tricky part is that these symptoms can have other causes too. Logging consistently helps build a clearer picture.",
        ctaLabel: "Learn about PMOS",
        secondaryCtaLabel: "Got it",
        followUpMessage:
          "Still noticing those symptom clusters. No pressure — just worth keeping an eye on as you keep logging.",
      },
      2: {
        headline: "Your symptoms may be pointing toward PMOS",
        lannaMessage:
          "Based on what you've been logging, there's a pattern that looks like it could be worth discussing with a provider. I can't tell you what it means — but a doctor can.",
        explainer:
          "PMOS is diagnosed through a combination of symptoms, ultrasound, and hormone blood tests — not just a single checklist. What you've been experiencing over the past few months could fit a PMOS pattern, but only a healthcare provider can confirm or rule that out. The good news is that PMOS is very manageable with the right support. Getting a diagnosis is the first step to understanding what your body needs.",
        ctaLabel: "What to tell your doctor",
        secondaryCtaLabel: "Not now",
        followUpMessage:
          "Still thinking about those PMOS-related symptoms. It's worth raising with a provider when you're ready — bringing your logged history makes the conversation much easier.",
      },
      3: {
        headline: "This pattern warrants a medical conversation",
        lannaMessage:
          "Your symptom history shows a consistent PMOS-related pattern over several months. A healthcare provider needs to evaluate this properly.",
        explainer:
          "You've been logging several PMOS-associated symptoms consistently. While only a medical professional can confirm a diagnosis, the pattern you've built up is meaningful data that a doctor or gynaecologist should see. PMOS is treatable and manageable — but it requires proper testing to guide the right approach for you. Please don't wait on this one.",
        ctaLabel: "Find a provider",
        secondaryCtaLabel: "Remind me later",
        followUpMessage:
          "I'm still tracking this for you. The PMOS pattern is still present in your logs. When you're ready, finding a provider is the most important next step.",
      },
    },
  },

  endometriosis: {
    id: "endometriosis",
    conditionName: "Endometriosis",
    shortLabel: "Pain pattern",
    tiers: {
      1: {
        headline: "Your pain patterns are worth noting",
        lannaMessage:
          "I've noticed some pain you've been logging that stands out a little. Want to understand more about what it might mean?",
        explainer:
          "Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus. It affects roughly 1 in 10 women and often takes years to diagnose. Pain — particularly pelvic pain, pain during sex, or pain during your period that feels severe — is one of the key signs. Pain varies a lot between people, so tracking the location, timing, and severity helps build a picture that's actually useful for a provider.",
        ctaLabel: "Learn about pain patterns",
        secondaryCtaLabel: "Got it",
        followUpMessage:
          "Still noticing those pain logs. No rush, but the pattern is worth keeping an eye on.",
      },
      2: {
        headline: "Your pain logs suggest something worth investigating",
        lannaMessage:
          "The pain you've been logging — how often it appears and where — is the kind of pattern that's worth discussing with a gynaecologist.",
        explainer:
          "Endometriosis pain typically escalates over time and doesn't respond well to standard pain relief. If you've been logging significant pelvic pain, pain during or after sex, or pain during bowel movements — especially if it's getting worse rather than better — a healthcare provider should know about it. Endometriosis can affect fertility and quality of life, but with the right support, it's manageable. The average diagnosis time is 7–10 years. You don't have to wait that long.",
        ctaLabel: "Find a gynaecologist",
        secondaryCtaLabel: "Not now",
        followUpMessage:
          "The pain pattern is still showing up in your logs. I know it's not easy to navigate — but talking to a provider about this is genuinely worth it.",
      },
      3: {
        headline: "This pain needs clinical attention",
        lannaMessage:
          "Your logged pain — its severity, frequency, and location — has reached the point where I think you should speak to a healthcare provider. This isn't something to keep managing alone.",
        explainer:
          "Severe or escalating pelvic pain, pain outside your period, or pain that doesn't respond to pain relief are clinical indicators that need proper evaluation. Endometriosis is progressive — early intervention matters. A gynaecologist can assess your symptoms, perform appropriate tests, and create a management plan. This appointment matters. You deserve to not be in pain.",
        ctaLabel: "Book an appointment",
        secondaryCtaLabel: "Remind me in a week",
        followUpMessage:
          "I haven't been able to stop thinking about your pain logs. Please make that appointment when you can — you've been managing this for too long without support.",
      },
    },
  },

  menopause: {
    id: "menopause",
    conditionName: "Perimenopause",
    shortLabel: "Cycle & hormonal shift",
    tiers: {
      1: {
        headline: "Your cycle might be changing",
        lannaMessage:
          "A few things you've been logging — cycle gaps, sleep changes, and some other symptoms — could be early signs of a hormonal shift. Want to understand more?",
        explainer:
          "Perimenopause is the transition period before menopause, usually beginning in your 40s (though it can start earlier). During this time, cycles often become irregular, longer, or shorter. Hot flashes, sleep disruption, and mood changes are also common. It's a completely natural process, but it can be confusing when you don't know what's happening. Tracking your symptoms through this period helps you and any provider you work with understand your experience.",
        ctaLabel: "Learn about perimenopause",
        secondaryCtaLabel: "Got it",
        followUpMessage:
          "Still noticing those cycle and symptom patterns. It's a good time to start tracking your sleep and any hot flash experiences too.",
      },
      2: {
        headline: "This looks like a perimenopause pattern",
        lannaMessage:
          "Your cycle gaps, combined with some of the other symptoms you've been logging, are consistent with the early stages of perimenopause. It's worth understanding and discussing.",
        explainer:
          "Perimenopause can last several years before periods stop entirely. Hormone levels fluctuate, which can cause irregular cycles, vasomotor symptoms (like hot flashes and night sweats), sleep disruption, and mood shifts. A healthcare provider can confirm what's happening through a simple conversation and, if needed, blood tests. There are also evidence-based options for managing symptoms if they're affecting your quality of life. You don't have to figure this out alone.",
        ctaLabel: "Talk to a provider",
        secondaryCtaLabel: "Not now",
        followUpMessage:
          "Your cycle pattern and symptoms are still consistent with perimenopause. It's worth raising with a provider — bring your logged history, it tells the story clearly.",
      },
      3: {
        headline: "This pattern warrants a conversation with your doctor",
        lannaMessage:
          "Based on your cycle gaps and symptom history, your body may be moving through a significant hormonal transition. A healthcare provider should be part of how you navigate this.",
        explainer:
          "Significant cycle gaps — 60 days or more — combined with vasomotor symptoms like hot flashes or severe sleep disruption are indicators that warrant clinical assessment. A doctor can confirm the stage you're in, discuss options for symptom management, and ensure your bone and cardiovascular health are being considered as hormone levels shift. This is a major life stage and you deserve proper support for it.",
        ctaLabel: "Find a provider",
        secondaryCtaLabel: "Remind me later",
        followUpMessage:
          "I'm still tracking this for you. Your cycle gaps and symptom pattern continue. Please consider making that appointment — this is worth proper attention.",
      },
    },
  },
};

/** Questions Lanna can use to prompt self-reflection at tier 1 */
export const LANNA_REFLECTION_PROMPTS: Record<ConditionId, string[]> = {
  irregular_periods: [
    "Has anything big changed in your life recently — stress, travel, or diet?",
    "Have you noticed any other changes alongside your cycle shifts?",
    "How long has your cycle been feeling unpredictable?",
  ],
  pmos: [
    "Have you noticed any changes to your skin, hair, or weight recently?",
    "Does fatigue feel different to you — heavier or harder to shake?",
    "Is your cycle fairly regular, or does it vary a lot?",
  ],
  endometriosis: [
    "Where does the pain tend to show up most — lower abdomen, lower back, or elsewhere?",
    "Does the pain change at different points in your cycle?",
    "Does pain relief help, or does it feel like it barely takes the edge off?",
  ],
  menopause: [
    "Have you noticed changes to your sleep — waking up hot, or just not sleeping as well?",
    "How would you describe your mood lately — steady, or more up and down?",
    "Have your cycles been getting longer or further apart?",
  ],
};
