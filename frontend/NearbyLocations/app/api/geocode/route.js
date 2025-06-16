import { NextResponse } from "next/server"

// API key for Geoapify
const API_KEY = "e43c6e276b2d4f7eae552ce3afad8caf"

// Kerala bounding box coordinates
const KERALA_BOUNDS = {
  minLon: 74.8559, // Southwest longitude
  minLat: 8.2735, // Southwest latitude
  maxLon: 77.8114, // Northeast longitude
  maxLat: 12.8933, // Northeast latitude
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    console.error("Missing required parameter: query")
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  console.log(`Processing geocode request for query: "${query}"`)

  try {
    // Geocode the search query to get coordinates with bias towards Kerala
    const apiUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&filter=rect:${KERALA_BOUNDS.minLon},${KERALA_BOUNDS.minLat},${KERALA_BOUNDS.maxLon},${KERALA_BOUNDS.maxLat}&bias=rect:${KERALA_BOUNDS.minLon},${KERALA_BOUNDS.minLat},${KERALA_BOUNDS.maxLon},${KERALA_BOUNDS.maxLat}&format=json&apiKey=${API_KEY}`

    console.log("Geocoding search query:", query)
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Tourist Location Finder/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Geocoding API error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Geocoding API error response:", errorText)
      throw new Error(`Geocoding API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("Geocoding response received, results:", data.results?.length || 0)

    // If no results, try again without the Kerala filter
    if (!data.results || data.results.length === 0) {
      console.log("No results found in Kerala, trying wider search")

      // Try a wider search in India
      const fallbackApiUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&filter=countrycode:in&format=json&apiKey=${API_KEY}`

      const fallbackResponse = await fetch(fallbackApiUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Tourist Location Finder/1.0",
        },
        cache: "no-store",
      })

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text()
        throw new Error(`Fallback geocoding API returned ${fallbackResponse.status}: ${errorText}`)
      }

      const fallbackData = await fallbackResponse.json()

      if (!fallbackData.results || fallbackData.results.length === 0) {
        console.log("No results found in wider search")
        return NextResponse.json([])
      }

      // Transform the API response to our format
      const locations = fallbackData.results.map((result) => {
        return {
          lat: result.lat,
          lon: result.lon,
          formatted: result.formatted,
          country: result.country,
          state: result.state,
          city: result.city,
        }
      })

      console.log(`Returning ${locations.length} locations from wider search`)
      return NextResponse.json(locations)
    }

    // Transform the API response to our format
    const locations = data.results.map((result) => {
      return {
        lat: result.lat,
        lon: result.lon,
        formatted: result.formatted,
        country: result.country,
        state: result.state,
        city: result.city,
      }
    })

    console.log(`Returning ${locations.length} locations from Kerala search`)
    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error geocoding location:", error)
    return NextResponse.json(
      {
        error: "Failed to geocode location",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
