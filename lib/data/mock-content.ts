/**
 * Placeholder content shown until the real Supabase project is created and seeded.
 * Shape mirrors lib/types/database.ts so swapping to live queries is a drop-in change.
 * Delete this file once lib/data/tests.ts and lib/data/packages.ts talk to real Supabase data.
 */

export type MockTest = {
  slug: string;
  name_en: string;
  name_hi: string;
  category_en: string;
  sample_type: string;
  price: number;
  turnaround_time: string;
  home_collection_available: boolean;
  description_en: string;
  description_hi: string;
  primary_image_url?: string | null;
};

export const mockTests: MockTest[] = [
  {
    slug: "cbc-test-pokaran",
    name_en: "Complete Blood Count (CBC)",
    name_hi: "कंप्लीट ब्लड काउंट (सीबीसी)",
    category_en: "Blood Test",
    sample_type: "Venous blood",
    price: 300,
    turnaround_time: "Same day",
    home_collection_available: true,
    description_en:
      "Measures red cells, white cells, and platelets to screen for anaemia, infection, and general health.",
    description_hi:
      "एनीमिया, संक्रमण व सामान्य स्वास्थ्य की जांच के लिए लाल रक्त कण, श्वेत रक्त कण व प्लेटलेट्स की जांच।",
  },
  {
    slug: "thyroid-profile-pokaran",
    name_en: "Thyroid Profile (T3, T4, TSH)",
    name_hi: "थायरॉइड प्रोफाइल (T3, T4, TSH)",
    category_en: "Blood Test",
    sample_type: "Venous blood",
    price: 500,
    turnaround_time: "Next day",
    home_collection_available: true,
    description_en:
      "Checks thyroid hormone levels to screen for hypo- or hyperthyroidism.",
    description_hi:
      "हाइपो या हाइपरथायरॉइडिज़्म की जांच के लिए थायरॉइड हार्मोन स्तर की जांच।",
  },
  {
    slug: "vitamin-d3-test-pokaran",
    name_en: "Vitamin D3 Test",
    name_hi: "विटामिन डी3 टेस्ट",
    category_en: "Blood Test",
    sample_type: "Venous blood",
    price: 800,
    turnaround_time: "2 days",
    home_collection_available: true,
    description_en: "Measures vitamin D levels in the blood.",
    description_hi: "रक्त में विटामिन डी के स्तर की जांच।",
  },
  {
    slug: "digital-xray-chest-pokaran",
    name_en: "Digital X-Ray — Chest",
    name_hi: "डिजिटल एक्स-रे — चेस्ट",
    category_en: "X-Ray",
    sample_type: "N/A",
    price: 400,
    turnaround_time: "Same day",
    home_collection_available: false,
    description_en: "High-resolution digital chest X-ray.",
    description_hi: "उच्च गुणवत्ता वाला डिजिटल चेस्ट एक्स-रे।",
  },
  {
    slug: "ecg-test-pokaran",
    name_en: "ECG (Electrocardiogram)",
    name_hi: "ईसीजी (इलेक्ट्रोकार्डियोग्राम)",
    category_en: "ECG",
    sample_type: "N/A",
    price: 250,
    turnaround_time: "Same day",
    home_collection_available: false,
    description_en: "Records the electrical activity of the heart.",
    description_hi: "हृदय की विद्युत गतिविधि की रिकॉर्डिंग।",
  },
];

export type MockPackage = {
  slug: string;
  name_en: string;
  name_hi: string;
  price: number;
  description_en: string;
  description_hi: string;
  includedTestSlugs: string[];
  primary_image_url?: string | null;
};

export const mockPackages: MockPackage[] = [
  {
    slug: "fever-panel-pokaran",
    name_en: "Fever Panel",
    name_hi: "फीवर पैनल",
    price: 900,
    description_en: "CBC, malaria, typhoid, and dengue screening in one panel.",
    description_hi: "एक ही पैनल में सीबीसी, मलेरिया, टाइफाइड व डेंगू जांच।",
    includedTestSlugs: ["cbc-test-pokaran"],
  },
];

/**
 * Fallback only — shown before a Supabase project exists. Once `site_settings` is seeded
 * (supabase/schema.sql does this automatically), the real, admin-editable row from
 * lib/data/site.ts takes over and this object is never read. Edit the lab's real
 * details from /admin/settings, not here.
 */
export const mockSiteInfo = {
  name_en: "Pokaran Diagnostic & Dr X Ray Center",
  name_hi: "पोकरण डायग्नोस्टिक एंड डॉ एक्स-रे सेंटर",
  shortName: "Pokaran Lab",
  address_en:
    "Near CHC / Govt. Hospital, Jodh Nagar, Pokaran, Dist. Jaisalmer, Rajasthan",
  address_hi: "सीएचसी / सरकारी अस्पताल के पास, जोध नगर, पोकरण, जिला जैसलमेर, राजस्थान",
  phone: "+91-XXXXXXXXXX",
  whatsapp: "91XXXXXXXXXX",
  email: "info@pokaranlab.com",
  hours_en: "Mon–Sat: 7:00 AM – 8:00 PM, Sun: 8:00 AM – 1:00 PM",
  hours_hi: "सोम–शनि: सुबह 7:00 – रात 8:00, रवि: सुबह 8:00 – दोपहर 1:00",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Pokaran+Jaisalmer+Rajasthan&output=embed",
  mapsDirectionsUrl: "https://maps.google.com/?q=Pokaran+Jaisalmer+Rajasthan",
};
