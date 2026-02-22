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
    { id: 'artisan', label: 'Artizanat' },
    { id: 'shop', label: 'Dyqan' },
    { id: 'restaurant', label: 'Restorant' },
    { id: 'cafe', label: 'Kafe & Bar' },
    { id: 'service', label: 'Shërbime' }
  ]

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
      <div className="bg-white py-12 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Bizneset e Pazarit
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl">
            Njihuni me njerëzit dhe bizneset që i japin jetë Pazarit të Ri çdo ditë.
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white border-b sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kërko tregtarë..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  to={`/tregtaret/${vendor.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
                >
                  <div className="relative h-48">
                    <img
                      src={vendor.cover_url || vendor.logo_url || 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400'}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover"
                    />
                    {vendor.category && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 text-secondary text-xs font-medium rounded-full">
                        {vendor.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {vendor.logo_url ? (
                        <img
                          src={vendor.logo_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Store className="text-primary" size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary truncate">
                          {vendor.business_name}
                        </h3>
                        {vendor.location && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin size={12} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{vendor.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {vendor.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Store className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Nuk u gjetën tregtarë</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-secondary mb-4">Jeni Biznes në Pazarin e Ri?</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Regjistrohuni për të ndarë historinë tuaj dhe për të arritur vizitorë të rinj
            përmes platformës sonë dixhitale.
          </p>
          <Link
            to="/regjistrim"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Regjistrohu Tani
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Vendors
