/**
 * Health-concern landing pages (system-design.md §11.5 — "individual landing pages per test and
 * per health concern... this is exactly the kind of specific, well-structured content that gets
 * pulled into AI answers"). Code-maintained, not admin-editable — unlike catalog/site content,
 * this is medical-adjacent editorial writing that warrants review before publishing, not a form
 * field. See docs/decisions-log.md.
 *
 * General factual info only, not diagnosis — every page should read as "here's what this is and
 * why testing helps," never as medical advice. `recommendedTestSlugs`/`recommendedPackageSlugs`
 * must point at real rows in `tests`/`packages` (verified against supabase/seed.sql) so these
 * pages never link to something that 404s.
 */

export type HealthConcern = {
  slug: string;
  title_en: string;
  title_hi: string;
  intro_en: string;
  intro_hi: string;
  symptoms_en: string[];
  symptoms_hi: string[];
  whenToTest_en: string;
  whenToTest_hi: string;
  recommendedTestSlugs?: string[];
  recommendedPackageSlugs?: string[];
};

export const healthConcerns: HealthConcern[] = [
  {
    slug: "fever",
    title_en: "Fever Testing in Pokaran",
    title_hi: "पोकरण में बुखार की जांच",
    intro_en:
      "Fever is the body's response to infection — viral, bacterial, or parasitic (including malaria and typhoid, both common in Rajasthan). A short fever that resolves in a day or two usually needs no testing, but fever lasting more than 2-3 days, or fever with other symptoms, is worth investigating with blood tests.",
    intro_hi:
      "बुखार शरीर की संक्रमण के प्रति प्रतिक्रिया है — वायरल, बैक्टीरियल या परजीवी (मलेरिया और टाइफाइड सहित, जो राजस्थान में आम हैं)। एक-दो दिन में ठीक होने वाले बुखार में आमतौर पर जांच की जरूरत नहीं होती, लेकिन 2-3 दिन से ज्यादा रहने वाला बुखार, या अन्य लक्षणों के साथ बुखार, ब्लड टेस्ट से जांचना चाहिए।",
    symptoms_en: [
      "Body temperature above 100.4°F (38°C)",
      "Chills or sweating",
      "Body ache, headache",
      "Fatigue or weakness",
      "Loss of appetite",
    ],
    symptoms_hi: [
      "शरीर का तापमान 100.4°F (38°C) से अधिक",
      "ठंड लगना या पसीना आना",
      "बदन दर्द, सिरदर्द",
      "थकान या कमजोरी",
      "भूख न लगना",
    ],
    whenToTest_en:
      "See a doctor and get tested if fever lasts more than 2-3 days, crosses 102°F, or comes with severe headache, rash, persistent vomiting, or difficulty breathing.",
    whenToTest_hi:
      "यदि बुखार 2-3 दिन से अधिक रहे, 102°F से ऊपर हो, या तेज़ सिरदर्द, चकत्ते, लगातार उल्टी या सांस लेने में तकलीफ़ के साथ हो, तो डॉक्टर को दिखाएं और जांच कराएं।",
    recommendedPackageSlugs: ["fever-panel-pokaran"],
  },
  {
    slug: "thyroid-problems",
    title_en: "Thyroid Problems: Symptoms & Testing",
    title_hi: "थायरॉइड समस्या: लक्षण व जांच",
    intro_en:
      "The thyroid gland regulates metabolism. An underactive thyroid (hypothyroidism) slows the body down; an overactive one (hyperthyroidism) speeds it up. Both are common, especially in women, and are diagnosed with a simple blood test (T3, T4, TSH) — not something you can tell from symptoms alone.",
    intro_hi:
      "थायरॉइड ग्रंथि शरीर के मेटाबॉलिज्म को नियंत्रित करती है। कम सक्रिय थायरॉइड (हाइपोथायरॉइडिज़्म) शरीर को धीमा कर देता है; अधिक सक्रिय (हाइपरथायरॉइडिज़्म) उसे तेज़ कर देता है। दोनों आम हैं, विशेषकर महिलाओं में, और एक साधारण ब्लड टेस्ट (T3, T4, TSH) से पता चलते हैं — सिर्फ लक्षणों से नहीं।",
    symptoms_en: [
      "Unexplained weight gain or weight loss",
      "Fatigue or unusual energy/restlessness",
      "Hair thinning or hair fall",
      "Feeling unusually cold or unusually warm",
      "Irregular periods (in women)",
    ],
    symptoms_hi: [
      "बिना कारण वजन बढ़ना या घटना",
      "थकान या असामान्य ऊर्जा/बेचैनी",
      "बाल पतले होना या झड़ना",
      "असामान्य रूप से ठंड या गर्मी महसूस होना",
      "अनियमित मासिक धर्म (महिलाओं में)",
    ],
    whenToTest_en:
      "If you notice several of these symptoms together, especially unexplained weight or energy changes, ask your doctor about a thyroid profile test.",
    whenToTest_hi:
      "यदि आपको इनमें से कई लक्षण एक साथ दिखें, विशेषकर बिना कारण वजन या ऊर्जा में बदलाव, तो अपने डॉक्टर से थायरॉइड प्रोफाइल जांच के बारे में पूछें।",
    recommendedTestSlugs: ["thyroid-profile-pokaran"],
  },
  {
    slug: "anemia-weakness",
    title_en: "Anemia & Ongoing Weakness",
    title_hi: "एनीमिया व लगातार कमजोरी",
    intro_en:
      "Anemia — low red blood cells or hemoglobin — is one of the most common, and most under-diagnosed, health issues in India, especially among women and children. It causes tiredness that's easy to dismiss as \"just being busy,\" but a Complete Blood Count (CBC) test identifies it in minutes.",
    intro_hi:
      "एनीमिया — कम लाल रक्त कण या हीमोग्लोबिन — भारत में सबसे आम और सबसे कम पहचानी जाने वाली स्वास्थ्य समस्याओं में से एक है, विशेषकर महिलाओं व बच्चों में। यह थकान का कारण बनता है जिसे अक्सर \"बस व्यस्त होना\" समझकर नज़रअंदाज़ कर दिया जाता है, लेकिन कंप्लीट ब्लड काउंट (सीबीसी) जांच से मिनटों में पता चल जाता है।",
    symptoms_en: [
      "Persistent tiredness or weakness",
      "Pale skin, lips, or nails",
      "Shortness of breath on mild exertion",
      "Dizziness or headaches",
      "Cold hands and feet",
    ],
    symptoms_hi: [
      "लगातार थकान या कमजोरी",
      "त्वचा, होंठ या नाखूनों का पीलापन",
      "हल्की मेहनत पर सांस फूलना",
      "चक्कर आना या सिरदर्द",
      "हाथ-पैर ठंडे रहना",
    ],
    whenToTest_en:
      "If tiredness persists for more than a couple of weeks despite rest, or you notice paleness, a CBC test is a quick, affordable first step before assuming it's \"just stress.\"",
    whenToTest_hi:
      "यदि आराम के बावजूद थकान दो हफ्ते से अधिक बनी रहे, या पीलापन दिखे, तो इसे \"बस तनाव\" मानने से पहले सीबीसी जांच एक त्वरित, किफायती पहला कदम है।",
    recommendedTestSlugs: ["cbc-test-pokaran"],
  },
  {
    slug: "heart-health",
    title_en: "Heart Health: When to Get an ECG",
    title_hi: "हृदय स्वास्थ्य: ईसीजी कब कराएं",
    intro_en:
      "An ECG (electrocardiogram) records your heart's electrical activity and is one of the fastest ways to screen for an irregular heartbeat, past heart strain, or other cardiac concerns. It's quick, painless, and often recommended even as a routine check for adults over 40 or before certain procedures.",
    intro_hi:
      "ईसीजी (इलेक्ट्रोकार्डियोग्राम) आपके हृदय की विद्युत गतिविधि को रिकॉर्ड करता है और अनियमित धड़कन, पुराने हृदय तनाव, या अन्य हृदय संबंधी समस्याओं की जांच के सबसे तेज़ तरीकों में से एक है। यह त्वरित, दर्द रहित है और अक्सर 40 वर्ष से अधिक उम्र के वयस्कों के लिए नियमित जांच के रूप में भी सुझाया जाता है।",
    symptoms_en: [
      "Chest discomfort, tightness, or pain",
      "Palpitations (irregular or racing heartbeat)",
      "Unexplained shortness of breath",
      "Dizziness or fainting spells",
      "Unusual fatigue with mild activity",
    ],
    symptoms_hi: [
      "छाती में बेचैनी, जकड़न या दर्द",
      "धड़कनों का अनियमित या तेज़ होना",
      "बिना कारण सांस फूलना",
      "चक्कर आना या बेहोशी",
      "हल्की गतिविधि से असामान्य थकान",
    ],
    whenToTest_en:
      "Chest pain or pressure needs urgent medical attention — go to a hospital, don't wait for a scheduled test. For milder or recurring symptoms, or as a routine check, an ECG is a reasonable next step.",
    whenToTest_hi:
      "सीने में दर्द या दबाव के लिए तुरंत चिकित्सा सहायता लें — अस्पताल जाएं, जांच का समय तय होने का इंतज़ार न करें। हल्के या बार-बार होने वाले लक्षणों के लिए, या नियमित जांच के रूप में, ईसीजी एक उचित अगला कदम है।",
    recommendedTestSlugs: ["ecg-test-pokaran"],
  },
];

export function getHealthConcernBySlug(slug: string): HealthConcern | undefined {
  return healthConcerns.find((c) => c.slug === slug);
}
