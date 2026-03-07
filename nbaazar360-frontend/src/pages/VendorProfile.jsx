import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Mail, Globe, Store, BookOpen, Eye, Play, Clock } from 'lucide-react'
import { vendorsAPI, getMediaUrl } from '../services/api'
import { getErrorMessage, ERROR_MESSAGES } from '../utils/errorMessages'

function VendorProfile() {
  const { id } = useParams()
  const [vendor, setVendor] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVendor()
  }, [id])

  useEffect(() => {
    if (vendor?.business_name) {
      document.title = `n'Bazaar360 - ${vendor.business_name}`
    } else {
      document.title = "n'Bazaar360 - Biznesi"
    }
  }, [vendor])

  const fetchVendor = async () => {
    try {
      setError(null)
      console.log('Fetching vendor with ID:', id)

      const vendorRes = await vendorsAPI.getById(id)
      console.log('Vendor response:', vendorRes)

      let vendorData = vendorRes.data?.vendor || vendorRes.data

      if (!vendorData || Object.keys(vendorData).length === 0) {
        console.error('No vendor data received')
        setError('Biznesi nuk u gjet ose nuk është aktiv')
        return
      }

      // Parse contact_info if it's a string
      if (vendorData && vendorData.contact_info && typeof vendorData.contact_info === 'string') {
        try {
          const contactInfo = JSON.parse(vendorData.contact_info)
          vendorData = {
            ...vendorData,
            website: vendorData.website || contactInfo.website,
            opening_hours: vendorData.opening_hours || contactInfo.opening_hours
          }
        } catch (e) {
          // Invalid JSON, ignore
        }
      }

      setVendor(vendorData)

      // Fetch stories using username from vendor data
      if (vendorData?.username) {
        try {
          const storiesRes = await vendorsAPI.getStories(vendorData.username)
          const storiesData = storiesRes.data?.stories || storiesRes.data || []
          setStories(Array.isArray(storiesData) ? storiesData : [])
        } catch (storiesError) {
          console.log('Could not fetch stories:', storiesError)
          // Don't fail the whole page if stories fail
        }
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
      if (error.response?.status === 404) {
        setError(ERROR_MESSAGES.VENDOR_NOT_FOUND)
      } else {
        setError(getErrorMessage(error))
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate total views from stories
  const totalViews = stories.reduce((sum, story) => sum + (story.view_count || 0), 0)

  // Get business type label (supports both old and new category values)
  const getBusinessTypeLabel = (type) => {
    const legacyTypes = {
      'artisan': 'Artizanat & Suvenire',
      'shop': 'Dyqan',
      'restaurant': 'Restorant',
      'cafe': 'Kafe & Bar',
      'service': 'Dyqan'
    }
    return legacyTypes[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!vendor || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Store size={64} className="text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4 text-lg">{error || 'Biznesi nuk u gjet'}</p>
        <p className="text-gray-400 text-sm mb-4">ID: {id}</p>
        <Link to="/tregtaret" className="text-primary hover:text-primary-dark font-medium">
          ← Kthehu te bizneset
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover & Logo */}
      <section className="relative h-56 sm:h-64 md:h-80 bg-gray-800">
        <img
          src={vendor.cover_url || vendor.cover_image_url || 'https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png'}
          alt=""
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back button */}
        <Link
          to="/tregtaret"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-white hover:text-primary transition-colors bg-black/30 backdrop-blur-sm px-3 py-2 sm:px-4 rounded-lg min-h-[44px]"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Kthehu</span>
        </Link>

        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-end space-x-3 sm:space-x-6">
              {/* Logo */}
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-xl bg-primary flex items-center justify-center">
                  <span className="text-white text-2xl sm:text-4xl font-bold">
                    {vendor.business_name?.charAt(0)}
                  </span>
                </div>
              )}

              {/* Business Name & Type */}
              <div className="flex-1 pb-1 sm:pb-2 min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 truncate">
                  {vendor.business_name}
                </h1>
                {vendor.business_type && (
                  <span className="inline-block px-2 sm:px-4 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium">
                    {getBusinessTypeLabel(vendor.business_type)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* LEFT COLUMN - Main Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Description */}
            {(vendor.description || vendor.business_description) && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <BookOpen className="mr-2 sm:mr-3 text-primary" size={20} />
                  Rreth Biznesit
                </h2>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                  {vendor.description || vendor.business_description}
                </p>
              </div>
            )}

            {/* Stories Section */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Play className="mr-2 sm:mr-3 text-primary" size={20} />
                Historitë AR
              </h2>

              {stories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {stories.map(story => (
                    <Link
                      key={story.id}
                      to={`/histori-ar/${story.id}`}
                      className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <img
                          src={getMediaUrl(story.thumbnail_url) || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400'}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Play className="text-primary ml-1" size={20} fill="currentColor" />
                          </div>
                        </div>
                        {/* View count */}
                        {story.view_count > 0 && (
                          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center space-x-1 px-2 py-1 bg-black/70 rounded-full text-white text-xs">
                            <Eye size={12} />
                            <span>{story.view_count}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm sm:text-base">
                          {story.title || (story.short_bio?.substring(0, 40) + (story.short_bio?.length > 40 ? '...' : '')) || 'Histori AR'}
                        </h3>
                        {story.short_bio && (
                          <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2">
                            {story.short_bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl">
                  <Play size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg">
                    Ky biznes nuk ka histori ende
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Contact & Info */}
          <div className="space-y-6">

            {/* Contact Information */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
                Informacione Kontakti
              </h3>
              <div className="space-y-4 sm:space-y-5">

                {/* Phone */}
                {vendor.phone && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <a
                        href={`tel:${vendor.phone}`}
                        className="text-gray-900 font-medium hover:text-primary transition-colors"
                      >
                        {vendor.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {vendor.email && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${vendor.email}`}
                        className="text-gray-900 font-medium hover:text-primary transition-colors break-all"
                      >
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {vendor.address && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adresa</p>
                      <p className="text-gray-900 font-medium">
                        {vendor.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {vendor.website && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary transition-colors break-all"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {vendor.opening_hours && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Orari i Punës</p>
                      <p className="text-gray-900 font-medium">
                        {vendor.opening_hours}
                      </p>
                    </div>
                  </div>
                )}

                {/* No contact info */}
                {!vendor.phone && !vendor.email && !vendor.address && !vendor.website && !vendor.opening_hours && (
                  <p className="text-gray-500 text-center py-4">
                    Nuk ka informacione kontakti
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VendorProfile
