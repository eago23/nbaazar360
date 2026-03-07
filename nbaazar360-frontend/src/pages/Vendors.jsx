import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Store, Star } from 'lucide-react'
import { vendorsAPI } from '../services/api'

function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'Të gjitha' },
    { id: 'Restorant', label: 'Restorant' },
    { id: 'Kafe & Bar', label: 'Kafe & Bar' },
    { id: 'Artizanat & Suvenire', label: 'Artizanat & Suvenire' },
    { id: 'Prodhime Vendore', label: 'Prodhime Vendore' },
    { id: 'Dyqan', label: 'Dyqan' }
  ]

  useEffect(() => {
    document.title = "n'Bazaar360 - Bizneset"
  }, [])

  useEffect(() => {
    fetchVendors()
  }, [selectedCategory])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = { status: 'active' }
      if (selectedCategory !== 'all') {
        params.business_type = selectedCategory
      }
      const response = await vendorsAPI.getAll(params)
      const vendorsData = response.data?.vendors || response.data || []
      setVendors(Array.isArray(vendorsData) ? vendorsData : [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* Hero Section - Clean White Style */}
      <div className="bg-white py-8 sm:py-12 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Bizneset e Pazarit
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl">
            Njihuni me njerëzit dhe bizneset që i japin jetë Pazarit të Ri çdo ditë.
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white border-b sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kërko tregtarë..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>

            {/* Category Filter - Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-6 sm:py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredVendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  to={`/tregtaret/${vendor.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
                >
                  <div className="relative h-40 sm:h-48">
                    <img
                      src={vendor.cover_url || vendor.logo_url || 'https://pikark.com/wp-content/uploads/listing-uploads/gallery/2020/12/Pazari-i-ri-Tirane-atelier4-studio_01.png'}
                      alt={vendor.business_name}
                      loading="lazy"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                    {vendor.category && (
                      <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-1 bg-white/90 text-secondary text-xs font-medium rounded-full">
                        {vendor.category}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start space-x-3">
                      {vendor.logo_url ? (
                        <img
                          src={vendor.logo_url}
                          alt=""
                          loading="lazy"
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Store className="text-primary" size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary truncate text-sm sm:text-base">
                          {vendor.business_name}
                        </h3>
                        {vendor.location && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                            <MapPin size={12} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{vendor.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {vendor.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 line-clamp-2">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
              <Store className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Nuk u gjetën tregtarë</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-3 sm:mb-4">Jeni Biznes në Pazarin e Ri?</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-4 sm:mb-6">
            Regjistrohuni për të ndarë historinë tuaj dhe për të arritur vizitorë të rinj
            përmes platformës sonë dixhitale.
          </p>
          <Link
            to="/regjistrim"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors min-h-[48px]"
          >
            Regjistrohu Tani
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Vendors
