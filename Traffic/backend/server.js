const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Phone number schema & model
const phoneNumberSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  dateSaved: { type: Date, default: Date.now }
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Fast2SMS API Key replaced with your provided key
const FAST2SMS_API_KEY = '14Pcz3qiOBxGCEfF6LlHeUVQgw925mTodYDRjaAb07SskWpNhvcdTQeEXqjPYHnmh4ywF2Alb7gfDt8s';

// Function to send SMS via Fast2SMS
async function sendSMS(phone, message) {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {},
      {
        params: {
          authorization: FAST2SMS_API_KEY,
          message: message,
          language: 'english',
          route: 'q',
          numbers: phone,
        },
      }
    );
    console.log('📤 SMS sent:', response.data);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ Error sending SMS:', error.response ? error.response.data : error.message);
    return { success: false, error };
  }
}

// Route to receive phone & message and send SMS
app.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;
  const result = await sendSMS(phone, message);

  if (result.success) {
    res.send({ success: true, message: 'SMS sent successfully!' });
  } else {
    res.status(500).send({ success: false, message: 'Failed to send SMS', error: result.error });
  }
});

// Route to save phone number from frontend into MongoDB
app.post('/save-phone', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).send({ success: false, message: 'Phone number is required.' });
  }
  try {
    const newPhoneNumber = new PhoneNumber({ phoneNumber });
    await newPhoneNumber.save();
    console.log('✅ Phone number saved to database:', phoneNumber);
    res.send({ success: true, message: 'Phone number saved to database!' });
  } catch (error) {
    console.error('❌ Error saving phone number:', error);
    res.status(500).send({ success: false, message: 'Error saving phone number.' });
  }
});

app.listen(5000, () => {
  console.log('🚀 Backend server running on port 5000');
});
