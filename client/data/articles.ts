export interface ArticleSection {
  type: "heading" | "subheading" | "paragraph" | "bullets" | "quote" | "disclaimer";
  content: string;
  items?: string[];
}

export interface ArticleReference {
  number: number;
  text: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  category: string;
  topic: string;
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
  imageSource?: any;
  sections: ArticleSection[];
  references: ArticleReference[];
}

export const TOPIC_CATEGORIES = [
  {
    id: "periods-101",
    label: "Periods 101",
    description: "Your cycle explained, clearly and simply",
    icon: "droplet" as const,
    color: "#D4A090",
  },
  {
    id: "pcos",
    label: "PCOS",
    description: "Understanding and managing polycystic ovarian syndrome",
    icon: "activity" as const,
    color: "#B8C4B8",
  },
  {
    id: "endometriosis",
    label: "Endometriosis",
    description: "Everything you need to know about endo",
    icon: "heart" as const,
    color: "#C8C0D0",
  },
] as const;

export const articles: Article[] = [
  {
    id: "4",
    slug: "whats-in-your-period-pad",
    title: "What\u2019s Really in Your Period Pad? And What Can We Use Instead?",
    subtitle: "The product that sits against one of the most absorbent parts of your body for days every month \u2014 and we rarely question what\u2019s inside it.",
    summary: "A recent South African study found hormone-disrupting chemicals in period pads. Here is what you need to know \u2014 and safer alternatives to consider.",
    category: "Periods",
    topic: "periods-101",
    author: "Olanna Editorial",
    date: "2 March 2026",
    readTime: "6 min",
    featured: true,
    imageSource: require("@/assets/images/articles/period-products-featured.jpeg"),
    sections: [
      {
        type: "paragraph",
        content: "For years, most of us have never questioned what is inside our period pads.",
      },
      {
        type: "paragraph",
        content: "We check ingredients on our skincare. We avoid parabens in shampoo. We debate seed oils in our food.",
      },
      {
        type: "paragraph",
        content: "But the product that sits against one of the most absorbent parts of our body for days every single month? That, we rarely question.",
      },
      {
        type: "heading",
        content: "The Study That Changed the Conversation",
      },
      {
        type: "paragraph",
        content: "A recent study conducted by researchers at the University of the Free State revealed that multiple sanitary pad and pantyliner brands sold in South Africa contained endocrine-disrupting chemicals (EDCs), including phthalates, parabens, and bisphenols. These chemicals are known to interfere with hormone function and have been linked in broader research to reproductive health concerns.",
      },
      {
        type: "paragraph",
        content: "While the concentrations detected were low, the concern lies in repeated exposure \u2014 month after month, year after year \u2014 on highly absorbent vaginal tissue.",
      },
      {
        type: "paragraph",
        content: "And here is the uncomfortable truth: menstrual product ingredients are not required to be fully disclosed on packaging.",
      },
      {
        type: "heading",
        content: "Why This Matters",
      },
      {
        type: "paragraph",
        content: "Period poverty is a global reality. Many girls and women rely on the most affordable disposable products available \u2014 and when ingredient transparency is limited, those with the fewest options often carry the highest exposure risk.",
      },
      {
        type: "paragraph",
        content: "Add to that rising rates of hormonal disorders like PCOS, endometriosis, and infertility \u2014 and it becomes clear that menstrual health deserves far more scrutiny than it currently receives.",
      },
      {
        type: "paragraph",
        content: "This is not about fear. It is about informed choice.",
      },
      {
        type: "heading",
        content: "So What Can We Use Instead?",
      },
      {
        type: "paragraph",
        content: "Fortunately, there are safer, more sustainable alternatives widely available \u2014 including across Southern Africa. The right option depends on your lifestyle, budget, comfort level, and access to water.",
      },
      {
        type: "subheading",
        content: "1. Reusable Cloth Pads",
      },
      {
        type: "paragraph",
        content: "Modern reusable pads are absorbent, breathable, and designed to last up to five years with proper care. Brands like Palesa Pads offer locally produced options that reduce both waste and long-term costs.",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Pros: Eco-friendly, cost-effective over time, minimal chemical exposure",
          "Cons: Require washing and drying; access to clean water is important",
        ],
      },
      {
        type: "subheading",
        content: "2. Antimicrobial Reusable Pads",
      },
      {
        type: "paragraph",
        content: "Products like Safepad use permanently bonded antimicrobial technology that reduces bacterial growth and can be washed even in low-resource settings.",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Pros: Long lifespan (up to five years), suitable for limited water access",
          "Cons: Higher upfront cost than disposable pads",
        ],
      },
      {
        type: "subheading",
        content: "3. Menstrual Cups",
      },
      {
        type: "paragraph",
        content: "Made from medical-grade silicone, menstrual cups collect rather than absorb blood. Brands like Mina Cup are locally available and can last up to five years.",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Pros: No disposable waste, lower long-term cost, preserves natural vaginal moisture",
          "Cons: Learning curve for insertion; requires sterilisation between cycles",
        ],
      },
      {
        type: "subheading",
        content: "4. Period Underwear",
      },
      {
        type: "paragraph",
        content: "Period panties from brands like Miss Ruby and Blushproof contain built-in absorbent layers and can be worn for up to 12 hours depending on flow.",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Pros: Comfortable, discreet, reusable for years",
          "Cons: Requires washing; higher initial purchase price",
        ],
      },
      {
        type: "subheading",
        content: "5. Organic and Biodegradable Disposable Pads",
      },
      {
        type: "paragraph",
        content: "If you prefer disposables, look for brands made from 100% organic cotton and plant-based materials, free from added fragrances and dyes. Options like ANNA Pure Organic are available in major South African retailers.",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Pros: Lower chemical exposure, more breathable materials",
          "Cons: Still single-use; slightly more expensive than mainstream pads",
        ],
      },
      {
        type: "subheading",
        content: "6. Menstrual Discs",
      },
      {
        type: "paragraph",
        content: "Menstrual discs sit higher in the vaginal canal and can be worn for up to 12 hours. Some reusable versions are available.",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Pros: Long wear time; suitable for heavy flow",
          "Cons: Insertion and removal require practice; not as widely available locally",
        ],
      },
      {
        type: "heading",
        content: "Where to Find These Products",
      },
      {
        type: "paragraph",
        content: "Many of these products are available online and in pharmacies and health stores globally. In Southern Africa, you will find options at Clicks, Dischem, Checkers, Pick n Pay, and online platforms like Takealot and Faithful to Nature. NGOs and community initiatives also distribute reusable pads and menstrual cups in schools and underserved communities.",
      },
      {
        type: "heading",
        content: "The Bigger Conversation",
      },
      {
        type: "paragraph",
        content: "Discovering that period products may contain hormone-disrupting chemicals can feel unsettling. But this moment is also empowering.",
      },
      {
        type: "paragraph",
        content: "We deserve ingredient transparency. We deserve regulation that prioritises women\u2019s health. And we deserve options that align with our bodies, our values, and our budgets.",
      },
      {
        type: "paragraph",
        content: "Your period is not a luxury. It is not a trend. It is a biological process that happens roughly 450 times in a lifetime.",
      },
      {
        type: "paragraph",
        content: "The products we use during that time should be as safe as possible.",
      },
      {
        type: "paragraph",
        content: "At Olanna Health, we believe menstrual health is foundational health. And informed women make powerful choices.",
      },
      {
        type: "disclaimer",
        content: "This article is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider regarding any medical condition or treatment.",
      },
    ],
    references: [
      { number: 1, text: "University of the Free State. Endocrine-disrupting chemicals in sanitary pads and pantyliners sold in South Africa. 2024." },
      { number: 2, text: "UNFPA. Menstrual Health Management in East and Southern Africa: A Review Paper. 2018." },
      { number: 3, text: "Sumpter JP, Johnson AC. Endocrine disruption: Causes and consequences in aquatic environments. 2008." },
      { number: 4, text: "Madwantsi V. Understanding menorrhagia: the significant effects of heavy periods on South African women. IOL. 2025." },
      { number: 5, text: "Crankshaw T et al. Menstrual health management and schooling experience amongst female learners in South Africa. 2020." },
      { number: 6, text: "Palesa Pads. About our reusable menstrual products. 2024." },
      { number: 7, text: "Faithful to Nature. Sustainable menstrual product guide. 2024." },
    ],
  },
  {
    id: "1",
    slug: "irregular-periods-health-signal",
    title: "We Should All Be Worried About Irregular Periods",
    subtitle: "Because your cycle is not just a monthly guest \u2014 it is a whole conversation your body is trying to have with you.",
    summary: "Irregular periods are a health signal, not a personality trait. Learn what they mean for African and South African women, and when to seek help.",
    category: "Periods",
    topic: "periods-101",
    author: "Olanna Editorial",
    date: "8 December 2025",
    readTime: "8 min",
    featured: false,
    imageSource: require("@/assets/images/articles/irregular-periods-hero.png"),
    sections: [
      {
        type: "heading",
        content: "Let\u2019s be honest...",
      },
      {
        type: "paragraph",
        content: "If you grew up in a Black or African household, you probably learned very quickly that periods are \u201Cjust something women go through.\u201D Pain? Normal. Heavy flow? Normal. Skipping a month? \u201CAh, your body is just adjusting.\u201D",
      },
      {
        type: "paragraph",
        content: "Doctors dismiss you, aunties minimise you, and Google confuses you. But here is the truth: no one taught us.",
      },
      {
        type: "paragraph",
        content: "Irregular periods are not a personality trait. They are a health signal. And we need to take them seriously.",
      },
      {
        type: "paragraph",
        content: "Your cycle is one of the most honest storytellers your body has \u2014 every late period, every skipped month, every random spotting session is your hormones trying to send you a message. Understanding these signals empowers you to take control of your health.",
      },
      {
        type: "heading",
        content: "1. Globally: What the world already knows",
      },
      {
        type: "paragraph",
        content: "Worldwide, an estimated 14\u201325% of women of reproductive age experience irregular menstrual cycles. That is up to one in four women.",
      },
      {
        type: "paragraph",
        content: "The Apple Women\u2019s Health Study, run with Harvard T.H. Chan School of Public Health, found that women with persistently irregular cycles have a higher risk of:",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Heart disease and heart attacks",
          "Stroke",
          "High blood pressure",
          "Type 2 diabetes",
          "Hormonal conditions like PCOS",
          "Fertility challenges",
          "Mood changes, including depression and fatigue",
        ],
      },
      {
        type: "quote",
        content: "Professional bodies like the American College of Obstetricians and Gynecologists now explicitly describe the menstrual cycle as a vital sign \u2014 just like heart rate or blood pressure.",
      },
      {
        type: "heading",
        content: "2. Across Africa: The burden hits different",
      },
      {
        type: "paragraph",
        content: "Across multiple African countries, menstrual irregularities among adolescents are estimated to range between 12.5% and 55%. That is a massive spread, shaped by differences in context, nutrition, and healthcare access.",
      },
      {
        type: "paragraph",
        content: "The real culprits often look like this:",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Chronic stress",
          "Low sleep and overwork",
          "Period stigma and silence",
          "Food insecurity and anaemia",
          "Limited access to reproductive healthcare",
          "Side-effects of contraception that are not properly explained",
        ],
      },
      {
        type: "paragraph",
        content: "A recent narrative review found that 10\u201330% of African women experience heavy menstrual bleeding \u2014 the kind that leaves you dizzy, exhausted, and constantly calculating how many pads you will need to survive the day.",
      },
      {
        type: "heading",
        content: "3. South Africa: Our menstrual health story",
      },
      {
        type: "paragraph",
        content: "As South African women, we deserve data that actually reflects our lives \u2014 our languages, our schools, our clinics, our stress.",
      },
      {
        type: "subheading",
        content: "Rural high school girls in Limpopo",
      },
      {
        type: "paragraph",
        content: "Studies among secondary school girls in Limpopo show that many learners have limited menstrual health knowledge, struggle with pain and heavy bleeding, miss school during their periods, and rarely talk to healthcare providers about it.",
      },
      {
        type: "subheading",
        content: "University students in South Africa",
      },
      {
        type: "paragraph",
        content: "Research with undergraduate women at South African universities shows that stress, academic pressure, poor sleep and financial strain all influence menstrual experiences. Many students report menstrual disturbances that disrupt their daily lives. Very few have ever been taught how to track their cycles or recognise when something is off.",
      },
      {
        type: "subheading",
        content: "Women across SA \u2014 all backgrounds",
      },
      {
        type: "paragraph",
        content: "Around a third of South African women report symptoms like irregular cycles, sleep disturbance, mood changes, and fluctuating energy, all linked to hormonal imbalance. Black African women are more likely to experience fibroids and heavy bleeding. Health-system inequalities, long queues and cost barriers delay diagnosis.",
      },
      {
        type: "heading",
        content: "4. When should you actually worry?",
      },
      {
        type: "paragraph",
        content: "You should pay attention if:",
      },
      {
        type: "bullets",
        content: "",
        items: [
          "Your cycle is shorter than 21 days",
          "Your cycle is longer than 35 days",
          "You regularly skip months",
          "Your period disappears for 3+ months (and you are not pregnant or breastfeeding)",
          "Your flow suddenly becomes much heavier or much lighter",
          "You are constantly spotting between periods",
          "Your cramps become more severe over time",
          "You feel like your cycle has become unpredictable and chaotic",
        ],
      },
      {
        type: "paragraph",
        content: "None of this is \u201Cjust being a woman.\u201D It is not a sign of weakness. It is a sign that something in your body needs attention. It is fixable \u2014 but only if we catch it early.",
      },
      {
        type: "heading",
        content: "5. What to do next",
      },
      {
        type: "subheading",
        content: "Track your cycle",
      },
      {
        type: "paragraph",
        content: "Use an app like Olanna, or a notebook, or a simple calendar. Write down: start date, flow, pain, mood, energy. Patterns matter.",
      },
      {
        type: "subheading",
        content: "Ask for blood tests",
      },
      {
        type: "paragraph",
        content: "Request checks for thyroid function, prolactin, insulin, and reproductive hormones.",
      },
      {
        type: "subheading",
        content: "Screen for underlying conditions",
      },
      {
        type: "paragraph",
        content: "Ask your provider about PCOS, fibroids, endometriosis, and anaemia if your symptoms fit.",
      },
      {
        type: "subheading",
        content: "Prioritise sleep",
      },
      {
        type: "paragraph",
        content: "Hormones are regulated during deep sleep. Chronic late nights and screen time absolutely show up in your cycle.",
      },
      {
        type: "subheading",
        content: "Advocate for yourself",
      },
      {
        type: "paragraph",
        content: "Go into appointments with notes. If you feel brushed off, you are allowed to seek a second opinion. Your menstrual cycle is an integral part of your overall health, not a footnote.",
      },
      {
        type: "disclaimer",
        content: "This article is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider regarding any medical condition or treatment.",
      },
    ],
    references: [
      { number: 1, text: "NICHD. What are menstrual irregularities? 2017." },
      { number: 2, text: "Harvard T.H. Chan School of Public Health. Irregular periods linked with increased risk for cardiometabolic conditions. 2024." },
      { number: 3, text: "Wang YX et al. Menstrual Cycle Regularity and Length Across the Reproductive Lifespan and Risk of Cardiovascular Disease. JAMA Network Open. 2022." },
      { number: 4, text: "ACOG. Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign. 2015." },
      { number: 5, text: "Menstrual irregularity and associated factors among female adolescents in Africa. Scientific Reports. 2025." },
      { number: 6, text: "Narrative review on heavy menstrual bleeding in African women, Annals of Medicine and Surgery. 2025." },
      { number: 7, text: "UNFPA. Menstrual Health Management in East and Southern Africa: A Review Paper. 2018." },
      { number: 8, text: "Ramathuba DU et al. Menstrual knowledge and practices of female adolescents in Vhembe District, Limpopo Province. 2015." },
      { number: 9, text: "Crankshaw T et al. Menstrual health management and schooling experience amongst female learners in South Africa. 2020." },
      { number: 10, text: "Padmanabhanunni A. The menstruation experience: Attitude dimensions among South African undergraduate women. 2017." },
    ],
  },
  {
    id: "2",
    slug: "pcos-signs-management",
    title: "Is It PCOS? The Signs Your Body Has Been Trying to Tell You",
    subtitle: "Sometimes the signs are quiet, but they deserve to be heard.",
    summary: "A gentle, clear breakdown of PCOS symptoms, causes, and steps you can take to support your reproductive health.",
    category: "PCOS",
    topic: "pcos",
    author: "Olanna Editorial",
    date: "8 December 2025",
    readTime: "4 min",
    imageSource: require("@/assets/images/articles/pcos-hair-loss.png"),
    sections: [
      {
        type: "paragraph",
        content: "If you have ever sat on Google at 2 AM trying to understand why your period disappears for three months only to return with the vengeance of a tax collector, you are not alone. Polycystic Ovarian Syndrome (PCOS) affects 1 in 10 women \u2014 and in South Africa, where access to reproductive healthcare is often uneven, many women navigate this condition without the language or support to make sense of their symptoms.",
      },
      {
        type: "paragraph",
        content: "PCOS is not a one-size-fits-all illness; it is more like a personality cluster. For some women, it is the stubborn hormonal acne that refuses to mind its business. For others, it is struggling to lose weight no matter how many Rooibos detox teas they drink. And for many, it is the quiet emotional toll of feeling like your body is working against you.",
      },
      {
        type: "heading",
        content: "What Exactly Is PCOS?",
      },
      {
        type: "paragraph",
        content: "PCOS is a hormonal condition where your ovaries produce higher-than-normal amounts of androgens (male-associated hormones). This hormonal imbalance can affect ovulation, period regularity, weight, mood, and even fertility.",
      },
      {
        type: "quote",
        content: "Think of your hormones as a choir. With PCOS, one section \u2014 usually the altos \u2014 starts singing off-key and refuses to blend. The entire performance suffers.",
      },
      {
        type: "heading",
        content: "Common Signs and Symptoms",
      },
      {
        type: "paragraph",
        content: "PCOS does not look the same for everyone, especially in a diverse country like South Africa where genetics, lifestyle, and environment vary widely. But here are the symptoms many women report:",
      },
      {
        type: "subheading",
        content: "Irregular or missing periods",
      },
      {
        type: "paragraph",
        content: "Your cycle could be 28 days one month and 60 days the next. Some women do not get a period for months at a time.",
      },
      {
        type: "subheading",
        content: "Skin changes",
      },
      {
        type: "paragraph",
        content: "Hormonal acne, oily skin, and darkening of the neck or inner thighs \u2014 often linked to insulin resistance.",
      },
      {
        type: "subheading",
        content: "Difficulty losing weight",
      },
      {
        type: "paragraph",
        content: "PCOS frequently involves insulin resistance, making weight loss harder.",
      },
      {
        type: "subheading",
        content: "Excess hair growth",
      },
      {
        type: "paragraph",
        content: "PCOS can cause facial or body hair growth in male-pattern areas.",
      },
      {
        type: "subheading",
        content: "Mood changes",
      },
      {
        type: "paragraph",
        content: "Anxiety, irritability, and low mood are common but often overlooked.",
      },
      {
        type: "heading",
        content: "Why PCOS Happens",
      },
      {
        type: "paragraph",
        content: "The exact cause is not fully understood, but two major factors drive PCOS:",
      },
      {
        type: "subheading",
        content: "Insulin resistance",
      },
      {
        type: "paragraph",
        content: "Your body struggles to use insulin properly, raising insulin and androgen levels.",
      },
      {
        type: "subheading",
        content: "Genetics",
      },
      {
        type: "paragraph",
        content: "PCOS often runs in families.",
      },
      {
        type: "heading",
        content: "What You Can Do (Starting Today)",
      },
      {
        type: "paragraph",
        content: "PCOS is chronic \u2014 not \u201Ccurable,\u201D but very manageable. Small, consistent changes matter.",
      },
      {
        type: "subheading",
        content: "Track your cycle",
      },
      {
        type: "paragraph",
        content: "Apps like Olanna help you understand your patterns and take control.",
      },
      {
        type: "subheading",
        content: "Prioritise balanced eating",
      },
      {
        type: "paragraph",
        content: "A sustainable eating pattern improves insulin sensitivity.",
      },
      {
        type: "subheading",
        content: "Move your body",
      },
      {
        type: "paragraph",
        content: "Regular movement improves metabolic health and mood.",
      },
      {
        type: "subheading",
        content: "Speak to a healthcare professional",
      },
      {
        type: "paragraph",
        content: "Diagnosis and treatment guidelines are well-established.",
      },
      {
        type: "heading",
        content: "The Bottom Line",
      },
      {
        type: "paragraph",
        content: "PCOS is common, manageable, and nothing to be ashamed of. Your symptoms are real, valid, and deserve attention. With tools like Olanna and proper medical support, you are not walking this journey alone.",
      },
      {
        type: "disclaimer",
        content: "This article is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider regarding any medical condition or treatment.",
      },
    ],
    references: [
      { number: 1, text: "Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. Revised 2003 consensus on diagnostic criteria. Fertil Steril. 2004." },
      { number: 2, text: "Teede HJ et al. Recommendations from the international evidence-based guideline for PCOS. Hum Reprod. 2018." },
      { number: 3, text: "Azziz R et al. Polycystic ovary syndrome. Nat Rev Dis Primers. 2016." },
      { number: 4, text: "Dunaif A. Insulin resistance and the polycystic ovary syndrome. Endocr Rev. 1997." },
      { number: 5, text: "Lizneva D et al. Criteria, prevalence, and phenotypes of PCOS. Fertil Steril. 2016." },
      { number: 6, text: "Goodman NF et al. AACE position statement on metabolic and cardiovascular consequences of PCOS. Endocr Pract. 2015." },
    ],
  },
  {
    id: "3",
    slug: "endometriosis-basics",
    title: "Endometriosis: The Basics Every Woman Should Know",
    subtitle: "If you have ever been curled up on the floor during your period, clutching a hot water bottle and wondering, \u201CIs this normal?\u201D \u2014 this one is for you.",
    summary: "It is more than just bad period pain. Here is what every South African woman deserves to know about endo.",
    category: "Endometriosis",
    topic: "endometriosis",
    author: "Olanna Editorial",
    date: "4 December 2025",
    readTime: "7 min",
    imageSource: require("@/assets/images/articles/endometriosis-hero.jpg"),
    sections: [
      {
        type: "paragraph",
        content: "For generations, South African women have been told that period pain is simply our \u201Ccross to bear.\u201D Drink some Panado. Swallow a cup of very sweet tea. Get on with it. Meanwhile, many of us are living with a condition that has a name, a history, and treatment options: endometriosis.",
      },
      {
        type: "heading",
        content: "What Is Endometriosis?",
      },
      {
        type: "paragraph",
        content: "Endometriosis (or endo) happens when tissue similar to the lining of your womb (endometrium) starts growing outside the uterus \u2014 on the ovaries, fallopian tubes, bladder, bowel, or other areas in the pelvis.",
      },
      {
        type: "paragraph",
        content: "Every cycle, this tissue responds to hormones just like your uterine lining does: it thickens, breaks down, and bleeds. The problem? There is nowhere for that blood to go. That is where inflammation, pain, and sometimes scarring come in.",
      },
      {
        type: "quote",
        content: "Endo is not \u201Cjust a painful period.\u201D It is a chronic condition that can affect your pain levels, your fertility, your work, your relationships \u2014 your whole life.",
      },
      {
        type: "heading",
        content: "How Common Is It?",
      },
      {
        type: "paragraph",
        content: "Globally, endometriosis is estimated to affect around 1 in 10 women and people with uteruses. Many are never diagnosed, especially in countries like South Africa where access to gynaecologists or laparoscopic surgery is not always realistic.",
      },
      {
        type: "heading",
        content: "What Endometriosis Looks Like in Real Life",
      },
      {
        type: "subheading",
        content: "Severe Period Pain",
      },
      {
        type: "paragraph",
        content: "We are not talking \u201Cpop one painkiller and go.\u201D We are talking pain that stops you from going to school or work, vomiting, diarrhoea or fainting with your period, and pain that does not respond to usual pain meds.",
      },
      {
        type: "subheading",
        content: "Pain During or After Sex",
      },
      {
        type: "paragraph",
        content: "Penetrative sex that feels sharp, deep, or achy \u2014 especially around your period \u2014 can be a symptom of endometriosis. In a country where we barely talk openly about sex, many women keep quiet about this. You do not have to.",
      },
      {
        type: "subheading",
        content: "Chronic Pelvic Pain",
      },
      {
        type: "paragraph",
        content: "Pain is not always limited to your period. You might have ongoing pelvic pain throughout the month, lower back pain, or pain when peeing or passing stools, especially during your period.",
      },
      {
        type: "subheading",
        content: "Heavy Bleeding",
      },
      {
        type: "paragraph",
        content: "Some people with endo experience very heavy periods, periods that last more than 7 days, or bleeding between periods. You should not be soaking through pads or tampons every hour.",
      },
      {
        type: "subheading",
        content: "Fertility Challenges",
      },
      {
        type: "paragraph",
        content: "Endometriosis can make it harder to fall pregnant for some women, though many do conceive \u2014 naturally or with assistance. Endo is one possible explanation, not a failure on your part.",
      },
      {
        type: "subheading",
        content: "Fatigue and Mood Changes",
      },
      {
        type: "paragraph",
        content: "Living with chronic pain is exhausting. Add hormonal shifts, poor sleep, and the emotional weight of not feeling believed, and burnout is inevitable. Many women with endo report anxiety, low mood and constant tiredness.",
      },
      {
        type: "heading",
        content: "Why South African Women Are Often Dismissed",
      },
      {
        type: "paragraph",
        content: "Endo does not exist in a vacuum; it exists in a system. In South Africa, many girls grow up hearing that periods are supposed to be painful. Black women in particular often have their pain downplayed \u2014 labelled as \u201Cstrong,\u201D \u201Cdramatic,\u201D or \u201Cexaggerating.\u201D",
      },
      {
        type: "paragraph",
        content: "Government clinics are under pressure, appointments are rushed, and the repeated message is: \u201CTake painkillers, you will be fine.\u201D But \u201Cbad cramps\u201D that stop you from functioning, month after month, are not a normal part of womanhood. They are a sign that something deserves proper investigation.",
      },
      {
        type: "heading",
        content: "How Is Endometriosis Treated?",
      },
      {
        type: "subheading",
        content: "Pain Relief",
      },
      {
        type: "paragraph",
        content: "Over-the-counter anti-inflammatories (like ibuprofen) and stronger prescription pain meds for flare-ups. These do not treat the underlying endo, but they can help get you through the worst days.",
      },
      {
        type: "subheading",
        content: "Hormonal Treatments",
      },
      {
        type: "paragraph",
        content: "These aim to reduce or stop periods and slow the growth of endometriosis tissue. They might include combined oral contraceptive pills, progestin-only methods, or other hormone-modulating medications prescribed by specialists.",
      },
      {
        type: "subheading",
        content: "Surgery",
      },
      {
        type: "paragraph",
        content: "Laparoscopic surgery can remove or burn away endometriosis lesions and release scar tissue. This can improve pain and sometimes fertility, but endo can recur.",
      },
      {
        type: "subheading",
        content: "Lifestyle and Support",
      },
      {
        type: "paragraph",
        content: "You cannot yoga your way out of endometriosis \u2014 but supportive choices can help: gentle movement, anti-inflammatory style eating, heat therapy, and therapy or support groups to process the emotional toll. And most importantly: being believed.",
      },
      {
        type: "heading",
        content: "The Bottom Line",
      },
      {
        type: "paragraph",
        content: "If your period is ruining your life every month, it is not because you are weak. It is not because you \u201Ccannot handle pain.\u201D It might be because you are living with endometriosis \u2014 a real, chronic condition that deserves diagnosis, support, and care.",
      },
      {
        type: "paragraph",
        content: "You are allowed to ask questions. You are allowed to say, \u201CThis pain is not normal for me.\u201D And you are allowed to demand a healthcare system that listens.",
      },
      {
        type: "disclaimer",
        content: "This article is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider regarding any medical condition or treatment.",
      },
    ],
    references: [
      { number: 1, text: "Zondervan KT, Becker CM, Missmer SA. Endometriosis. N Engl J Med. 2020;382(13):1244-1256." },
      { number: 2, text: "Johnson NP, Hummelshoj L; World Endometriosis Society Montpellier Consortium. Consensus on current management of endometriosis. Hum Reprod. 2013." },
      { number: 3, text: "Agarwal SK, Chapron C, Giudice LC, et al. Clinical diagnosis of endometriosis: a call to action. Am J Obstet Gynecol. 2019." },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleById(id: string): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function getArticlesByTopic(topicId: string): Article[] {
  return articles.filter((a) => a.topic === topicId);
}

export function getArticlesByCategory(category: string): Article[] {
  if (category === "All") return articles;
  return articles.filter((a) => a.category === category);
}
