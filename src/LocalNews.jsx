import React, { useState, useEffect } from "react";
import "./LocalNews.css"; // Import styles
import { useNavigate, useLocation } from "react-router-dom";

function LocalNews() {
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  // Get the location and coordinates passed from homepage (if available)
  const { location: fetchedLocation, lat, lon } = routerState || {};

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  // Use the passed location, or fallback to a default value
  const [locationName, setLocationName] = useState(
    fetchedLocation || "📍 സ്ഥലം കണ്ടെത്തുന്നു..."
  );
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Automatic translation: translate location from English to Malayalam
  async function getTranslatedLocation(location) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ml&dt=t&q=${encodeURIComponent(
      location
    )}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data[0][0][0].toLowerCase();
    } catch (error) {
      console.error("Translation error:", error);
      return location.toLowerCase();
    }
  }

  // On mount: fetch nearby places and news
  useEffect(() => {
    if (fetchedLocation) {
      setLocationName(fetchedLocation);
      if (lat && lon) {
        fetchNearbyPlaces(lat, lon).then(() => {
          fetchRSSNews(fetchedLocation);
        });
      } else {
        fetchRSSNews(fetchedLocation);
      }
    } else {
      fetchRSSNews("Unknown");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedLocation, lat, lon]);

  // Fetch nearby places within 100km radius
  const fetchNearbyPlaces = async (lat, lon) => {
    try {
      const res = await fetch("/kerala_places.json"); // Predefined list of cities/towns
      const places = await res.json();

      let nearby = places.filter((place) => {
        let distance = getDistance(lat, lon, place.lat, place.lon);
        return distance <= 100;
      });

      setNearbyPlaces(nearby.map((p) => p.name));
      console.log("📍 Nearby Places:", nearby);
    } catch (error) {
      console.error("❌ Error fetching nearby places:", error);
    }
  };

  // Calculate distance between two coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // List of RSS Feed URLs
  const RSS_FEED_URLS = [
    "https://www.thehindu.com/rssfeeds",
    "https://www.mathrubhumi.com/rss-feed-1.7275970",
    "https://www.onmanorama.com/rss.html",
    "https://pulamantholevaarttha.com/feed/",
    "https://feeds.feedburner.com/meenachilnews/Ubwq", 
    "https://erattupettanews.com/feed/",
    "https://cefakottayam.webnode.page/rss/news-.xml",
    "https://malayalam.oneindia.com/rss/feeds/oneindia-malayalam-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/malayalam-news-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/malayalam-astrology-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/oneindia-malayalam-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/malayalam-jobs-fb.xml",
  ];

  // Fetch RSS news, parse and filter them by location
  const fetchRSSNews = async (locationName) => {
    const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
    let allNews = [];
  
    for (let RSS_FEED_URL of RSS_FEED_URLS) {
      try {
        const res = await fetch(
          `${CORS_PROXY}${encodeURIComponent(RSS_FEED_URL)}`
        );
        const data = await res.text();
        console.log(`✅ RAW XML FROM: ${RSS_FEED_URL}`, data);
  
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
  
        for (let i = 0; i < items.length; i++) {
          let title =
            items[i]?.getElementsByTagName("title")[0]?.textContent ||
            "❌ Title Not Found";
          let descriptionRaw =
            items[i]?.getElementsByTagName("description")[0]?.textContent ||
            "❌ No Description";
          let description = cleanHTML(descriptionRaw);
          let pubDateStr =
            items[i]?.getElementsByTagName("pubDate")[0]?.textContent || "";
          let link =
            items[i]?.getElementsByTagName("link")[0]?.textContent || "#";
  
          // Extract Image URL from media or enclosure or fallback to default image
          let imageUrl =
            items[i]?.getElementsByTagName("media:content")[0]?.getAttribute(
              "url"
            ) ||
            items[i]?.getElementsByTagName("enclosure")[0]?.getAttribute("url") ||
            extractImageFromDescription(descriptionRaw) ||
            "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png";
  
          // Convert pubDate to Date object and filter articles within the last 3 days
          let pubDate = pubDateStr ? new Date(pubDateStr) : null;
          if (!pubDate || isNaN(pubDate.getTime())) continue;
  
          pubDate.setHours(0, 0, 0, 0);
  
          let today = new Date();
          today.setHours(0, 0, 0, 0);
          let threeDaysAgo = new Date(today);
          threeDaysAgo.setDate(today.getDate() - 3);
  
          if (pubDate >= threeDaysAgo && pubDate <= today) {
            allNews.push({ title, description, pubDate: pubDateStr, imageUrl, link });
          }
        }
      } catch (error) {
        console.error(`❌ RSS Fetch Error from ${RSS_FEED_URL}:`, error);
        continue;
      }
    }
  
    console.log("✅ Final Fetched News List (Last 3 Days):", allNews);
    filterNewsByLocation(allNews, locationName);
  };

  // Clean HTML tags from the description
  const cleanHTML = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    let textContent = doc.body.textContent || "";
    textContent = textContent.replace(/https?:\/\/[^\s]+/g, "");
    textContent = textContent.replace(/\s{2,}/g, " ").trim();
    textContent = textContent.split("...")[0];
    return textContent;
  };

  // Extract image URL from an HTML description
  const extractImageFromDescription = (description) => {
    if (!description) return "";
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/);
    return imgMatch ? imgMatch[1] : "";
  };

  
  // Filter news articles by matching location keywords using backend NLP API
