// This file contains fallback images for different categories of tourist locations
// These are direct links to reliable image sources that should work consistently

export const FALLBACK_IMAGES = {
  // Beaches
  beach: "/placeholder.svg?height=192&width=384&text=Beach",

  // Temples
  temple: "/placeholder.svg?height=192&width=384&text=Temple",

  // Hills and Mountains
  hill: "/placeholder.svg?height=192&width=384&text=Hill",
  mountain: "/placeholder.svg?height=192&width=384&text=Mountain",

  // Waterfalls
  waterfall: "/placeholder.svg?height=192&width=384&text=Waterfall",

  // Backwaters
  backwater: "/placeholder.svg?height=192&width=384&text=Backwater",

  // Wildlife
  wildlife: "/placeholder.svg?height=192&width=384&text=Wildlife",

  // Default
  default: "/placeholder.svg?height=192&width=384&text=Tourist+Location",
}

// Function to get a fallback image based on category
export function getFallbackImage(category, locationName) {
  if (!category) {
    return `/placeholder.svg?height=192&width=384&text=${encodeURIComponent(locationName || "Tourist Location")}`
  }

  const lowerCategory = category.toLowerCase()

  // Check for category matches
  for (const [key, value] of Object.entries(FALLBACK_IMAGES)) {
    if (lowerCategory.includes(key)) {
      return value.replace("text=", `text=${encodeURIComponent(locationName || key)}`)
    }
  }

  // Return default with location name
  return `/placeholder.svg?height=192&width=384&text=${encodeURIComponent(locationName || "Tourist Location")}`
}
