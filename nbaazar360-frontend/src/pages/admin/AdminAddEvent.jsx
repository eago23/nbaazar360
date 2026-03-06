import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertCircle, Upload } from 'lucide-react'
import { adminEventsAPI, locationsAPI, uploadAPI } from '../../services/api'

function AdminAddEvent() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    event_type: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location_id: '',
    venue_name: '',
    max_participants: '',
    registration_required: false,
    registration_url: '',
    is_featured: false,
    is_published: true
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const eventTypes = [
    { id: 'Festival', label: 'Festival' },
    { id: 'Koncert & Muzikë', label: 'Koncert & Muzikë' },
    { id: 'Ekspozitë & Art', label: 'Ekspozitë & Art' },
    { id: 'Teatër & Performancë', label: 'Teatër & Performancë' },
    { id: 'Treg & Artizanat', label: 'Treg & Artizanat' },
    { id: 'Workshop', label: 'Workshop' }
  ]

  useEffect(() => {
    document.title = "n'Bazaar360 - Shto Ngjarje"
  }, [])

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll()
      const locData = response.data?.locations || response.data || []
      setLocations(Array.isArray(locData) ? locData : [])
    } catch (error) {
      console.error('Error fetching locations:', error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let thumbnailUrl = null

      if (thumbnailFile) {
        const uploadRes = await uploadAPI.uploadImage(thumbnailFile, 'events')
        thumbnailUrl = uploadRes.data.file_url || uploadRes.data.url
      }

      // Build event data, only include non-empty values
      const eventData = {
        title: formData.title,
        event_type: formData.event_type,
        start_date: formData.start_date,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        registration_required: formData.registration_required
      }

      // Only add optional fields if they have values
      if (formData.description) eventData.description = formData.description
      if (formData.short_description) eventData.short_description = formData.short_description
      if (formData.end_date) eventData.end_date = formData.end_date
      if (formData.start_time) eventData.start_time = formData.start_time
      if (formData.end_time) eventData.end_time = formData.end_time
      if (formData.location_id) eventData.location_id = parseInt(formData.location_id)
      if (formData.venue_name) eventData.venue_name = formData.venue_name
      if (thumbnailUrl) eventData.thumbnail_url = thumbnailUrl
      if (formData.max_participants) eventData.max_participants = parseInt(formData.max_participants)
      if (formData.registration_url) eventData.registration_url = formData.registration_url

      await adminEventsAPI.create(eventData)
      navigate('/admin/permbajtje')
    } catch (error) {
      console.error('Error creating event:', error)
      console.error('Error response:', error.response?.data)
      setError(error.response?.data?.error || error.response?.data?.message || 'Gabim gjate krijimit te ngjarjes')
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
        <h1 className="text-2xl font-bold text-secondary">Shto Ngjarje te Re</h1>
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
          <h2 className="text-lg font-semibold text-secondary mb-4">Foto e Ngjarjes</h2>
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
                Titulli *
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="p.sh. Festivali i Artizanatit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Lloji i Ngjarjes *
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Zgjidhni llojin</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Vendndodhja
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Zgjidhni vendndodhjen</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Emri i Venues
              </label>
              <input
                name="venue_name"
                type="text"
                value={formData.venue_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="p.sh. Salla e Kongreseve"
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
                placeholder="Pershkrimi i detajuar i ngjarjes..."
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Data dhe Ora</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Data e Fillimit *
              </label>
              <input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Data e Mbarimit
              </label>
              <input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Ora e Fillimit
              </label>
              <input
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Ora e Mbarimit
              </label>
              <input
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Regjistrimi</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary">Kerkohet Regjistrim</p>
                <p className="text-sm text-gray-500">Pjesemarresit duhet te regjistrohen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="registration_required"
                  checked={formData.registration_required}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Numri Maksimal i Pjesemarresve
                </label>
                <input
                  name="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="p.sh. 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  URL per Regjistrim
                </label>
                <input
                  name="registration_url"
                  type="url"
                  value={formData.registration_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary">E Vecante</p>
                <p className="text-sm text-gray-500">Shfaqe ne seksionin e ngjarjeve te vecanta</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary">Publikimi</p>
                <p className="text-sm text-gray-500">Publikoni ngjarjen per ta bere te dukshme</p>
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
                <span>Krijo Ngjarjen</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminAddEvent
