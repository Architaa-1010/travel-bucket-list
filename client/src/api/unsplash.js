const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY

export const getPlacePhoto = async (query) => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    )
    const data = await res.json()
    return data.results?.[0]?.urls?.regular || null
  } catch {
    return null
  }
}