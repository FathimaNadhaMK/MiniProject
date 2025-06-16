"use client"

import { useState, useEffect, useRef } from "react"
import { X, MapPin, Navigation, Info, ImageOff, ImageIcon } from "lucide-react"
import ImageSearch from "./image-search"
import "../styles/location-detail-modal.css"

export default function LocationDetailModal({ location, onClose, userLocation, onImageSelect }) {
  const [activeTab, setActiveTab] = useState("info")
  const [locationImage, setLocationImage] = useState(null)
  const [locationImageLoaded, setLocationImageLoaded] = useState(false)
  const [locationImageError, setLocationImageError] = useState(false)

  // Refs for tracking mounted state
  const isMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Set location image when component mounts
  useEffect(() => {
    if (location && location.imageUrl) {
      setLocationImage(location.imageUrl)
    } else {
      // Use a default placeholder
      setLocationImage(`/placeholder.svg?height=400&width=800&text=${encodeURIComponent(location.name)}`)
    }
  }, [location])

  // Get default image based on category
  const getCategoryDefaultImage = (category) => {
    if (!category) return `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(location.name)}`

    const lowerCategory = category.toLowerCase()

    if (lowerCategory.includes("temple") || lowerCategory.includes("religion")) {
      return "/placeholder.svg?height=400&width=800&text=Temple"
    } else if (lowerCategory.includes("beach") || lowerCategory.includes("water")) {
      return "/placeholder.svg?height=400&width=800&text=Beach"
    } else if (lowerCategory.includes("mosque")) {
      return "/placeholder.svg?height=400&width=800&text=Mosque"
    } else if (lowerCategory.includes("museum") || lowerCategory.includes("culture")) {
      return "/placeholder.svg?height=400&width=800&text=Museum"
    } else if (lowerCategory.includes("waterfall")) {
      return "/placeholder.svg?height=400&width=800&text=Waterfall"
    } else if (lowerCategory.includes("hill") || lowerCategory.includes("mountain")) {
      return "/placeholder.svg?height=400&width=800&text=Hill"
    } else if (lowerCategory.includes("backwater") || lowerCategory.includes("lake")) {
      return "/placeholder.svg?height=400&width=800&text=Backwater"
    } else if (lowerCategory.includes("fort") || lowerCategory.includes("historic")) {
      return "/placeholder.svg?height=400&width=800&text=Historic+Site"
    } else if (lowerCategory.includes("palace")) {
      return "/placeholder.svg?height=400&width=800&text=Palace"
    } else if (lowerCategory.includes("wildlife") || lowerCategory.includes("sanctuary")) {
      return "/placeholder.svg?height=400&width=800&text=Wildlife"
    }

    // Default image
    return `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(location.name)}`
  }

  // Handle image selection from search
  const handleImageSelect = (imageUrl) => {
    if (imageUrl) {
      setLocationImage(imageUrl)
      setLocationImageLoaded(true)
      setLocationImageError(false)

      // Pass the selected image back to the parent component
      if (onImageSelect) {
        onImageSelect(imageUrl)
      }
    }
  }

  // Handle image error by setting a default image
  const handleImageError = () => {
    setLocationImageError(true)
    const category = location.categories && location.categories.length > 0 ? location.categories[0] : null
    setLocationImage(getCategoryDefaultImage(category))
    setLocationImageLoaded(true)
  }

  if (!location) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        // Close modal when clicking outside the content
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-container">
        <div className="modal-header">
          <h2>{location.name}</h2>
          <button className="close-button" onClick={onClose}>
            <X className="icon-small" />
          </button>
        </div>

        <div className="modal-tabs">
          <button className={`tab-button ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
            <Info className="tab-icon" />
            വിവരങ്ങൾ
          </button>
          <button
            className={`tab-button ${activeTab === "images" ? "active" : ""}`}
            onClick={() => setActiveTab("images")}
          >
            <ImageIcon className="tab-icon" />
            ചിത്രങ്ങൾ
          </button>
        </div>

        <div className="modal-content">
          {activeTab === "info" && (
            <div className="info-tab">
              <div className="location-image-container">
                {!locationImageLoaded && <div className="image-loading-placeholder"></div>}
                {locationImage ? (
                  <img
                    src={locationImage || "/placeholder.svg"}
                    alt={location.name}
                    className={`location-image ${locationImageLoaded ? "loaded" : ""}`}
                    onLoad={() => setLocationImageLoaded(true)}
                    onError={handleImageError}
                    loading="lazy"
                    width="800"
                    height="400"
                  />
                ) : locationImageError ? (
                  <div className="image-error-container">
                    <ImageOff className="image-error-icon" />
                    <p>ചിത്രം ലഭ്യമല്ല</p>
                  </div>
                ) : null}
              </div>

              <div className="location-details">
                <div className="detail-item">
                  <MapPin className="detail-icon" />
                  <p>{location.address}</p>
                </div>

                {location.distance && (
                  <div className="detail-item">
                    <Navigation className="detail-icon" />
                    <p>
                      {location.distance >= 1000
                        ? `${(location.distance / 1000).toFixed(1)} കി.മീ.`
                        : `${Math.round(location.distance)} മീറ്റർ`}
                    </p>
                  </div>
                )}

                <div className="location-description">
                  <p>{location.description}</p>
                </div>

                {location.categories && location.categories.length > 0 && (
                  <div className="category-badges">
                    {location.categories.map((category) => (
                      <span key={category} className="category-badge">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button className="view-images-button" onClick={() => setActiveTab("images")}>
                  <ImageIcon className="button-icon" />
                  ചിത്രങ്ങൾ കാണുക
                </button>
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="images-tab">
              <div className="current-image-container">
                <h4>നിലവിലെ ചിത്രം</h4>
                {locationImage ? (
                  <img
                    src={locationImage || "/placeholder.svg"}
                    alt={location.name}
                    className="current-location-image"
                    loading="lazy"
                    width="400"
                    height="200"
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <ImageOff className="no-image-icon" />
                    <p>ചിത്രം ലഭ്യമല്ല</p>
                  </div>
                )}
              </div>

              <ImageSearch locationName={location.name} onImageSelect={handleImageSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
