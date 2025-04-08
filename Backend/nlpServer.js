import express from "express";
import cors from "cors";
import { NlpManager } from "node-nlp";
import mongoose from "mongoose";
import dotenv from "dotenv";
import LocationData from "./models/LocationData.js";
import { WebSocketServer } from "ws";
import Parser from "rss-parser";
import Announcement from "./models/Announcement.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const parser = new Parser();
const WS_PORT = process.env.WS_PORT || 5002;
const wss = new WebSocketServer({ port: WS_PORT });
// ✅ Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err)); 


// ✅ Define MongoDB Schema for Storing Detected Locations
const locationSchema = new mongoose.Schema({
  text: String,
  detectedLocations: [String],
  timestamp: { type: Date, default: Date.now },
});
const announcementSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  date: String,
  link: String,
});

const RSS_FEEDS = [
  "https://go.lsgkerala.gov.in/pages/rss.php",
  "https://www.pib.gov.in/PressReleaseRSS.aspx",
  "https://www.india.gov.in/rss/india/news.rss"
];
//const LocationData = mongoose.model("LocationData", locationSchema); // Use the schema to create the model

const fetchRSSNews = async () => {
  try {
    for (const url of RSS_FEEDS) {
      const feed = await parser.parseURL(url);
      feed.items.forEach(async (item) => {
        const existing = await Announcement.findOne({ id: item.guid || item.link });
        if (!existing) {
          await Announcement.create({
            id: item.guid || item.link,
            title: item.title,
            description: item.contentSnippet || "No description available.",
            date: item.pubDate || new Date().toISOString(),
            link: item.link,
          });
        }
      });
    }
    console.log("✅ RSS News Updated");
  } catch (error) {
    console.error("❌ RSS Fetch Error:", error);
  }
};

const manager = new NlpManager({
  languages: ["en", "ml"],
  forceNER: true,
  ner: { threshold: 0.7 }, // Lower threshold for faster processing
});

