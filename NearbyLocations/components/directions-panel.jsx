"use client"

import { ArrowLeft, MapPin } from "lucide-react"
import "../styles/directions-panel.css"

export default function DirectionsPanel({ location, onClose }) {
  return (
    <div className="directions-container">
      <div className="directions-header">
        <button className="back-button" onClick={onClose}>
          <ArrowLeft className="icon-small" />
          മടങ്ങുക
        </button>
        <h2>വഴി നിർദ്ദേശങ്ങൾ</h2>
      </div>

      <div className="directions-destination">
        <h3>{location.name}</h3>
        <p className="destination-address">
          <MapPin className="icon-small" />
          {location.address}
        </p>
      </div>

      <div className="directions-info">
        <p>
          ഈ സ്ഥലത്തേക്കുള്ള വഴി നിർദ്ദേശങ്ങൾ ലഭിക്കുന്നതിന് നിങ്ങളുടെ മൊബൈൽ ഫോണിലെ മാപ്പ് ആപ്ലിക്കേഷൻ ഉപയോഗിക്കുക. നിങ്ങളുടെ നിലവിലെ സ്ഥാനത്തിൽ
          നിന്ന് ഈ സ്ഥലത്തേക്ക് എത്തിച്ചേരാനുള്ള വഴി നിർദ്ദേശങ്ങൾ ലഭിക്കും.
        </p>
      </div>

      <div className="directions-note">
        <p>
          <strong>കുറിപ്പ്:</strong> ഈ ആപ്ലിക്കേഷൻ നിലവിൽ വഴി നിർദ്ദേശങ്ങൾ നേരിട്ട് കാണിക്കുന്നില്ല. കൃത്യമായ വഴി നിർദ്ദേശങ്ങൾക്ക് നിങ്ങളുടെ
          മൊബൈൽ ഫോണിലെ മാപ്പ് ആപ്ലിക്കേഷൻ ഉപയോഗിക്കുക.
        </p>
      </div>
    </div>
  )
}
