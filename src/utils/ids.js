const crypto = require('crypto');

// Category abbreviation mapping
const categoryAbbr = {
  'Smartphones': 'SMART',
  'Laptops': 'LAPTOP',
  'Audio': 'AUDIO',
  'Cameras': 'CAMERA',
  'Gaming': 'GAME',
  'Accessories': 'ACCESS',
  'Smart Home': 'HOME',
  'Electronics': 'ELEC',
  'Deals': 'DEAL',
  'New Arrivals': 'NEW',
  'Monitors': 'MON',
  'Tablets': 'TAB',
  'Wearables': 'WERA',
  'Tv': 'TV'
};

// Counter for generating sequential IDs per category
const categoryCounters = {};

function resetCounters() {
  Object.keys(categoryAbbr).forEach(cat => {
    categoryCounters[cat] = 0;
  });
}

function genToken() {
  return Array.from(crypto.randomBytes(32))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function genProductId(category) {
  // If no category, use fallback random ID
  if (!category) {
    return 'PRD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  
  // Get abbreviation for category
  const abbr = categoryAbbr[category] || 'PROD';
  
  // Initialize counter for this category if not exists
  if (!categoryCounters[category]) {
    categoryCounters[category] = 0;
  }
  
  // Increment and format as 3-digit number
  categoryCounters[category]++;
  const seq = String(categoryCounters[category]).padStart(3, '0');
  
  return 'PRD-' + abbr + '-' + seq;
}

function genOrderId() {
  const d = new Date();
  return (
    'ORD-' +
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    '-' +
    Math.floor(Math.random() * 9000 + 1000)
  );
}

module.exports = { genToken, genProductId, genOrderId, resetCounters, categoryAbbr };

