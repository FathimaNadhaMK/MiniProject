import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Heavy traffic detected on your saved route!');

  const handleSendSMS = async () => {
    try {
      const response = await axios.post('http://localhost:5000/send-sms', { phone, message });
      alert(response.data.message);
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS. Check your backend server.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Send Traffic SMS Alert</h2>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={handleSendSMS}>Send SMS</button>
      </header>
    </div>
  );
}

export default App;