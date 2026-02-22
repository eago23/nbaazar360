import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, QrCode, Camera, Play, Eye } from 'lucide-react'
import { storiesAPI } from '../services/api'

function Stories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const response = await storiesAPI.getAll({ is_published: true })
      const storiesData = response.data?.stories || response.data || []
      setStories(Array.isArray(storiesData) ? storiesData : [])
    } catch (error) {
      console.error('Error fetching stories:', error)
      setError('Gabim në ngarkim të historive')
    } finally {
      setLoading(false)
    }
  }

  // How It Works steps - BIZNESET
  const steps = [
    {
      number: '1',
      icon: QrCode,
      title: 'Skanoni Kodin QR',
      description: 'Gjeni kodet QR në çdo vendndodhje të bizneseve në pazar'
    },
    {
      number: '2',
      icon: Camera,
      title: 'Drejtoni Telefonin',
      description: 'Drejtoni kamerën tuaj në pikën e caktuar për të aktivizuar përvojën AR'
    },
    {
      number: '3',
      icon: Smartphone,
      title: 'Shikoni Videon',
      description: 'Zbuloni çfarë ofron çdo biznes përmes videove të tyre'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean White Style */}
      <div className="bg-white py-12 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Histori AR
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl">
            Përmes videove me Augmented Reality, njihuni nga afër me njerëzit, produktet dhe energjinë që e bëjnë këtë vend unik çdo ditë.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Si Funksionon
            </h2>
            <p className="text-lg text-gray-600">
              Përdorni smartfonin tuaj për të hapur përvojat AR në çdo stendë të bizneseve
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
                  <step.icon className="text-white" size={36} />
                </div>

                {/* Number Badge */}
                <div className="inline-block px-4 py-1 bg-gray-900 text-white font-bold rounded-full mb-4">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-secondary mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories Grid Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12">
            Energjia e Pazarit
          </h2>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Stories Grid - Compact Cards */}
          {!loading && !error && stories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  to={`/histori-ar/${story.id}`}
                  className="group bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Thumbnail - Compact */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={story.thumbnail_url || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="text-primary ml-1" size={24} fill="currentColor" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {story.duration_seconds && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        {Math.floor(story.duration_seconds / 60)}:{(story.duration_seconds % 60).toString().padStart(2, '0')}
                      </div>
                    )}

                    {/* Featured Badge */}
                    {story.is_featured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 rounded-full text-white text-xs font-bold">
                        I veçantë
                      </div>
                    )}
                  </div>

                  {/* Card Content - Compact */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {story.title}
                    </h3>

                    {/* Artisan Name */}
                    {story.artisan_name && (
                      <p className="text-sm text-primary font-medium mb-2">
                        {story.artisan_name}
                        {story.profession && (
                          <span className="text-gray-500 font-normal"> • {story.profession}</span>
                        )}
                      </p>
                    )}

                    {/* Short Bio */}
                    {story.short_bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {story.short_bio}
                      </p>
                    )}

                    {/* View Count */}
                    <div className="flex items-center text-gray-500 text-xs">
                      <Eye size={14} className="mr-1" />
                      <span>{story.view_count || 0} shikime</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && stories.length === 0 && (
            <div className="text-center py-20">
              <Smartphone size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Asnjë histori e disponueshme
              </h3>
              <p className="text-gray-500">
                Historit do të shtohen së shpejti
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Stories