// --- Named Entity Training for Locations and People ---
async function trainNLP() {
  const locations = [
    // Your location data here... ["pulamanthole", "Pulamanthole", "പുലാമന്തോൾ"],
    ["kottayam", "Kottayam", "കോട്ടയം"],
    ["erattupetta", "Erattupetta", "ഈരാറ്റുപേട്ട"],
    ["poonjar", "Poonjar", "പൂഞ്ഞാർ"],
    ["meenachil", "Meenachil", "മീനച്ചിൽ"],
    ["kerala", "Kerala", "കേരളം"],
    ["ernakulam", "Ernakulam", "എറണാകുളം"],
    ["pathanamthitta", "Pathanamthitta", "പത്തനംതിട്ട"],
    ["thiruvananthapuram", "Thiruvananthapuram", "തിരുവനന്തപുരം"],
    ["kollam", "Kollam", "കൊല്ലം"],
    ["alappuzha", "Alappuzha", "ആലപ്പുഴ"],
    ["idukki", "Idukki", "ഇടുക്കി"],
    ["thrissur", "Thrissur", "തൃശ്ശൂര്"],
    ["palakkad", "Palakkad", "പാലക്കാട്"],
    ["malappuram", "Malappuram", "മലപ്പുറം"],
    ["kozhikode", "Kozhikode", "കോഴിക്കോഡ്"],
    ["wayanad", "Wayanad", "വയനാട്"],
    ["kannur", "Kannur", "കണ്ണൂര്"],
    ["kasaragod", "Kasaragod", "കാസര്‍കോട്"],
    ["pala", "Pala", "പാല"],
    // Additional Kottayam locations
    ["changanassery", "Changanassery", "ചങ്ങനാശ്ശേരി"],
    ["vaikom", "Vaikom", "വൈക്കം"],
    ["pala", "Pala", "പാലാ"],
    ["mundakkayam", "Mundakkayam", "മുണ്ടക്കായം"],
    ["kanjirappally", "Kanjirappally", "കാഞ്ഞിരപ്പള്ളി"],
    ["kaduthuruthy", "Kaduthuruthy", "കടുത്തുരുത്തി"],
    ["thiruvalla", "Thiruvalla", "തിരുവല്ല"],
    ["mallappally", "Mallappally", "മല്ലപ്പള്ളി"],
    ["kuravilangad", "Kuravilangad", "കുറവിലങ്ങാട്"],
    ["bharananganam", "Bharananganam", "ഭരണങ്ങാനം"],
    ["elikkulam", "Elikkulam", "എളിക്കുളം"],
    ["kangazha", "Kangazha", "കാഞ്ഞാഴ"],
    ["neendoor", "Neendoor", "നീന്ദൂർ"],
    ["rampuram", "Rampuram", "രാമ്പുറം"],
    ["vakathanam", "Vakathanam", "വാകത്താനം"],
    ["aroor", "Aroor", "ആറൂർ"],
    ["kumarakom", "Kumarakom", "കുമാരകം"],
    ["manarcaud", "Manarcaud", "മണർക്കാട്"],
    ["marangattupilly", "Marangattupilly", "മറങ്ങാട്ടുപിള്ളി"],
    ["uthiyanoor", "Uthiyanoor", "ഉതിയനൂർ"],
    ["vazhoor", "Vazhoor", "വാഴൂർ"],
    ["kottathavalam", "Kottathavalam", "കോട്ടത്തവളം"],
    ["kallara", "Kallara", "കല്ലറ"],
    ["kalloopara", "Kalloopara", "കല്ലൂപ്പാറ"],
    ["kothanalloor", "Kothanalloor", "കൊത്തനല്ലൂർ"],
    ["kurichy", "Kurichy", "കുറിച്ചി"],
    ["kudamaloor", "Kudamaloor", "കുടമലൂർ"],
    ["kuravilangad", "Kuravilangad", "കുറവിലങ്ങാട്"],
    ["muttuchira", "Muttuchira", "മുട്ടുചിറ"],
    ["pariyaram", "Pariyaram", "പരിയാരം"],
    ["perumbaikad", "Perumbaikad", "പെരുമ്പൈക്കാട്"],
    ["thidanad", "Thidanad", "തിടനാട്"],
    ["vakathanam", "Vakathanam", "വാകത്താനം"],
    ["pulamanthole", "Pulamanthole", "പുലാമന്തോൾ"],
    ["koppam", "Koppam", "കൊപ്പം"],
    ["ottapalam", "Ottapalam", "ഒട്ടപലം"],
    ["chittur", "Chittur", "ചിട്ടൂർ"],
    ["alathur", "Alathur", "അലത്തൂർ"],
    ["mannarkkad", "Mannarkkad", "മണ്ണാർക്കട"],
    ["tirunavaya", "Tirunavaya", "തിരുനാവായ"],

  ];

  // Train locations
  locations.forEach(([key, en, ml]) => {
    manager.addNamedEntityText("location", key, ["en", "ml"], [en, ml]);
  });

  const people = [
    // Your people data here...
    ["pinarayi vijayan", "Pinarayi Vijayan", "പിണറായി വിജയൻ"],
    ["kk george", "KK George", "കെ.കെ. ജോർജ്"],
    ["m k stalin", "M.K. Stalin", "എം.കെ. സ്റ്റാലിൻ"],
    ["Poonjar MLA","poonjar MLA","പൂഞ്ഞാർ എം എൽ എ"],
    ["poonjar MLA adv sebastin koluthingal", "poonjar MLA adv sebastin koluthingal", "പൂഞ്ഞാർ എംഎൽഎ അഡ്വ. സെബാസ്റ്റ്യൻ കുളത്തुङ്കൽ"],
    // Additional person training examples
    ["v s achuthanandan", "V S Achuthanandan", "വി എസ് അച്യുതാനന്ദൻ"],
    ["k karunakaran", "K Karunakaran", "കെ. കരുണാകരൻ"],
    ["oommen chandy", "Oommen Chandy", "ഓമ്മൻ ചാണ്ടി"],
    ["a k antony", "A K Antony", "എകെ ആന്റണി"],
    ["k muraleedharan", "K Muraleedharan", "കെ. മുരളീധരൻ"],
    ["suresh kumar", "Suresh Kumar", "സുരേഷ് കുമാർ"],

  ];

  people.forEach(([key, en, ml]) => {
    manager.addNamedEntityText("person", key, ["en", "ml"], [en, ml]);
  });

  // --- Additional Training: Recognize Person Names Starting with a Location ---
  const locationKeys = [...new Set(locations.map(([key]) => key))];
  const regexPattern = new RegExp(`^(${locationKeys.join("|")})\\s+.+`, "i");
manager.addRegexEntity("person", ["en", "ml"], regexPattern);

  await manager.train();
  await manager.save();
}

