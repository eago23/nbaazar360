import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, MapPin, BookOpen, Calendar, Search, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminStoriesAPI, adminLocationsAPI, adminEventsAPI, getMediaUrl } from '../../services/api'
import QRCodeModal from '../../components/QRCodeModal'

function AdminManageContent() {
  const [activeTab, setActiveTab] = useState('stories')
  const [stories, setStories] = useState([])
  const [locations, setLocations] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedStoryForQR, setSelectedStoryForQR] = useState(null)

  const tabs = [
    { id: 'stories', label: 'Histori AR', icon: BookOpen },
    { id: 'locations', label: 'Vendndodhje', icon: MapPin },
    { id: 'events', label: 'Ngjarje', icon: Calendar }
  ]

  useEffect(() => {
    document.title = "n'Bazaar360 - Menaxho Përmbajtjen"
  }, [])

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'stories':
          const storiesRes = await adminStoriesAPI.getAll()
          const storiesData = storiesRes.data?.stories || storiesRes.data || []
          setStories(Array.isArray(storiesData) ? storiesData : [])
          break
        case 'locations':
          const locationsRes = await adminLocationsAPI.getAll()
          const locationsData = locationsRes.data?.locations || locationsRes.data || []
          setLocations(Array.isArray(locationsData) ? locationsData : [])
          break
        case 'events':
          const eventsRes = await adminEventsAPI.getAll()
          const eventsData = eventsRes.data?.events || eventsRes.data || []
          setEvents(Array.isArray(eventsData) ? eventsData : [])
          break
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    try {
      switch (activeTab) {
        case 'stories':
          await adminStoriesAPI.delete(deleteModal)
          break
        case 'locations':
          await adminLocationsAPI.delete(deleteModal)
          break
        case 'events':
          await adminEventsAPI.delete(deleteModal)
          break
      }
      fetchContent()
      setDeleteModal(null)
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Gabim gjatë fshirjes')
    }
  }

  const handleViewQRCode = (story) => {
    setSelectedStoryForQR(story)
    setShowQRModal(true)
  }

  const closeQRModal = () => {
    setShowQRModal(false)
    setSelectedStoryForQR(null)
  }

  const getCurrentData = () => {
    let data = []
    switch (activeTab) {
      case 'stories':
        data = stories
        break
      case 'locations':
        data = locations
        break
      case 'events':
        data = events
        break
    }
    return data.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderContent = () => {
    const data = getCurrentData()

    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-sm sm:text-base">Nuk ka përmbajtje</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'stories':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map(story => (
              <div key={story.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-primary transition-colors">
                <Link
                  to={`/histori-ar/${story.id}`}
                  target="_blank"
                  className="block p-3 sm:p-4"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                      alt=""
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-secondary text-sm sm:text-base truncate">{story.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{story.artisan_name || story.vendor_name || 'Anonim'}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          Boolean(story.is_published) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {Boolean(story.is_published) ? 'Publikuar' : 'Draft'}
                        </span>
                        {Number(story.view_count) > 0 && (
                          <span className="flex items-center space-x-1 text-xs text-gray-500">
                            <Eye size={12} />
                            <span>{story.view_count}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex justify-end space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 border-t bg-gray-50">
                  <button
                    onClick={() => handleViewQRCode(story)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm"
                    title="Gjenero QR Code"
                  >
                    <QrCode size={16} />
                    <span className="sm:hidden">QR</span>
                  </button>
                  <Link
                    to={`/admin/histori/${story.id}/ndrysho`}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                  >
                    <Edit2 size={16} />
                    <span className="sm:hidden">Ndrysho</span>
                  </Link>
                  <button
                    onClick={() => setDeleteModal(story.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    <span className="sm:hidden">Fshi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )

      case 'locations':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map(location => (
              <div key={location.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-primary transition-colors">
                <img
                  src={getMediaUrl(location.thumbnail_url) || getMediaUrl(location.panorama_url) || 'https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png'}
                  alt=""
                  className="w-full h-28 sm:h-32 object-cover"
                />
                <div className="p-3 sm:p-4">
                  <h4 className="font-medium text-secondary text-sm sm:text-base">{location.name}</h4>
                  {location.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{location.description}</p>
                  )}
                  {(location.hotspots?.length > 0 || location.interactive_points_count > 0) && (
                    <p className="text-xs text-gray-400 mt-2">
                      {location.hotspots?.length || location.interactive_points_count || 0} pika interaktive
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 border-t bg-gray-50">
                  <button
                    onClick={() => window.open('/eksplorimi-360', '_blank')}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm"
                    title="Shiko në faqen publike"
                  >
                    <Eye size={16} />
                    <span className="sm:hidden">Shiko</span>
                  </button>
                  <Link
                    to={`/admin/vendndodhje/${location.id}/ndrysho`}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                    title="Ndrysho"
                  >
                    <Edit2 size={16} />
                    <span className="sm:hidden">Ndrysho</span>
                  </Link>
                  <button
                    onClick={() => setDeleteModal(location.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors text-sm"
                    title="Fshi"
                  >
                    <Trash2 size={16} />
                    <span className="sm:hidden">Fshi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )

      case 'events':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map(event => (
              <div key={event.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-primary transition-colors">
                <Link
                  to={`/ngjarje/${event.id}`}
                  target="_blank"
                  className="block"
                >
                  <img
                    src={getMediaUrl(event.thumbnail_url) || getMediaUrl(event.banner_url) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                    alt=""
                    className="w-full h-28 sm:h-32 object-cover"
                  />
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center flex-wrap gap-1.5 mb-2">
                      {event.event_type && String(event.event_type).trim() !== '' && (
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">
                          {event.event_type}
                        </span>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        Boolean(event.is_published) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {Boolean(event.is_published) ? 'Publikuar' : 'Draft'}
                      </span>
                    </div>
                    <h4 className="font-medium text-secondary text-sm sm:text-base truncate">{event.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>
                        {event.start_date ? new Date(event.start_date).toLocaleDateString('sq-AL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Pa datë'}
                      </span>
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 border-t bg-gray-50">
                  <Link
                    to={`/admin/ngjarje/${event.id}/ndrysho`}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                  >
                    <Edit2 size={16} />
                    <span className="sm:hidden">Ndrysho</span>
                  </Link>
                  <button
                    onClick={() => setDeleteModal(event.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    <span className="sm:hidden">Fshi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
    }
  }

  const getAddRoute = () => {
    switch (activeTab) {
      case 'stories': return '/admin/histori/shto'
      case 'locations': return '/admin/vendndodhje/shto'
      case 'events': return '/admin/ngjarje/shto'
      default: return '#'
    }
  }

  const getAddLabel = () => {
    switch (activeTab) {
      case 'stories': return 'Shto Histori'
      case 'locations': return 'Shto Vendndodhje'
      case 'events': return 'Shto Ngjarje'
      default: return 'Shto'
    }
  }

  return (
    <div>
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-secondary">Menaxho Përmbajtjen</h1>
        <Link
          to={getAddRoute()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
        >
          <Plus size={18} />
          <span>{getAddLabel()}</span>
        </Link>
      </div>

      {/* Tabs - Scrollable on Mobile */}
      <div className="bg-white rounded-xl shadow-sm mb-4 sm:mb-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex border-b min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-secondary'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-3 sm:p-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kërko..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Delete Modal - Mobile Responsive */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary mb-2">Konfirmo Fshirjen</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Jeni i sigurt që doni të fshini këtë artikull? Ky veprim nuk mund të zhbëhet.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0 sm:justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Anulo
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Fshi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedStoryForQR && (
        <QRCodeModal
          story={selectedStoryForQR}
          onClose={closeQRModal}
        />
      )}
    </div>
  )
}

export default AdminManageContent
