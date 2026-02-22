-- ============================================
-- N'BAZAAR360 SAMPLE DATA
-- Run this script after init-database.sql
-- ============================================

-- Set UTF-8 encoding for this session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

USE nbaazar360;

-- ============================================
-- 1. CREATE DEFAULT ADMIN USER
-- Email: admin@nbaazar360.al
-- Password: Admin123!
-- ============================================
-- Note: This is a bcrypt hash of "Admin123!" with 10 salt rounds
INSERT INTO users (email, username, full_name, role, status, password_hash, terms_accepted, created_at)
VALUES (
    'admin@nbaazar360.al',
    'admin',
    'Administratori n\'Bazaar360',
    'admin',
    'active',
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    true,
    NOW()
);

-- ============================================
-- 2. SAMPLE LOCATIONS IN PAZARI I RI
-- ============================================
INSERT INTO locations (name, slug, description, short_description, latitude, longitude, address, is_published, display_order, created_by) VALUES
(
    'Sheshi Kryesor',
    'sheshi-kryesor',
    'Sheshi kryesor i Pazarit të Ri, ku takohen tregtarët dhe vizitorët çdo ditë. Një hapësirë e gjallë plot me ngjyra, aroma dhe tinguj tradicionale shqiptare.',
    'Zemra e gjallë e Pazarit të Ri',
    41.3275,
    19.8187,
    'Pazari i Ri, Rruga Avni Rustemi, Tiranë',
    true,
    1,
    1
),
(
    'Qoshja e Artizanëve',
    'qoshja-artizaneve',
    'Një zone e veçantë ku zejtarët tradicionalë shqiptarë punojnë dhe shesin punime dore. Këtu mund të gjeni bakër, qilima, dhe veshje tradicionale.',
    'Arti tradicional shqiptar i gjallë',
    41.3277,
    19.8185,
    'Pazari i Ri, Rruga Myslym Shyri, Tiranë',
    true,
    2,
    1
),
(
    'Tregu i Perimeve',
    'tregu-perimeve',
    'Tregu më i freskët në Tiranë! Perime dhe fruta nga fshatrat përreth, të sjella çdo mëngjes nga fermerët lokalë.',
    'Fresket më të mira të qytetit',
    41.3273,
    19.8190,
    'Pazari i Ri, Rruga e Kavajës, Tiranë',
    true,
    3,
    1
),
(
    'Këndi i Kafes',
    'kendi-kafes',
    'Kafene tradicionale shqiptare ku mund të shijosh një kafe turke dhe të bisedosh me tregtarët lokalë.',
    'Kafe dhe kulturë',
    41.3276,
    19.8188,
    'Pazari i Ri, Qendra, Tiranë',
    true,
    4,
    1
);

