import mongoose from "mongoose";

// Define the Schema
const locationDataSchema = new mongoose.Schema({
  text: String,
  detectedLocations: [String],
  title: String,
  description: String,
  location: String,
  pubDate: Date,
  link: String,
}, { collection: "locationdatas" });  // 🔥 Force collection name

// Create the model
const LocationData = mongoose.model("LocationData", locationDataSchema);

export default LocationData; // If using ES6 modules
