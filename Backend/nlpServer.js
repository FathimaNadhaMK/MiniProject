import express from "express";
import cors from "cors";
import { NlpManager } from "node-nlp";
import mongoose from "mongoose";
import dotenv from "dotenv";
import LocationData from "./models/LocationData.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

//const LocationData = mongoose.model("LocationData", locationSchema); // Use the schema to create the model

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ NLP Location API running on http://localhost:${PORT}`);
});