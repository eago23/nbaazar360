import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Info, X, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { locationsAPI, getMediaUrl } from '../services/api'

function LocationView() {
  const { id } = useParams()
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef(null)

  useEffect(() => {
    fetchLocation()
  }, [id])

  useEffect(() => {
    if (location?.name) {
      document.title = `n'Bazaar360 - ${location.name}`
    } else {
      document.title = "n'Bazaar360 - Vendndodhje"
    }
  }, [location])

  const fetchLocation = async () => {
    try {
      const response = await locationsAPI.getById(id)
      const locationData = response.data?.location || response.data
      setLocation(locationData)
    } catch (error) {
      console.error('Error fetching location:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Vendndodhja nuk u gjet</p>
        <Link to="/eksplorimi-360" className="text-primary hover:text-primary-dark">
          Kthehu te eksplorimi
        </Link>
      </div>
    )
  }

  const hotspots = location.hotspots || []

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button - Fixed position with highest z-index */}
      <Link
        to="/eksplorimi-360"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[10000] w-11 h-11 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 transition-all hover:scale-110 active:scale-95"
      >
        <ArrowLeft size={22} className="sm:w-6 sm:h-6" />
      </Link>

      {/* Location Title - Fixed at top center */}
      <div className="fixed top-4 left-16 right-16 sm:top-6 sm:left-20 sm:right-20 z-[9998] flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg pointer-events-auto">
          <h1 className="text-gray-900 font-semibold text-sm sm:text-lg truncate max-w-[200px] sm:max-w-none">{location.name}</h1>
        </div>
      </div>

      {/* Fullscreen Button - Fixed at top right */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] w-11 h-11 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 transition-all hover:scale-110 active:scale-95"
        title="Ekran i plotë"
      >
        <Maximize size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Panorama Viewer */}
      <div ref={viewerRef} className="relative h-screen">
        {/* Panorama Image (placeholder for Pannellum) */}
        <div className="w-full h-full bg-gray-800 relative overflow-hidden">
          <img
            src={getMediaUrl(location.panorama_url) || getMediaUrl(location.thumbnail_url) || 'https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png'}
            alt={location.name}
            className="w-full h-full object-cover"
          />

          {/* Simulated Hotspots */}
          {hotspots.map((hotspot, index) => (
            <button
              key={index}
              onClick={() => setActiveHotspot(hotspot)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent-gold rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:scale-110 transition-transform animate-pulse"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${40 + (index % 3) * 10}%`
              }}
            >
              {index + 1}
            </button>
          ))}

          {/* Instructions overlay */}
          <div className="fixed bottom-44 sm:bottom-48 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-xs sm:text-sm z-[99] whitespace-nowrap">
            Klikoni mbi numrat për të parë detajet
          </div>
        </div>

        {/* Viewer Controls */}
        <div className="fixed bottom-28 sm:bottom-32 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/60 backdrop-blur rounded-full p-2 z-[101]">
          <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ZoomOut size={20} />
          </button>
          <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Reset view">
            <Maximize size={20} />
          </button>
          <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ZoomIn size={20} />
          </button>
        </div>

        {/* Hotspot Info Panel */}
        {activeHotspot && (
          <div className="fixed top-20 right-4 sm:right-6 w-72 sm:w-80 bg-white rounded-xl shadow-xl overflow-hidden z-[9990] fade-in max-h-[70vh] overflow-y-auto">
            <div className="relative">
              {activeHotspot.image_url && (
                <img
                  src={activeHotspot.image_url}
                  alt={activeHotspot.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <button
                onClick={() => setActiveHotspot(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-secondary mb-2">{activeHotspot.title}</h3>
              <p className="text-gray-600 text-sm">{activeHotspot.description}</p>
              {activeHotspot.link_url && (
                <a
                  href={activeHotspot.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Mëso më shumë →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Info Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 z-[100]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="text-white" size={24} />
            </div>
            <div className="text-white">
              <h2 className="font-semibold text-lg">{location.name}</h2>
              <p className="text-gray-300 text-sm mt-1 max-w-2xl">{location.description}</p>
              <p className="text-gray-400 text-xs mt-2">
                {hotspots.length} pika interaktive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationView
