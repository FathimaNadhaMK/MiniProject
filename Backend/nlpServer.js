import express from "express";
import cors from "cors";
import { NlpManager } from "node-nlp";

const app = express();
app.use(cors());
app.use(express.json());

const manager = new NlpManager({ languages: ["en", "ml"], forceNER: true });

// Train your model with extra examples for disambiguation
async function trainNLP() {
  // --- Named Entity Training for Locations ---
  manager.addNamedEntityText("location", "kottayam", ["en", "ml"], ["Kottayam", "kottayam", "കോട്ടയം"]);
  manager.addNamedEntityText("location", "erattupetta",["en","ml"],["Erattupetta","erattupetta","ഈരാറ്റുപേട്ട"]);
  manager.addNamedEntityText("location", "poonjar", ["en", "ml"], ["Poonjar", "poonjar", "പൂഞ്ഞാർ"]);
  manager.addNamedEntityText("location", "meenachil", ["en", "ml"], ["Meenachil", "meenachil", "മീനച്ചിൽ"]);
  manager.addNamedEntityText("location", "kerala", ["en", "ml"], ["Kerala", "kerala", "കേരളം"]);
  manager.addNamedEntityText("location", "ernakulam", ["en", "ml"], ["Ernakulam", "ernakulam", "എറണാകുളം"]);
  manager.addNamedEntityText("location", "pathanamthitta", ["en", "ml"], ["Pathanamthitta", "pathanamthitta", "പത്തനംതിട്ട"]);
  manager.addNamedEntityText("location", "thiruvananthapuram", ["en", "ml"], ["Thiruvananthapuram", "thiruvananthapuram", "തിരുവനന്തപുരം"]);

  // Districts in Kerala
  manager.addNamedEntityText("location","pulamanthole",["en","ml"],["Pulamanthole","pulamanthole"," പുലാമന്തോൾ "]);
  manager.addNamedEntityText("location", "kollam", ["en", "ml"], ["Kollam", "kollam", "കൊല്ലം"]);
  manager.addNamedEntityText("location", "alappuzha", ["en", "ml"], ["Alappuzha", "alappuzha", "ആലപ്പുഴ"]);
  manager.addNamedEntityText("location", "idukki", ["en", "ml"], ["Idukki", "idukki", "ഇടുക്കി"]);
  manager.addNamedEntityText("location", "thrissur", ["en", "ml"], ["Thrissur", "thrissur", "തൃശ്ശൂര്"]);
  manager.addNamedEntityText("location", "palakkad", ["en", "ml"], ["Palakkad", "palakkad", "പാലക്കാട്"]);
  manager.addNamedEntityText("location", "malappuram", ["en", "ml"], ["Malappuram", "malappuram", "മലപ്പുറം"]);
  manager.addNamedEntityText("location", "kozhikode", ["en", "ml"], ["Kozhikode", "kozhikode", "കോഴിക്കോഡ്"]);
  manager.addNamedEntityText("location", "wayanad", ["en", "ml"], ["Wayanad", "wayanad", "വയനാട്"]);
  manager.addNamedEntityText("location", "kannur", ["en", "ml"], ["Kannur", "kannur", "കണ്ണൂര്"]);
  manager.addNamedEntityText("location", "kasaragod", ["en", "ml"], ["Kasaragod", "kasaragod", "കാസര്‍കോട്"]);

  // --- Named Entity Training for People (for ambiguous names) ---
  // For example, "Poonjar" might also be a person's name.
  manager.addNamedEntityText("person", "poonjar", ["en", "ml"], ["Poonjar", "poonjar"]);
  // Add person entity examples for ambiguous names
manager.addNamedEntityText("person", "pinarayi vijayan", ["en", "ml"], [
    "Pinarayi Vijayan",
    "പിണറായി വിജയൻ"
  ]);
  
  // You can add more public figures as needed:
  manager.addNamedEntityText("person", "kk george", ["en", "ml"], [
    "KK George",
    "കെ.കെ. ജോർജ്"
  ]);
  
  manager.addNamedEntityText("person", "m k staline", ["en", "ml"], [
    "M.K. Stalin",
    "എം.കെ. സ്റ്റാലിൻ"
  ]);
  
  // Add more training if there are other ambiguous cases.
  
  // --- Add Training Documents for Disambiguation ---
  // Train sentences where the ambiguous term is used as a location.
  manager.addDocument("en", "I visited Poonjar", "location.visit");
  manager.addDocument("en", "The town of Poonjar is beautiful", "location.info");
  manager.addDocument("en", "Traveling to Poonjar was amazing", "location.visit");
  
  // Train sentences where the ambiguous term is used as a person.
  manager.addDocument("en", "Poonjar spoke at the event", "person.speak");
  manager.addDocument("en", "I met Mr. Poonjar yesterday", "person.meet");
  // Training sentences when the ambiguous term is used as a location
manager.addDocument("en", "I visited Poonjar", "location.visit");
manager.addDocument("en", "The town of Poonjar is beautiful", "location.info");
manager.addDocument("ml", "പൂർത്തിയാക്കുന്ന ആദ്യ നിയോജകമണ്ഡലം പൂഞ്ഞാർ:", "person.name");

// Training sentences when the ambiguous term is used as a person
manager.addDocument("en", "Pinarayi Vijayan spoke at the rally", "person.speak");
manager.addDocument("ml", "പൂഞ്ഞാർ എംഎൽഎ അഡ്വ. സെബാസ്റ്റ്യൻ കുളത്തുങ്കൽ ", "person.speak");

manager.addDocument("en", "I met Mr. Pinarayi Vijayan yesterday", "person.meet");
manager.addDocument("ml", "പൂഞ്ഞാർ ആണെന്നും വനം വകുപ്പ് മന്ത്രി എ. കെ ശശീന്ദ്രൻ നിയമസഭയെ അറിയിച്ചു.", "person.meet");

  
  // You can add similar training examples for other ambiguous names if needed.

  await manager.train();
  manager.save();
}
await trainNLP();

// Endpoint to return location variants based on a target location.
app.get("/get-location-variants/:location", (req, res) => {
  const location = req.params.location.toLowerCase();
  const mapping = {
    pulamanthole:["pulamanthole","Pulamanthole","പുലാമന്തോൾ"],
    erattupetta:["erattupetta","Erattupetta","ഈരാറ്റുപേട്ട"],
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
  };

  if (mapping[location]) {
    res.json({ variants: mapping[location] });
  } else {
    res.json({ variants: [location] });
  }
});

// Updated endpoint for detecting locations in a text.
// We process the text and return only those entities that are recognized as location 
// and not flagged as a person in similar contexts.
app.post("/detect-location", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const response = await manager.process("en", text);

  // Separate detected entities into location and person groups.
  const locationEntities = response.entities.filter(entity => entity.entity === "location");
  const personEntities = response.entities.filter(entity => entity.entity === "person");

  // We'll return a location only if it appears as a location and either does not appear as a person,
  // or the context strongly indicates a location usage.
  const locations = locationEntities
    .filter(locEntity => {
      const optionLower = locEntity.option.toLowerCase();
      // If the same option is detected as a person, we discard it as a location.
      const isAmbiguous = personEntities.some(perEntity => perEntity.option.toLowerCase() === optionLower);
      return !isAmbiguous;
    })
    .map(entity => entity.option);

  res.json({ locations });
});

app.listen(5001, () => {
  console.log("NLP Location API running on http://localhost:5001");
});
