# 📡 LocalStream – Real-Time Location-Based News & Community Platform

**LocalStream** is a full-stack web app that delivers **location-specific news, emergency alerts, and community updates**. By combining **multilingual NLP**, **machine learning**, and **Firebase authentication**, it offers users a personalized experience built around their geographic district.

🔗 **Live App:** https://mini-project-sandy-nine.vercel.app/login
🔒 **Authentication:** Enabled via Firebase  
---

## 🚀 Features


- 📍 **Location-aware content**: News and alerts filtered by location
- 🧠 **Smart NLP tagging**: Location entities extracted from RSS feeds using NER
- 🔁 **Hybrid NLP pipeline**: JS-based NLP with Python ML fallback (Transformers)
- 🌐 **Multilingual support**: Handles both Malayalam and English districts
- 📡 **Live news ingestion**: Fetches from local and national RSS feeds
- 📢 **Advertisement module**: Post and view local community ads or notices
- 🔐 **Authentication**: Firebase Google login integration
- 🌦 **Weather insights**: Real-time weather cards for your district
- 🧩 **Modular frontend**: Reusable React components and clean architecture
- 🗄️ **MongoDB backend**: Flexible and scalable document database
- ☁️ **Fully deployed**: Vercel (Frontend), Render/HF (Backend)

---

## 🔧 Tech Stack

| Layer         | Technology                              |
|---------------|------------------------------------------|
| Frontend      | React (Vite), CSS Modules                |
| Backend       | Node.js, Express.js, WebSocket (WSS)     |
| NLP / ML      | Python (Flask), HuggingFace Transformers |
| Database      | MongoDB (Atlas) + Mongoose               |
| Auth / Storage| Firebase                                 |
| Deployment    | Vercel (frontend), Render/HF (backend)   |

---

---

## ⚙️ Getting Started (Local)

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.8
- MongoDB (local or Atlas)
- Firebase project setup

### Installation

```bash
# 1. Clone
git clone https://github.com/FathimaNadhaMK/MiniProject.git
cd miniproject
cd frontend
npm install
npm run dev

cd ../backend
npm install
node nlpServer.js

python ml_ner_api.py

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
PORT=5001
VITE_OPENWEATHER_API_KEY=<your-openweather-key>
VITE_WEATHERAPI_KEY=<your-weatherapi-key>

How It Works
RSS feeds are parsed and stored via backend script
Headlines and descriptions are passed to /detect-location
node-nlp tries to detect location names (English + Malayalam)
If not found, request is forwarded to Python ML API (/ner)
Detected entities and article content are stored in MongoDB
The frontend retrieves and displays data based on user location
Firebase auth ensures secure access to features

🧪 Testing
✅ Postman used for testing /news, /detect-location, /ner
✅ Python API tested for multilingual entities
✅ Feed ingestion verified with sample articles

📈 Future Enhancements
Push notifications for emergencies (Firebase Cloud Messaging)
Admin dashboard for CMS-like controls
User-generated reports and moderation
Docker setup for scalable deployment
Full PWA support and offline mode

📄 License
This project is open-sourced under the MIT License.


