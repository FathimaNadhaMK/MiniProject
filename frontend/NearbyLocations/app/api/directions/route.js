import { NextResponse } from "next/server"

// API key for Geoapify
const API_KEY = "e43c6e276b2d4f7eae552ce3afad8caf"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const fromLat = searchParams.get("fromLat")
  const fromLon = searchParams.get("fromLon")
  const toLat = searchParams.get("toLat")
  const toLon = searchParams.get("toLon")

  if (!fromLat || !fromLon || !toLat || !toLon) {
    return NextResponse.json({ error: "Origin and destination coordinates are required" }, { status: 400 })
  }

  try {
    // Get directions from Geoapify Routing API
    const apiUrl = `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLon}|${toLat},${toLon}&mode=drive&details=instruction_details&apiKey=${API_KEY}`

    console.log("Fetching directions from API")
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Tourist Location Finder/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Directions API error:", response.status, response.statusText)
      throw new Error(`Directions API returned ${response.status}`)
    }

    const data = await response.json()
    console.log("Directions response received")

    // If no routes, return empty object
    if (!data.features || data.features.length === 0) {
      console.log("No routes found")
      return NextResponse.json({})
    }

    // Extract the route information
    const route = data.features[0]
    const properties = route.properties

    // Transform the API response to our format
    const directions = {
      distance: properties.distance,
      time: properties.time,
      steps: [],
    }

    // Extract steps from the legs
    if (properties.legs && properties.legs.length > 0) {
      properties.legs.forEach((leg) => {
        if (leg.steps && leg.steps.length > 0) {
          leg.steps.forEach((step) => {
            directions.steps.push({
              instruction: step.instruction,
              distance: step.distance,
              time: step.time,
            })
          })
        }
      })
    }

    return NextResponse.json(directions)
  } catch (error) {
    console.error("Error fetching directions:", error)
    return NextResponse.json({ error: "Failed to fetch directions" }, { status: 500 })
  }
}
