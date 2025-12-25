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
  'actinic-keratoses': {
    description: 'Actinic keratoses are rough, scaly patches on the skin caused by years of sun exposure.',
    symptoms: ['Rough, dry patch', 'Flat to slightly raised bump', 'Color varies pink to brown', 'Itching or burning', 'Hard wart-like surface'],
    remedies: ['Cryotherapy', 'Topical medications', 'Photodynamic therapy', 'Chemical peels', 'Laser treatment'],
    precautions: ['Use sunscreen daily', 'Wear protective clothing', 'Avoid peak sun hours'],
    emergency_signs: ['Rapid growth', 'Bleeding', 'Significant pain']
  },
  'basal-cell-carcinoma': {
    description: 'Basal cell carcinoma is the most common type of skin cancer appearing as a slightly transparent bump.',
    symptoms: ['Pearly or waxy bump', 'Flat flesh-colored lesion', 'Bleeding sore that returns', 'Open sore that does not heal'],
    remedies: ['Surgical excision', 'Mohs surgery', 'Curettage', 'Radiation therapy'],
    precautions: ['Limit sun exposure', 'Use SPF 30+ sunscreen', 'Avoid tanning beds'],
    emergency_signs: ['Rapid growth', 'Deep invasion', 'Spread to lymph nodes']
  },
  'benign-keratosis': {
    description: 'Benign keratosis includes non-cancerous skin growths that commonly appear with age.',
    symptoms: ['Waxy stuck-on appearance', 'Brown black or tan color', 'Slightly raised', 'Round or oval shape'],
    remedies: ['Usually no treatment needed', 'Cryotherapy', 'Curettage', 'Laser treatment'],
    precautions: ['Monitor for changes', 'Sun protection', 'Regular skin checks']
  },
  'dermatofibroma': {
    description: 'Dermatofibroma is a common benign skin growth that often appears on the lower legs.',
    symptoms: ['Small firm bump', 'Brown to reddish-brown', 'Dimples when pinched', 'Usually painless'],
    remedies: ['Usually no treatment required', 'Surgical removal if bothersome', 'Cryotherapy'],
    precautions: ['Avoid trauma to the area', 'Monitor for changes']
  },
  'melanocytic-nevi': {
    description: 'Melanocytic nevi commonly known as moles are benign growths composed of melanocytes.',
    symptoms: ['Brown black or skin-colored spots', 'Round or oval shape', 'Flat or raised', 'Usually smaller than 6mm'],
    remedies: ['No treatment needed for normal moles', 'Surgical removal if suspicious', 'Regular monitoring'],
    precautions: ['Use sunscreen regularly', 'Monthly self-examinations', 'Annual dermatologist visits'],
    emergency_signs: ['Asymmetry', 'Border irregularity', 'Color variation', 'Diameter larger than 6mm']
  },
  'melanoma': {
    description: 'Melanoma is the most serious type of skin cancer that develops in melanocytes.',
    symptoms: ['New or changing mole', 'Asymmetrical shape', 'Irregular borders', 'Multiple colors', 'Evolving size or shape'],
    remedies: ['Surgical excision', 'Immunotherapy', 'Targeted therapy', 'Radiation therapy'],
    precautions: ['Avoid excessive sun exposure', 'Use SPF 50+ sunscreen', 'Wear protective clothing'],
    emergency_signs: ['Rapid growth', 'Bleeding', 'New symptoms like headache', 'Lumps in lymph nodes']
  },
  'vascular-lesions': {
    description: 'Vascular lesions are abnormalities in blood vessels appearing on or under the skin.',
    symptoms: ['Red purple or blue coloring', 'Flat or raised', 'May blanch with pressure', 'Variable size'],
    remedies: ['Often no treatment needed', 'Laser therapy', 'Surgery for large lesions'],
    precautions: ['Protect from trauma', 'Monitor for changes', 'Sunscreen to prevent darkening']
  },
  'BA-cellulitis': {
    description: 'Cellulitis is a common bacterial skin infection causing redness swelling and warmth.',
    symptoms: ['Red swollen area', 'Pain and tenderness', 'Warmth', 'Fever'],
    remedies: ['Antibiotics', 'Rest', 'Elevation', 'Pain relievers']
  },
  'BA-impetigo': {
    description: 'Impetigo is a highly contagious bacterial skin infection common in children.',
    symptoms: ['Red sores', 'Honey-colored crust', 'Itching', 'Fluid-filled blisters'],
    remedies: ['Topical antibiotics', 'Oral antibiotics', 'Keep area clean']
  },
  'FU-athlete-foot': {
    description: 'Athletes foot is a fungal infection affecting the feet especially between toes.',
    symptoms: ['Itching', 'Scaling', 'Redness', 'Cracking skin'],
    remedies: ['Antifungal cream', 'Keep feet dry', 'Wear breathable shoes']
  },
  'FU-nail-fungus': {
    description: 'Nail fungus causes discoloration and thickening of nails.',
    symptoms: ['Yellow nails', 'Thickened nails', 'Brittle nails', 'Distorted shape'],
    remedies: ['Oral antifungals', 'Topical treatments', 'Nail removal in severe cases']
  },
  'FU-ringworm': {
    description: 'Ringworm is a fungal infection causing circular scaly patches.',
    symptoms: ['Ring-shaped rash', 'Itching', 'Red scaly patches', 'Clear center'],
    remedies: ['Antifungal cream', 'Keep area clean', 'Avoid sharing personal items']
  },
  'PA-cutaneous-larva-migrans': {
    description: 'Creeping eruption is caused by hookworm larvae creating winding tracks.',
    symptoms: ['Itchy winding rash', 'Red tracks', 'Blistering', 'Intense itching'],
    remedies: ['Antiparasitic medication', 'Anti-itch creams', 'Keep area clean']
  },
  'VI-chickenpox': {
    description: 'Chickenpox is a highly contagious viral infection causing itchy blisters.',
    symptoms: ['Itchy blisters', 'Fever', 'Fatigue', 'Rash spreading over body'],
    remedies: ['Calamine lotion', 'Oatmeal baths', 'Antihistamines', 'Rest']
  },
  'VI-shingles': {
    description: 'Shingles is caused by reactivation of chickenpox virus causing painful rash.',
    symptoms: ['Painful rash', 'Blisters', 'Burning sensation', 'Fever'],
    remedies: ['Antiviral medication', 'Pain relievers', 'Cool compresses']
  }
};
