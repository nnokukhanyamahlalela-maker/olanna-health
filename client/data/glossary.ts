export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export const GLOSSARY_CATEGORIES = [
  "All",
  "Menstrual Health",
  "Hormones",
  "Conditions",
  "Fertility",
  "Anatomy",
  "Treatment",
] as const;

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: "amenorrhoea",
    term: "Amenorrhoea",
    definition: "The absence of menstrual periods. Primary amenorrhoea is when periods have not started by age 15. Secondary amenorrhoea is when periods stop for three or more months in someone who previously had regular cycles.",
    category: "Menstrual Health",
    relatedTerms: ["Oligomenorrhoea", "Menstrual cycle"],
  },
  {
    id: "androgens",
    term: "Androgens",
    definition: "A group of hormones, including testosterone, that play a role in reproductive health. While often called \"male hormones,\" women also produce androgens. Elevated levels can cause symptoms like acne, excess hair growth, and irregular periods.",
    category: "Hormones",
    relatedTerms: ["PCOS", "Testosterone", "Hormonal imbalance"],
  },
  {
    id: "anovulation",
    term: "Anovulation",
    definition: "When the ovaries do not release an egg during a menstrual cycle. This can lead to irregular or missed periods and is a common feature of PCOS.",
    category: "Fertility",
    relatedTerms: ["Ovulation", "PCOS", "Infertility"],
  },
  {
    id: "basal-body-temperature",
    term: "Basal Body Temperature (BBT)",
    definition: "Your body's lowest resting temperature, typically measured first thing in the morning. BBT rises slightly after ovulation due to progesterone, making it useful for tracking fertility.",
    category: "Fertility",
    relatedTerms: ["Ovulation", "Progesterone", "Fertility awareness"],
  },
  {
    id: "cervical-screening",
    term: "Cervical Screening",
    definition: "A test (previously called a Pap smear) that checks for abnormal cells on the cervix. In South Africa, SASOG recommends screening from age 21 or within three years of becoming sexually active.",
    category: "Treatment",
    relatedTerms: ["HPV", "Cervix"],
  },
  {
    id: "cervix",
    term: "Cervix",
    definition: "The lower, narrow end of the uterus that opens into the vagina. The cervix produces mucus that changes throughout the menstrual cycle and plays a key role in fertility and childbirth.",
    category: "Anatomy",
    relatedTerms: ["Uterus", "Cervical mucus", "Cervical screening"],
  },
  {
    id: "corpus-luteum",
    term: "Corpus Luteum",
    definition: "A temporary structure that forms in the ovary after an egg is released during ovulation. It produces progesterone to prepare the uterine lining for pregnancy. If pregnancy does not occur, it breaks down and triggers menstruation.",
    category: "Anatomy",
    relatedTerms: ["Ovulation", "Progesterone", "Luteal phase"],
  },
  {
    id: "dysmenorrhoea",
    term: "Dysmenorrhoea",
    definition: "The medical term for painful periods. Primary dysmenorrhoea is caused by natural prostaglandins and is common. Secondary dysmenorrhoea is caused by an underlying condition like endometriosis or fibroids.",
    category: "Menstrual Health",
    relatedTerms: ["Endometriosis", "Prostaglandins", "Fibroids"],
  },
  {
    id: "endometriosis",
    term: "Endometriosis",
    definition: "A chronic condition where tissue similar to the lining of the uterus grows outside the uterus, commonly on the ovaries, fallopian tubes, and pelvic lining. It causes pain, heavy bleeding, and can affect fertility. It affects approximately 1 in 10 women.",
    category: "Conditions",
    relatedTerms: ["Dysmenorrhoea", "Laparoscopy", "Chronic pelvic pain"],
  },
  {
    id: "endometrium",
    term: "Endometrium",
    definition: "The lining of the uterus that thickens each cycle in preparation for pregnancy. If no pregnancy occurs, the endometrium sheds during menstruation.",
    category: "Anatomy",
    relatedTerms: ["Uterus", "Menstruation", "Endometriosis"],
  },
  {
    id: "estrogen",
    term: "Oestrogen",
    definition: "A primary female reproductive hormone produced mainly by the ovaries. Oestrogen regulates the menstrual cycle, supports bone health, and affects mood, skin, and cardiovascular health. Levels rise during the follicular phase and peak just before ovulation.",
    category: "Hormones",
    relatedTerms: ["Follicular phase", "Ovulation", "Hormonal imbalance"],
  },
  {
    id: "fallopian-tubes",
    term: "Fallopian Tubes",
    definition: "Two narrow tubes that connect the ovaries to the uterus. Eggs travel through the fallopian tubes after ovulation, and fertilisation typically occurs here.",
    category: "Anatomy",
    relatedTerms: ["Ovaries", "Ovulation", "Uterus"],
  },
  {
    id: "fertile-window",
    term: "Fertile Window",
    definition: "The days in a menstrual cycle when pregnancy is most likely. This typically spans about 5 days before ovulation and the day of ovulation itself, as sperm can survive in the reproductive tract for up to 5 days.",
    category: "Fertility",
    relatedTerms: ["Ovulation", "Cervical mucus", "Basal body temperature"],
  },
  {
    id: "fibroids",
    term: "Fibroids (Uterine Fibroids)",
    definition: "Non-cancerous growths that develop in or on the uterus. They are more common in Black African women and can cause heavy periods, pelvic pain, and fertility challenges. Most fibroids do not require treatment unless they cause symptoms.",
    category: "Conditions",
    relatedTerms: ["Menorrhagia", "Uterus", "Heavy menstrual bleeding"],
  },
  {
    id: "follicle",
    term: "Follicle",
    definition: "A small fluid-filled sac in the ovary that contains a developing egg. Each cycle, several follicles begin to develop, but typically only one matures and releases an egg during ovulation.",
    category: "Anatomy",
    relatedTerms: ["Ovulation", "FSH", "Ovaries"],
  },
  {
    id: "follicular-phase",
    term: "Follicular Phase",
    definition: "The first phase of the menstrual cycle, starting on day 1 of your period and lasting until ovulation. During this phase, FSH stimulates follicle growth, and rising oestrogen thickens the uterine lining.",
    category: "Menstrual Health",
    relatedTerms: ["Oestrogen", "FSH", "Ovulation"],
  },
  {
    id: "fsh",
    term: "FSH (Follicle-Stimulating Hormone)",
    definition: "A hormone produced by the pituitary gland that stimulates the growth of ovarian follicles. FSH levels rise at the beginning of each menstrual cycle to trigger egg development.",
    category: "Hormones",
    relatedTerms: ["LH", "Follicle", "Pituitary gland"],
  },
  {
    id: "hormonal-imbalance",
    term: "Hormonal Imbalance",
    definition: "When one or more hormones are produced in too much or too little quantity. Common signs include irregular periods, acne, weight changes, mood swings, fatigue, and sleep disturbances. Causes can include PCOS, thyroid disorders, stress, and lifestyle factors.",
    category: "Hormones",
    relatedTerms: ["PCOS", "Thyroid", "Androgens"],
  },
  {
    id: "hpv",
    term: "HPV (Human Papillomavirus)",
    definition: "A very common sexually transmitted infection. Most HPV infections clear on their own, but some high-risk strains can lead to cervical cancer over time. Regular cervical screening helps detect changes early.",
    category: "Conditions",
    relatedTerms: ["Cervical screening", "STI"],
  },
  {
    id: "insulin-resistance",
    term: "Insulin Resistance",
    definition: "A condition where the body's cells do not respond effectively to insulin, leading to higher blood sugar and insulin levels. It is commonly associated with PCOS and can contribute to weight gain, irregular periods, and increased androgen production.",
    category: "Conditions",
    relatedTerms: ["PCOS", "Androgens", "Type 2 diabetes"],
  },
  {
    id: "laparoscopy",
    term: "Laparoscopy",
    definition: "A minimally invasive surgical procedure using a small camera inserted through a small incision in the abdomen. It is the gold standard for diagnosing endometriosis and can also be used to treat it by removing lesions.",
    category: "Treatment",
    relatedTerms: ["Endometriosis", "Surgery"],
  },
  {
    id: "lh",
    term: "LH (Luteinising Hormone)",
    definition: "A hormone produced by the pituitary gland. A surge in LH triggers ovulation \u2014 the release of a mature egg from the ovary. LH tests (ovulation predictor kits) detect this surge to help predict fertile days.",
    category: "Hormones",
    relatedTerms: ["FSH", "Ovulation", "Pituitary gland"],
  },
  {
    id: "luteal-phase",
    term: "Luteal Phase",
    definition: "The second half of the menstrual cycle, after ovulation and before the next period. The corpus luteum produces progesterone to maintain the uterine lining. If no pregnancy occurs, progesterone drops and menstruation begins. This phase typically lasts 10\u201316 days.",
    category: "Menstrual Health",
    relatedTerms: ["Progesterone", "Corpus luteum", "PMS"],
  },
  {
    id: "menorrhagia",
    term: "Menorrhagia",
    definition: "Abnormally heavy or prolonged menstrual bleeding. Signs include soaking through a pad or tampon every hour, periods lasting longer than 7 days, and passing blood clots larger than a 10-cent coin.",
    category: "Menstrual Health",
    relatedTerms: ["Fibroids", "Endometriosis", "Anaemia"],
  },
  {
    id: "menstrual-cycle",
    term: "Menstrual Cycle",
    definition: "The monthly process your body goes through to prepare for pregnancy. It is counted from the first day of one period to the first day of the next. A typical cycle is 21\u201335 days and includes four phases: menstrual, follicular, ovulatory, and luteal.",
    category: "Menstrual Health",
    relatedTerms: ["Follicular phase", "Ovulation", "Luteal phase"],
  },
  {
    id: "ovaries",
    term: "Ovaries",
    definition: "Two almond-shaped organs located on either side of the uterus. They produce eggs (ova) and the hormones oestrogen and progesterone. Each month, one ovary typically releases a mature egg during ovulation.",
    category: "Anatomy",
    relatedTerms: ["Ovulation", "Oestrogen", "Progesterone"],
  },
  {
    id: "ovulation",
    term: "Ovulation",
    definition: "The release of a mature egg from an ovary, typically occurring around the middle of the menstrual cycle. The egg travels down the fallopian tube where it can be fertilised. Ovulation is triggered by a surge in LH.",
    category: "Fertility",
    relatedTerms: ["LH", "Fertile window", "Follicle"],
  },
  {
    id: "pcos",
    term: "PCOS (Polycystic Ovary Syndrome)",
    definition: "A common hormonal condition affecting 1 in 10 women. It involves elevated androgens, irregular ovulation, and sometimes multiple small follicles on the ovaries. Symptoms include irregular periods, acne, weight gain, excess hair growth, and fertility challenges.",
    category: "Conditions",
    relatedTerms: ["Androgens", "Insulin resistance", "Anovulation"],
  },
  {
    id: "pms",
    term: "PMS (Premenstrual Syndrome)",
    definition: "A group of physical and emotional symptoms that occur in the 1\u20132 weeks before your period. Common symptoms include bloating, breast tenderness, mood swings, fatigue, and food cravings. Symptoms resolve once menstruation begins.",
    category: "Menstrual Health",
    relatedTerms: ["Luteal phase", "Progesterone", "PMDD"],
  },
  {
    id: "progesterone",
    term: "Progesterone",
    definition: "A hormone produced primarily by the corpus luteum after ovulation. It prepares the uterine lining for a potential pregnancy and helps maintain early pregnancy. Low progesterone can cause irregular periods, spotting, and mood changes.",
    category: "Hormones",
    relatedTerms: ["Luteal phase", "Corpus luteum", "Oestrogen"],
  },
  {
    id: "prostaglandins",
    term: "Prostaglandins",
    definition: "Chemical compounds in the body that trigger uterine contractions to help shed the endometrium during menstruation. High levels of prostaglandins are associated with more intense period cramps.",
    category: "Hormones",
    relatedTerms: ["Dysmenorrhoea", "Menstruation"],
  },
  {
    id: "spotting",
    term: "Spotting",
    definition: "Light bleeding that occurs outside of your regular period. It can happen between periods, during early pregnancy, around ovulation, or as a side effect of hormonal contraception. Persistent or heavy spotting should be discussed with a healthcare provider.",
    category: "Menstrual Health",
    relatedTerms: ["Menstrual cycle", "Hormonal imbalance"],
  },
  {
    id: "sti",
    term: "STI (Sexually Transmitted Infection)",
    definition: "An infection passed from one person to another through sexual contact. Common STIs include chlamydia, gonorrhoea, syphilis, HIV, and HPV. Regular screening is important, especially as many STIs can be asymptomatic.",
    category: "Conditions",
    relatedTerms: ["HPV", "Cervical screening"],
  },
  {
    id: "uterus",
    term: "Uterus (Womb)",
    definition: "A pear-shaped muscular organ in the pelvis where a fertilised egg implants and a foetus develops during pregnancy. The inner lining (endometrium) thickens and sheds each menstrual cycle.",
    category: "Anatomy",
    relatedTerms: ["Endometrium", "Cervix", "Fallopian tubes"],
  },
];

export function searchGlossary(query: string, category?: string): GlossaryTerm[] {
  const normalised = query.toLowerCase().trim();
  let results = glossaryTerms;

  if (category && category !== "All") {
    results = results.filter((t) => t.category === category);
  }

  if (normalised.length > 0) {
    results = results.filter(
      (t) =>
        t.term.toLowerCase().includes(normalised) ||
        t.definition.toLowerCase().includes(normalised)
    );
  }

  return results.sort((a, b) => a.term.localeCompare(b.term));
}