-- ============================================
-- 3. SAMPLE VENDORS (Artisans/Shops)
-- Password for all vendors: Vendor123!
-- ============================================
INSERT INTO users (
    email, username, full_name, business_name, business_description, business_type,
    phone, address, about, contact_info, role, status,
    terms_accepted, approved_by, approved_at, location_id, password_hash, created_at
) VALUES
(
    'agim.gjini@example.com',
    'agim_metalwork',
    'Agim Gjini',
    'Agim Gjini - Punime Bakri',
    'Punime artistike në bakër që nga viti 1987',
    'artisan',
    '+355 69 234 5678',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 12, Tiranë',
    'Tre breza të familjes Gjini kanë punuar bakrin në Tiranë. Teknikat tona tradicionale kalojnë nga babai te djali që nga viti 1960. Çdo copë është e punuar me dorë dhe bartë historinë e artizanatit shqiptar.',
    'Telefon: +355 69 234 5678\nOrari: E Hënë - E Shtunë, 08:00 - 18:00\nInstagram: @agimgjini_copper',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'fatmir.shehu@example.com',
    'traditional_textiles',
    'Fatmir Shehu',
    'Tekstile Tradicionale Shehu',
    'Qilima dhe thurje të punuar me dorë',
    'artisan',
    '+355 69 345 6789',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 8, Tiranë',
    'Qilimat tona janë thurur me teknika që vijnë nga veri i Shqipërisë. Çdo model tregon një histori nga kultura jonë. Ngjyrat janë natyrale, nga bimët e malit.',
    'Telefon: +355 69 345 6789\nOrari: E Hënë - E Premte, 09:00 - 17:00\nFacebook: Tekstile Shehu',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'luan.hoxha@example.com',
    'hoxha_pottery',
    'Luan Hoxha',
    'Poçeritë e Hoxhës',
    'Poçeri tradicionale shqiptare',
    'artisan',
    '+355 69 456 7890',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 15, Tiranë',
    'Poçeritë tona bëhen me argjilë nga liqeni i Shkodrës. Forma dhe dekoret janë të trashëguara nga gjyshërit tanë. Çdo enë është unike.',
    'Telefon: +355 69 456 7890\nOrari: E Martë - E Shtunë, 08:30 - 18:30\nEmail: luan.hoxha@pocerite.al',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'ardian.kola@example.com',
    'kola_traditional_food',
    'Ardian Kola',
    'Ushqime Tradicionale Kola',
    'Produktet më të mira vendase',
    'shop',
    '+355 69 567 8901',
    'Pazari i Ri, Tregu i Perimeve, Stendi 23, Tiranë',
    'Familja Kola sjell produkte nga fshati në Tiranë që nga viti 1995. Gjithçka është e freskët, pa kimikate, e mbjellë dhe e korrur me duart tona.',
    'Telefon: +355 69 567 8901\nOrari: Çdo ditë, 06:00 - 14:00',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    3,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'elona.rama@example.com',
    'kafe_elona',
    'Elona Rama',
    'Kafja e Elonës',
    'Kafe tradicionale dhe ëmbëlsira shqiptare',
    'cafe',
    '+355 69 678 9012',
    'Pazari i Ri, Këndi i Kafes, Stendi 5, Tiranë',
    'Kafja jonë e zezë është e përgatitur sipas recetës së gjyshes. Bakllava dhe kadaifi janë të bëra çdo mëngjes. Atmosfera është si në shtëpi.',
    'Telefon: +355 69 678 9012\nOrari: E Hënë - E Shtunë, 07:00 - 20:00\nInstagram: @kafjaelones',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    4,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'shpetim.dervishi@example.com',
    'dervishi_leatherwork',
    'Shpëtim Dervishi',
    'Lëkurë e Punuar Dervishi',
    'Çanta dhe rripa lëkure të punuar me dorë',
    'artisan',
    '+355 69 789 0123',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 18, Tiranë',
    'Punoj lëkurën që nga moshat 15 vjeç. Çdo çantë është e qepur me dorë dhe zgjat një jetë. Lëkura vjen nga lopët e rritura në Malësi.',
    'Telefon: +355 69 789 0123\nOrari: E Mërkurë - E Diel, 10:00 - 19:00',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'marjana.krasniqi@example.com',
    'krasniqi_jewelry',
    'Marjana Krasniqi',
    'Stoli Krasniqi',
    'Stoli argjendie dhe veshje tradicionale',
    'artisan',
    '+355 69 890 1234',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 7, Tiranë',
    'Stolitë tona janë të dizajnuara sipas motiveve të vjetra shqiptare. Argjendia është 925 dhe çdo copë është e punuar me duart e mia. Veshjet tradicionale përshtaten për dasmë dhe festa.',
    'Telefon: +355 69 890 1234\nOrari: E Hënë - E Shtunë, 09:00 - 18:00\nFacebook: Stoli Krasniqi',
    'vendor',
    'active',
    true,
    1,
    NOW(),
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
);

