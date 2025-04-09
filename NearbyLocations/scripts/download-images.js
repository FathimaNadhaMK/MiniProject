// This script downloads images from the provided URLs and saves them to the public/images directory
// Run this script with: node scripts/download-images.js

const fs = require("fs")
const path = require("path")
const https = require("https")
const { promisify } = require("util")

// Create the images directory if it doesn't exist
const imagesDir = path.join(__dirname, "../public/images")
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// List of images to download
const images = [
  {
    name: "sreepadmanabha.jpg",
    url: "https://www.shutterstock.com/editorial/image-editorial/exterior-view-sree-padmanabhaswamy-temple-thiruvananthapuram-kerala-1405492h",
    fallback: "https://source.unsplash.com/featured/?temple,kerala",
  },
  {
    name: "poovar.jpg",
    url: "https://www.keralatourism.org/photo-gallery/poovar-backwaters/2254",
    fallback: "https://source.unsplash.com/featured/?backwaters,kerala",
  },
  {
    name: "kovalam.jpg",
    url: "https://www.alamy.com/stock-photo-aerial-view-of-kovalam-beach-trivandrum-india-25996020.html",
    fallback: "https://source.unsplash.com/featured/?beach,kerala",
  },
  {
    name: "magicplanet.jpg",
    url: "https://magicplanet.in/gallery",
    fallback: "https://source.unsplash.com/featured/?themepark,india",
  },
  {
    name: "attukal.jpg",
    url: "https://www.alamy.com/thiruvananthapuram-kerala-india-december-2017-devotee-at-attukal-bhagavathy-temple-is-a-hindu-religious-shrine-image345315367.html",
    fallback: "https://source.unsplash.com/featured/?temple,kerala",
  },
  {
    name: "akkulam.jpg",
    url: "https://www.alamy.com/stock-photo-boating-at-akkulam-tourist-village-near-akkulam-lake-trivandrum-10662050.html",
    fallback: "https://source.unsplash.com/featured/?lake,kerala",
  },
  {
    name: "kuthiramalika.jpg",
    url: "https://www.alamy.com/stock-photo-kuthiramalika-palace-museum-trivandrum-kerala-india-132854178.html",
    fallback: "https://source.unsplash.com/featured/?palace,india",
  },
  {
    name: "valiathura.jpg",
    url: "https://www.keralatourism.org/photo-gallery/kerala-panorama/valiyathura-beach/38",
    fallback: "https://source.unsplash.com/featured/?beach,kerala",
  },
  {
    name: "beemapalli.jpg",
    url: "https://www.kanyakumarians.com/beemapally-mosque-thiruvananthapuram",
    fallback: "https://source.unsplash.com/featured/?mosque,india",
  },
  {
    name: "trivandrum_zoo.jpg",
    url: "https://www.gettyimages.com/photos/THIRUVANANTHAPURAM-ZOO",
    fallback: "https://source.unsplash.com/featured/?zoo,animals",
  },
  {
    name: "sreechitra.jpg",
    url: "https://in.worldorgs.com/catalog/thiruvananthapuram/amusement-center/sri-chitra-art-gallery",
    fallback: "https://source.unsplash.com/featured/?art,gallery",
  },
  {
    name: "neyyar.jpg",
    url: "https://keralatourism.travel/neyyar-dam-trivandrum",
    fallback: "https://source.unsplash.com/featured/?dam,kerala",
  },
]

// Function to download an image
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        // Check if the response is an image
        const contentType = response.headers["content-type"]
        if (!contentType || !contentType.startsWith("image/")) {
          // If not an image, use the fallback URL
          reject(new Error("URL does not point to an image"))
          return
        }

        // Create a write stream to save the image
        const fileStream = fs.createWriteStream(path.join(imagesDir, filename))
        response.pipe(fileStream)

        fileStream.on("finish", () => {
          fileStream.close()
          resolve()
        })

        fileStream.on("error", (err) => {
          fs.unlink(path.join(imagesDir, filename), () => {})
          reject(err)
        })
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

// Download all images
async function downloadAllImages() {
  for (const image of images) {
    try {
      console.log(`Downloading ${image.name}...`)
      await downloadImage(image.url, image.name)
      console.log(`Successfully downloaded ${image.name}`)
    } catch (error) {
      console.error(`Error downloading ${image.name}: ${error.message}`)
      console.log(`Using fallback for ${image.name}...`)
      try {
        await downloadImage(image.fallback, image.name)
        console.log(`Successfully downloaded fallback for ${image.name}`)
      } catch (fallbackError) {
        console.error(`Error downloading fallback for ${image.name}: ${fallbackError.message}`)
      }
    }
  }
}

// Run the download function
downloadAllImages()
  .then(() => {
    console.log("All images downloaded successfully!")
  })
  .catch((error) => {
    console.error("Error downloading images:", error)
  })
