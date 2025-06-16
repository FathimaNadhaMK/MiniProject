"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import "../styles/district-selector.css"

// Comprehensive list of Kerala districts with coordinates
const KERALA_DISTRICTS = [
  { name: "തിരുവനന്തപുരം", englishName: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "കൊല്ലം", englishName: "Kollam", lat: 8.8932, lon: 76.6141 },
  { name: "പത്തനംതിട്ട", englishName: "Pathanamthitta", lat: 9.2648, lon: 76.787 },
  { name: "ആലപ്പുഴ", englishName: "Alappuzha", lat: 9.4981, lon: 76.3388 },
  { name: "കോട്ടയം", englishName: "Kottayam", lat: 9.5916, lon: 76.5222 },
  { name: "ഇടുക്കി", englishName: "Idukki", lat: 9.9189, lon: 77.1025 },
  { name: "എറണാകുളം", englishName: "Ernakulam", lat: 9.9816, lon: 76.2999 },
  { name: "തൃശ്ശൂർ", englishName: "Thrissur", lat: 10.5276, lon: 76.2144 },
  { name: "പാലക്കാട്", englishName: "Palakkad", lat: 10.7867, lon: 76.6548 },
  { name: "മലപ്പുറം", englishName: "Malappuram", lat: 11.051, lon: 76.0711 },
  { name: "കോഴിക്കോട്", englishName: "Kozhikode", lat: 11.2588, lon: 75.7804 },
  { name: "വയനാട്", englishName: "Wayanad", lat: 11.6854, lon: 76.132 },
  { name: "കണ്ണൂർ", englishName: "Kannur", lat: 11.8745, lon: 75.3704 },
  { name: "കാസർഗോഡ്", englishName: "Kasaragod", lat: 12.4996, lon: 74.9869 },
]

export default function DistrictSelector({ onSelectDistrict, selectedDistrict }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDistricts, setFilteredDistricts] = useState(KERALA_DISTRICTS)

  useEffect(() => {
    if (searchTerm) {
      const filtered = KERALA_DISTRICTS.filter(
        (district) =>
          district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          district.englishName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredDistricts(filtered)
    } else {
      setFilteredDistricts(KERALA_DISTRICTS)
    }
  }, [searchTerm])

  const handleSelectDistrict = (district) => {
    onSelectDistrict(district)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="district-selector-container">
      <div className="selector-label">ജില്ല തിരഞ്ഞെടുക്കുക:</div>

      <div className="district-dropdown">
        <button className="district-dropdown-button" onClick={() => setIsOpen(!isOpen)} type="button">
          {selectedDistrict ? (
            <span className="selected-district">
              <MapPin className="district-icon" />
              {selectedDistrict.name}
            </span>
          ) : (
            <span className="placeholder-text">ജില്ല തിരഞ്ഞെടുക്കുക</span>
          )}
          <ChevronDown className="dropdown-icon" />
        </button>

        {isOpen && (
          <div className="district-dropdown-content">
            <div className="district-search">
              <input
                type="text"
                placeholder="ജില്ല തിരയുക..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="district-search-input"
              />
            </div>

            <div className="districts-list">
              {filteredDistricts.map((district) => (
                <div
                  key={district.englishName}
                  className={`district-item ${selectedDistrict?.englishName === district.englishName ? "selected" : ""}`}
                  onClick={() => handleSelectDistrict(district)}
                >
                  <MapPin className="district-icon" />
                  <span>{district.name}</span>
                  <span className="district-english-name">({district.englishName})</span>
                </div>
              ))}

              {filteredDistricts.length === 0 && <div className="no-districts-found">ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
