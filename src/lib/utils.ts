import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DISEASE_INFO: Record<string, {
  description: string;
  symptoms: string[];
  remedies: string[];
  precautions?: string[];
  emergency_signs?: string[];
}> = {
  // New HAM10000 Model Classes
  'actinic-keratoses': {
    description: 'Actinic keratoses are rough, scaly patches on the skin caused by years of sun exposure. They are considered precancerous and can develop into squamous cell carcinoma if left untreated.',
    symptoms: [
      'Rough, dry or scaly patch of skin',
      'Flat to slightly raised patch or bump',
      'Color varying from pink to red to brown',
      'Itching, burning or tender skin',
      'Hard, wart-like surface'
    ],
    remedies: [
      'Cryotherapy (freezing)',
      'Topical medications (fluorouracil, imiquimod)',
      'Photodynamic therapy',
      'Chemical peels',
      'Laser treatment'
    ],
    precautions: [
      'Use broad-spectrum sunscreen daily',
      'Wear protective clothing',
      'Avoid peak sun hours',
      'Regular skin examinations'
    ],
    emergency_signs: [
      'Rapid growth of lesion',
      'Bleeding or ulceration',
      'Significant pain or tenderness'
    ]
  },
  'basal-cell-carcinoma': {
    description: 'Basal cell carcinoma is the most common type of skin cancer. It typically appears as a slightly transparent bump on sun-exposed skin but can take other forms.',
    symptoms: [
      'Pearly or waxy bump',
      'Flat, flesh-colored or brown scar-like lesion',
      'Bleeding or scabbing sore that heals and returns',
      'Pink growth with elevated border',
      'Open sore that does not heal'
    ],
    remedies: [
      'Surgical excision',
      'Mohs surgery',
      'Curettage and electrodesiccation',
      'Radiation therapy',
      'Topical treatments for superficial cases'
    ],
    precautions: [
      'Limit sun exposure',
      'Use SPF 30+ sunscreen',
      'Avoid tanning beds',
      'Regular dermatologist check-ups'
    ],
    emergency_signs: [
      'Rapid growth',
      'Deep invasion into tissues',
      'Spread to lymph nodes'
    ]
  },
  'benign-keratosis': {
    description: 'Benign keratosis includes seborrheic keratoses and solar lentigines. These are non-cancerous skin growths that commonly appear with age.',
    symptoms: [
      'Waxy, stuck-on appearance',
      'Brown, black, or tan coloring',
      'Slightly raised growths',
      'Round or oval shape',
      'May be itchy but usually painless'
    ],
    remedies: [
      'Usually no treatment needed',
      'Cryotherapy for removal',
      'Curettage',
      'Electrosurgery',
      'Laser treatment'
    ],
    precautions: [
      'Monitor for changes',
      'Sun protection',
      'Regular skin checks'
    ]
  },
  'dermatofibroma': {
    description: 'Dermatofibroma is a common benign skin growth that often appears on the lower legs. It feels like a hard lump under the skin.',
    symptoms: [
      'Small, firm bump',
      'Brown to reddish-brown color',
      'Dimples when pinched',
      'Usually painless',
      'May be itchy or tender'
    ],
    remedies: [
      'Usually no treatment required',
      'Surgical removal if bothersome',
      'Cryotherapy',
      'Laser treatment'
    ],
    precautions: [
      'Avoid trauma to the area',
      'Monitor for changes in size or color'
    ]
  },
  'melanocytic-nevi': {
    description: 'Melanocytic nevi, commonly known as moles, are benign growths composed of melanocytes. Most are harmless but should be monitored for changes.',
    symptoms: [
      'Brown, black, or skin-colored spots',
      'Round or oval shape',
      'Flat or raised',
      'Usually smaller than 6mm',
      'Even coloring and borders'
    ],
    remedies: [
      'No treatment needed for normal moles',
      'Surgical removal if suspicious',
      'Regular monitoring using ABCDE rule'
    ],
    precautions: [
      'Use sunscreen regularly',
      'Perform monthly self-examinations',
      'Annual dermatologist visits',
      'Note any changes in moles'
    ],
    emergency_signs: [
      'Asymmetry in shape',
      'Border irregularity',
      'Color variation',
      'Diameter larger than 6mm',
      'Evolution or changes over time'
    ]
  },
  'melanoma': {
    description: 'Melanoma is the most serious type of skin cancer. It develops in melanocytes and can spread to other organs if not caught early. Early detection is crucial.',
    symptoms: [
      'New or changing mole',
      'Asymmetrical shape',
      'Irregular, ragged borders',
      'Multiple colors (brown, black, red, white, blue)',
      'Diameter larger than 6mm',
      'Evolving size, shape, or color'
    ],
    remedies: [
      'Surgical excision',
      'Immunotherapy',
      'Targeted therapy',
      'Radiation therapy',
      'Chemotherapy for advanced cases'
    ],
    precautions: [
      'Avoid excessive sun exposure',
      'Use SPF 50+ sunscreen',
      'Wear protective clothing',
      'Never use tanning beds',
      'Regular full-body skin exams'
    ],
    emergency_signs: [
      'Rapid growth',
      'Bleeding or ulceration',
      'New symptoms like headache or vision changes',
      'Lumps in lymph nodes'
    ]
  },
  'vascular-lesions': {
    description: 'Vascular lesions are abnormalities in blood vessels appearing on or under the skin. They include hemangiomas, port-wine stains, and cherry angiomas.',
    symptoms: [
      'Red, purple, or blue coloring',
      'Flat or raised appearance',
      'May blanch with pressure',
      'Variable size',
      'Usually painless'
    ],
    remedies: [
      'Often no treatment needed',
      'Laser therapy for cosmetic concerns',
      'Surgery for large lesions',
      'Beta-blockers for some hemangiomas'
    ],
    precautions: [
      'Protect from trauma',
      'Monitor for changes',
      'Sunscreen to prevent darkening'
    ]
  },
  // Legacy conditions for backwards compatibility
  'BA-cellulitis': {
    description: 'Cellulitis is a common bacterial skin infection causing redness, swelling, and warmth.',
    symptoms: ['Red, swollen area', 'Pain and tenderness', 'Warmth', 'Fever'],
    remedies: ['Antibiotics', 'Rest', 'Elevation', 'Pain relievers']
  },
  'BA-impetigo': {
    description: 'Impetigo is a highly contagious bacterial skin infection common in children.',
    symptoms: ['Red sores', 'Honey-colored crust', 'Itching', 'Fluid-filled blisters'],
    remedies: ['Topical antibiotics', 'Oral antibiotics', 'Keep area clean']
  },
  'FU-athlete-foot': {
    description: 'Athlete\\'s foot is a fungal infection affecting the feet, especially between toes.',
    symptoms: ['Itching', 'Scaling', 'Redness', 'Cracking skin'],
    remedies: ['Antifungal cream', 'Keep feet dry', 'Wear breathable shoes']
  },
  'FU-nail-fungus': {
    description: 'Nail fungus causes discoloration and thickening of nails.',
    symptoms: ['Yellow nails', 'Thickened nails', 'Brittle nails', 'Distorted shape'],
    remedies: ['Oral antifungals', 'Topical treatments', 'Nail removal in severe cases']
  },
  'FU-ringworm': {
    description: 'Ringworm is a fungal infection causing circular, scaly patches.',
    symptoms: ['Ring-shaped rash', 'Itching', 'Red, scaly patches', 'Clear center'],
    remedies: ['Antifungal cream', 'Keep area clean', 'Avoid sharing personal items']
  },
  'PA-cutaneous-larva-migrans': {
    description: 'Creeping eruption is caused by hookworm larvae and creates winding tracks.',
    symptoms: ['Itchy, winding rash', 'Red tracks', 'Blistering', 'Intense itching'],
    remedies: ['Antiparasitic medication', 'Anti-itch creams', 'Keep area clean']
  },
  'VI-chickenpox': {
    description: 'Chickenpox is a highly contagious viral infection causing itchy blisters.',
    symptoms: ['Itchy blisters', 'Fever', 'Fatigue', 'Rash spreading over body'],
    remedies: ['Calamine lotion', 'Oatmeal baths', 'Antihistamines', 'Rest']
  },
  'VI-shingles': {
    description: 'Shingles is caused by reactivation of chickenpox virus, causing painful rash.',
    symptoms: ['Painful rash', 'Blisters', 'Burning sensation', 'Fever'],
    remedies: ['Antiviral medication', 'Pain relievers', 'Cool compresses']
  }
};
