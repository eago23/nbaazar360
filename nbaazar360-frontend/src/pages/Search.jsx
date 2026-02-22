import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, MapPin, Calendar, BookOpen, Store, ArrowLeft } from 'lucide-react'
import { vendorsAPI, storiesAPI, eventsAPI, locationsAPI } from '../services/api'

function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState({
    vendors: [],
    stories: [],
    events: [],
    locations: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'Te gjitha', icon: SearchIcon },
    { id: 'vendors', label: 'Tregtaret', icon: Store },
    { id: 'stories', label: 'Histori', icon: BookOpen },
    { id: 'events', label: 'Ngjarje', icon: Calendar },
    { id: 'locations', label: 'Vendndodhje', icon: MapPin }
  ]

  useEffect(() => {
    if (query) {
      searchAll()
    } else {
      setLoading(false)
    }
  }, [query])

  const searchAll = async () => {
    const searchTerm = query.trim()

    // Require at least 2 characters
    if (searchTerm.length < 2) {
      setResults({ vendors: [], stories: [], events: [], locations: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [vendorsRes, storiesRes, eventsRes, locationsRes] = await Promise.all([
        vendorsAPI.getAll({ search: searchTerm, status: 'active' }),
        storiesAPI.getAll({ search: searchTerm }),
        eventsAPI.getAll({ search: searchTerm }),
        locationsAPI.getAll({ search: searchTerm })
      ])

      const vendorsData = vendorsRes.data?.vendors || vendorsRes.data || []
      const storiesData = storiesRes.data?.stories || storiesRes.data || []
      const eventsData = eventsRes.data?.events || eventsRes.data || []
      const locationsData = locationsRes.data?.locations || locationsRes.data || []

      setResults({
        vendors: Array.isArray(vendorsData) ? vendorsData : [],
        stories: Array.isArray(storiesData) ? storiesData : [],
        events: Array.isArray(eventsData) ? eventsData : [],
        locations: Array.isArray(locationsData) ? locationsData : []
      })
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = results.vendors.length + results.stories.length +
                       results.events.length + results.locations.length

  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return results
    }
    return { [activeTab]: results[activeTab] }
  }

  const filteredResults = getFilteredResults()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Kthehu
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Rezultatet e kerkimit
          </h1>
          {query && (
            <p className="text-white/80">
              {loading ? 'Duke kerkuar...' : `${totalResults} rezultate per "${query}"`}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!query ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <SearchIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Shkruani dicka per te kerkuar</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : totalResults === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <SearchIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Nuk u gjeten rezultate per "{query}"</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm mb-6">
                <div className="flex overflow-x-auto border-b">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-500 hover:text-secondary'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span>{tab.label}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {tab.id === 'all' ? totalResults : results[tab.id]?.length || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="space-y-8">
                {/* Vendors */}
                {(activeTab === 'all' || activeTab === 'vendors') && filteredResults.vendors?.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                        <Store size={20} className="mr-2" />
                        Tregtaret ({results.vendors.length})
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.vendors.map(vendor => (
                        <Link
                          key={vendor.id}
                          to={`/tregtaret/${vendor.username}`}
                          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center space-x-4"
                        >
                          {vendor.logo_url ? (
                            <img
                              src={vendor.logo_url}
                              alt={vendor.business_name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Store className="text-primary" size={24} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-secondary truncate">{vendor.business_name}</h3>
                            <p className="text-sm text-gray-500">{vendor.business_type}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stories */}
                {(activeTab === 'all' || activeTab === 'stories') && filteredResults.stories?.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                        <BookOpen size={20} className="mr-2" />
                        Histori ({results.stories.length})
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.stories.map(story => (
                        <Link
                          key={story.id}
                          to={`/histori-ar/${story.slug || story.id}`}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={story.thumbnail_url || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400'}
                            alt={story.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-medium text-secondary line-clamp-1">{story.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{story.artisan_name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {(activeTab === 'all' || activeTab === 'events') && filteredResults.events?.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                        <Calendar size={20} className="mr-2" />
                        Ngjarje ({results.events.length})
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.events.map(event => (
                        <Link
                          key={event.id}
                          to={`/ngjarje/${event.slug || event.id}`}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                            alt={event.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4">
                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full mb-2">
                              {event.event_type}
                            </span>
                            <h3 className="font-medium text-secondary line-clamp-1">{event.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(event.event_date).toLocaleDateString('sq-AL')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations */}
                {(activeTab === 'all' || activeTab === 'locations') && filteredResults.locations?.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                        <MapPin size={20} className="mr-2" />
                        Vendndodhje ({results.locations.length})
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.locations.map(location => (
                        <Link
                          key={location.id}
                          to={`/eksplorimi-360/${location.id}`}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={location.thumbnail_url || 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400'}
                            alt={location.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-medium text-secondary">{location.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{location.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Search