await trainNLP();
trainNLP().then(() => console.log("✅ NLP Model Trained")).catch(console.error);


// ✅ Endpoint for Getting Location Variants
const locationMapping = {
  
  // Your location mapping data here...
  pala:["pala","Pala","പാല"],
  pulamanthole: ["pulamanthole", "Pulamanthole", "പുലാമന്തോൾ"],
  erattupetta: ["erattupetta", "Erattupetta", "ഈരാറ്റുപേട്ട"],
  kottayam: ["kottayam", "Kottayam", "കോട്ടയം"],
  poonjar: ["poonjar", "Poonjar", "പൂഞ്ഞാർ"],
  meenachil: ["meenachil", "Meenachil", "മീനച്ചിൽ"],
  kerala: ["kerala", "Kerala", "കേരളം"],
  ernakulam: ["ernakulam", "Ernakulam", "എറണാകുളം"],
  pathanamthitta: ["pathanamthitta", "Pathanamthitta", "പത്തനംതിട്ട"],
  thiruvananthapuram: ["thiruvananthapuram", "Thiruvananthapuram", "തിരുവനന്തപുരം"],
  kollam: ["kollam", "Kollam", "കൊല്ലം"],
  alappuzha: ["alappuzha", "Alappuzha", "ആലപ്പുഴ"],
  idukki: ["idukki", "Idukki", "ഇടുക്കി"],
  thrissur: ["thrissur", "Thrissur", "തൃശ്ശൂര്"],
  palakkad: ["palakkad", "Palakkad", "പാലക്കാട്"],
  malappuram: ["malappuram", "Malappuram", "മലപ്പുറം"],
  kozhikode: ["kozhikode", "Kozhikode", "കോഴിക്കോഡ്"],
  wayanad: ["wayanad", "Wayanad", "വയനാട്"],
  kannur: ["kannur", "Kannur", "കണ്ണൂര്"],
  kasaragod: ["kasaragod", "Kasaragod", "കാസര്‍കോട്"],
  changanassery: ["changanassery", "Changanassery", "ചങ്ങനാശ്ശേരി"],
  vaikom: ["vaikom", "Vaikom", "വൈക്കം"],
  pala: ["pala", "Pala", "പാലാ"],
  mundakkayam: ["mundakkayam", "Mundakkayam", "മുണ്ടക്കായം"],
  kanjirappally: ["kanjirappally", "Kanjirappally", "കാഞ്ഞിരപ്പള്ളി"],
  kaduthuruthy: ["kaduthuruthy", "Kaduthuruthy", "കടുത്തുരുത്തി"],
  thiruvalla: ["thiruvalla", "Thiruvalla", "തിരുവല്ല"],
  mallappally: ["mallappally", "Mallappally", "മല്ലപ്പള്ളി"],
  kuravilangad: ["kuravilangad", "Kuravilangad", "കുറവിലങ്ങാട്"],
  bharananganam: ["bharananganam", "Bharananganam", "ഭരണങ്ങാനം"],
  elikkulam: ["elikkulam", "Elikkulam", "എളിക്കുളം"],
  kangazha: ["kangazha", "Kangazha", "കാഞ്ഞാഴ"],
  neendoor: ["neendoor", "Neendoor", "നീന്ദൂർ"],
  rampuram: ["rampuram", "Rampuram", "രാമ്പുറം"],
  vakathanam: ["vakathanam", "Vakathanam", "വാകത്താനം"],
  aroor: ["aroor", "Aroor", "ആറൂർ"],
  kumarakom: ["kumarakom", "Kumarakom", "കുമാരകം"],
  manarcaud: ["manarcaud", "Manarcaud", "മണർക്കാട്"],
  marangattupilly: ["marangattupilly", "Marangattupilly", "മറങ്ങാട്ടുപിള്ളി"],
  uthiyanoor: ["uthiyanoor", "Uthiyanoor", "ഉതിയനൂർ"],
  vazhoor: ["vazhoor", "Vazhoor", "വാഴൂർ"],
  kottathavalam: ["kottathavalam", "Kottathavalam", "കോട്ടത്തവളം"],
  kallara: ["kallara", "Kallara", "കല്ലറ"],
  kalloopara: ["kalloopara", "Kalloopara", "കല്ലൂപ്പാറ"],
  kothanalloor: ["kothanalloor", "Kothanalloor", "കൊത്തനല്ലൂർ"],
  kurichy: ["kurichy", "Kurichy", "കുറിച്ചി"],
  kudamaloor: ["kudamaloor", "Kudamaloor", "കുടമലൂർ"],
  muttuchira: ["muttuchira", "Muttuchira", "മുട്ടുചിറ"],
  pariyaram: ["pariyaram", "Pariyaram", "പരിയാരം"],
  perumbaikad: ["perumbaikad", "Perumbaikad", "പെരുമ്പൈക്കാട്"],
  thidanad: ["thidanad", "Thidanad", "തിടനാട്"],
  poonjar: ["poonjar", "Poonjar", "പൂഞ്ഞാർ"],
  teekoy: ["teekoy", "Teekoy", "തീക്കോയി"],
  erattupetta: ["erattupetta", "Erattupetta", "ഈരാറ്റുപേട്ട"],
  pala: ["pala", "Pala", "പാലാ"],
  melukavu: ["melukavu", "Melukavu", "മേലുകാവ്"],
  moonnilavu: ["moonnilavu", "Moonnilavu", "മൂന്നിലാവ്"],
  thalappalam: ["thalappalam", "Thalappalam", "തലപ്പലം"],
  manimala: ["manimala", "Manimala", "മാണിമല"],
  meenachil: ["meenachil", "Meenachil", "മീനച്ചിൽ"],
  thidanadu: ["thidanadu", "Thidanadu", "തിടനാട്"],
  kulamavu: ["kulamavu", "Kulamavu", "കുലമാവ്"],
  vandanmedu: ["vandanmedu", "Vandanmedu", "വണ്ടൻമേട്"],
  kottamala: ["kottamala", "Kottamala", "കോട്ടമല"],
  elappara: ["elappara", "Elappara", "എലപ്പാറ"],
  kanjar: ["kanjar", "Kanjar", "കാഞ്ചാർ"],
  upputhara: ["upputhara", "Upputhara", "ഉപ്പുതറ"],
  peruvanthanam: ["peruvanthanam", "Peruvanthanam", "പെരുവന്താനം"],
  idukki: ["idukki", "Idukki", "ഇടുക്കി"],
    Akalakunnam: ["akalakunnam", "Akalakunnam", "അകലകുന്നം"],
    Anickad: ["anickad", "Anickad", "അനിക്കാട്"],
    Arpookara: ["arpookara", "Arpookara", "ആർപ്പൂക്കര"],
    Athirampuzha: ["athirampuzha", "Athirampuzha", "അതിരമ്പുഴ"],
    Aymanam: ["aymanam", "Aymanam", "അയ്മനം"],
    Ayarkunnam: ["ayarkunnam", "Ayarkunnam", "അയർക്കുന്നം"],
    Bharananganam: ["bharananganam", "Bharananganam", "ഭരണങ്ങാനം"],
    Changanassery: ["changanassery", "Changanassery", "ചങ്ങനാശ്ശേരി"],
    Cheruvally: ["cheruvally", "Cheruvally", "ചെറുവള്ളി"],
    "Chengalam East": ["chengalam east", "Chengalam East", "ചെങ്ങളം ഈസ്റ്റ്"],
    "Chengalam South": ["chengalam south", "Chengalam South", "ചെങ്ങളം സൗത്ത്"],
    Chirakkadavu: ["chirakkadavu", "Chirakkadavu", "ചിറക്കടവ്"],
    Edakkunnam: ["edakkunnam", "Edakkunnam", "എടക്കുന്നം"],
    Elackad: ["elackad", "Elackad", "ഇലക്കാട്"],
    Elamgulam: ["elamgulam", "Elamgulam", "ഏലംഗുളം"],
    Elikkulam: ["elikkulam", "Elikkulam", "എളിക്കുളം"],
    Erumeli: ["erumeli", "Erumeli", "എരുമേലി"],
    "Erumeli South": ["erumeli south", "Erumeli South", "എരുമേലി സൗത്ത്"],
    Erattupetta: ["erattupetta", "Erattupetta", "ഈരാറ്റുപേട്ട"],
    Ettumanoor: ["ettumanoor", "Ettumanoor", "എട്ടുമാനൂർ"],
    Kadanad: ["kadanad", "Kadanad", "കടനാട്"],
    Kadaplamattom: ["kadaplamattom", "Kadaplamattom", "കടപ്ലാമറ്റം"],
    Kaipuzha: ["kaipuzha", "Kaipuzha", "കൈപ്പുഴ"],
    Kanakkary: ["kanakkary", "Kanakkary", "കനക്കരി"],
    Kangazha: ["kangazha", "Kangazha", "കങ്ങഴ"],
    Kanjirappally: ["kanjirappally", "Kanjirappally", "കാഞ്ഞിരപ്പള്ളി"],
    Karukachal: ["karukachal", "Karukachal", "കരുകച്ചാൽ"],
    Kidangoor: ["kidangoor", "Kidangoor", "കിടങ്ങൂർ"],
    Koottickal: ["koottickal", "Koottickal", "കൂട്ടിക്കൽ"],
    Koovappally: ["koovappally", "Koovappally", "കൂവപ്പള്ളി"],
    Koruthodu: ["koruthodu", "Koruthodu", "കൊരുത്തോട്"],
    Kooroppada: ["kooroppada", "Kooroppada", "കൂരോപ്പട"],
    Kottayam: ["kottayam", "Kottayam", "കോട്ടയം"],
    Kumarakom: ["kumarakom", "Kumarakom", "കുമരകം"],
    Kuravilangad: ["kuravilangad", "Kuravilangad", "കുറവിലങ്ങാട്"],
    Kurichy: ["kurichy", "Kurichy", "കുറിച്ചി"],
    Kurichithanam: ["kurichithanam", "Kurichithanam", "കുറിച്ചിതാനം"],
    Lalam: ["lalam", "Lalam", "ലാളം"],
    Madappally: ["madappally", "Madappally", "മടപ്പള്ളി"],
    Manarcad: ["manarcad", "Manarcad", "മണർകാട്"],
    Manimala: ["manimala", "Manimala", "മണിമല"],
    Meenachil: ["meenachil", "Meenachil", "മീനച്ചിൽ"],
    Meenadam: ["meenadam", "Meenadam", "മീനടം"],
    Melukavu: ["melukavu", "Melukavu", "മേലുകാവ്"],
    Monippally: ["monippally", "Monippally", "മോണിപ്പള്ളി"],
    Moonilavu: ["moonilavu", "Moonilavu", "മൂണിലാവ്"],
    Mundakkayam: ["mundakkayam", "Mundakkayam", "മുണ്ടക്കയം"],
    Muttambalam: ["muttambalam", "Muttambalam", "മുട്ടമ്പലം"],
    Nattakom: ["nattakom", "Nattakom", "നാട്ടകം"],
    Nedumkunnam: ["nedumkunnam", "Nedumkunnam", "നെടുംകുന്നം"],
    Onamthuruthu: ["onamthuruthu", "Onamthuruthu", "ഓണംതുരുത്ത്"],
    Pala: ["pala", "Pala", "പാല"],
    Panachikkad: ["panachikkad", "Panachikkad", "പനച്ചിക്കാട്"],
    Panackapalam: ["panackapalam", "Panackapalam", "പനക്കപലം"],
    Pampady: ["pampady", "Pampady", "പാമ്പാടി"],
    Payippad: ["payippad", "Payippad", "പായിപ്പാട്"],
    Peroor: ["peroor", "Peroor", "പേരൂർ"],
    Perumbaikad: ["perumbaikad", "Perumbaikad", "പെരുമ്പൈക്കാട്"],
    Poovarany: ["poovarany", "Poovarany", "പൂവാരണി"],
    Poonjar: ["poonjar", "Poonjar", "പൂഞ്ഞാർ"],
    "Poonjar Nadubhagam": ["poonjar nadubhagam", "Poonjar Nadubhagam", "പൂഞ്ഞാർ നടുഭാഗം"],
    "Poonjar Thekkekara": ["poonjar thekkekara", "Poonjar Thekkekara", "പൂഞ്ഞാർ തെക്കേക്കര"],
    Puliyannoor: ["puliyannoor", "Puliyannoor", "പുലിയന്നൂർ"],
    Puthuppally: ["puthuppally", "Puthuppally", "പുതുപ്പള്ളി"],
    Ramapuram: ["ramapuram", "Ramapuram", "രാമപുരം"],
    Teekoy: ["teekoy", "Teekoy", "തീക്കോയ്"],
    Thalanadu: ["thalanadu", "Thalanadu", "തളനാട്"],
    Thalappalam: ["thalappalam", "Thalappalam", "തളപ്പലം"],
    Thiruvarppu: ["thiruvarppu", "Thiruvarppu", "തിരുവാർപ്പ്"],
    Thottackad: ["thottackad", "Thottackad", "തോട്ടാക്കാട്"],
    Vakathanam: ["vakathanam", "Vakathanam", "വാകത്താനം"],
    Vaikom: ["vaikom", "Vaikom", "വൈക്കം"],
    "Vazhappally East": ["vazhappally east", "Vazhappally East", "വഴപ്പള്ളി ഈസ്റ്റ്"],
    "Vazhappally West": ["vazhappally west", "Vazhappally West", "വഴപ്പള്ളി വെസ്റ്റ്"],
    Vazhoor: ["vazhoor", "Vazhoor", "വാഴൂർ"],
    Vellavoor: ["vellavoor", "Vellavoor", "വെള്ളവൂർ"],
    Veloor: ["veloor", "Veloor", "വെളൂർ"],
    Vijayapuram: ["vijayapuram", "Vijayapuram", "വിജയപുരം"]
  
  


};

