const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: ''
  },
  circle: {
    type: String,
    default: ''
  }
});

LocationSchema.statics.findByPincode = async function(pincode) {
  pincode = pincode.toString().trim();
  
  let location = await this.findOne({ pincode });
  
  if (!location) {
    const externalData = await fetchFromExternalApi(pincode);
    if (externalData) {
      location = await this.create({
        pincode,
        ...externalData
      });
    }
  }
  
  return location;
};

async function fetchFromExternalApi(pincode) {
  try {
    const https = require('https');
    const apiUrl = `https://api.postalpincode.in/pincode/${pincode}`;
    
    return new Promise((resolve, reject) => {
      const req = https.get(apiUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result[0] && result[0].Status === 'Success') {
              const postOffice = result[0].PostOffice[0];
              resolve({
                city: postOffice.Block || postOffice.Taluk,
                district: postOffice.District,
                state: postOffice.State,
                region: postOffice.Region || '',
                circle: postOffice.Circle || ''
              });
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });
    });
  } catch (e) {
    return null;
  }
}

module.exports = mongoose.model('Location', LocationSchema);
