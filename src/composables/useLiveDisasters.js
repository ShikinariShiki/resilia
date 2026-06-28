import { ref, onMounted } from 'vue'

const CACHE_KEY = 'resilia_live_disasters'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

export function useLiveDisasters() {
  const liveDisasters = ref([])
  const loading = ref(true)
  const error = ref(null)

  const fetchLiveFeed = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          liveDisasters.value = parsed.data
          loading.value = false
          return
        }
      }

      // Fetch from USGS (M4.5+ Earthquakes in the past 7 days)
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson')
      if (!res.ok) throw new Error('Failed to fetch from USGS')
      const data = await res.json()
      
      // Filter for ASEAN bounding box approx (Lat: -11 to 28, Lon: 92 to 141)
      const aseanQuakes = data.features.filter(eq => {
        const [lon, lat] = eq.geometry.coordinates
        return lat >= -11 && lat <= 28 && lon >= 92 && lon <= 141
      }).map(eq => {
        // Extract country from place name (usually after comma, or just use full place)
        const placeParts = eq.properties.place.split(', ')
        const location = placeParts.length > 1 ? placeParts[1] : placeParts[0]
        
        // Approximate risk based on magnitude
        let risk = Math.round((eq.properties.mag / 9.0) * 100)
        
        return {
          id: eq.id,
          country: location,
          recentDisaster: `M${eq.properties.mag} Earthquake`,
          disasterRiskIndex: risk,
          time: eq.properties.time,
          url: eq.properties.url,
          // Generic warning flag
          flag: 'https://flagcdn.com/w40/un.png'
        }
      })

      // Take top 6 most recent
      const result = aseanQuakes.slice(0, 6)

      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: result
      }))

      liveDisasters.value = result
    } catch (e) {
      console.error('Live feed error:', e)
      error.value = 'Failed to load live feed. Showing cached/offline data.'
      
      // Fallback to cache if available
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        liveDisasters.value = JSON.parse(cached).data
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchLiveFeed()
  })

  return { liveDisasters, loading, error, fetchLiveFeed }
}
