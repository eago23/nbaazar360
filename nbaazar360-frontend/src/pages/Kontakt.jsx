import { useState, useEffect } from 'react'
import { MapPin, Mail, Phone, Send, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'

function Kontakt() {
  const [formData, setFormData] = useState({
    emri: '',
    mbiemri: '',
    email: '',
    mesazhi: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = "n'Bazaar360 - Kontakt"
  }, [])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    if (!formData.emri.trim() || !formData.mbiemri.trim() || !formData.email.trim() || !formData.mesazhi.trim()) {
      setError('Ju lutemi plotësoni të gjitha fushat.')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Ju lutemi vendosni një email të vlefshëm.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/contact', formData)
      setSuccess(true)
      setFormData({
        emri: '',
        mbiemri: '',
        email: '',
        mesazhi: ''
      })
    } catch (err) {
      console.error('Error sending contact message:', err)
      setError('Ndodhi një gabim. Ju lutemi provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Background Image */}
      <div
        className="relative bg-gray-900 py-16 sm:py-20 md:py-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Na Kontaktoni
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Jemi këtu për çdo pyetje, sugjerim apo bashkëpunim.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Side - Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Informacione Kontakti
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Na kontaktoni për çdo pyetje rreth Pazarit të Ri, platformës n'Bazaar360, ose bashkëpunimeve të mundshme.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Vendndodhja</h3>
                  <p className="text-gray-600 mt-1">
                    Pazari i Ri, Tirana, Albania
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Telefon</h3>
                  <a
                    href="tel:08000888"
                    className="text-primary hover:text-primary-dark transition-colors mt-1 block"
                  >
                    0800 0888
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Email</h3>
                  <a
                    href="mailto:info@tirana.al"
                    className="text-primary hover:text-primary-dark transition-colors mt-1 block"
                  >
                    info@tirana.al
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Dërgoni Mesazh
            </h2>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Mesazhi juaj u dërgua me sukses!</p>
                  <p className="text-green-700 text-sm mt-1">Do t'ju përgjigjemi së shpejti.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields - Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emri" className="block text-sm font-medium text-gray-700 mb-1">
                    Emri <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="emri"
                    name="emri"
                    value={formData.emri}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Emri juaj"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="mbiemri" className="block text-sm font-medium text-gray-700 mb-1">
                    Mbiemri <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="mbiemri"
                    name="mbiemri"
                    value={formData.mbiemri}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Mbiemri juaj"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="email@shembull.com"
                  disabled={loading}
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="mesazhi" className="block text-sm font-medium text-gray-700 mb-1">
                  Mesazhi <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="mesazhi"
                  name="mesazhi"
                  value={formData.mesazhi}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                  placeholder="Shkruani mesazhin tuaj këtu..."
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Duke dërguar...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Dërgo Mesazhin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Kontakt
