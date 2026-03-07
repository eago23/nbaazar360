import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Eye, Plus, Clock, CheckCircle, AlertCircle, User, Edit } from 'lucide-react'
import { vendorStoriesAPI, getMediaUrl } from '../../services/api'

function VendorDashboard() {
  const { user, isApproved } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0
  })

  useEffect(() => {
    document.title = "n'Bazaar360 - Paneli i Biznesit"
  }, [])

  useEffect(() => {
    if (isApproved()) {
      fetchStories()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchStories = async () => {
    try {
      const response = await vendorStoriesAPI.getAll()
      const rawData = response.data?.stories || response.data || []
      const storiesData = Array.isArray(rawData) ? rawData : []
      setStories(storiesData)
      setStats({
        total: storiesData.length,
        published: storiesData.filter(s => s.is_published).length,
        draft: storiesData.filter(s => !s.is_published).length,
        views: storiesData.reduce((acc, s) => acc + (s.view_count || 0), 0)
      })
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isApproved()) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 sm:p-8 text-center">
          <AlertCircle className="mx-auto text-yellow-500 mb-4" size={40} />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Llogaria në Pritje të Miratimit
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Kërkesa juaj për regjistrim është duke u shqyrtuar nga administratori.
            Do të njoftoheni me email sapo llogaria juaj të miratohet.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Kjo zakonisht merr 1-2 ditë pune.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Welcome - Simple & Clear */}
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Mirësevini, {user?.business_name}!
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Menaxhoni historitë tuaja dhe ndiqni performancën e tyre.
        </p>
      </div>

      {/* Stats - Simple White Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
        {/* Total Stories */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg mb-2 sm:mb-4">
            <BookOpen className="text-primary" size={20} />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
            {stats.total}
          </p>
          <p className="text-xs sm:text-base text-gray-600">Histori Totale</p>
        </div>

        {/* Published */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mb-2 sm:mb-4">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
            {stats.published}
          </p>
          <p className="text-xs sm:text-base text-gray-600">Të Publikuara</p>
        </div>

        {/* Draft */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg mb-2 sm:mb-4">
            <Clock className="text-gray-600" size={20} />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
            {stats.draft}
          </p>
          <p className="text-xs sm:text-base text-gray-600">Draft</p>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg mb-2 sm:mb-4">
            <Eye className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
            {stats.views}
          </p>
          <p className="text-xs sm:text-base text-gray-600">Shikime Totale</p>
        </div>
      </div>

      {/* Quick Actions - Simple Big Buttons */}
      <div className="mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Veprime të Shpejta
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to="/tregtar/historite/e-re"
            className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-primary hover:bg-red-50 transition-all min-h-[44px]"
          >
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-lg mb-3 sm:mb-4">
              <Plus className="text-primary" size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              Krijo Histori të Re
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Ndani eksperiencën tuaj
            </p>
          </Link>

          <Link
            to="/tregtar/historite"
            className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-purple-500 hover:bg-purple-50 transition-all min-h-[44px]"
          >
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-lg mb-3 sm:mb-4">
              <BookOpen className="text-purple-600" size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              Shiko Historitë
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Menaxho përmbajtjen
            </p>
          </Link>

          <Link
            to="/tregtar/profili"
            className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-green-500 hover:bg-green-50 transition-all min-h-[44px]"
          >
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-lg mb-3 sm:mb-4">
              <User className="text-green-600" size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              Ndrysho Profilin
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Përditëso të dhënat
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Stories - Simple List */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Historitë e Fundit
          </h2>
          <Link
            to="/tregtar/historite"
            className="text-primary font-semibold hover:underline text-sm sm:text-base min-h-[44px] flex items-center"
          >
            Shiko të gjitha →
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : stories.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {stories.slice(0, 5).map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    {/* Thumbnail */}
                    <img
                      src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                      alt={story.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                        {story.title || (story.short_bio?.substring(0, 40) + (story.short_bio?.length > 40 ? '...' : '')) || 'Histori AR'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="flex items-center space-x-1 text-gray-600">
                          <Eye size={14} />
                          <span>{story.view_count || 0} shikime</span>
                        </span>
                        {story.is_published ? (
                          <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                            Publikuar
                          </span>
                        ) : (
                          <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium text-xs">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Link
                    to={`/tregtar/historite/${story.id}/ndrysho`}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-red-50 transition-all min-h-[44px] w-full sm:w-auto sm:ml-4"
                  >
                    <Edit size={18} />
                    <span className="font-medium text-sm sm:text-base">Ndrysho</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 sm:p-12 text-center">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg mx-auto mb-4">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
              Nuk keni histori ende
            </p>
            <Link
              to="/tregtar/historite/e-re"
              className="inline-flex items-center space-x-2 px-5 sm:px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold min-h-[44px]"
            >
              <Plus size={20} />
              <span className="text-sm sm:text-base">Krijo Historinë e Parë</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorDashboard
