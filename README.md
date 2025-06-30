LOCALSTREAM – Location-Based News & Community Engagement Platform

LocalStream is a full-stack web application designed to deliver real-time, hyper-local news, emergency alerts, and community announcements based on the user's geographic location. It uses Machine Learning (NER) and multilingual Natural Language Processing (NLP) to intelligently analyze news feeds from trusted government sources, offering users relevant, personalized content.

---

## KEY FEATURES

* Location based news filtering based on user’s location
* Named Entity Recognition (NER) using both JavaScript and Python
* Dual-layer NLP: node-nlp for fast detection and Python ML fallback using HuggingFace Transformers
* Multilingual support for Malayalam and English
* Live RSS feed parsing from sources like PIB and Kerala.gov.in
* React-based modular frontend with reusable components
* MongoDB for fast and flexible backend storage
* WebSocket-ready architecture for real-time features (future support)
* Firebase integration for storage and potential user authentication

---

## TECH STACK

Frontend: React (Vite), JSX, Tailwind CSS or CSS Modules
Backend: Node.js, Express.js
ML/NLP: Python, Flask, HuggingFace Transformers (bert-base-multilingual-cased-ner-hrl)
Database: MongoDB with Mongoose ODM
APIs Used: Government RSS feeds, OpenWeather, WeatherAPI
Tools: Git, VS Code, Postman, dotenv for environment management

---

## HOW TO RUN

Requirements:

* Node.js and npm
* Python 3.x
* MongoDB Atlas account or local MongoDB
* Git

Step-by-step:

1. Clone the repository
   git clone [https://github.com/yourusername/LocalStream.git](https://github.com/yourusername/LocalStream.git)
   cd LocalStream

2. Setup Frontend
   cd frontend
   npm install
   npm run dev

3. Setup Backend
   cd ../backend
   npm install
   node nlpServer.js

4. Start Python ML API (in a separate terminal)
   python ml\_ner\_api.py

---

## .ENV CONFIGURATION

Create a .env file in the backend directory with:

MONGO\_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
PORT=5001
VITE\_OPENWEATHER\_API\_KEY=your\_api\_key
VITE\_WEATHERAPI\_KEY=your\_api\_key

---

## HOW IT WORKS

* RSS feeds are fetched from verified sources like PIB and Kerala.gov
* News headlines and descriptions are passed to the backend `/detect-location` endpoint
* node-nlp attempts to extract the location
* If it fails, a request is sent to a Python Flask API running a transformer-based NER model
* Extracted locations are stored along with articles in MongoDB
* The frontend fetches and filters the articles based on the user’s selected or detected district

---

## SAMPLE API ENDPOINTS

GET    /news?location=Kottayam       – fetches news for a given location
GET    /announcements                – fetches the latest announcements
POST   /detect-location              – sends text to NLP/ML pipeline
POST   /ner                          – directly invokes Python-based NER model

---

## FUTURE IMPROVEMENTS

* Push notifications and alerts
* Admin dashboard with analytics
* Community discussions and comment features
* Docker support and CI/CD pipelines
* Improved error handling and security middleware

---

## TESTING

* API testing with Postman
* Sample RSS feed injections for offline tests
* Manual verification of multilingual location extraction

---

## LICENSE

This project is licensed under the MIT License.

---
