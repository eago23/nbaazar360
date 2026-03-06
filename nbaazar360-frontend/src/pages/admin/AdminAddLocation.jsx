import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertCircle, Upload } from 'lucide-react'
import { adminLocationsAPI, uploadAPI } from '../../services/api'

function AdminAddLocation() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "n'Bazaar360 - Shto Vendndodhje"
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    address: '',
    latitude: '',
    longitude: '',
    is_published: true
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let thumbnailUrl = null

      if (thumbnailFile) {
        const uploadRes = await uploadAPI.uploadImage(thumbnailFile, 'locations')
        thumbnailUrl = uploadRes.data.file_url || uploadRes.data.url
      }

      // Build location data, only include non-empty values
      const locationData = {
        name: formData.name,
        is_published: formData.is_published
      }

      // Only add optional fields if they have values
      if (formData.description) locationData.description = formData.description
      if (formData.short_description) locationData.short_description = formData.short_description
      if (formData.address) locationData.address = formData.address
      if (formData.latitude) locationData.latitude = parseFloat(formData.latitude)
      if (formData.longitude) locationData.longitude = parseFloat(formData.longitude)
      if (thumbnailUrl) locationData.thumbnail_url = thumbnailUrl

      await adminLocationsAPI.create(locationData)
      navigate('/admin/permbajtje')
    } catch (error) {
      console.error('Error creating location:', error)
      console.error('Error response:', error.response?.data)
      setError(error.response?.data?.error || error.response?.data?.message || 'Gabim gjate krijimit te vendndodhjes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admin/permbajtje')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-secondary">Shto Vendndodhje te Re</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Thumbnail */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Foto e Vendndodhjes</h2>
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="text-center text-white">
                <Upload size={32} className="mx-auto mb-2" />
                <span>Ngarko Foto</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Informacione Bazike</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Emri *
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="p.sh. Pazari i Vjeter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Pershkrimi i Shkurter
              </label>
              <input
                name="short_description"
                type="text"
                value={formData.short_description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Pershkrim i shkurter per listen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Pershkrimi i Plote
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Pershkrimi i detajuar i vendndodhjes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Adresa
              </label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="p.sh. Rruga Kryesore, Nr. 15"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Gjeresia (Latitude)
                </label>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="p.sh. 41.3275"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Gjatesia (Longitude)
                </label>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="p.sh. 19.8187"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-secondary">Publikimi</h2>
              <p className="text-sm text-gray-500">
                Publikoni vendndodhjen per ta bere te dukshme
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/permbajtje')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} />
                <span>Krijo Vendndodhjen</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminAddLocation
