const axios = require('axios');

async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {},
      {
        params: {
          authorization: '14Pcz3qiOBxGCEfF6LlHeUVQgw925mTodYDRjaAb07SskWpNhvcdTQeEXqjPYHnmh4ywF2Alb7gfDt8s',  // Replace with your real key
          message: message,
          language: 'english',
          route: 'q',
          numbers: phoneNumber
        }
      }
    );
    console.log('SMS sent:', response.data);
  } catch (error) {
    console.error('SMS send error:', error.response ? error.response.data : error.message);
  }
}

module.exports = { sendSMS };
