"use client"

import { useState, useEffect } from "react"
import { Search, MapPin } from "lucide-react"
import DistrictSelector from "./district-selector"
import "../styles/search-form.css"

export default function SearchForm({
  onSearch,
  isSearching,
  onDistrictSelect = () => {},
  onRadiusChange = () => {},
  initialRadius = 20,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [searchRadius, setSearchRadius] = useState(initialRadius) // Use initialRadius

  const keralaCities = [
    "തിരുവനന്തപുരം",
    "കൊല്ലം",
    "പത്തനംതിട്ട",
    "ആലപ്പുഴ",
    "കോട്ടയം",
    "ഇടുക്കി",
    "എറണാകുളം",
    "കൊച്ചി",
    "തൃശ്ശൂർ",
    "പാലക്കാട്",
    "മലപ്പുറം",
    "കോഴിക്കോട്",
    "വയനാട്",
    "കണ്ണൂർ",
    "കാസർഗോഡ്",
    "മുന്നാർ",
    "കുമളി",
    "തേക്കടി",
    "വർക്കല",
    "കോവളം",
    "കുമരകം",
    "വാഗമൺ",
    "പൊന്മുടി",
    "അട്ടപ്പാടി",
    "സൈലന്റ് വാലി",
    "ആറന്മുള",
    "ഗുരുവായൂർ",
    "ബേക്കൽ",
    "കൊടുങ്ങല്ലൂർ",
    "ചാലക്കുടി",
  ]

  // Update local state when initialRadius changes
  useEffect(() => {
    setSearchRadius(initialRadius)
  }, [initialRadius])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      onSearch(searchQuery, searchRadius)
    } else if (selectedDistrict) {
      // If no search query but district is selected, search by district
      onDistrictSelect(selectedDistrict, searchRadius)
    }
  }

  const handleSuggestionClick = (city) => {
    setSearchQuery(city)
    onSearch(city, searchRadius)
    setShowSuggestions(false)
  }

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district)
    // Clear search query when district is selected
    setSearchQuery("")
    // Notify parent component about district selection
    onDistrictSelect(district, searchRadius)
  }

  const handleRadiusChange = (e) => {
    const newRadius = Number.parseInt(e.target.value)
    setSearchRadius(newRadius)

    // Notify parent component about radius change
    onRadiusChange(newRadius)
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-options">
          <DistrictSelector onSelectDistrict={handleDistrictSelect} selectedDistrict={selectedDistrict} />

          <div className="radius-selector">
            <label htmlFor="radius-slider" className="radius-label">
              തിരയൽ റേഡിയസ്: <span className="radius-value">{searchRadius} കി.മീ.</span>
            </label>
            <input
              type="range"
              id="radius-slider"
              min="5"
              max="50"
              step="5"
              value={searchRadius}
              onChange={handleRadiusChange}
              className="radius-slider"
            />
            <div className="radius-markers">
              <span>5</span>
              <span>20</span>
              <span>35</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <div className="search-input-wrapper">
          <div className="search-input-container">
            <MapPin className="input-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="സ്ഥലത്തിന്റെ പേര് തിരയുക..."
              className="search-input"
              disabled={isSearching}
            />
            <button
              type="submit"
              className="search-button"
              disabled={isSearching || (!searchQuery.trim() && !selectedDistrict)}
            >
              {isSearching ? (
                <span className="search-loading"></span>
              ) : (
                <>
                  <Search className="search-icon" />
                  <span>സ്ഥലങ്ങൾ തിരയുക</span>
                </>
              )}
            </button>
          </div>

          {showSuggestions && searchQuery.trim() && (
            <div className="suggestions-container">
              {keralaCities
                .filter(
                  (city) =>
                    city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    searchQuery.toLowerCase().includes(city.toLowerCase()),
                )
                .slice(0, 5)
                .map((city, index) => (
                  <div key={index} className="suggestion-item" onClick={() => handleSuggestionClick(city)}>
                    <MapPin className="suggestion-icon" />
                    {city}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="popular-locations">
          <span className="popular-label">പ്രശസ്തമായ സ്ഥലങ്ങൾ:</span>
          {keralaCities.slice(0, 5).map((city, index) => (
            <button key={index} type="button" className="location-tag" onClick={() => handleSuggestionClick(city)}>
              {city}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
