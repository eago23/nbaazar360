import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Maximize2, MapPin } from 'lucide-react'
import { createCustomIcon } from '../utils/customMarkerIcon'
import 'leaflet/dist/leaflet.css'

// Pazari i Ri center coordinates
const PAZARI_CENTER = [41.330134, 19.824325]
const DEFAULT_ZOOM = 18

function InteractiveMap({ locations, onLocationClick }) {
  return (
    <div className="relative z-0">
      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={PAZARI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render markers for each location */}
        {locations.map((location, index) => (
          location.latitude && location.longitude && (
            <Marker
              key={location.id}
              position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
              icon={createCustomIcon(index + 1)}
            >
              <Popup
                maxWidth={350}
                minWidth={300}
                className="custom-popup"
              >
                <div className="p-6">
                  {/* Thumbnail - Larger */}
                  {location.thumbnail_url && (
                    <img
                      src={location.thumbnail_url}
                      alt={location.name}
                      className="w-full h-48 object-cover rounded-xl mb-5 shadow-md"
                    />
                  )}

                  {/* Location Name - LARGE and PROMINENT */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {location.name}
                  </h3>

                  {/* Interactive Points Count - Small, subtle */}
                  {Number(location.interactive_points_count) > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-5">
                      <MapPin size={16} className="text-primary" />
                      <span>{location.interactive_points_count} pika interaktive</span>
                    </div>
                  )}

                  {/* View Button - LARGER and MORE PROMINENT */}
                  <button
                    onClick={() => onLocationClick(location)}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
                  >
                    <Maximize2 size={22} />
                    <span>Shiko 360°</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      </div>
    </div>
  )
}

export default InteractiveMap
