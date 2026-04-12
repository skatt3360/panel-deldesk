import { EquipmentType, EquipmentStatus } from '../types';

export const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'laptop',    label: 'Laptop' },
  { value: 'desktop',   label: 'Komputer stacjonarny' },
  { value: 'monitor',   label: 'Monitor' },
  { value: 'printer',   label: 'Drukarka' },
  { value: 'scanner',   label: 'Skaner' },
  { value: 'phone',     label: 'Telefon' },
  { value: 'tablet',    label: 'Tablet' },
  { value: 'keyboard',  label: 'Klawiatura' },
  { value: 'mouse',     label: 'Mysz' },
  { value: 'headset',   label: 'Słuchawki / Zestaw głośnomówiący' },
  { value: 'projector', label: 'Projektor' },
  { value: 'camera',    label: 'Kamera' },
  { value: 'server',    label: 'Serwer' },
  { value: 'switch',    label: 'Switch' },
  { value: 'router',    label: 'Router' },
  { value: 'ups',       label: 'UPS' },
  { value: 'dock',      label: 'Stacja dokująca' },
  { value: 'cable',     label: 'Kabel / Akcesorium' },
  { value: 'other',     label: 'Inne' },
];

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  laptop:    'Laptop',
  desktop:   'Komputer stacjonarny',
  monitor:   'Monitor',
  printer:   'Drukarka',
  scanner:   'Skaner',
  phone:     'Telefon',
  tablet:    'Tablet',
  keyboard:  'Klawiatura',
  mouse:     'Mysz',
  headset:   'Słuchawki',
  projector: 'Projektor',
  camera:    'Kamera',
  server:    'Serwer',
  switch:    'Switch',
  router:    'Router',
  ups:       'UPS',
  dock:      'Stacja dokująca',
  cable:     'Kabel',
  other:     'Inne',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: 'Dostępny',
  assigned:  'Przydzielony',
  service:   'Serwis',
  retired:   'Wycofany',
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, { bg: string; text: string; border: string }> = {
  available: { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  assigned:  { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  service:   { bg: 'rgba(234,179,8,0.12)',  text: '#facc15', border: 'rgba(234,179,8,0.25)' },
  retired:   { bg: 'rgba(107,114,128,0.12)',text: '#9ca3af', border: 'rgba(107,114,128,0.25)' },
};

export const BRANDS_BY_TYPE: Record<EquipmentType, string[]> = {
  laptop:    ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Microsoft', 'Toshiba', 'Inne'],
  desktop:   ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'Inne'],
  monitor:   ['Dell', 'LG', 'Samsung', 'BenQ', 'HP', 'ASUS', 'Philips', 'AOC', 'ViewSonic', 'Inne'],
  printer:   ['HP', 'Canon', 'Epson', 'Brother', 'Lexmark', 'Kyocera', 'Xerox', 'Inne'],
  scanner:   ['Canon', 'Epson', 'HP', 'Brother', 'Fujitsu', 'Inne'],
  phone:     ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Nokia', 'Inne'],
  tablet:    ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Huawei', 'Inne'],
  keyboard:  ['Logitech', 'Microsoft', 'Cherry', 'Apple', 'HP', 'Dell', 'Inne'],
  mouse:     ['Logitech', 'Microsoft', 'HP', 'Dell', 'ASUS', 'Inne'],
  headset:   ['Jabra', 'Plantronics', 'Logitech', 'Poly', 'Sennheiser', 'Sony', 'Inne'],
  projector: ['Epson', 'BenQ', 'Optoma', 'ViewSonic', 'NEC', 'Panasonic', 'Inne'],
  camera:    ['Logitech', 'Microsoft', 'Poly', 'Yealink', 'AXIS', 'Inne'],
  server:    ['Dell', 'HP', 'Lenovo', 'IBM', 'SuperMicro', 'Inne'],
  switch:    ['Cisco', 'TP-Link', 'HP', 'Netgear', 'D-Link', 'Juniper', 'Inne'],
  router:    ['Cisco', 'ASUS', 'TP-Link', 'Netgear', 'Mikrotik', 'Inne'],
  ups:       ['APC', 'Eaton', 'CyberPower', 'Legrand', 'Inne'],
  dock:      ['Dell', 'HP', 'Lenovo', 'CalDigit', 'Targus', 'Inne'],
  cable:     ['Inne'],
  other:     ['Inne'],
};

export const MODELS_BY_BRAND: Record<string, string[]> = {
  // ── Laptopy Dell ──────────────────────────────────────────────────────────
  'Dell': [
    'Latitude 5530', 'Latitude 5540', 'Latitude 7430', 'Latitude 7440',
    'XPS 13', 'XPS 15', 'XPS 13 Plus',
    'Vostro 3510', 'Vostro 3520', 'Vostro 5620',
    'Precision 5570', 'Precision 5580',
    'OptiPlex 3090', 'OptiPlex 5090', 'OptiPlex 7090',
    'OptiPlex 3000', 'OptiPlex 5000', 'OptiPlex 7000',
    'PowerEdge R540', 'PowerEdge R640', 'PowerEdge R740', 'PowerEdge T440',
    'U2422H', 'P2422H', 'S2422H', 'U2722D', 'P3222QE', 'SE2722H',
    'U2723QE', 'P2723QE', 'S2721DS',
    'WD19', 'WD19S', 'WD22TB4',
    'Inne',
  ],
  // ── Laptopy HP ────────────────────────────────────────────────────────────
  'HP': [
    'EliteBook 840 G9', 'EliteBook 850 G9', 'EliteBook 640 G9', 'EliteBook 840 G8',
    'ProBook 450 G9', 'ProBook 440 G9', 'ProBook 640 G8',
    'Pavilion 15', 'Pavilion 14',
    'ZBook Studio G9', 'ZBook Fury 16 G10',
    'ProDesk 600 G6', 'ProDesk 400 G7', 'EliteDesk 800 G6',
    'ProOne 440 G6', 'EliteOne 800 G6',
    'LaserJet Pro M404dn', 'LaserJet Pro M428fdw', 'Color LaserJet Pro M479fdw',
    'LaserJet Enterprise M507dn', 'OfficeJet Pro 9012e', 'OfficeJet Pro 8022e',
    '24mh', 'E24d G4', 'Z24i G3', 'M24fw',
    'USB-C Dock G5', 'USB-C/A Universal Dock G2',
    'X500', 'Z3700',
    'Inne',
  ],
  // ── Laptopy Lenovo ────────────────────────────────────────────────────────
  'Lenovo': [
    'ThinkPad T14s Gen 3', 'ThinkPad T14 Gen 3', 'ThinkPad T480', 'ThinkPad T490',
    'ThinkPad X1 Carbon Gen 11', 'ThinkPad X1 Carbon Gen 10',
    'ThinkPad L14 Gen 3', 'ThinkPad L15 Gen 3',
    'ThinkPad E14 Gen 4', 'ThinkPad E15 Gen 4',
    'IdeaPad 3 15', 'IdeaPad 5 15',
    'V15 Gen 4', 'V14 Gen 4',
    'ThinkCentre M70q Gen 3', 'ThinkCentre M90n', 'ThinkCentre M90q',
    'ThinkStation P350', 'ThinkStation P360',
    'ThinkPad USB-C Dock Gen 2', 'ThinkPad Thunderbolt 4 Dock',
    'Inne',
  ],
  // ── Laptopy Apple ────────────────────────────────────────────────────────
  'Apple': [
    'MacBook Air M1', 'MacBook Air M2', 'MacBook Air M3',
    'MacBook Pro 14" M3', 'MacBook Pro 16" M3', 'MacBook Pro 14" M2', 'MacBook Pro 16" M2',
    'Mac mini M1', 'Mac mini M2', 'Mac mini M4',
    'iMac 24" M1', 'iMac 24" M3',
    'iPhone 13', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro', 'iPhone SE 3',
    'iPad 10th gen', 'iPad Air M1', 'iPad Air M2', 'iPad Pro 11" M2', 'iPad Pro 12.9" M2', 'iPad mini 6th gen',
    'Magic Keyboard', 'Magic Keyboard z Touch ID',
    'Magic Mouse', 'Magic Trackpad',
    'Inne',
  ],
  // ── Laptopy ASUS ─────────────────────────────────────────────────────────
  'ASUS': [
    'ZenBook 14 UX425', 'ZenBook 14X', 'ZenBook Pro 15',
    'VivoBook 15 X512', 'VivoBook 15 M515',
    'ExpertBook B1 B1500', 'ExpertBook B2 B2502',
    'ROG Zephyrus G14', 'ROG Strix G15',
    'ProArt StudioBook 16',
    'ZenScreen MB249C', 'ProArt PA279CV',
    'RT-AX86U', 'RT-AX88U', 'ZenWiFi Pro XT12',
    'Inne',
  ],
  // ── Laptopy Acer ─────────────────────────────────────────────────────────
  'Acer': [
    'Aspire 5 A515', 'Aspire 3 A315',
    'Swift 3 SF314', 'Swift 5 SF514',
    'TravelMate P2 TMP215', 'TravelMate P4 TMP414',
    'Nitro 5 AN515', 'ConceptD 5',
    'Inne',
  ],
  // ── Microsoft ────────────────────────────────────────────────────────────
  'Microsoft': [
    'Surface Pro 9', 'Surface Pro 8', 'Surface Pro X',
    'Surface Laptop 5', 'Surface Laptop 4',
    'Surface Book 3',
    'Arc Mouse', 'Sculpt Ergonomic Mouse', 'Bluetooth Mobile Mouse 3600',
    'Ergonomic Keyboard', 'Compact Wireless Keyboard',
    'Inne',
  ],
  // ── Monitory LG ──────────────────────────────────────────────────────────
  'LG': [
    '27UK850-W', '24MK600M', '27GP850-B', '27GP950-B',
    '32UL950-W', '34WN80C-B', '27UL850-W',
    '32QN650-B', '27QN600-B', '24QP500-B',
    'Inne',
  ],
  // ── Monitory Samsung ─────────────────────────────────────────────────────
  'Samsung': [
    '27" Odyssey G5 LC27G55TQ', 'S27A600NWU', '24T450FQR', 'U28R550UQR',
    'S34J550WQR', 'ViewFinity S8 S27B800PXU',
    'Galaxy A54', 'Galaxy A34', 'Galaxy S23', 'Galaxy S24', 'Galaxy S24+',
    'Galaxy Tab A8', 'Galaxy Tab S7 FE', 'Galaxy Tab S8',
    'Inne',
  ],
  // ── Monitory BenQ ────────────────────────────────────────────────────────
  'BenQ': [
    'GW2480', 'GW2485TC', 'PD2720U', 'EX2780Q',
    'PD3220U', 'SW271C', 'BL2780',
    'MH560', 'TK800M', 'W2700',
    'Inne',
  ],
  // ── Monitory Philips ─────────────────────────────────────────────────────
  'Philips': [
    '243V7QJABF', '272B7QPJEB', '346B1C', '279C9',
    'Inne',
  ],
  // ── Monitory AOC ─────────────────────────────────────────────────────────
  'AOC': [
    'Q27P2Q', 'CQ27G2S', 'U27P2CA', '24P2Q',
    'Inne',
  ],
  // ── Monitory ViewSonic ───────────────────────────────────────────────────
  'ViewSonic': [
    'VP2776', 'VA2715-H', 'VG2756-4K', 'VX2718-2KPC-MHD',
    'Inne',
  ],
  // ── Drukarki Canon ────────────────────────────────────────────────────────
  'Canon': [
    'i-SENSYS MF445dw', 'i-SENSYS MF543x', 'i-SENSYS MF735Cx',
    'i-SENSYS LBP6030', 'i-SENSYS LBP7660Cdn',
    'PIXMA TR8650', 'PIXMA TS5350i',
    'imageCLASS MF644Cdw',
    'CanoScan LIDE 300', 'CanoScan LIDE 400',
    'Inne',
  ],
  // ── Drukarki Epson ───────────────────────────────────────────────────────
  'Epson': [
    'EcoTank ET-4850', 'EcoTank ET-3850', 'EcoTank ET-2850',
    'WorkForce WF-4830', 'WorkForce Pro WF-6590',
    'Expression Premium XP-7100',
    'EB-W06', 'EB-FH52', 'EB-2265U', 'EB-1785W',
    'WorkForce DS-870', 'Perfection V39',
    'Inne',
  ],
  // ── Drukarki Brother ─────────────────────────────────────────────────────
  'Brother': [
    'HL-L2350DW', 'HL-L2395DW', 'HL-L8260CDW',
    'MFC-L2750DW', 'MFC-L8900CDW', 'MFC-J4540DW',
    'DCP-L3550CDW', 'DCP-L2550DN',
    'Inne',
  ],
  // ── Drukarki Lexmark ─────────────────────────────────────────────────────
  'Lexmark': [
    'MC3224adwe', 'MC3326adwe', 'CS431dw',
    'MS431dn', 'MB2236adw',
    'Inne',
  ],
  // ── Drukarki Kyocera ─────────────────────────────────────────────────────
  'Kyocera': [
    'ECOSYS M2540dn', 'ECOSYS M2040dn', 'ECOSYS P2040dn',
    'ECOSYS MA4000cifx', 'TASKalfa 2554ci',
    'Inne',
  ],
  // ── Drukarki Xerox ───────────────────────────────────────────────────────
  'Xerox': [
    'VersaLink C405', 'VersaLink B405', 'WorkCentre 3335',
    'C235', 'B315',
    'Inne',
  ],
  // ── Skanery Fujitsu ───────────────────────────────────────────────────────
  'Fujitsu': [
    'ScanSnap iX1600', 'ScanSnap iX1400', 'fi-7160',
    'Inne',
  ],
  // ── Mysz Logitech ─────────────────────────────────────────────────────────
  'Logitech': [
    'MX Master 3', 'MX Master 3S', 'MX Anywhere 3',
    'M650 L', 'M650 S', 'M325',
    'H650e', 'Zone Wired', 'Zone 900',
    'MX Keys', 'MX Keys S', 'K380', 'K870',
    'C920s', 'C925e', 'C1000e',
    'Inne',
  ],
  // ── Klawiatury Cherry ─────────────────────────────────────────────────────
  'Cherry': [
    'KC 1000', 'KC 6000 Slim', 'MX Board 3.0S',
    'MX 1.0 TKL', 'G80-3000', 'DW 9000 SLIM',
    'Inne',
  ],
  // ── Jabra ─────────────────────────────────────────────────────────────────
  'Jabra': [
    'Evolve2 65', 'Evolve2 40', 'Evolve2 85',
    'Evolve 75', 'Evolve 40', 'Evolve 30 II',
    'Speak 750', 'Speak 510',
    'Inne',
  ],
  // ── Plantronics ───────────────────────────────────────────────────────────
  'Plantronics': [
    'Voyager 5200', 'Voyager Focus 2', 'Blackwire 5220',
    'Savi 8220', 'CS540',
    'Inne',
  ],
  // ── Poly ─────────────────────────────────────────────────────────────────
  'Poly': [
    'Sync 40', 'Sync 60', 'Sync 20+',
    'Studio P5', 'Studio P15',
    'Voyager 4320', 'Blackwire 3320',
    'Inne',
  ],
  // ── Sennheiser ────────────────────────────────────────────────────────────
  'Sennheiser': [
    'EPOS Adapt 660', 'EPOS Adapt 561', 'SC 660',
    'SDW 5064', 'SDW 5034',
    'Inne',
  ],
  // ── Sony ─────────────────────────────────────────────────────────────────
  'Sony': [
    'WH-1000XM5', 'WH-1000XM4', 'WH-CH720N',
    'Inne',
  ],
  // ── Optoma ────────────────────────────────────────────────────────────────
  'Optoma': [
    'HD146X', 'UHD35', 'X600', 'ZH450',
    'Inne',
  ],
  // ── NEC ───────────────────────────────────────────────────────────────────
  'NEC': [
    'ME382U', 'MC422XG', 'PA803UL',
    'Inne',
  ],
  // ── Panasonic ─────────────────────────────────────────────────────────────
  'Panasonic': [
    'PT-VMZ60', 'PT-VZ580', 'PT-MZ680',
    'Inne',
  ],
  // ── Serwery HP ────────────────────────────────────────────────────────────
  // (HP already has entries above)

  // ── Cisco ─────────────────────────────────────────────────────────────────
  'Cisco': [
    'Catalyst 2960-X', 'Catalyst 2960-L', 'Catalyst 9200L',
    'SG350-28', 'SG350X-24', 'SF350-24P',
    'RV160', 'RV260', 'ISR 4321', 'ISR 4331',
    'Inne',
  ],
  // ── TP-Link ────────────────────────────────────────────────────────────────
  'TP-Link': [
    'TL-SG1024', 'TL-SG1048', 'TL-SG2428P',
    'Archer AX55', 'Archer AX73', 'Archer AX6000',
    'Deco XE75', 'EAP670',
    'Inne',
  ],
  // ── Netgear ────────────────────────────────────────────────────────────────
  'Netgear': [
    'GS308', 'GS316', 'GS724TP',
    'Nighthawk AX12', 'Orbi WiFi 6',
    'Inne',
  ],
  // ── D-Link ─────────────────────────────────────────────────────────────────
  'D-Link': [
    'DGS-1024D', 'DGS-1210-28', 'DSS-200G-10MP',
    'Inne',
  ],
  // ── Juniper ────────────────────────────────────────────────────────────────
  'Juniper': [
    'EX2300-24T', 'EX3400-24T', 'SRX300',
    'Inne',
  ],
  // ── Mikrotik ──────────────────────────────────────────────────────────────
  'Mikrotik': [
    'hEX S RB760iGS', 'CCR2004', 'hAP ac2', 'RB4011iGS+',
    'Inne',
  ],
  // ── APC ────────────────────────────────────────────────────────────────────
  'APC': [
    'Back-UPS 650', 'Back-UPS 900', 'Back-UPS Pro 1500',
    'Smart-UPS 750', 'Smart-UPS 1500', 'Smart-UPS 3000',
    'Inne',
  ],
  // ── Eaton ──────────────────────────────────────────────────────────────────
  'Eaton': [
    '5E 650i', '5E 1100i', '5PX 1500',
    '9SX 3000', 'Ellipse PRO 1200',
    'Inne',
  ],
  // ── CyberPower ─────────────────────────────────────────────────────────────
  'CyberPower': [
    'CP1000EILCD', 'CP1500EPFCLCD', 'OL2000ERT2U',
    'Inne',
  ],
  // ── Legrand ────────────────────────────────────────────────────────────────
  'Legrand': [
    'KEOR Line 1000', 'KEOR Multiplug 800', 'KEOR SP 1000',
    'Inne',
  ],
  // ── CalDigit ───────────────────────────────────────────────────────────────
  'CalDigit': [
    'TS4 Thunderbolt 4 Dock', 'TS3 Plus', 'Element Hub',
    'Inne',
  ],
  // ── Targus ─────────────────────────────────────────────────────────────────
  'Targus': [
    'USB-C Universal DV4K Docking Station', 'USB 3.0 SuperSpeed Dual Video Docking Station',
    'Inne',
  ],
  // ── Yealink ─────────────────────────────────────────────────────────────────
  'Yealink': [
    'UVC30', 'UVC84', 'MSpeaker II',
    'Inne',
  ],
  // ── AXIS ─────────────────────────────────────────────────────────────────
  'AXIS': [
    'M3106-L Mk II', 'P3245-V', 'Q6135-LE',
    'Inne',
  ],
  // ── SuperMicro ───────────────────────────────────────────────────────────
  'SuperMicro': [
    'SYS-6029P-TRT', 'SYS-1029P-WTR', 'CSE-826BE16-R920WB',
    'Inne',
  ],
  // ── IBM ──────────────────────────────────────────────────────────────────
  'IBM': [
    'System x3650 M5', 'Power Systems S922', 'FlexSystem x240 M5',
    'Inne',
  ],
  // ── Huawei ───────────────────────────────────────────────────────────────
  'Huawei': [
    'MateBook D 14', 'MateBook X Pro', 'MateBook 14s',
    'MatePad 11', 'MatePad T10s',
    'Inne',
  ],
  // ── Nokia ────────────────────────────────────────────────────────────────
  'Nokia': [
    'G60 5G', 'X30 5G', 'G21',
    'Inne',
  ],
  // ── Xiaomi ───────────────────────────────────────────────────────────────
  'Xiaomi': [
    'Redmi Note 12', 'POCO X5 Pro', '13T Pro',
    'Inne',
  ],
  // ── Toshiba ───────────────────────────────────────────────────────────────
  'Toshiba': [
    'Dynabook Satellite Pro C50', 'Dynabook Tecra A50',
    'Inne',
  ],
  // ── Inne ─────────────────────────────────────────────────────────────────
  'Inne': ['Inne'],
};
