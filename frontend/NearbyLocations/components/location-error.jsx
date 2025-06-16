"use client"

import { AlertCircle, Search } from "lucide-react"
import SearchForm from "./search-form"
import "../styles/location-error.css"

export default function LocationError({ message, onRetry, debugInfo, onSearch, isSearching, onDistrictSelect }) {
  return (
    <div className="error-container">
      <div className="error-alert">
        <AlertCircle className="icon-small" />
        <h3 className="error-title">സ്ഥാനം കണ്ടെത്താൻ കഴിഞ്ഞില്ല</h3>
        <p className="error-message">{message}</p>
      </div>

      {debugInfo && (
        <div className="debug-info">
          <p>
            <strong>Debug Info:</strong> {debugInfo}
          </p>
          <p className="browser-info">
            <strong>Browser:</strong> {navigator.userAgent}
          </p>
        </div>
      )}

      <div className="search-section">
        <h4 className="search-title">
          <Search className="icon-small" />
          മറ്റൊരു സ്ഥലം തിരയുക
        </h4>
        <SearchForm onSearch={onSearch} isSearching={isSearching} onDistrictSelect={onDistrictSelect} />
      </div>

      <div className="retry-section">
        <button className="retry-button" onClick={onRetry}>
          വീണ്ടും ശ്രമിക്കുക
        </button>

        <div className="help-section">
          <h4>ലൊക്കേഷൻ അനുമതി നൽകുന്നതിനുള്ള നിർദ്ദേശങ്ങൾ:</h4>
          <ol>
            <li>ബ്രൗസറിന്റെ അഡ്രസ് ബാറിൽ ലൊക്കേഷൻ ഐക്കൺ ക്ലിക്ക് ചെയ്യുക</li>
            <li>ഈ വെബ്സൈറ്റിന് ലൊക്കേഷൻ അനുമതി നൽകുക</li>
            <li>പേജ് റീലോഡ് ചെയ്യുക അല്ലെങ്കിൽ "വീണ്ടും ശ്രമിക്കുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
