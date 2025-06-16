"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ImageIcon, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import "../styles/image-search.css"

export default function ImageSearch({ locationName, onImageSelect, className = "" }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchContainerRef = useRef(null)
  const searchFormRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchButtonRef = useRef(null)
  const searchResultsRef = useRef(null)

  // Set initial search query when locationName changes
  useEffect(() => {
    if (locationName) {
      setSearchQuery(`${locationName} Kerala tourism`)
    }
  }, [locationName])

  // Function to perform a search using the Wikimedia API
  const performSearch = async (query) => {
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      // Use Wikimedia API to search for images
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query,
      )}+filetype:bitmap|drawing&srnamespace=6&format=json&origin=*&srlimit=20`

      const response = await fetch(searchUrl)

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.query || !data.query.search) {
        setSearchResults([])
        setError("No images found. Try a different search term.")
        return
      }

      // Process search results to get image details
      const results = await Promise.all(
        data.query.search.map(async (item) => {
          // Extract the file name from the title
          const fileName = item.title.replace("File:", "")

          // Get image URL using the Wikimedia API
          const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            item.title,
          )}&prop=imageinfo&iiprop=url|size&format=json&origin=*`

          try {
            const imageResponse = await fetch(imageInfoUrl)
            const imageData = await imageResponse.json()

            // Extract the image URL from the response
            const pages = imageData.query.pages
            const pageId = Object.keys(pages)[0]

            if (pages[pageId].imageinfo && pages[pageId].imageinfo.length > 0) {
              const imageInfo = pages[pageId].imageinfo[0]
              return {
                title: item.title,
                url: imageInfo.url,
                thumbUrl: imageInfo.url,
                width: imageInfo.width,
                height: imageInfo.height,
                snippet: item.snippet,
              }
            }
            return null
          } catch (err) {
            console.error("Error fetching image info:", err)
            return null
          }
        }),
      )

      // Filter out null results and set the search results
      const validResults = results.filter((result) => result !== null)
      setSearchResults(validResults)

      if (validResults.length === 0) {
        setError("No images found. Try a different search term.")
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Error performing search. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e) => {
    e?.preventDefault()
    performSearch(searchQuery)
  }

  // Auto-search when component mounts with a search query
  useEffect(() => {
    if (searchQuery && !isSearching) {
      const timer = setTimeout(() => {
        performSearch(searchQuery)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  // Handle image selection
  const handleImageSelect = (imageUrl) => {
    if (onImageSelect) {
      onImageSelect(imageUrl)
    }
  }

  // Set loading state to false after component mounts
  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <div className={`image-search-sidebar ${className}`}>
      <div className="image-search-header">
        <h3 className="image-search-title">
          <ImageIcon className="image-search-icon" />
          {locationName ? `${locationName} ചിത്രങ്ങൾ` : "ടൂറിസ്റ്റ് സ്ഥലങ്ങളുടെ ചിത്രങ്ങൾ"}
        </h3>
      </div>

      <form ref={searchFormRef} onSubmit={handleSearch} className="image-search-form">
        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ചിത്രങ്ങൾ തിരയുക..."
            className="search-input"
            disabled={isSearching}
          />
          <button
            ref={searchButtonRef}
            type="submit"
            className="search-button"
            disabled={isSearching || !searchQuery.trim()}
            aria-label="Search"
          >
            {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>
      </form>

      {error && (
        <div className="image-search-error">
          <AlertCircle className="error-icon" />
          <p>{error}</p>
          <button onClick={handleSearch} className="retry-button">
            <RefreshCw className="retry-icon" />
            വീണ്ടും ശ്രമിക്കുക
          </button>
        </div>
      )}

      {isLoading && (
        <div className="search-loading">
          <Loader2 className="search-loading-spinner animate-spin" />
          <p>തിരയൽ എഞ്ചിൻ ലോഡ് ചെയ്യുന്നു...</p>
        </div>
      )}

      {isSearching && (
        <div className="search-loading">
          <Loader2 className="search-loading-spinner animate-spin" />
          <p>ചിത്രങ്ങൾ തിരയുന്നു...</p>
        </div>
      )}

      <div className="search-results-container" ref={searchContainerRef}>
        <div className="search-results-grid" ref={searchResultsRef}>
          {searchResults.length > 0 && !isSearching && (
            <>
              <div className="search-results-count">{searchResults.length} ചിത്രങ്ങൾ കണ്ടെത്തി</div>
              {searchResults.map((result, index) => (
                <div key={index} className="search-result-item">
                  <div className="search-result-image-container">
                    <img
                      src={result.thumbUrl || "/placeholder.svg"}
                      alt={result.title}
                      className="search-result-image"
                      onClick={() => handleImageSelect(result.url)}
                      loading="lazy"
                    />
                  </div>
                  <div className="search-result-title" title={result.title}>
                    {result.title.replace("File:", "")}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="image-search-footer">
        <p className="image-search-attribution">ചിത്രങ്ങൾ: വിക്കിമീഡിയ കോമൺസ്</p>
      </div>
    </div>
  )
}
