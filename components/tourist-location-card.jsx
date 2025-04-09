"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, ImageOff, Search } from "lucide-react"
import LocationDetailModal from "./location-detail-modal"
import "../styles/tourist-location-card.css"

export default function TouristLocationCard({
  location,
  onGetDirections,
  showDirectionsButton,
  onViewMore,
  onImageSearch,
}) {
  const [showModal, setShowModal] = useState(false)
  const [imgSrc, setImgSrc] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const { name, description, distance, address, categories } = location

  // Format distance to show in km if > 1000m
  const formattedDistance =
    distance >= 1000 ? `${(distance / 1000).toFixed(1)} കി.മീ.` : `${Math.round(distance)} മീറ്റർ`

  // Set default placeholder image when component mounts or location changes
  useEffect(() => {
    // If location already has an imageUrl, use it
    if (location.imageUrl) {
      setImgSrc(location.imageUrl)
      return
    }

    // Get the primary category for image matching
    const category = location.categories && location.categories.length > 0 ? location.categories[0] : null

    // Use a default placeholder image based on category
    setImgSrc(getCategoryDefaultImage(category))
  }, [location])

  // Get default image based on category
  const getCategoryDefaultImage = (category) => {
    if (!category) return `/placeholder.svg?height=192&width=384&text=${encodeURIComponent(location.name)}`

    const lowerCategory = category.toLowerCase()

    if (lowerCategory.includes("temple") || lowerCategory.includes("religion")) {
      return "/placeholder.svg?height=192&width=384&text=Temple"
    } else if (lowerCategory.includes("beach") || lowerCategory.includes("water")) {
      return "/placeholder.svg?height=192&width=384&text=Beach"
    } else if (lowerCategory.includes("mosque")) {
      return "/placeholder.svg?height=192&width=384&text=Mosque"
    } else if (lowerCategory.includes("museum") || lowerCategory.includes("culture")) {
      return "/placeholder.svg?height=192&width=384&text=Museum"
    } else if (lowerCategory.includes("waterfall")) {
      return "/placeholder.svg?height=192&width=384&text=Waterfall"
    } else if (lowerCategory.includes("hill") || lowerCategory.includes("mountain")) {
      return "/placeholder.svg?height=192&width=384&text=Hill"
    } else if (lowerCategory.includes("backwater") || lowerCategory.includes("lake")) {
      return "/placeholder.svg?height=192&width=384&text=Backwater"
    } else if (lowerCategory.includes("fort") || lowerCategory.includes("historic")) {
      return "/placeholder.svg?height=192&width=384&text=Historic+Site"
    } else if (lowerCategory.includes("palace")) {
      return "/placeholder.svg?height=192&width=384&text=Palace"
    } else if (lowerCategory.includes("wildlife") || lowerCategory.includes("sanctuary")) {
      return "/placeholder.svg?height=192&width=384&text=Wildlife"
    }

    // Default image
    return `/placeholder.svg?height=192&width=384&text=${encodeURIComponent(location.name)}`
  }

  // Handle image selection from search
  const handleImageSelect = (imageUrl) => {
    if (imageUrl) {
      setImgSrc(imageUrl)
      setImageLoaded(true)
      setImageError(false)
    }
  }

  // Handle image error by setting a default image
  const handleImageError = () => {
    console.log("Image failed to load:", location.name)
    setImageError(true)

    // Get a default image based on category
    const category = location.categories && location.categories.length > 0 ? location.categories[0] : null
    setImgSrc(getCategoryDefaultImage(category))
    setImageLoaded(true)
  }

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  // Handle image search button click
  const handleImageSearchClick = (e) => {
    e.stopPropagation()
    if (onImageSearch) {
      onImageSearch(location.name)
    }
  }

  return (
    <>
      <div className="location-card">
        <div className="card-image-container">
          {!imageLoaded && <div className="image-loading-placeholder"></div>}
          {imgSrc ? (
            <img
              src={imgSrc || "/placeholder.svg"}
              alt={name}
              className={`standard-image ${imageLoaded ? "loaded" : ""}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              width="384"
              height="192"
            />
          ) : imageError ? (
            <div className="image-error-container">
              <ImageOff className="image-error-icon" />
              <p>ചിത്രം ലഭ്യമല്ല</p>
            </div>
          ) : null}

          {/* Image search button overlay */}
          {onImageSearch && (
            <button
              className="image-search-button"
              onClick={handleImageSearchClick}
              title="ചിത്രങ്ങൾ തിരയുക"
              aria-label="Search for images"
            >
              <Search className="image-search-icon" />
            </button>
          )}
        </div>

        <div className="card-header">
          <h3 className="card-title">{name}</h3>
          <div className="card-address">
            <MapPin className="icon-small" />
            {address}
          </div>
        </div>

        <div className="card-content">
          <p className="card-description">{description}</p>

          {categories && categories.length > 0 && (
            <div className="category-badges">
              {categories.slice(0, 3).map((category) => (
                <span key={category} className="category-badge">
                  {category}
                </span>
              ))}
              {categories.length > 3 && <span className="category-badge">+{categories.length - 3}</span>}
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="distance-indicator">
            <Navigation className="icon-small" />
            <span>{formattedDistance}</span>
          </div>

          <div className="card-actions">
            {showDirectionsButton ? (
              <button
                className="directions-button"
                onClick={() => onGetDirections(location)}
                aria-label="Get directions"
              >
                <Navigation className="icon-small" />
                വഴി കാണിക്കുക
              </button>
            ) : (
              <button
                className="view-more-button"
                onClick={() => {
                  if (onViewMore) {
                    onViewMore(location)
                  } else {
                    setShowModal(true)
                  }
                }}
                aria-label="View more details"
              >
                കൂടുതൽ കാണുക
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <LocationDetailModal
          location={{ ...location, imageUrl: imgSrc }}
          onClose={() => setShowModal(false)}
          userLocation={null}
          onImageSelect={handleImageSelect}
        />
      )}
    </>
  )
}
