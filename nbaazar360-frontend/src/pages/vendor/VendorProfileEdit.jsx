import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { vendorProfileAPI } from '../../services/api'
import { Save, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { getErrorMessage, SUCCESS_MESSAGES } from '../../utils/errorMessages'

function VendorProfileEdit() {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    location: '',
    category: '',
    description: '',
    website: '',
    opening_hours: ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = [
    { id: 'Restorant', label: 'Restorant' },
    { id: 'Kafe & Bar', label: 'Kafe & Bar' },
    { id: 'Artizanat & Suvenire', label: 'Artizanat & Suvenire' },
    { id: 'Prodhime Vendore', label: 'Prodhime Vendore' },
    { id: 'Dyqan', label: 'Dyqan' }
  ]

  useEffect(() => {
    document.title = "n'Bazaar360 - Ndrysho Profilin"
  }, [])

  // Fetch vendor profile data on page load
  useEffect(() => {
    fetchVendorProfile()
  }, [])

  const fetchVendorProfile = async () => {
    try {
      setFetching(true)
      const response = await vendorProfileAPI.get()
      const vendorData = response.data?.vendor || response.data

      console.log('Fetched vendor data:', vendorData)

      // Parse contact_info if it exists
      let website = ''
      let opening_hours = ''
      if (vendorData.contact_info) {
        try {
          const contactInfo = typeof vendorData.contact_info === 'string'
            ? JSON.parse(vendorData.contact_info)
            : vendorData.contact_info
          website = contactInfo.website || ''
          opening_hours = contactInfo.opening_hours || ''
        } catch (e) {
          console.log('Could not parse contact_info')
        }
      }

      // Populate form with existing data
      setFormData({
        business_name: vendorData.business_name || '',
        phone: vendorData.phone || '',
        location: vendorData.address || '',
        category: vendorData.business_type || '',
        description: vendorData.business_description || vendorData.about || '',
        website: vendorData.website || website || '',
        opening_hours: vendorData.opening_hours || opening_hours || ''
      })

      // Set image previews
      if (vendorData.logo_url) {
        setLogoPreview(vendorData.logo_url)
      }
      if (vendorData.cover_image_url || vendorData.cover_url) {
        setCoverPreview(vendorData.cover_image_url || vendorData.cover_url)
      }

    } catch (error) {
      console.error('Error fetching vendor profile:', error)
      // Fall back to user data from auth context
      if (user) {
        setFormData({
          business_name: user.business_name || '',
          phone: user.phone || '',
          location: user.address || '',
          category: user.business_type || '',
          description: user.business_description || '',
          website: user.website || '',
          opening_hours: user.opening_hours || ''
        })
        setLogoPreview(user.logo_url || '')
        setCoverPreview(user.cover_image_url || '')
      }
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      let logoUrl = user.logo_url
      let coverUrl = user.cover_url

      // Upload logo if changed
      if (logoFile) {
        const logoRes = await vendorProfileAPI.uploadLogo(logoFile)
        logoUrl = logoRes.data.url
      }

      // Upload cover if changed
      if (coverFile) {
        const coverRes = await vendorProfileAPI.uploadCover(coverFile)
        coverUrl = coverRes.data.url
      }

      // Update profile - map frontend fields to backend field names
      const response = await vendorProfileAPI.update({
        business_name: formData.business_name,
        business_description: formData.description,
        business_type: formData.category,
        phone: formData.phone,
        address: formData.location,
        about: formData.description,
        contact_info: JSON.stringify({
          website: formData.website,
          opening_hours: formData.opening_hours
        })
      })

      updateUser(response.data)
      setSuccess(SUCCESS_MESSAGES.PROFILE_UPDATED)

      // Refresh profile data
      await fetchVendorProfile()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Update error:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while fetching data
  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-6">Ndrysho Profilin</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">Ndrysho Profilin</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Cover Image */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Foto e Kopertinës</h2>
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="text-center text-white">
                <Upload size={32} className="mx-auto mb-2" />
                <span>Ndrysho Kopertinën</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Logo & Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Informacione Bazë</h2>

          <div className="flex items-start space-x-6 mb-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-gray-400">Logo</span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                  <Upload className="text-white" size={24} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name & Category */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Emri i Biznesit *
                </label>
                <input
                  name="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Kategoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Zgjidhni kategorinë</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Përshkrimi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Përshkruani biznesin tuaj..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">Informacione Kontakti</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Telefoni
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+355 69 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Website
              </label>
              <input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Vendndodhja në Pazar
              </label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Stenda 15, Rruga kryesore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Orari i Punës
              </label>
              <input
                name="opening_hours"
                type="text"
                value={formData.opening_hours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="E Hënë - E Shtunë: 09:00 - 18:00"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
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

export default VendorProfileEdit
