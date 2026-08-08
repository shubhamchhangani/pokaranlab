-- Pokaran Lab — starter catalog content
-- Run once after schema.sql, on a project with an empty `tests`/`packages`/`test_categories`.
-- This is deliberately the same starting content the mock-data fallback used
-- (lib/data/mock-content.ts), now as real, admin-editable rows — replace prices/tests with the
-- lab's actual price list from /admin/catalog whenever it's available; nothing here is final.

insert into test_categories (id, name_en, name_hi) values
  ('11111111-1111-1111-1111-111111111101', 'Blood Test', 'ब्लड टेस्ट'),
  ('11111111-1111-1111-1111-111111111102', 'X-Ray', 'एक्स-रे'),
  ('11111111-1111-1111-1111-111111111103', 'ECG', 'ईसीजी')
on conflict (id) do nothing;

insert into tests (
  category_id, name_en, name_hi, description_en, description_hi, sample_type, price,
  turnaround_time, home_collection_available, slug
) values
  (
    '11111111-1111-1111-1111-111111111101',
    'Complete Blood Count (CBC)', 'कंप्लीट ब्लड काउंट (सीबीसी)',
    'Measures red cells, white cells, and platelets to screen for anaemia, infection, and general health.',
    'एनीमिया, संक्रमण व सामान्य स्वास्थ्य की जांच के लिए लाल रक्त कण, श्वेत रक्त कण व प्लेटलेट्स की जांच।',
    'Venous blood', 300, 'Same day', true, 'cbc-test-pokaran'
  ),
  (
    '11111111-1111-1111-1111-111111111101',
    'Thyroid Profile (T3, T4, TSH)', 'थायरॉइड प्रोफाइल (T3, T4, TSH)',
    'Checks thyroid hormone levels to screen for hypo- or hyperthyroidism.',
    'हाइपो या हाइपरथायरॉइडिज़्म की जांच के लिए थायरॉइड हार्मोन स्तर की जांच।',
    'Venous blood', 500, 'Next day', true, 'thyroid-profile-pokaran'
  ),
  (
    '11111111-1111-1111-1111-111111111101',
    'Vitamin D3 Test', 'विटामिन डी3 टेस्ट',
    'Measures vitamin D levels in the blood.',
    'रक्त में विटामिन डी के स्तर की जांच।',
    'Venous blood', 800, '2 days', true, 'vitamin-d3-test-pokaran'
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Digital X-Ray — Chest', 'डिजिटल एक्स-रे — चेस्ट',
    'High-resolution digital chest X-ray.',
    'उच्च गुणवत्ता वाला डिजिटल चेस्ट एक्स-रे।',
    'N/A', 400, 'Same day', false, 'digital-xray-chest-pokaran'
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'ECG (Electrocardiogram)', 'ईसीजी (इलेक्ट्रोकार्डियोग्राम)',
    'Records the electrical activity of the heart.',
    'हृदय की विद्युत गतिविधि की रिकॉर्डिंग।',
    'N/A', 250, 'Same day', false, 'ecg-test-pokaran'
  )
on conflict (slug) do nothing;

insert into packages (name_en, name_hi, description_en, description_hi, price, slug)
values (
  'Fever Panel', 'फीवर पैनल',
  'CBC, malaria, typhoid, and dengue screening in one panel.',
  'एक ही पैनल में सीबीसी, मलेरिया, टाइफाइड व डेंगू जांच।',
  900, 'fever-panel-pokaran'
)
on conflict (slug) do nothing;

-- Link the one test we actually have a row for; add malaria/typhoid/dengue as their own `tests`
-- rows later and link them here too once the lab's real panel composition is known.
insert into package_tests (package_id, test_id)
select p.id, t.id from packages p, tests t
where p.slug = 'fever-panel-pokaran' and t.slug = 'cbc-test-pokaran'
on conflict do nothing;