-- ============================================
-- 3.5 PENDING VENDORS (for testing approval workflow)
-- These vendors are waiting for admin approval
-- ============================================
INSERT INTO users (
    email, username, full_name, business_name, business_description, business_type,
    phone, address, about, contact_info, role, status,
    terms_accepted, location_id, password_hash, created_at
) VALUES
(
    'driton.berisha@example.com',
    'berisha_woodwork',
    'Driton Berisha',
    'Punime Druri Berisha',
    'Mobilje dhe objekte dekorative nga druri',
    'artisan',
    '+355 69 111 2222',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 20, Tiranë',
    'Punoj drurin e ahut dhe arrës për të krijuar mobilje unike tradicionale.',
    'Telefon: +355 69 111 2222\nOrari: E Hënë - E Shtunë, 09:00 - 18:00',
    'vendor',
    'pending',
    true,
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'lindita.hoxha@example.com',
    'lindita_embroidery',
    'Lindita Hoxha',
    'Qëndisjet e Linditës',
    'Qëndisje tradicionale shqiptare',
    'artisan',
    '+355 69 333 4444',
    'Pazari i Ri, Qoshja e Artizanëve, Stendi 22, Tiranë',
    'Qëndisjet e mia janë frymëzuar nga motivet tradicionale të Shqipërisë së Veriut.',
    'Telefon: +355 69 333 4444\nOrari: E Martë - E Diel, 10:00 - 19:00',
    'vendor',
    'pending',
    true,
    2,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
),
(
    'besnik.kelmendi@example.com',
    'kelmendi_honey',
    'Besnik Kelmendi',
    'Mjaltë e Malit Kelmendi',
    'Mjaltë natyrale nga malet e Shqipërisë',
    'shop',
    '+355 69 555 6666',
    'Pazari i Ri, Tregu i Perimeve, Stendi 30, Tiranë',
    'Bletët e mia jetojnë në malet e Tropojës dhe prodhojnë mjaltën më të pastër.',
    'Telefon: +355 69 555 6666\nOrari: Çdo ditë, 07:00 - 15:00',
    'vendor',
    'pending',
    true,
    3,
    '$2b$10$ypghXFwyQjNbIHyOkLnPy.fugC3lsdrpezJDrSt/GpctMRN/uICtS',
    NOW()
);

