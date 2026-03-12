import { useState, useEffect, useRef } from 'react'
import { MapPin, X, AlertCircle, Navigation } from 'lucide-react'
import { locationsAPI, getMediaUrl } from '../services/api'
import InteractiveMap from '../components/InteractiveMap'
import '../utils/leafletConfig'

function Exploration() {
  const [locations, setLocations] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showViewer, setShowViewer] = useState(false)
  const [viewerError, setViewerError] = useState('')
  const viewerRef = useRef(null)

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    document.title = "n'Bazaar360 - Eksplorimi 360°"
  }, [])

  useEffect(() => {
    fetchLocations()
  }, [])

  // Hide navbar when 360° viewer is open for true full-screen experience
  useEffect(() => {
    const navbar = document.querySelector('nav')

    if (showViewer) {
      // Hide navbar and prevent body scroll
      document.body.style.overflow = 'hidden'
      if (navbar) {
        navbar.style.display = 'none'
      }
    } else {
      // Restore navbar and body scroll
      document.body.style.overflow = 'auto'
      if (navbar) {
        navbar.style.display = 'block'
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto'
      if (navbar) {
        navbar.style.display = 'block'
      }
    }
  }, [showViewer])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await locationsAPI.getAll()
      const locationData = response.data?.locations || response.data || []
      setLocations(Array.isArray(locationData) ? locationData : [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Open detail modal when clicking a location card
  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    setShowDetailModal(true)
  }

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedLocation(null)
  }

  // Open 360° viewer from detail modal
  const openViewer = (location) => {
    console.log('=== OPENING 360° VIEWER ===')
    console.log('Location:', location.name)
    console.log('Panorama URL:', location.panorama_url)

    // Close detail modal first
    setShowDetailModal(false)
    setSelectedLocation(null)

    setViewerError('')
    setCurrentLocation(location)
    setShowViewer(true)

    // Load Pannellum after modal opens (increased delay for DOM)
    setTimeout(() => {
      loadPannellum(location)
    }, 300)
  }

  const loadPannellum = (location) => {
    console.log('=== LOADING PANNELLUM ===')

    // Check if Pannellum is loaded
    if (!window.pannellum) {
      console.error('ERROR: Pannellum library not loaded!')
      setViewerError('Pannellum nuk u ngarkua. Rifreskoni faqen.')
      return
    }
    console.log('✓ Pannellum library loaded')

    // Check if panorama URL exists
    if (!location.panorama_url) {
      console.error('ERROR: No panorama_url for location:', location.name)
      setViewerError('Kjo vendndodhje nuk ka foto 360°')
      return
    }
    console.log('✓ Panorama URL:', location.panorama_url)

    // Check if container exists
    const container = document.getElementById('panorama')
    if (!container) {
      console.error('ERROR: Panorama container not found!')
      setViewerError('Kontejneri i pamjes nuk u gjet')
      return
    }
    console.log('✓ Container found:', container)

    // Destroy existing viewer if any
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy()
        console.log('✓ Previous viewer destroyed')
      } catch (e) {
        console.log('No previous viewer to destroy')
      }
    }

    try {
      const panoramaFullUrl = getMediaUrl(location.panorama_url)
      console.log('Creating Pannellum viewer...')
      console.log('Full panorama URL:', panoramaFullUrl)
      viewerRef.current = window.pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: panoramaFullUrl,
        autoLoad: true,
        showControls: true,
        mouseZoom: true,
        draggable: true,
        compass: true,
        autoRotate: -2,
        hfov: 110,
        minHfov: 50,
        maxHfov: 120,
        strings: {
          loadingLabel: 'Po ngarkohet...',
          errorMsg: 'Gabim gjatë ngarkimit të pamjes 360°'
        }
      })
      console.log('✓ Pannellum viewer created successfully!')
    } catch (error) {
      console.error('ERROR creating Pannellum viewer:', error)
      setViewerError('Gabim gjatë krijimit të pamjes: ' + error.message)
    }
  }

  const closeViewer = () => {
    // Destroy viewer before closing
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy()
        viewerRef.current = null
      } catch (e) {
        console.log('Error destroying viewer:', e)
      }
    }
    setShowViewer(false)
    setCurrentLocation(null)
    setViewerError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Hidden when viewer is open */}
      {!showViewer && (
        <>
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-2 sm:mb-4">
                Eksplorimi 360°
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Klikoni mbi pikat në hartë për të eksploruar Pazarin e Ri përmes pamjeve panoramike 360°.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Info Box */}
              <div className="mb-4 sm:mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-blue-900 font-medium text-sm sm:text-base">
                    Klikoni mbi pikat e numëruara në hartë për të hapur pamjen 360°
                  </p>
                  <p className="text-blue-700 text-xs sm:text-sm mt-1">
                    {locations.length} vendndodhje të disponueshme
                  </p>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="mb-8 sm:mb-12">
                <InteractiveMap
                  locations={locations}
                  onLocationClick={handleLocationClick}
                />
              </div>

              {/* Location Grid */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-4 sm:mb-6">
                  Të Gjitha Vendndodhjet
                </h2>

                {locations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {locations.map((location, index) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationClick(location)}
                        className="group bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-red-50 transition-all overflow-hidden text-left min-h-[44px]"
                      >
                        {location.thumbnail_url && (
                          <img
                            src={getMediaUrl(location.thumbnail_url)}
                            alt={location.name}
                            className="w-full h-32 sm:h-40 object-cover"
                          />
                        )}

                        <div className="p-4 sm:p-6">
                          <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full font-bold text-xs sm:text-sm mb-2 sm:mb-3">
                            {index + 1}
                          </div>

                          <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-1 sm:mb-2 text-sm sm:text-base">
                            {location.name}
                          </h3>

                          {location.description && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                              {location.description}
                            </p>
                          )}

                          {Number(location.interactive_points_count || location.hotspots?.length || 0) > 0 && (
                            <p className="text-xs text-gray-500">
                              {location.interactive_points_count || location.hotspots?.length} pika interaktive
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-8 sm:p-12 text-center">
                    <MapPin className="mx-auto text-gray-300 mb-4" size={40} />
                    <p className="text-gray-500 text-sm sm:text-base">Nuk ka vendndodhje të disponueshme</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </>
      )}

      {/* Location Detail Modal */}
      {showDetailModal && selectedLocation && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thumbnail Image */}
            <div className="relative h-48 sm:h-64 bg-gray-200 flex-shrink-0">
              {/* Close Button - Inside thumbnail area for proper positioning */}
              <button
                onClick={closeDetailModal}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
              {selectedLocation.thumbnail_url || selectedLocation.panorama_url ? (
                <img
                  src={getMediaUrl(selectedLocation.thumbnail_url || selectedLocation.panorama_url)}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <MapPin className="text-gray-400" size={48} />
                </div>
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
              {/* Location Name */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {selectedLocation.name}
              </h2>

              {/* Description */}
              {selectedLocation.description ? (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                  {selectedLocation.description}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic mb-4">
                  Nuk ka përshkrim të disponueshëm
                </p>
              )}

              {/* Interactive Points Info */}
              {Number(selectedLocation.interactive_points_count || selectedLocation.hotspots?.length || 0) > 0 && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin size={16} className="mr-2 text-primary" />
                  <span>
                    {selectedLocation.interactive_points_count || selectedLocation.hotspots?.length} pika interaktive
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="p-5 sm:p-6 pt-0 flex-shrink-0">
              <button
                onClick={() => openViewer(selectedLocation)}
                disabled={!selectedLocation.panorama_url}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <Navigation size={22} />
                <span>Hap Eksplorimin 360°</span>
              </button>
              {!selectedLocation.panorama_url && (
                <p className="text-center text-gray-500 text-xs mt-2">
                  Pamja 360° nuk është e disponueshme për këtë vendndodhje
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 360° Viewer Modal - True Full Screen */}
      {showViewer && currentLocation && (
        <div className="fixed inset-0 bg-black z-[9999] overflow-hidden">
          {/* Close Button - Top Right */}
          <button
            onClick={closeViewer}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] w-11 h-11 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 transition-all hover:scale-110 active:scale-95"
          >
            <X size={22} className="sm:w-6 sm:h-6" />
          </button>

          {/* Location Name Badge - Top Left */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[10000] bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="text-primary" size={18} />
              <span className="text-gray-900 font-semibold text-sm sm:text-base">
                {currentLocation.name}
              </span>
            </div>
          </div>

          {/* Panorama Viewer Container */}
          <div id="panorama" className="w-full h-full">
            {/* Show error if any */}
            {viewerError && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <AlertCircle className="mx-auto mb-4 text-red-400" size={64} />
                  <h3 className="text-2xl font-bold mb-2">Gabim</h3>
                  <p className="text-white/70">{viewerError}</p>
                  <p className="text-white/50 text-sm mt-4">
                    Kontrolloni konsolën për më shumë detaje
                  </p>
                </div>
              </div>
            )}
            {/* If no panorama_url, show placeholder */}
            {!currentLocation.panorama_url && !viewerError && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="mx-auto mb-4 text-white/50" size={64} />
                  <h3 className="text-2xl font-bold mb-2">{currentLocation.name}</h3>
                  <p className="text-white/70">Pamja 360° nuk është e disponueshme</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Exploration
