// Utility to map possible frontend key variants to backend expected keys
function getField(data, keys, fallback = null) {
    for (const key of keys) {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            return data[key];
        }
    }
    return fallback;
}

// Map frontend values to allowed DB values for customer_type
const customerTypeMap = {
    'account_owner': 'Account Owner',
    'business_owner': 'Business Owner / Officer / Signatory',
    'business_owner / officer / signatory': 'Business Owner / Officer / Signatory',
    'individual': 'Individual',
    'corporate': 'Corporate',
    // Handle direct values (for new frontend format)
    'Account Owner': 'Account Owner',
    'Business Owner / Officer / Signatory': 'Business Owner / Officer / Signatory',
    'Individual': 'Individual',
    'Corporate': 'Corporate',
    // Defaults
    '': 'Account Owner',
    null: 'Account Owner',
    undefined: 'Account Owner'
};

// Map registration3 dropdown options to allowed DB values
const residencyStatusMap = {
    'citizen': 'Resident',
    'permanent resident': 'Resident',
    'temporary resident': 'Resident',
    'foreign national': 'Non-Resident',
    'dual citizen': 'Resident',
    'refugee': 'Non-Resident',
    'student visa holder': 'Non-Resident',
    'work visa holder': 'Non-Resident',
    'undocumented': 'Non-Resident',
    'other': 'Non-Resident',
    'resident': 'Resident',
    'non-resident': 'Non-Resident',
    'non resident': 'Non-Resident',
    'nonresident': 'Non-Resident',
    'resident alien': 'Resident',
    'non-resident alien': 'Non-Resident',
    '': null,
    null: null,
    undefined: null
};

// Civil status mapping (text to database codes)
const civilStatusMap = {
    'single': 'CS01',
    'married': 'CS02',
    'legally separated': 'CS03',
    'divorced': 'CS04',
    'annulled': 'CS05',
    'widowed': 'CS06',
    'widow': 'CS06',
    'widower': 'CS06',
    'widow/er': 'CS06',
    'separated': 'CS03', // Handle old "Separated" option -> Legally Separated
    // Handle existing codes
    'cs01': 'CS01',
    'cs02': 'CS02', 
    'cs03': 'CS03',
    'cs04': 'CS04',
    'cs05': 'CS05',
    'cs06': 'CS06',
    // Defaults
    '': 'CS01', // Default to Single
    null: 'CS01',
    undefined: 'CS01'
};

// Fund source mapping (text to database codes)
const fundSourceMap = {
    'employed - fixed income': 'FS001',
    'employed - variable income': 'FS002',
    'self-employed - business income': 'FS003',
    'remittances': 'FS004',
    'pension': 'FS005',
    'personal savings / retirement proceeds': 'FS006',
    'allowance': 'FS007',
    'inheritance': 'FS008',
    'investment/dividend income': 'FS009',
    'rental income': 'FS010',
    'sale of asset / property': 'FS011',
    'other sources (lottery, donations, tax refunds, and insurance/legal claims)': 'FS012',
    // Handle variations
    'employed': 'FS001',
    'self-employed': 'FS003',
    'business income': 'FS003',
    'remittance': 'FS004',
    'savings': 'FS006',
    'investment': 'FS009',
    'rental': 'FS010',
    'other': 'FS012',
    // Handle existing codes
    'fs001': 'FS001',
    'fs002': 'FS002',
    'fs003': 'FS003',
    'fs004': 'FS004',
    'fs005': 'FS005',
    'fs006': 'FS006',
    'fs007': 'FS007',
    'fs008': 'FS008',
    'fs009': 'FS009',
    'fs010': 'FS010',
    'fs011': 'FS011',
    'fs012': 'FS012',
    // Defaults
    '': 'FS001', // Default to Employed - Fixed Income
    null: 'FS001',
    undefined: 'FS001'
};