-- ============================================
-- 4. SAMPLE AR STORIES
-- ============================================
INSERT INTO ar_stories (
    title, slug, artisan_name, profession, short_bio, full_story,
    video_url, duration_seconds, location_id, vendor_id,
    is_primary_story, is_featured, is_published, created_at
) VALUES
(
    'Arti i Punimit të Bakrit',
    'arti-punimit-bakrit',
    'Agim Gjini',
    'Zejtari i Bakrit',
    'Tre breza të punës së bakrit të familjes Gjini.',
    'Historia e familjes Gjini fillon në vitet 1960 kur gjyshi im filloi të punojë bakrin në dyqanin e tij të vogël në Tiranë. Teknikat që ai përdorte ishin të trashëguara nga zejtarë të vjetër otomanë. Babai im vazhdoi këtë traditë dhe më mësoi mua çdo sekret të zanatit. Sot, unë dhe djali im punojmë së bashku, duke ruajtur këtë art për brezat e ardhshëm. Çdo copë që krijohet këtu ka shpirt dhe histori.',
    'https://sample-videos.com/agim-gjini-bakri.mp4',
    180,
    2,
    2,
    true,
    true,
    true,
    NOW()
),
(
    'Thurja Tradicionale Shqiptare',
    'thurja-tradicionale',
    'Fatmir Shehu',
    'Thurës Qilimash',
    'Teknikat e thurjes nga veriu i Shqipërisë.',
    'Gjyshja ime më mësoi të thurë kur isha 8 vjeç. Ajo thurte qilima për familjen dhe fqinjët në fshatin tonë në Shkodër. Motivet që përdorim kanë kuptim - çdo ngjyrë dhe formë tregon diçka: malin, lumin, diellin. Ngjyrat i nxjerrim nga bimët: kafe nga lëvozhgat e arrës, blu nga indigo, kuq nga lëkura e qepës. Një qilim mund të më marrë dy muaj, por ai do të zgjasë një jetë të tërë.',
    'https://sample-videos.com/fatmir-shehu-thurje.mp4',
    210,
    2,
    3,
    true,
    true,
    true,
    NOW()
),
(
    'Poçeria e Trashëguar',
    'poceria-trasheguar',
    'Luan Hoxha',
    'Poçar',
    'Poçeri të bëra me argjilë nga Liqeni i Shkodrës.',
    'Argjila që përdorim vjen nga brigjet e Liqenit të Shkodrës, e njëjta argjilë që përdornin paraardhësit tanë shekuj më parë. E sjellim, e lajmë, e lëmë të thahet pikërisht sa duhet. Rrotën e kam nga babai im, dhe ai nga i ati. Kur punon argjilën, duhet të ndjesh se si ajo të drejton duart. Nuk je ti që e formon argjilën, por argjila që të formon ty.',
    'https://sample-videos.com/luan-hoxha-poceri.mp4',
    195,
    2,
    4,
    true,
    false,
    true,
    NOW()
),
(
    'Nga Ferma në Treg',
    'nga-ferma-ne-treg',
    'Ardian Kola',
    'Fermer',
    'Rrugëtimi i produkteve nga fshati në Tiranë.',
    'Çdo mëngjes në orën 4, ne nisemi nga fshati me kamionin plot me perime. I kemi mbjellë vetë, pa pleh kimik, pa pesticide. Domatet e kuqe janë nga farat që gjyshja ime ruante çdo vit. Trungujtë janë të ëmbël sepse toka jonë është e pasur. Kur një klient të thotë "Kjo domate ka shijes si ato të dikurshme", atëherë di që punën e ke bërë mirë.',
    'https://sample-videos.com/ardian-kola-ferma.mp4',
    165,
    3,
    5,
    true,
    false,
    true,
    NOW()
),
(
    'Kafja e Zezë Tradicionale',
    'kafja-zeze-tradicionale',
    'Elona Rama',
    'Pronarë Kafeneje',
    'Sekretet e kafes së zezë shqiptare.',
    'Kafja e zezë është më shumë se pije - është ritual. Recetën e kam nga gjyshja ime që e mbante një kafe të vogël në qytet. Kafja duhet të vlojë ngadalë, jo shpejt. Duhet të aromë shtëpinë. Dhe kur e servirësh, duhet të jetë me shkumë të trashë sipermas. Ne e shoqërojmë me bakllava që bëjmë çdo mëngjes. Klientët vijnë jo vetëm për kafen, por për atmosferën e ngrohtë, për bisedën.',
    'https://sample-videos.com/elona-rama-kafe.mp4',
    175,
    4,
    6,
    true,
    true,
    true,
    NOW()
);

-- ============================================
-- 5. SAMPLE PANORAMAS (360° photos)
-- ============================================
INSERT INTO panoramas (location_id, title, image_url, thumbnail_url, initial_view_angle, is_primary, display_order) VALUES
(1, 'Pamja Kryesore e Sheshit', 'https://sample-360.com/sheshi-kryesor-main.jpg', 'https://sample-360.com/thumbs/sheshi-main.jpg', 0, true, 1),
(1, 'Pamja Lindore', 'https://sample-360.com/sheshi-kryesor-east.jpg', 'https://sample-360.com/thumbs/sheshi-east.jpg', 90, false, 2),
(2, 'Hyrja e Qoshes së Artizanëve', 'https://sample-360.com/artizane-entrance.jpg', 'https://sample-360.com/thumbs/artizane-entrance.jpg', 0, true, 1),
(2, 'Qendra e Dyqaneve', 'https://sample-360.com/artizane-center.jpg', 'https://sample-360.com/thumbs/artizane-center.jpg', 180, false, 2),
(3, 'Tregu i Perimeve - Pamja Veriore', 'https://sample-360.com/treg-north.jpg', 'https://sample-360.com/thumbs/treg-north.jpg', 0, true, 1),
(4, 'Brendësia e Kafes', 'https://sample-360.com/kafe-interior.jpg', 'https://sample-360.com/thumbs/kafe-interior.jpg', 0, true, 1);

