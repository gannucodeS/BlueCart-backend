const express = require('express');
const Location = require('../models/location.model');

const router = express.Router();

const CITIES_BY_STATE = {
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Pilani', 'Bhilwara', 'Alwar', 'Bharatpur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Vasai'],
  'Delhi': ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Shahdara', 'Dwarka', 'Rohini'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga', 'Davanagere', 'Ballari', 'Shimoga', 'Tumkur'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Dindigul', 'Thanjavur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Berhampore', 'Kharagpur', 'Darjeeling'],
  'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Ramagundam', 'Khammam', 'Nizamabad', 'Adilabad', 'Mahbubnagar', 'Nalgonda'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Alappuzha', 'Kottayam', 'Malappuram'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Moga', 'Firozpur', 'Sangrur', 'Pathankot'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Yamunanagar', 'Panchkula'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
  'Goa': ['Panaji', 'Margao', 'Vasco', 'Mapusa', 'Ponda', 'Bicholim', 'Sanquelim', 'Valsau']
};

router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return res.json({ 
        ok: false, 
        error: 'Invalid pincode format. Pincode should be 6 digits starting with 1-9.' 
      });
    }
    
    const location = await Location.findByPincode(pincode);
    
    if (!location) {
      return res.json({ 
        ok: false, 
        error: 'Pincode not found. Please enter city and state manually.' 
      });
    }
    
    return res.json({
      ok: true,
      pincode: location.pincode,
      city: location.city,
      district: location.district,
      state: location.state
    });
  } catch (e) {
    console.error('Pincode lookup error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to fetch pincode details' });
  }
});

router.get('/states', async (req, res) => {
  const states = Object.keys(CITIES_BY_STATE).sort();
  return res.json({ ok: true, states });
});

router.get('/cities/:state', async (req, res) => {
  const { state } = req.params;
  const cities = CITIES_BY_STATE[state] || [];
  return res.json({ ok: true, cities: cities.sort() });
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ ok: false, error: 'Query too short' });
    }
    
    const regex = new RegExp(query, 'i');
    const locations = await Location.find({
      $or: [
        { city: regex },
        { state: regex },
        { district: regex },
        { pincode: regex }
      ]
    }).limit(20);
    
    return res.json({ ok: true, locations });
  } catch (e) {
    console.error('Location search error:', e);
    return res.status(500).json({ ok: false, error: 'Search failed' });
  }
});

module.exports = router;