app.get("/news", async (req, res) => {
  try {
    console.log("🔎 Incoming request:", req.query);
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: "Missing location parameter" });
    }

    // ✅ Query the correct `LocationData` collection for news
    const news = await LocationData.find({
      location: { $regex: new RegExp(location, "i") },
      title: { $exists: true }, // ✅ Ensure we are fetching only news articles
    })
      .sort({ pubDate: -1 })
      .limit(20)
      .lean();

    console.log("✅ News fetched:", news.length);
    res.json({ news });
  } catch (error) {
    console.error("❌ News Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


app.get("/get-location-variants/:location", (req, res) => {
  const location = req.params.location.toLowerCase();
  res.json({ variants: locationMapping[location] || [location] });
});

// ✅ Optimized Endpoint for Detecting Locations
 //✅ Location Detection API
app.post("/detect-location", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const existingEntry = await LocationData.findOne({ text });
    if (existingEntry) {
      return res.json({ locations: existingEntry.detectedLocations });
    }

    const response = await manager.process("ml", text);
    const locations = response.entities
      .filter((entity) => entity.entity === "location")
      .map((entity) => entity.option);

    if (locations.length > 0) {
      await LocationData.create({ text, detectedLocations: locations });
    }

    res.json({ locations });
  } catch (error) {
    console.error("❌ Error processing NLP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})
app.get("/announcements", async (req, res) => {
  try {
    console.log("📢 Fetching announcements...");
    const announcements = await Announcement.find().sort({ date: -1 }).limit(20);
    console.log("✅ Announcements fetched:", announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error("❌ Fetch Error in /announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements", details: error.message });
  }
});
fetch("http://localhost:5001/announcements")
  .then((res) => res.json())
  .then((data) => {
    console.log("Fetched Announcements:", data);  // Debugging step
    Announcement(data);
  })
  .catch((error) => console.error("Fetch error:", error));


wss.on("connection", (ws) => {
  console.log("🔗 WebSocket Connected");
  ws.on("message", (message) => console.log("📩 Received:", message));
  ws.on("close", () => console.log("⚠️ WebSocket Disconnected"));
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ NLP Location API running on http://localhost:${PORT}`);
});

export { wss };