-- ============================================
-- 6. SAMPLE HOTSPOTS (navigation between panoramas)
-- ============================================
INSERT INTO hotspots (panorama_id, title, description, hotspot_type, pitch, yaw, link_to_panorama_id) VALUES
(1, 'Shiko nga Lindja', 'Kthehu për të parë pamjen lindore të sheshit', 'navigation', 0, 90, 2),
(2, 'Kthehu në Qendër', 'Rikthehu në pamjen kryesore të sheshit', 'navigation', 0, 270, 1),
(3, 'Shko në Qendër', 'Ec drejt qendrës së dyqaneve', 'navigation', -5, 180, 4),
(4, 'Kthehu në Hyrje', 'Rikthehu te hyrja', 'navigation', 0, 0, 3);

-- ============================================
-- 7. SAMPLE EVENTS
-- ============================================
INSERT INTO events (
    title, slug, description, short_description, event_type,
    start_date, end_date, start_time, end_time, location_id,
    venue_name, is_published, is_featured, created_at
) VALUES
(
    'Festivali i Artizanatit Tradicional',
    'festivali-artizanatit',
    'Një festë e madhe e artizanatit tradicional shqiptar ku zejtarët nga e gjithë Shqipëria vijnë të shfaqin dhe shesin punimet e tyre.',
    'Zejtarët më të mirë të Shqipërisë',
    'festival',
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    DATE_ADD(CURDATE(), INTERVAL 32 DAY),
    '09:00:00',
    '21:00:00',
    1,
    'Pazari i Ri - Sheshi Kryesor',
    true,
    true,
    NOW()
),
(
    'Punëtori: Mësoni të Thuani Qilima',
    'punetori-thurje-qilima',
    'Një mundësi unike për të mësuar teknikat e thurjes së qilimave tradicionale nga mjeshtrit e Shkodrës.',
    'Mësoni artin e vjetër të thurjes',
    'workshop',
    DATE_ADD(CURDATE(), INTERVAL 14 DAY),
    NULL,
    '10:00:00',
    '14:00:00',
    2,
    'Qoshja e Artizanëve',
    true,
    false,
    NOW()
),
(
    'Ekspozita: Bakri i Tiranës',
    'ekspozita-bakri-tiranes',
    'Ekspozitë e punimeve të bakrit nga zejtarët e Tiranës, duke treguar historinë dhe evolucionin e kësaj tradite.',
    'Historia e bakrit në Tiranë',
    'exhibition',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    DATE_ADD(CURDATE(), INTERVAL 21 DAY),
    '08:00:00',
    '20:00:00',
    2,
    'Qoshja e Artizanëve',
    true,
    true,
    NOW()
);

-- ============================================
-- 8. SITE SETTINGS
-- ============================================
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'n\'Bazaar360', 'string', 'Website name'),
('site_description', 'Digital Cultural Experience Platform for Pazari i Ri', 'string', 'Website description'),
('default_language', 'sq', 'string', 'Default language code'),
('contact_email', 'info@nbaazar360.al', 'string', 'Contact email address'),
('social_facebook', 'https://facebook.com/nbaazar360', 'string', 'Facebook page URL'),
('social_instagram', 'https://instagram.com/nbaazar360', 'string', 'Instagram page URL'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode');

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Sample data inserted successfully!' as status;
SELECT 'Admin login: admin@nbaazar360.al / Admin123!' as credentials;
SELECT 'Vendor login: agim.gjini@example.com / Admin123!' as vendor_credentials;

SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_locations FROM locations;
SELECT COUNT(*) as total_stories FROM ar_stories;
SELECT COUNT(*) as total_panoramas FROM panoramas;
SELECT COUNT(*) as total_events FROM events;
