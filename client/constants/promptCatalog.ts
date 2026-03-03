export interface Prompt {
  id: string;
  title: string;
  userFacing: string;
}

export const PROMPTS: Prompt[] = [
  {
    id: "phase_today",
    title: "What phase am I in?",
    userFacing: "What phase am I in today and what's typical?",
  },
  {
    id: "symptom_normal",
    title: "Is this symptom normal?",
    userFacing: "Is my symptom normal for this phase of my cycle?",
  },
  {
    id: "late_period",
    title: "Why is my period late?",
    userFacing: "What are common reasons a period is late?",
  },
  {
    id: "cramps_help",
    title: "Help with my cramps",
    userFacing: "What can cause cramps and what can I do today?",
  },
  {
    id: "pcos_basics",
    title: "PCOS basics",
    userFacing: "Explain PCOS signs, how it's diagnosed, and what to track.",
  },
  {
    id: "doctor_when",
    title: "When should I see a doctor?",
    userFacing: "What are red flags and when should I seek medical care?",
  },
];