// Work nature mapping (text to database codes)
const workNatureMap = {
    // Professional Services
    'accounting/auditing/tax practice services': 'ACT',
    'accounting': 'ACT',
    'auditing': 'ACT',
    'tax services': 'ACT',
    'legal services': 'LEG',
    'legal': 'LEG',
    'law': 'LEG',
    'architecture/engineering': 'ANE',
    'architecture': 'ANE',
    'engineering': 'ANE',
    'other professional services / consultancy/coaching': 'SVC',
    'consultancy': 'SVC',
    'consulting': 'SVC',
    'coaching': 'SVC',
    'professional services': 'SVC',
    
    // Financial Services
    'pawnshop': 'PWN',
    'lending': 'LDG',
    'money service business - electronic money issuer': 'MSE',
    'electronic money': 'MSE',
    'money service business - virtual currency exchange': 'MSV',
    'virtual currency': 'MSV',
    'crypto': 'MSV',
    'money service business - remittance transfer company': 'MSR',
    'remittance transfer': 'MSR',
    'money service business - foreign exchange dealer / money changer': 'MSF',
    'foreign exchange': 'MSF',
    'money changer': 'MSF',
    'banking': 'BAN',
    'bank': 'BAN',
    'insurance': 'INS',
    'securities broker / dealer': 'SBD',
    'securities': 'SBD',
    'broker': 'SBD',
    
    // Construction & Real Estate
    'construction and civil engineering': 'CON',
    'construction': 'CON',
    'civil engineering': 'CON',
    'real estate brokerage and sales': 'REL',
    'real estate': 'REL',
    
    // Media & Entertainment
    'media': 'MED',
    'arts/entertainment/recreation': 'ENT',
    'entertainment': 'ENT',
    'arts': 'ENT',
    'recreation': 'ENT',
    'sports/esports': 'SPO',
    'sports': 'SPO',
    'esports': 'SPO',
    'gambling/casino/egames': 'GAM',
    'gambling': 'GAM',
    'casino': 'GAM',
    'gaming': 'GAM',
    
    // Healthcare & Social
    'healthcare (doctor, dentist, nurse, psychiatrist and others)': 'HEA',
    'healthcare': 'HEA',
    'medical': 'HEA',
    'doctor': 'HEA',
    'dentist': 'HEA',
    'nurse': 'HEA',
    'social work / non-government and non-profit organizations': 'SOC',
    'social work': 'SOC',
    'ngo': 'SOC',
    'non-profit': 'SOC',
    
    // Education & Communication
    'education/ online education': 'EDU',
    'education': 'EDU',
    'teaching': 'EDU',
    'information/communication/telecommunication': 'COM',
    'communication': 'COM',
    'telecommunication': 'COM',
    'publishing/printing': 'PUB',
    'publishing': 'PUB',
    'printing': 'PUB',
    'advertising/marketing': 'ADV',
    'advertising': 'ADV',
    'marketing': 'ADV',
    
    // Technology
    'robotics/ai/cloud/data engineering/ software development/cybersecurity': 'ICT',
    'information technology': 'ICT',
    'software development': 'ICT',
    'programming': 'ICT',
    'cybersecurity': 'ICT',
    'it': 'ICT',
    'technology': 'ICT',
    
    // Manufacturing & Trading
    'manufacturing/packaging': 'MFG',
    'manufacturing': 'MFG',
    'packaging': 'MFG',
    'manufacturing/trading of firearms and ammunition': 'MFF',
    'firearms': 'MFF',
    'art / antiques dealership': 'ART',
    'art': 'ART',
    'antiques': 'ART',
    'car/boat/plane dealership': 'CAR',
    'car dealership': 'CAR',
    'automotive': 'CAR',
    'jewelry / precious metals / precious stones dealership': 'JEW',
    'jewelry': 'JEW',
    'precious metals': 'JEW',
    'wholesale / retail trade (distribution & sales) / e-commerce / online selling': 'WRT',
    'wholesale': 'WRT',
    'retail': 'WRT',
    'trade': 'WRT',
    'e-commerce': 'WRT',
    'online selling': 'WRT',
    'sales': 'WRT',
    'repair services': 'REP',
    'repair': 'REP',
    
    // Transportation & Logistics
    'transportation (land, sea and air)': 'TRN',
    'transportation': 'TRN',
    'transport': 'TRN',
    'shipping/cargo / storage': 'SHI',
    'shipping': 'SHI',
    'cargo': 'SHI',
    'logistics': 'SHI',
    'seaman / seafarer': 'SEA',
    'seaman': 'SEA',
    'seafarer': 'SEA',
    'marine': 'SEA',
    
    // Agriculture & Resources
    'agriculture / fishing': 'AGR',
    'agriculture': 'AGR',
    'farming': 'AGR',
    'fishing': 'AGR',
    'forestry': 'FOR',
    'mining/quarrying': 'MIN',
    'mining': 'MIN',
    'quarrying': 'MIN',
    
    // Utilities
    'electric utilities': 'UTL',
    'utilities': 'UTL',
    'electric': 'UTL',
    'oil/gasoline': 'OIL',
    'oil': 'OIL',
    'gasoline': 'OIL',
    'petroleum': 'OIL',
    'water supply/sewerage/waste management': 'WAT',
    'water supply': 'WAT',
    'waste management': 'WAT',
    
    // Government & Security
    'public administration / government': 'PAD',
    'government': 'PAD',
    'public administration': 'PAD',
    'peace and order (military, police, fireman, jail warden and others)': 'MIL',
    'military': 'MIL',
    'police': 'MIL',
    'security': 'SEC',
    'security agency / services': 'SEC',
    
    // Services
    'hotel/accommodation/restaurant/food services': 'AFS',
    'hotel': 'AFS',
    'restaurant': 'AFS',
    'food services': 'AFS',
    'hospitality': 'AFS',
    'embassies/diplomatic services / attached offices': 'EMB',
    'embassy': 'EMB',
    'diplomatic': 'EMB',
    'travel / travel agencies': 'TRA',
    'travel': 'TRA',
    'tourism': 'TRA',
    'employment agency / human resources': 'AGY',
    'human resources': 'AGY',
    'hr': 'AGY',
    'recruitment': 'AGY',
    'other service activities (hairdresser, manicurist, masseuse and others)': 'OTS',
    'other services': 'OTS',
    'personal services': 'OTS',
    'private household / household employee / household staff': 'HOU',
    'household': 'HOU',
    'domestic': 'HOU',
    'religious organization': 'RLG',
    'religious': 'RLG',
    'church': 'RLG',
    
    // Special Categories
    'designated non financial business and professions (dnfbp)': 'DFP',
    'dnfbp': 'DFP',
    'direct ogb/pogo licensee and authorized gaming agent': 'OGB',
    'pogo': 'OGB',
    'ogb': 'OGB',
    'indirect ogb/pogo allied service provider': 'OGI',
    
    // Handle existing codes (case insensitive)
    'act': 'ACT', 'leg': 'LEG', 'ane': 'ANE', 'svc': 'SVC', 'pwn': 'PWN',
    'ldg': 'LDG', 'mse': 'MSE', 'msv': 'MSV', 'msr': 'MSR', 'msf': 'MSF',
    'ban': 'BAN', 'ins': 'INS', 'sbd': 'SBD', 'con': 'CON', 'rel': 'REL',
    'med': 'MED', 'ent': 'ENT', 'spo': 'SPO', 'gam': 'GAM', 'hea': 'HEA',
    'soc': 'SOC', 'edu': 'EDU', 'com': 'COM', 'pub': 'PUB', 'adv': 'ADV',
    'ict': 'ICT', 'mfg': 'MFG', 'mff': 'MFF', 'art': 'ART', 'car': 'CAR',
    'jew': 'JEW', 'wrt': 'WRT', 'rep': 'REP', 'trn': 'TRN', 'shi': 'SHI',
    'sea': 'SEA', 'agr': 'AGR', 'for': 'FOR', 'min': 'MIN', 'utl': 'UTL',
    'oil': 'OIL', 'wat': 'WAT', 'pad': 'PAD', 'mil': 'MIL', 'afs': 'AFS',
    'emb': 'EMB', 'tra': 'TRA', 'agy': 'AGY', 'sec': 'SEC', 'ots': 'OTS',
    'hou': 'HOU', 'rlg': 'RLG', 'dfp': 'DFP', 'ogb': 'OGB', 'ogi': 'OGI',
    
    // Defaults
    '': 'ICT', // Default to ICT for unknown
    null: 'ICT',
    undefined: 'ICT'
};

module.exports = {
    getField,
    customerTypeMap,
    residencyStatusMap,
    civilStatusMap,
    fundSourceMap,
    workNatureMap
};
