import { MapContainer, TileLayer, Marker } from 'react-leaflet'
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
              eventHandlers={{
                click: () => onLocationClick(location)
              }}
            />
          )
        ))}
      </MapContainer>
      </div>
    </div>
  )
}

export default InteractiveMap
