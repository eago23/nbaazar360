import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, EyeOff, QrCode } from 'lucide-react'
import { vendorStoriesAPI, getMediaUrl } from '../../services/api'
import QRCodeModal from '../../components/QRCodeModal'

function VendorStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [error, setError] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedStoryForQR, setSelectedStoryForQR] = useState(null)

  useEffect(() => {
    document.title = "n'Bazaar360 - Historitë e Mia"
  }, [])

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await vendorStoriesAPI.getAll()
      const storiesData = response.data?.stories || response.data || []
      setStories(Array.isArray(storiesData) ? storiesData : [])
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id, isPublished) => {
    setError(null)
    try {
      // Toggle publish status using update endpoint
      await vendorStoriesAPI.update(id, { is_published: !isPublished })
      fetchStories()
    } catch (err) {
      console.error('Error updating story:', err)
      setError(err.response?.data?.message || 'Gabim gjatë përditësimit të historisë')
    }
  }

  const handleDelete = async (id) => {
    setError(null)
    try {
      await vendorStoriesAPI.delete(id)
      fetchStories()
      setDeleteId(null)
    } catch (err) {
      console.error('Error deleting story:', err)
      setError(err.response?.data?.message || 'Gabim gjatë fshirjes së historisë')
      setDeleteId(null)
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-secondary">Historitë e Mia</h1>
        <Link
          to="/tregtar/historite/e-re"
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors min-h-[44px] text-sm sm:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Histori e Re</span>
          <span className="sm:hidden">E Re</span>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stories List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : stories.length > 0 ? (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-xl shadow-sm p-4">
                {/* Story Info */}
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                    alt={story.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary text-sm truncate">
                      {story.title || (story.short_bio?.substring(0, 40) + (story.short_bio?.length > 40 ? '...' : '')) || 'Histori AR'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{story.view_count || 0} shikime</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      story.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {story.is_published ? 'Publikuar' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between border-t pt-3 gap-2">
                  <button
                    onClick={() => handleViewQRCode(story)}
                    className="flex-1 flex items-center justify-center min-h-[44px] text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    title="QR Code"
                  >
                    <QrCode size={20} />
                  </button>
                  <Link
                    to={`/tregtar/historite/${story.id}/ndrysho`}
                    className="flex-1 flex items-center justify-center min-h-[44px] text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Ndrysho"
                  >
                    <Edit2 size={20} />
                  </Link>
                  <button
                    onClick={() => handlePublish(story.id, story.is_published)}
                    className="flex-1 flex items-center justify-center min-h-[44px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title={story.is_published ? 'Çpubliko' : 'Publiko'}
                  >
                    {story.is_published ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button
                    onClick={() => setDeleteId(story.id)}
                    className="flex-1 flex items-center justify-center min-h-[44px] text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Fshi"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Historia</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Shikime</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statusi</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=100'}
                          alt={story.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-secondary">
                            {story.title || (story.short_bio?.substring(0, 40) + (story.short_bio?.length > 40 ? '...' : '')) || 'Histori AR'}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {story.short_bio}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{story.view_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        story.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {story.is_published ? 'Publikuar' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewQRCode(story)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        <Link
                          to={`/tregtar/historite/${story.id}/ndrysho`}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ndrysho"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handlePublish(story.id, story.is_published)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title={story.is_published ? 'Çpubliko' : 'Publiko'}
                        >
                          {story.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(story.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="Fshi"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-secondary mb-2">Nuk keni histori</h3>
          <p className="text-gray-500 mb-6">Krijoni historinë tuaj të parë për të ndarë me vizitorët</p>
          <Link
            to="/tregtar/historite/e-re"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={20} />
            <span>Krijo Histori</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary mb-2">Konfirmo Fshirjen</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Jeni i sigurt që doni të fshini këtë histori? Ky veprim nuk mund të zhbëhet.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-3 gap-2 sm:gap-0 sm:justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                Anulo
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px]"
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

export default VendorStories
