import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DISEASE_INFO = {
  'BA-cellulitis': {
    description: 'Cellulitis is a common bacterial skin infection that affects the deeper layers of skin and the subcutaneous tissues. It most commonly occurs on the lower legs but can affect skin anywhere on the body.',
    symptoms: [
      'Redness and swelling of the affected area',
      'Skin that feels warm and tender to touch',
      'Spreading redness over several days',
      'Fever and chills in some cases',
      'Swollen lymph nodes near the infection',
      'Skin may appear stretched or glossy'
    ],
    precautions: [
      'Keep the affected area clean and dry',
      'Monitor the area for signs of spreading infection',
      'Avoid scratching or injuring the affected skin',
      'Elevate the affected area when possible',
      'Clean any cuts or breaks in the skin promptly'
    ],
    remedies: [
      'Take prescribed antibiotics as directed',
      'Apply warm compresses to the affected area',
      'Rest and elevate the affected limb',
      'Take over-the-counter pain relievers if needed',
      'Keep the area clean with mild soap and water'
    ],
    emergency_signs: [
      'Fever above 100.4°F (38°C)',
      'Red streaks extending from the affected area',
      'Severe pain or numbness',
      'Rapid spreading of the affected area',
      'Blistering or blackening of the affected skin'
    ]
  },
  'BA-impetigo': {
    description: 'Impetigo is a highly contagious bacterial skin infection that causes red sores that can break open, ooze fluid, and form a honey-colored crust. It commonly affects children and can spread through close contact.',
    symptoms: [
      'Red sores that quickly rupture and ooze',
      'Honey-colored crust formation',
      'Itching and soreness in affected areas',
      'Small red blisters that may be itchy',
      'Skin lesions primarily around nose and mouth',
      'Sores that heal without leaving scars'
    ],
    precautions: [
      'Wash hands frequently',
      'Keep fingernails short and clean',
      'Avoid touching or scratching the sores',
      'Use separate towels and washcloths',
      'Avoid close contact until healed'
    ],
    remedies: [
      'Apply prescribed antibiotic ointment',
      'Gently wash affected areas with mild soap',
      'Keep sores covered with gauze',
      'Take oral antibiotics if prescribed',
      'Use antibiotic soap as recommended'
    ],
    emergency_signs: [
      'Fever or swollen lymph nodes',
      'Sores spreading rapidly',
      'Deep tissue infection',
      'Sores that will not heal after treatment',
      'Signs of systemic infection'
    ]
  },
  'FU-athlete-foot': {
    description: 'Athletes foot (tinea pedis) is a common fungal infection that typically begins between the toes. It can cause a scaly rash that usually causes itching, stinging, and burning.',
    symptoms: [
      'Scaly, peeling, or cracking skin',
      'Redness and blistering',
      'Itching, stinging, or burning sensations',
      'Softened, broken down skin',
      'Dry, flaking skin on soles',
      'Unpleasant foot odor'
    ],
    precautions: [
      'Keep feet dry, especially between toes',
      'Wear breathable shoes and socks',
      'Change socks regularly',
      'Never share shoes or socks',
      'Use shower shoes in public areas'
    ],
    remedies: [
      'Apply antifungal cream/powder',
      'Keep feet clean and dry',
      'Use medicated powders',
      'Change socks frequently',
      'Allow shoes to dry completely'
    ],
    emergency_signs: [
      'Severe pain or swelling',
      'Fever with infection',
      'Cracks in skin that won\'t heal',
      'Signs of bacterial infection',
      'Spreading to other parts of body'
    ]
  },
  'FU-nail-fungus': {
    description: 'Nail fungus is a common condition that begins as a white or yellow spot under the tip of your fingernail or toenail. As it spreads deeper, it can cause nail discoloration, thickening, and crumbling at the edges.',
    symptoms: [
      'Thickened nails',
      'Whitish to yellow-brown discoloration',
      'Brittle, crumbly, or ragged nails',
      'Distorted nail shape',
      'Dark color from debris buildup',
      'Slightly foul odor'
    ],
    precautions: [
      'Keep nails trimmed and clean',
      'Wear breathable footwear',
      'Avoid sharing nail clippers',
      'Protect feet in public areas',
      'Keep feet dry and clean'
    ],
    remedies: [
      'Apply prescribed antifungal medication',
      'Keep nails short and dry',
      'Use antifungal foot powder',
      'Consider oral antifungal medications if prescribed',
      'File down thick areas of nail'
    ],
    emergency_signs: [
      'Severe pain or discomfort',
      'Spreading beyond the nail',
      'Signs of bacterial infection',
      'Complete nail separation',
      'Widespread infection'
    ]
  },
  'FU-ringworm': {
    description: 'Ringworm is a fungal infection that causes a red, circular rash with clearer skin in the middle. Despite its name, it\'s not caused by a worm but by fungi known as dermatophytes that live on the outer layer of skin.',
    symptoms: [
      'Circular, red, scaly patches',
      'Raised borders with central clearing',
      'Intense itching',
      'Overlapping rings in severe cases',
      'Hair loss if on scalp',
      'Burning or stinging sensation'
    ],
    precautions: [
      'Avoid sharing personal items',
      'Keep skin clean and dry',
      'Wash hands after touching affected areas',
      'Avoid scratching the rash',
      'Treat infected pets if present'
    ],
    remedies: [
      'Apply antifungal cream as directed',
      'Keep the affected area clean',
      'Change clothes and bedding daily',
      'Use medicated shampoo if on scalp',
      'Continue treatment as prescribed'
    ],
    emergency_signs: [
      'Rash spreading despite treatment',
      'Signs of bacterial infection',
      'Severe itching or burning',
      'Fever or swollen lymph nodes',
      'Deep skin cracks or bleeding'
    ]
  },
  'PA-cutaneous-larva-migrans': {
    description: 'Cutaneous larva migrans is a skin condition caused by hookworm larvae that creates itchy, raised tracks in the skin. The larvae typically enter through bare skin that comes into contact with contaminated soil or sand.',
    symptoms: [
      'Intense itching along larval tracks',
      'Raised, reddish snake-like lines',
      'Progressive advancement of tracks',
      'Blistering along the path',
      'Visible movement under skin',
      'Local swelling and tenderness'
    ],
    precautions: [
      'Avoid walking barefoot on contaminated soil',
      'Wear protective footwear on beaches',
      'Use beach towels or chairs instead of lying directly on sand',
      'Practice good hygiene',
      'Avoid contact with stray animal feces'
    ],
    remedies: [
      'Take prescribed anti-parasitic medication',
      'Apply anti-itch cream if recommended',
      'Keep the affected area clean',
      'Follow medical advice carefully',
      'Use oral antihistamines for itching'
    ],
    emergency_signs: [
      'Severe allergic reaction',
      'Signs of bacterial infection',
      'Persistent symptoms after treatment',
      'Spread to sensitive areas',
      'Development of systemic symptoms'
    ]
  },
  'VI-chickenpox': {
    description: 'Chickenpox is a highly contagious viral infection causing an itchy, blister-like rash. It\'s caused by the varicella-zoster virus and is most common in children but can affect anyone who hasn\'t had it before.',
    symptoms: [
      'Itchy, fluid-filled blisters',
      'Red spots and bumps',
      'Fever and fatigue',
      'Loss of appetite',
      'Headache',
      'Progressive rash that spreads'
    ],
    precautions: [
      'Isolate until blisters crust over',
      'Avoid scratching the blisters',
      'Stay home from school/work',
      'Practice good hygiene',
      'Keep fingernails trimmed'
    ],
    remedies: [
      'Apply calamine lotion',
      'Take oatmeal baths',
      'Use antihistamines for itching',
      'Take antiviral medications if prescribed',
      'Apply cool compresses'
    ],
    emergency_signs: [
      'High fever lasting more than 4 days',
      'Severe skin infections',
      'Difficulty breathing',
      'Dizziness or disorientation',
      'Stiff neck or severe headache'
    ]
  },
  'VI-shingles': {
    description: 'Shingles is a viral infection causing a painful rash that often appears as a stripe of blisters wrapping around either the left or right side of the torso. It\'s caused by reactivation of the chickenpox virus.',
    symptoms: [
      'Burning, tingling, or numbness',
      'Sensitive, painful skin',
      'Red rash following nerve paths',
      'Fluid-filled blisters that break and crust',
      'Itching and persistent pain',
      'Symptoms usually affect one side'
    ],
    precautions: [
      'Avoid touching or scratching the rash',
      'Keep the rash covered',
      'Avoid contact with high-risk individuals',
      'Maintain good personal hygiene',
      'Reduce stress levels'
    ],
    remedies: [
      'Take prescribed antiviral medications',
      'Apply cool compresses',
      'Take pain relievers as recommended',
      'Get plenty of rest',
      'Keep affected area clean and dry'
    ],
    emergency_signs: [
      'Rash near the eyes',
      'Severe pain or widespread rash',
      'Confusion or fever',
      'Signs of bacterial infection',
      'Persistent dizziness or weakness'
    ]
  }
};