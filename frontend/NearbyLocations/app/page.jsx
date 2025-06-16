"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { MapPin, Info, ArrowLeft, ImageIcon, X } from "lucide-react"
import TouristLocationCard from "@/components/tourist-location-card"
import LocationError from "@/components/location-error"
import LoadingState from "@/components/loading-state"
import SearchForm from "@/components/search-form"
import DirectionsPanel from "@/components/directions-panel"
import LocationDetailModal from "@/components/location-detail-modal"
import ImageSearch from "@/components/image-search"
import "../styles/tourist-locations.css"

export default function TouristLocationsPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [searchedLocation, setSearchedLocation] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showDirections, setShowDirections] = useState(false)
  const [searchRadius, setSearchRadius] = useState(20) // Default radius
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailLocation, setDetailLocation] = useState(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [selectedImageSearchLocation, setSelectedImageSearchLocation] = useState("")
  const [visibleLocations, setVisibleLocations] = useState([])

  // Refs for tracking mounted state and intersection observer
  const isMounted = useRef(true)
  const observerRef = useRef(null)
  const locationRefs = useRef({})

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (typeof IntersectionObserver !== "undefined") {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const locationId = entry.target.dataset.locationId
              if (locationId) {
                setVisibleLocations((prev) => [...prev, locationId])
                observerRef.current.unobserve(entry.target)
              }
            }
          })
        },
        { rootMargin: "200px" },
      )
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Observe location cards when they're rendered
  useEffect(() => {
    if (observerRef.current) {
      Object.values(locationRefs.current).forEach((ref) => {
        if (ref) {
          observerRef.current.observe(ref)
        }
      })
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [locations])

  // Function to get user location
  const getLocation = useCallback(() => {
    setLoading(true)
    setError(null)
    setDebugInfo("Attempting to get location...")

    if (!navigator.geolocation) {
      setDebugInfo("Geolocation is not supported by this browser")
      setError("നിങ്ങളുടെ ബ്രൗസർ ജിയോലൊക്കേഷൻ പിന്തുണയ്ക്കുന്നില്ല.")
      setLoading(false)
      return
    }

    // Options for geolocation request - increased timeout and high accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          setDebugInfo(`Location obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setUserLocation({ lat: latitude, lon: longitude })

          // Fetch nearby tourist locations from our API route
          setDebugInfo("Fetching locations from API...")
          console.log('fetching locations from API...')
          const response = await fetch(`/api/tourist-locations?lat=${latitude}&lon=${longitude}&radius=${searchRadius}`)

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`)
          }

          const data = await response.json()
          setDebugInfo(`Received ${data.length} locations from API`)

          // Set locations with default placeholder images
          if (isMounted.current) {
            setLocations(data)
            setLoading(false)
            setImagesLoaded(true)
            // Initially set only first 5 locations as visible
            setVisibleLocations(data.slice(0, 5).map((loc) => loc.id))
          }
        } catch (err) {
          if (isMounted.current) {
            setDebugInfo(`Error: ${err.message}`)
            setError("സ്ഥലങ്ങൾ ലഭിക്കുന്നതിൽ പിശക് ഉണ്ടായി") // Error fetching locations
            setLoading(false)
          }
        }
      },
      (err) => {
        if (!isMounted.current) return

        let errorMessage = "നിങ്ങളുടെ സ്ഥാനം കണ്ടെത്താൻ കഴിഞ്ഞില്ല. ദയവായി ലൊക്കേഷൻ അനുമതി നൽകുക."

        // More specific error messages based on the error code
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "ലൊക്കേഷൻ അനുമതി നിഷേധിച്ചു. ദയവായി ബ്രൗസർ സെറ്റിംഗ്സിൽ പോയി ലൊക്കേഷൻ അനുമതി നൽകുക."
            break
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "നിങ്ങളുടെ സ്ഥാനം ലഭ്യമല്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക."
            break
          case 3: // TIMEOUT
            errorMessage = "ലൊക്കേഷൻ ലഭിക്കുന്നതിന് കാലതാമസം നേരിട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക."
            break
        }

        setDebugInfo(`Geolocation error: ${err.code} - ${err.message}`)
        setError(errorMessage)
        setLoading(false)
      },
      options,
    )
  }, [searchRadius])

  // Function to handle search
  const handleSearch = async (searchQuery, radius = searchRadius) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setDebugInfo(`Searching for: ${searchQuery} with radius: ${radius}km`)
    setSearchRadius(radius)

    try {
      // First, geocode the search query to get coordinates
      const geocodeResponse = await fetch(`/api/geocode?query=${encodeURIComponent(searchQuery)}`)

      if (!geocodeResponse.ok) {
        throw new Error(`Geocoding API responded with status: ${geocodeResponse.status}`)
      }

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData || geocodeData.length === 0) {
        setDebugInfo("No location found for the search query")
        setLocations([])
        setSearchedLocation(null)
        setIsSearching(false)
        return
      }

      const { lat, lon, formatted } = geocodeData[0]

      if (!lat || !lon) {
        throw new Error("Geocoding API returned invalid coordinates")
      }

      setDebugInfo(`Found location: ${formatted} at ${lat}, ${lon}`)
      setSearchedLocation({ lat, lon, name: formatted })

      // Now fetch tourist locations near the searched location
      const locationsUrl = `/api/tourist-locations?lat=${lat}&lon=${lon}&radius=${radius}`
      setDebugInfo(`Fetching locations from: ${locationsUrl}`)

      const locationsResponse = await fetch(locationsUrl)

      if (!locationsResponse.ok) {
        const errorData = await locationsResponse.text()
        throw new Error(`Tourist locations API error: ${locationsResponse.status} - ${errorData}`)
      }

      const locationsData = await locationsResponse.json()
      setDebugInfo(`Received ${locationsData.length} locations for search query`)

      // Set locations with default placeholder images
      if (isMounted.current) {
        setLocations(locationsData)
        setImagesLoaded(true)
        // Initially set only first 5 locations as visible
        setVisibleLocations(locationsData.slice(0, 5).map((loc) => loc.id))
      }
    } catch (err) {
      console.error("Search error:", err)
      setDebugInfo(`Search error: ${err.message}`)
      setError("തിരയലിൽ പിശക് ഉണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക.") // Error in search
      setLocations([])
    } finally {
      setIsSearching(false)
    }
  }

  // Function to get directions to a location
  const getDirections = (location) => {
    if (!userLocation) {
      setDebugInfo("Cannot get directions: User location is not available")
      return
    }

    setSelectedLocation(location)
    setDebugInfo(`Getting directions to: ${location.name}`)
    setShowDirections(true)
  }

  // Close directions panel
  const closeDirections = () => {
    setShowDirections(false)
    setSelectedLocation(null)
  }

  // Handle view more details for a location
  const handleViewMore = (location) => {
    setDetailLocation(location)
    setShowDetailModal(true)
  }

  const handleDistrictSelect = async (district, radius = searchRadius) => {
    if (!district) return

    setIsSearching(true)
    setError(null)
    setDebugInfo(`Searching in district: ${district.name} with radius: ${radius}km`)
    setSearchRadius(radius)

    try {
      // Use the district coordinates for the search
      const { lat, lon, name } = district

      setDebugInfo(`Using coordinates: ${lat}, ${lon} for district: ${name}`)
      setSearchedLocation({ lat, lon, name: district.name })

      // Fetch tourist locations in the selected district
      const locationsUrl = `/api/tourist-locations?lat=${lat}&lon=${lon}&district=${district.englishName}&radius=${radius}`
      setDebugInfo(`Fetching locations from: ${locationsUrl}`)

      const locationsResponse = await fetch(locationsUrl)

      if (!locationsResponse.ok) {
        const errorData = await locationsResponse.text()
        throw new Error(`Tourist locations API error: ${locationsResponse.status} - ${errorData}`)
      }

      const locationsData = await locationsResponse.json()
      setDebugInfo(`Received ${locationsData.length} locations for district: ${district.name}`)

      // Set locations with default placeholder images
      if (isMounted.current) {
        setLocations(locationsData)
        setImagesLoaded(true)
        // Initially set only first 5 locations as visible
        setVisibleLocations(locationsData.slice(0, 5).map((loc) => loc.id))
      }
    } catch (err) {
      console.error("District search error:", err)
      setDebugInfo(`District search error: ${err.message}`)
      setError("ജില്ലയിൽ തിരയുന്നതിൽ പിശക് ഉണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക.") // Error in district search
      setLocations([])
    } finally {
      setIsSearching(false)
    }
  }

  // Update locations when radius changes
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius)

    if (searchedLocation) {
      // If we have a searched location, search again with new radius
      handleSearch(searchedLocation.name, newRadius)
    } else if (userLocation) {
      // If we have user location, fetch locations with new radius
      fetchLocationsWithRadius(userLocation.lat, userLocation.lon, newRadius)
    }
  }

  // Helper function to fetch locations with a specific radius
  const fetchLocationsWithRadius = async (lat, lon, radius) => {
    setDebugInfo(`Updating locations with radius: ${radius}km`)

    try {
      const response = await fetch(`/api/tourist-locations?lat=${lat}&lon=${lon}&radius=${radius}`)

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setDebugInfo(`Received ${data.length} locations with ${radius}km radius`)

      // Set locations with default placeholder images
      if (isMounted.current) {
        setLocations(data)
        setImagesLoaded(true)
        // Initially set only first 5 locations as visible
        setVisibleLocations(data.slice(0, 5).map((loc) => loc.id))
      }
    } catch (err) {
      setDebugInfo(`Error updating locations: ${err.message}`)
      console.error("Error updating locations:", err)
    }
  }

  // Toggle image search visibility
  const toggleImageSearch = () => {
    setSidebarCollapsed(!sidebarCollapsed)

    // If we're opening the sidebar and no location is selected, show the general search
    if (sidebarCollapsed && !selectedImageSearchLocation) {
      setSelectedImageSearchLocation("")
    }
  }

  // Handle image selection for a location
  const handleImageSelect = (imageUrl, locationId) => {
    if (!imageUrl) return

    // Update the location's image URL
    const updatedLocations = locations.map((loc) => (loc.id === locationId ? { ...loc, imageUrl } : loc))
    setLocations(updatedLocations)
  }

  // Set the selected location for image search
  const setImageSearchLocation = (locationName) => {
    setSelectedImageSearchLocation(locationName)
    setSidebarCollapsed(false) // Expand sidebar when a location is selected
  }

  // Set location ref for intersection observer
  const setLocationRef = (id, element) => {
    if (element) {
      locationRefs.current[id] = element
    }
  }

  useEffect(() => {
    // Try to get location when component mounts
    getLocation()
  }, [getLocation])

  if (loading) {
    return <LoadingState debugInfo={debugInfo} />
  }

  if (error && !searchedLocation) {
    return (
      <LocationError
        message={error}
        onRetry={getLocation}
        debugInfo={debugInfo}
        onSearch={handleSearch}
        isSearching={isSearching}
        onDistrictSelect={handleDistrictSelect}
      />
    )
  }

  return (
    <div className="container">
      {showDirections && selectedLocation ? (
        <DirectionsPanel location={selectedLocation} onClose={closeDirections} />
      ) : (
        <>
          <div className="page-header">
            <h1>കേരളത്തിലെ ടൂറിസ്റ്റ് കേന്ദ്രങ്ങൾ</h1>
            <p className="subtitle">
              {searchedLocation
                ? `${searchedLocation.name} സ്ഥലത്തിന് സമീപമുള്ള ആകർഷണീയമായ സ്ഥലങ്ങൾ`
                : "നിങ്ങളുടെ സ്ഥാനത്തിന് സമീപമുള്ള ആകർഷണീയമായ സ്ഥലങ്ങൾ കണ്ടെത്തുക"}
            </p>

            {userLocation && !searchedLocation && (
              <div className="location-indicator">
                <MapPin className="icon-small" />
                <span>നിങ്ങളുടെ നിലവിലെ സ്ഥാനത്തിൽ നിന്നുള്ള ദൂരം കാണിക്കുന്നു</span>
              </div>
            )}

            {searchedLocation && (
              <button
                className="back-to-current-button"
                onClick={() => {
                  setSearchedLocation(null)
                  getLocation()
                }}
              >
                <ArrowLeft className="icon-small" />
                നിങ്ങളുടെ സ്ഥാനത്തിലേക്ക് മടങ്ങുക
              </button>
            )}
          </div>

          <SearchForm
            onSearch={handleSearch}
            isSearching={isSearching}
            onDistrictSelect={handleDistrictSelect}
            onRadiusChange={handleRadiusChange}
            initialRadius={searchRadius}
          />

          {debugInfo && (
            <div className="debug-info">
              <p>
                <strong>Debug:</strong> {debugInfo}
              </p>
              {!imagesLoaded && locations.length > 0 && (
                <p>
                  <strong>Status:</strong> Loading images...
                </p>
              )}
            </div>
          )}

          <div className="main-content-with-sidebar">
            <div className="main-content">
              {locations.length === 0 ? (
                <div className="empty-state">
                  <Info className="icon-large" />
                  <h3>
                    {searchedLocation
                      ? `${searchedLocation.name} സ്ഥലത്തിന് സമീപം ടൂറിസ്റ്റ് കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല`
                      : "സമീപത്തുള്ള ടൂറിസ്റ്റ് കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്തിയില്ല"}
                  </h3>
                  <p>
                    {searchedLocation
                      ? "മറ്റൊരു സ്ഥലം തിരയുക അല്ലെങ്കിൽ നിങ്ങളുടെ സ്ഥാനത്തിലേക്ക് മടങ്ങുക."
                      : "നിങ്ങളുടെ സ്ഥാനത്തിന് സമീപം ടൂറിസ്റ്റ് കേന്ദ്രങ്ങളൊന്നും കണ്ടെത്താൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക."}
                  </p>
                  {!searchedLocation && (
                    <button className="retry-button" onClick={getLocation}>
                      വീണ്ടും ശ്രമിക്കുക
                    </button>
                  )}
                </div>
              ) : (
                <div className={`locations-grid ${!imagesLoaded ? "loading-images" : ""}`}>
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      ref={(el) => setLocationRef(location.id, el)}
                      data-location-id={location.id}
                      className="location-card-wrapper"
                    >
                      {visibleLocations.includes(location.id) && (
                        <TouristLocationCard
                          location={location}
                          onGetDirections={() => getDirections(location)}
                          showDirectionsButton={!!userLocation}
                          onViewMore={() => handleViewMore(location)}
                          onImageSearch={() => setImageSearchLocation(location.name)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Search Sidebar */}
            <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} sidebar-transition`}>
              <button
                className="toggle-sidebar-button"
                onClick={toggleImageSearch}
                aria-label={sidebarCollapsed ? "Show image search" : "Hide image search"}
              >
                {sidebarCollapsed ? (
                  <>
                    <ImageIcon />
                    ചിത്രങ്ങൾ തിരയുക
                  </>
                ) : (
                  <>
                    <X />
                    ചിത്ര തിരയൽ മറയ്ക്കുക
                  </>
                )}
              </button>

              {!sidebarCollapsed && (
                <ImageSearch
                  locationName={selectedImageSearchLocation}
                  onImageSelect={(imageUrl) => {
                    // Find the location that matches the selected name
                    const matchingLocation = locations.find((loc) => loc.name === selectedImageSearchLocation)
                    if (matchingLocation) {
                      handleImageSelect(imageUrl, matchingLocation.id)
                    }
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {showDetailModal && detailLocation && (
        <LocationDetailModal
          location={detailLocation}
          onClose={() => setShowDetailModal(false)}
          userLocation={userLocation}
          onImageSelect={(imageUrl) => {
            handleImageSelect(imageUrl, detailLocation.id)
          }}
        />
      )}
    </div>
  )
}
