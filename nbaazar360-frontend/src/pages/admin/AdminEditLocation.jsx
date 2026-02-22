import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertCircle, Upload, CheckCircle } from 'lucide-react'
import { adminLocationsAPI, uploadAPI } from '../../services/api'

function AdminEditLocation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    address: '',
    latitude: '',
    longitude: '',
    interactive_points_count: 0,
    is_published: true
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState('')
  const [panoramaFile, setPanoramaFile] = useState(null)
  const [panoramaPreview, setPanoramaPreview] = useState('')
  const [existingPanoramaUrl, setExistingPanoramaUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchLocation()
  }, [id])

  const fetchLocation = async () => {
    try {
      const response = await adminLocationsAPI.getAll()
      const locations = response.data?.locations || response.data || []
      const location = locations.find(l => l.id === parseInt(id))
      if (location) {
        setFormData({
          name: location.name || '',
          description: location.description || '',
          short_description: location.short_description || '',
          address: location.address || '',
          latitude: location.latitude || '',
          longitude: location.longitude || '',
          interactive_points_count: location.interactive_points_count || 0,
          is_published: location.is_published !== false
        })
        setExistingThumbnailUrl(location.thumbnail_url || '')
        setThumbnailPreview(location.thumbnail_url || '')
        setExistingPanoramaUrl(location.panorama_url || '')
        setPanoramaPreview(location.panorama_url || '')
      } else {
        setError('Vendndodhja nuk u gjet')
      }
    } catch (error) {
      console.error('Error fetching location:', error)
      setError('Gabim gjate ngarkimit te vendndodhjes')
    } finally {
      setFetchLoading(false)
    }
  }

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

  const handlePanoramaChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (20MB limit)
      const fileSizeMB = file.size / (1024 * 1024)

      console.log(`Selected panorama file size: ${fileSizeMB.toFixed(2)} MB`)

      if (fileSizeMB > 20) {
        setError(`Foto eshte shume e madhe (${fileSizeMB.toFixed(1)}MB). Maksimumi eshte 20MB. Kompresoni foton dhe provoni perseri.`)
        return
      }

      if (fileSizeMB > 15) {
        console.warn('File is large, upload may take time:', fileSizeMB.toFixed(2), 'MB')
      }

      setPanoramaFile(file)
      setPanoramaPreview(URL.createObjectURL(file))

      // Clear any previous errors
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      let thumbnailUrl = existingThumbnailUrl
      let panoramaUrl = existingPanoramaUrl

      // If panorama file is selected, upload it using dedicated panorama endpoint (high quality)
      if (panoramaFile) {
        console.log('Uploading panorama with high quality settings...')
        const panoramaRes = await uploadAPI.uploadPanorama(panoramaFile)
        panoramaUrl = panoramaRes.data.file_url || panoramaRes.data.url

        // Auto-generate thumbnail from panorama (use same image)
        thumbnailUrl = panoramaUrl
        console.log('Panorama uploaded, auto-generated thumbnail:', panoramaUrl)
      }

      // If separate thumbnail file is selected (overrides auto-generated)
      if (thumbnailFile) {
        const uploadRes = await uploadAPI.uploadImage(thumbnailFile, 'locations/thumbnails')
        thumbnailUrl = uploadRes.data.file_url || uploadRes.data.url
      }

      // Build location data
      const locationData = {
        name: formData.name,
        is_published: formData.is_published,
        interactive_points_count: parseInt(formData.interactive_points_count) || 0
      }

      if (formData.description) locationData.description = formData.description
      if (formData.short_description) locationData.short_description = formData.short_description
      if (formData.address) locationData.address = formData.address
      if (formData.latitude) locationData.latitude = parseFloat(formData.latitude)
      if (formData.longitude) locationData.longitude = parseFloat(formData.longitude)
      if (thumbnailUrl) locationData.thumbnail_url = thumbnailUrl
      if (panoramaUrl) locationData.panorama_url = panoramaUrl

      await adminLocationsAPI.update(id, locationData)

      setSuccess(true)

      // Refresh data and clear file selections
      setPanoramaFile(null)
      setThumbnailFile(null)
      await fetchLocation()

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating location:', error)
      setError(error.response?.data?.error || error.response?.data?.message || 'Gabim gjate perditesimit te vendndodhjes')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-secondary">Ndrysho Vendndodhjen</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700 text-sm">Vendndodhja u perditesua me sukses!</p>
          </div>
        )}

        {/* Panorama 360° Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-2">Foto 360° (Panorama)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Ngarko nje foto panoramike 360°. Thumbnail do te gjenerohet automatikisht.
          </p>

          {/* Show current panorama if exists and no new file selected */}
          {existingPanoramaUrl && !panoramaFile && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Foto aktuale:</p>
              <img
                src={existingPanoramaUrl}
                alt="Current panorama"
                className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
              />
            </div>
          )}

          {/* Upload new panorama */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary transition-colors bg-gray-50">
            {panoramaFile ? (
              <div className="relative">
                <img
                  src={panoramaPreview}
                  alt="New panorama preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPanoramaFile(null)
                    setPanoramaPreview(existingPanoramaUrl || '')
                  }}
                  className="absolute top-2 right-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm"
                >
                  Hiq foton e re
                </button>
                <p className="text-sm text-green-600 mt-3 font-medium flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Foto e zgjedhur: {(panoramaFile.size / (1024 * 1024)).toFixed(1)} MB - thumbnail do te gjenerohet automatikisht
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-700 font-medium mb-2">
                  {existingPanoramaUrl ? 'Ngarko foto te re 360°' : 'Ngarko foto 360°'}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  Kliko ose zvarrit foton ketu
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WebP - Deri ne 20MB
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePanoramaChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Help text for compression */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Keshille:</strong> Nese foto eshte me e madhe se 20MB, kompresoni para se te ngarkoni:
            </p>
            <ul className="text-xs text-blue-800 mt-1 ml-4 list-disc">
              <li>Perdorni compressor.io per kompresim online</li>
              <li>Ose ri-eksportoni nga Polycam me cilesi 80-85%</li>
            </ul>
          </div>
        </div>

        {/* Thumbnail (Optional Override) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-2">Thumbnail (Opsionale)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Nese deshironi nje foto te ndryshme per thumbnail, ngarkojeni ketu. Perndryshe, do te perdoret foto panoramike.
          </p>
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
                <span>Ndrysho Thumbnail</span>
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

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Numri i Pikave Interaktive
              </label>
              <input
                name="interactive_points_count"
                type="number"
                min="0"
                value={formData.interactive_points_count}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="p.sh. 5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Numri i hotspots/pikave te klikueshme ne panorame
              </p>
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
                <span>Ruaj Ndryshimet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminEditLocation
