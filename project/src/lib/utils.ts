import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DISEASE_INFO = {
  'BA-cellulitis': {
    description: 'Cellulitis is a common bacterial skin infection that affects the deeper layers of skin and the subcutaneous tissues.',
    precautions: [
      'Keep the affected area clean and dry',
      'Monitor the area for signs of spreading infection',
      'Avoid scratching or injuring the affected skin',
      'Elevate the affected area when possible'
    ],
    remedies: [
      'Take prescribed antibiotics as directed',
      'Apply warm compresses to the affected area',
      'Rest and elevate the affected limb',
      'Take over-the-counter pain relievers if needed'
    ],
    emergency_signs: [
      'Fever above 100.4°F (38°C)',
      'Red streaks extending from the affected area',
      'Severe pain or numbness',
      'Rapid spreading of the affected area'
    ]
  },
  'BA-impetigo': {
    description: 'Impetigo is a highly contagious bacterial skin infection that causes red sores that can break open, ooze fluid, and form a honey-colored crust.',
    precautions: [
      'Wash hands frequently',
      'Keep fingernails short and clean',
      'Avoid touching or scratching the sores',
      'Use separate towels and washcloths'
    ],
    remedies: [
      'Apply prescribed antibiotic ointment',
      'Gently wash affected areas with mild soap',
      'Keep sores covered with gauze',
      'Take oral antibiotics if prescribed'
    ],
    emergency_signs: [
      'Fever or swollen lymph nodes',
      'Sores spreading rapidly',
      'Deep tissue infection',
      'Sores that will not heal after treatment'
    ]
  },
  'FU-athlete-foot': {
    description: 'Athlete\'s foot is a fungal infection that causes scaling, flaking, and itching of affected skin, typically between the toes.',
    precautions: [
      'Keep feet dry, especially between toes',
      'Wear breathable shoes and socks',
      'Don\'t walk barefoot in public areas',
      'Change socks regularly'
    ],
    remedies: [
      'Apply antifungal medication as directed',
      'Use foot powder to keep feet dry',
      'Air out shoes between uses',
      'Wash feet daily with soap and dry thoroughly'
    ],
    emergency_signs: [
      'Severe pain or swelling',
      'Fever with infection',
      'Cracks in skin that won\'t heal',
      'Signs of bacterial infection'
    ]
  },
  'FU-nail-fungus': {
    description: 'Nail fungus is a common condition that begins as a white or yellow spot under the tip of your fingernail or toenail.',
    precautions: [
      'Keep nails trimmed and clean',
      'Wear breathable footwear',
      'Avoid sharing nail clippers',
      'Protect feet in public areas'
    ],
    remedies: [
      'Apply prescribed antifungal medication',
      'Keep nails short and dry',
      'Use antifungal foot powder',
      'Consider oral antifungal medications if prescribed'
    ],
    emergency_signs: [
      'Severe pain or discomfort',
      'Spreading beyond the nail',
      'Signs of bacterial infection',
      'Complete nail separation'
    ]
  },
  'FU-ringworm': {
    description: 'Ringworm is a fungal infection that causes a red, circular rash with clearer skin in the middle.',
    precautions: [
      'Avoid sharing personal items',
      'Keep skin clean and dry',
      'Wash hands after touching affected areas',
      'Avoid scratching the rash'
    ],
    remedies: [
      'Apply antifungal cream as directed',
      'Keep the affected area clean',
      'Change clothes and bedding daily',
      'Use medicated shampoo if on scalp'
    ],
    emergency_signs: [
      'Rash spreading despite treatment',
      'Signs of bacterial infection',
      'Severe itching or burning',
      'Fever or swollen lymph nodes'
    ]
  },
  'PA-cutaneous-larva-migrans': {
    description: 'Cutaneous larva migrans is a skin condition caused by hookworm larvae that creates itchy, raised tracks in the skin.',
    precautions: [
      'Avoid walking barefoot on contaminated soil',
      'Wear protective footwear on beaches',
      'Use beach towels or chairs instead of lying directly on sand',
      'Practice good hygiene'
    ],
    remedies: [
      'Take prescribed anti-parasitic medication',
      'Apply anti-itch cream if recommended',
      'Keep the affected area clean',
      'Follow medical advice carefully'
    ],
    emergency_signs: [
      'Severe allergic reaction',
      'Signs of bacterial infection',
      'Persistent symptoms after treatment',
      'Spread to sensitive areas'
    ]
  },
  'VI-chickenpox': {
    description: 'Chickenpox is a highly contagious viral infection causing an itchy rash of spots that blisters and scabs over.',
    precautions: [
      'Isolate until all blisters have scabbed',
      'Avoid scratching the blisters',
      'Stay away from high-risk individuals',
      'Practice good hygiene'
    ],
    remedies: [
      'Take oral antihistamines for itching',
      'Apply calamine lotion',
      'Take lukewarm baths with colloidal oatmeal',
      'Rest and stay hydrated'
    ],
    emergency_signs: [
      'High fever lasting more than 4 days',
      'Severe skin pain or infection',
      'Difficulty breathing',
      'Dizziness or disorientation'
    ]
  },
  'VI-shingles': {
    description: 'Shingles is a viral infection causing a painful rash that often appears as a stripe of blisters.',
    precautions: [
      'Avoid touching or scratching the rash',
      'Keep the rash covered',
      'Avoid contact with high-risk individuals',
      'Maintain good personal hygiene'
    ],
    remedies: [
      'Take prescribed antiviral medications',
      'Apply cool compresses',
      'Take pain relievers as recommended',
      'Get plenty of rest'
    ],
    emergency_signs: [
      'Rash near the eyes',
      'Severe pain or widespread rash',
      'Confusion or fever',
      'Signs of bacterial infection'
    ]
  }
};