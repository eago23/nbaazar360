import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Image, MapPin, Calendar, TrendingUp, Users, ArrowRight, Film, CheckCircle, Clock, Star, PlayCircle } from 'lucide-react'
import { statsAPI, storiesAPI, locationsAPI, eventsAPI, adminVendorsAPI, getMediaUrl } from '../../services/api'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalViews: 0,
    activeStories: 0,
    totalStories: 0,
    draftStories: 0,
    locations: 0,
    events: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    pendingVendors: 0
  })
  const [stories, setStories] = useState([])
  const [locations, setLocations] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    document.title = "n'Bazaar360 - Paneli i Administratorit"
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [storiesRes, locationsRes, eventsRes, pendingRes] = await Promise.all([
        storiesAPI.getAll(),
        locationsAPI.getAll(),
        eventsAPI.getAll(),
        adminVendorsAPI.getAll({ status: 'pending' })
      ])

      const storiesData = storiesRes.data?.stories || storiesRes.data || []
      const locationsData = locationsRes.data?.locations || locationsRes.data || []
      const eventsData = eventsRes.data?.events || eventsRes.data || []
      const pendingData = pendingRes.data?.vendors || pendingRes.data || []

      const storiesArr = Array.isArray(storiesData) ? storiesData : []
      const locationsArr = Array.isArray(locationsData) ? locationsData : []
      const eventsArr = Array.isArray(eventsData) ? eventsData : []
      const pending = Array.isArray(pendingData) ? pendingData : []

      const now = new Date()
      const upcomingEvents = eventsArr.filter(e => new Date(e.start_date) > now)
      const pastEvents = eventsArr.filter(e => new Date(e.end_date || e.start_date) < now)

      setStats({
        totalViews: storiesArr.reduce((acc, s) => acc + (s.view_count || 0), 0) +
                    locationsArr.reduce((acc, l) => acc + (l.view_count || 0), 0),
        activeStories: storiesArr.filter(s => s.is_published).length,
        totalStories: storiesArr.length,
        draftStories: storiesArr.filter(s => !s.is_published).length,
        locations: locationsArr.length,
        events: eventsArr.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        pendingVendors: pending.length
      })

      setStories(storiesArr)
      setLocations(locationsArr)
      setEvents(eventsArr)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Pasqyra' },
    { id: 'stories', label: 'Histori AR' },
    { id: 'locations', label: 'Vendndodhje' },
    { id: 'events', label: 'Ngjarje' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate tab-specific stats
  const storyViews = stories.reduce((acc, s) => acc + (s.view_count || 0), 0)
  const locationViews = locations.reduce((acc, l) => acc + (l.view_count || 0), 0)
  const mostViewedLocation = locations.length > 0
    ? locations.reduce((max, l) => (l.view_count || 0) > (max.view_count || 0) ? l : max, locations[0])
    : null

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-secondary">Paneli i Administratorit</h1>
          <p className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Menaxhoni përmbajtjen, vendndodhjet dhe ngjarjet për n'Bazaar360
          </p>
        </div>
        <Link
          to="/admin/permbajtje"
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          <span>+ Shto të Re</span>
        </Link>
      </div>

      {/* Pending Vendors Alert - Mobile Responsive */}
      {stats.pendingVendors > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Users className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-secondary text-sm sm:text-base">
                {stats.pendingVendors} kërkesa të reja për regjistrim
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Tregtarë që presin miratimin tuaj</p>
            </div>
          </div>
          <Link
            to="/admin/miratime"
            className="text-primary hover:text-primary-dark font-medium flex items-center text-sm sm:text-base self-end sm:self-auto"
          >
            Shiko <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      )}

      {/* Tabs - Scrollable on Mobile */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 p-2 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-secondary hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards - Different for each tab - Mobile Responsive */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

            {/* Overview Tab Stats */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Eye className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-green-500 text-xs sm:text-sm font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1" /> +12.5%
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Shikime Totale</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Film className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-green-500 text-xs sm:text-sm font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1" /> +{stats.activeStories}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.activeStories}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Histori Aktive</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <MapPin className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-green-500 text-xs sm:text-sm font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1" /> +{stats.locations}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.locations}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Vendndodhje</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Calendar className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-green-500 text-xs sm:text-sm font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1" /> +{stats.events}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.events}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Ngjarje</p>
                </div>
              </>
            )}

            {/* AR Stories Tab Stats */}
            {activeTab === 'stories' && (
              <>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Film className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.totalStories}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Histori Totale</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Eye className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{storyViews.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Shikime Totale</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.activeStories}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Publikuar</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Clock className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.draftStories}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Draft</p>
                </div>
              </>
            )}

            {/* Locations Tab Stats */}
            {activeTab === 'locations' && (
              <>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <MapPin className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.locations}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Vendndodhje Totale</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Eye className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{locationViews.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Shikime 360°</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Star className="text-yellow-500 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">
                    {mostViewedLocation ? (mostViewedLocation.view_count || 0) : 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Më e Vizituara</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Image className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.locations}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Foto Panoramike</p>
                </div>
              </>
            )}

            {/* Events Tab Stats */}
            {activeTab === 'events' && (
              <>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Calendar className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.events}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Ngjarje Totale</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <PlayCircle className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.upcomingEvents}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Në Vijim</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">0</p>
                  <p className="text-xs sm:text-sm text-gray-500">Pjesëmarrës</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-secondary mt-3 sm:mt-4">{stats.pastEvents}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Të Kaluara</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Content - Different for each tab - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Recent Stories */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-secondary">Historitë e Fundit</h2>
                <Link
                  to="/admin/permbajtje"
                  className="text-primary hover:text-primary-dark text-xs sm:text-sm font-medium"
                >
                  Shiko të gjitha →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {stories.slice(0, 5).map(story => (
                  <div key={story.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <img
                        src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                        alt=""
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-secondary text-xs sm:text-sm truncate">{story.title}</p>
                        <p className="text-xs text-gray-500 truncate">{story.vendor_id ? (story.vendor_name || 'Anonim') : 'Admin'}</p>
                      </div>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      story.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {story.is_published ? 'Publikuar' : 'Draft'}
                    </span>
                  </div>
                ))}
                {stories.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">Nuk ka histori</p>
                )}
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-secondary">Vendndodhjet Kryesore</h2>
                <Link
                  to="/admin/permbajtje"
                  className="text-primary hover:text-primary-dark text-xs sm:text-sm font-medium"
                >
                  Shiko të gjitha →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {locations.slice(0, 5).map(location => (
                  <div key={location.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <img
                        src={getMediaUrl(location.thumbnail_url) || 'https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png'}
                        alt=""
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-secondary text-xs sm:text-sm truncate">{location.name}</p>
                        <p className="text-xs text-gray-500 truncate">{location.category || 'Vendndodhje'}</p>
                      </div>
                    </div>
                    <span className="ml-2 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                      {location.view_count || 0} shikime
                    </span>
                  </div>
                ))}
                {locations.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">Nuk ka vendndodhje</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Stories Tab Content */}
        {activeTab === 'stories' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-secondary">Të Gjitha Historitë AR</h2>
              <Link
                to="/admin/histori/shto"
                className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
              >
                + Shto Histori
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {stories.map(story => (
                <div key={story.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <img
                      src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                      alt=""
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-secondary text-sm sm:text-base truncate">{story.title}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{story.artisan_name || (story.vendor_id ? (story.vendor_name || 'Anonim') : 'Admin')}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Eye size={12} className="inline mr-1" />
                        {story.view_count || 0} shikime
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 ml-0 sm:ml-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                      story.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {story.is_published ? 'Publikuar' : 'Draft'}
                    </span>
                    <Link
                      to={`/admin/histori/${story.id}/ndrysho`}
                      className="text-primary hover:text-primary-dark text-sm font-medium whitespace-nowrap"
                    >
                      Ndrysho →
                    </Link>
                  </div>
                </div>
              ))}
              {stories.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-sm">Nuk ka histori. Krijoni historinë e parë!</p>
              )}
            </div>
          </div>
        )}

        {/* Locations Tab Content */}
        {activeTab === 'locations' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-secondary">Të Gjitha Vendndodhjet</h2>
              <Link
                to="/admin/vendndodhje/shto"
                className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
              >
                + Shto Vendndodhje
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {locations.map(location => (
                <div key={location.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <img
                      src={getMediaUrl(location.thumbnail_url) || getMediaUrl(location.panorama_url) || 'https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png'}
                      alt=""
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-secondary text-sm sm:text-base truncate">{location.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{location.address || location.short_description || 'Pa adresë'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Eye size={12} className="inline mr-1" />
                        {location.view_count || 0} shikime
                        {location.panorama_url && (
                          <span className="ml-2 text-primary">• 360°</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 ml-0 sm:ml-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                      location.is_published !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {location.is_published !== false ? 'Publikuar' : 'Draft'}
                    </span>
                    <Link
                      to={`/admin/vendndodhje/${location.id}/ndrysho`}
                      className="text-primary hover:text-primary-dark text-sm font-medium whitespace-nowrap"
                    >
                      Ndrysho →
                    </Link>
                  </div>
                </div>
              ))}
              {locations.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-sm">Nuk ka vendndodhje. Krijoni vendndodhjen e parë!</p>
              )}
            </div>
          </div>
        )}

        {/* Events Tab Content */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-secondary">Të Gjitha Ngjarjet</h2>
              <Link
                to="/admin/ngjarje/shto"
                className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
              >
                + Shto Ngjarje
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {events.map(event => {
                const startDate = new Date(event.start_date)
                const isUpcoming = startDate > new Date()
                // Format time from start_time field (HH:MM:SS format)
                const formatTime = (timeStr) => {
                  if (!timeStr) return 'Ora e papërcaktuar'
                  const parts = timeStr.split(':')
                  return `${parts[0]}:${parts[1]}`
                }
                return (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl font-bold text-primary">{startDate.getDate()}</span>
                        <span className="text-xs text-primary uppercase">
                          {startDate.toLocaleString('sq', { month: 'short' })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-secondary text-sm sm:text-base truncate">{event.title}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {event.venue_name || event.location_name || 'Pa vendndodhje'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(event.start_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3 ml-0 sm:ml-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        isUpcoming
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isUpcoming ? 'Në Vijim' : 'E Kaluar'}
                      </span>
                      <Link
                        to={`/admin/ngjarje/${event.id}/ndrysho`}
                        className="text-primary hover:text-primary-dark text-sm font-medium whitespace-nowrap"
                      >
                        Ndrysho →
                      </Link>
                    </div>
                  </div>
                )
              })}
              {events.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-sm">Nuk ka ngjarje. Krijoni ngjarjen e parë!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