const filterNewsByLocation = async (newsList, userLocation) => {
  if (!userLocation) {
    console.log("❌ User location not detected. Showing general news.");
    setNews(newsList.slice(0, 10));
    setLoading(false);
    return;
  }

  let englishLocation = userLocation.toLowerCase();

  // Fetch location variants (both English and Malayalam) from backend
  let response = await fetch(`http://localhost:5001/get-location-variants/${englishLocation}`);
  let data = await response.json();
  let locationVariants = data.variants.map((variant) => variant.toLowerCase());

  // Also add any nearby places (if available)
  locationVariants = locationVariants.concat(nearbyPlaces.map((place) => place.toLowerCase()));

  console.log("🔎 Filtering news for:", locationVariants);

  let filteredNews = [];

  for (let article of newsList) {
    let text = `${article.title} ${article.description}`;

    // Call backend NLP API to detect locations in the article text
    let detectedLocations = await fetch("http://localhost:5001/detect-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("❌ Error calling location API:", err);
        return { locations: [] };
      });

    let detectedPlaces = detectedLocations.locations.map((loc) => loc.toLowerCase());

    // Use both backend-detected locations and fallback regex matching
    let validContext = locationVariants.some((place) => {
      if (detectedPlaces.includes(place)) {
        return true;
      }
      let regex = new RegExp(`\\b${place}\\b`, "i");
      return regex.test(text);
    });

    if (validContext) {
      filteredNews.push(article);
    }
  }

  console.log(`✅ Found ${filteredNews.length} location-based news articles`);
  setNews(filteredNews.length > 0 ? filteredNews : newsList.slice(0, 10));
  setLoading(false);
};

  return (
    <div className="local-news-container">
      <h1>📰 {locationName}ലെ ഏറ്റവും പുതിയ വാർത്തകൾ</h1>
      {loading ? <p>🔄 വാർത്തകൾ ലോഡുചെയ്യുന്നു...</p> : null}
      <div className="news-list">
        {news.length > 0 ? (
          news.map((article, index) => (
            <div
              key={index}
              className="news-item"
              onClick={() => window.open(article.link, "_blank")}
            >
              <img
                src={article.imageUrl}
                alt="വാർത്താ ചിത്രം"
                className="news-image"
                onError={(e) =>
                  (e.target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png")
                }
              />
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <p className="news-date">📅 {article.pubDate}</p>
            </div>
          ))
        ) : (
          !loading && <p>❌ ഈ സ്ഥലത്തിന്റെയും യാതൊരു വാർത്തകളും ലഭ്യമല്ല.</p>
        )}
      </div>
      <button className="back-button" onClick={() => navigate("/home")}>
        🏠
      </button>
    </div>
  );
}

export default LocalNews;
