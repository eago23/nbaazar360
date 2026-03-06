import { useState, useEffect } from 'react'
import { TrendingUp, Eye, Users, MapPin, Calendar, BookOpen, ArrowUp, ArrowDown } from 'lucide-react'
import { storiesAPI, locationsAPI, eventsAPI, vendorsAPI, getMediaUrl } from '../../services/api'

function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalStories: 0,
    totalLocations: 0,
    totalEvents: 0,
    totalVendors: 0,
    publishedStories: 0,
    approvedVendors: 0
  })
  const [topStories, setTopStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "n'Bazaar360 - Analitika"
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [storiesRes, locationsRes, eventsRes, vendorsRes] = await Promise.all([
        storiesAPI.getAll(),
        locationsAPI.getAll(),
        eventsAPI.getAll(),
        vendorsAPI.getAll()
      ])

      const storiesData = storiesRes.data?.stories || storiesRes.data || []
      const locationsData = locationsRes.data?.locations || locationsRes.data || []
      const eventsData = eventsRes.data?.events || eventsRes.data || []
      const vendorsData = vendorsRes.data?.vendors || vendorsRes.data || []

      const stories = Array.isArray(storiesData) ? storiesData : []
      const locations = Array.isArray(locationsData) ? locationsData : []
      const events = Array.isArray(eventsData) ? eventsData : []
      const vendors = Array.isArray(vendorsData) ? vendorsData : []

      setStats({
        totalViews: stories.reduce((acc, s) => acc + (s.view_count || 0), 0),
        totalStories: stories.length,
        totalLocations: locations.length,
        totalEvents: events.length,
        totalVendors: vendors.length,
        publishedStories: stories.filter(s => s.is_published).length,
        approvedVendors: vendors.filter(v => v.status === 'approved').length
      })

      // Sort stories by views
      setTopStories(stories.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 10))
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Analitika</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="text-blue-600" size={24} />
            </div>
            <span className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUp size={14} className="mr-1" />
              12%
            </span>
          </div>
          <p className="text-2xl font-bold text-secondary">{stats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Shikime Totale</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-purple-600" size={24} />
            </div>
            <span className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUp size={14} className="mr-1" />
              5
            </span>
          </div>
          <p className="text-2xl font-bold text-secondary">{stats.totalStories}</p>
          <p className="text-sm text-gray-500">Histori ({stats.publishedStories} publikuar)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
            <span className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUp size={14} className="mr-1" />
              3
            </span>
          </div>
          <p className="text-2xl font-bold text-secondary">{stats.totalVendors}</p>
          <p className="text-sm text-gray-500">Tregtarë ({stats.approvedVendors} aktivë)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary">{stats.totalLocations}</p>
          <p className="text-sm text-gray-500">Vendndodhje 360°</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Historitë më të Shikuara</h2>
          <div className="space-y-3">
            {topStories.map((story, index) => (
              <div key={story.id} className="flex items-center space-x-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index < 3 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <img
                  src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary text-sm truncate">{story.title}</p>
                  <p className="text-xs text-gray-500">{story.vendor_name || 'Anonim'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-secondary">{(story.view_count || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">shikime</p>
                </div>
              </div>
            ))}
            {topStories.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nuk ka të dhëna</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Përmbledhje e Shpejtë</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BookOpen className="text-purple-600" size={20} />
                <span className="text-gray-600">Histori të Publikuara</span>
              </div>
              <span className="font-semibold text-secondary">
                {stats.publishedStories} / {stats.totalStories}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="text-green-600" size={20} />
                <span className="text-gray-600">Tregtarë Aktivë</span>
              </div>
              <span className="font-semibold text-secondary">
                {stats.approvedVendors} / {stats.totalVendors}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="text-orange-600" size={20} />
                <span className="text-gray-600">Vendndodhje 360°</span>
              </div>
              <span className="font-semibold text-secondary">{stats.totalLocations}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-gray-600">Ngjarje</span>
              </div>
              <span className="font-semibold text-secondary">{stats.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="text-primary" size={20} />
                <span className="text-gray-600">Mesatarja Shikimeve/Histori</span>
              </div>
              <span className="font-semibold text-secondary">
                {stats.totalStories > 0
                  ? Math.round(stats.totalViews / stats.totalStories).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-accent/50 border border-accent-gold/20 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-accent-gold" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-secondary mb-1">Analitika të Avancuara</h3>
            <p className="text-gray-600 text-sm">
              Për raporte më të detajuara dhe analitika të avancuara, lidhuni me Google Analytics
              ose zgjidhje të tjera të analitikës. Kjo faqe tregon një përmbledhje të shpejtë të
              metrikave kryesore të platformës.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
