import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Calendar as CalendarIcon, MapPin, Clock, Users, Star, ArrowRight, List, Grid3X3 } from 'lucide-react'
import { eventsAPI } from '../services/api'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'

  const categories = [
    { id: 'all', label: 'Të gjitha' },
    { id: 'festival', label: 'Festival' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'food', label: 'Ngjarje Kulinare' },
    { id: 'market', label: 'Treg' },
    { id: 'music', label: 'Muzikë' },
    { id: 'art', label: 'Art' }
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsAPI.getAll()
      const eventsData = response.data?.events || response.data || []
      setEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Gabim në ngarkim të ngjarjeve')
    } finally {
      setLoading(false)
    }
  }

  // Filter events by category and date
  const filteredEvents = events.filter(event => {
    // Category filter
    if (selectedCategory !== 'all' && event.event_type !== selectedCategory) {
      return false
    }

    // Date filter
    if (selectedDate) {
      const eventDate = new Date(event.start_date)
      const selected = new Date(selectedDate)
      if (
        eventDate.getFullYear() !== selected.getFullYear() ||
        eventDate.getMonth() !== selected.getMonth() ||
        eventDate.getDate() !== selected.getDate()
      ) {
        return false
      }
    }

    return true
  })

  // Sort by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.start_date) - new Date(b.start_date)
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return null
    return timeString.substring(0, 5) // HH:MM
  }

  // Get dates that have events (for calendar highlighting)
  const eventDates = events.map(event => {
    const date = new Date(event.start_date)
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  })

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      if (eventDates.includes(dateStr)) {
        return 'has-event'
      }
    }
    return null
  }

  const clearDateFilter = () => {
    setSelectedDate(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean White Style */}
      <div className="bg-white py-12 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Ngjarje në Pazarin e Ri
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl">
            Zbuloni ngjarjet, aktivitetet dhe festivalet që japin jetë Pazarit të Ri gjatë gjithë vitit.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Calendar */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide">
                Zgjidh Datën
              </h3>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="events-calendar border-none w-full"
                tileClassName={tileClassName}
                locale="sq-AL"
              />
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="w-full mt-4 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Pastro filtrin e datës
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide">
                Kategoritë
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Events */}
          <div className="lg:col-span-3">

            {/* Header with View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ngjarjet e Ardhshme
                </h2>
                {selectedDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Për datën: {formatDate(selectedDate)}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  title="List View"
                >
                  <List size={20} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 size={20} />
                </button>
              </div>
            </div>

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

            {/* Events List View */}
            {!loading && !error && viewMode === 'list' && (
              <div className="space-y-4">
                {sortedEvents.map(event => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
                  >
                    <div className="flex flex-col md:flex-row">

                      {/* Event Image */}
                      <div className="md:w-72 h-48 md:h-auto relative flex-shrink-0">
                        <img
                          src={event.thumbnail_url || event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Category Badge */}
                        {event.event_type && (
                          <span className="absolute top-4 left-4 px-3 py-1 bg-gray-900/90 text-white text-xs font-semibold rounded-full uppercase">
                            {event.event_type}
                          </span>
                        )}
                        {/* Featured Badge */}
                        {event.is_featured && (
                          <div className="absolute top-4 right-4 px-2 py-1 bg-amber-500 rounded-full">
                            <Star size={14} className="text-white fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">
                          <Link to={`/ngjarje/${event.id}`}>
                            {event.title}
                          </Link>
                        </h3>

                        {event.short_description && (
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                            {event.short_description}
                          </p>
                        )}

                        {/* Event Meta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon size={16} className="mr-2 text-primary flex-shrink-0" />
                            {formatDate(event.start_date)}
                          </div>
                          {event.start_time && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock size={16} className="mr-2 text-primary flex-shrink-0" />
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </div>
                          )}
                          {event.venue_name && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin size={16} className="mr-2 text-primary flex-shrink-0" />
                              {event.venue_name}
                            </div>
                          )}
                          {event.max_participants && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users size={16} className="mr-2 text-primary flex-shrink-0" />
                              Deri në {event.max_participants} pjesëmarrës
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          {event.registration_required && (
                            <button className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm inline-flex items-center">
                              Regjistrohu
                              <ArrowRight size={16} className="ml-1" />
                            </button>
                          )}
                          <Link
                            to={`/ngjarje/${event.id}`}
                            className="px-5 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-primary hover:text-primary transition-colors font-semibold text-sm"
                          >
                            Shiko Detajet
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Events Grid View */}
            {!loading && !error && viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedEvents.map(event => (
                  <Link
                    key={event.id}
                    to={`/ngjarje/${event.id}`}
                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all group"
                  >
                    {/* Event Image */}
                    <div className="h-48 relative">
                      <img
                        src={event.thumbnail_url || event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Category Badge */}
                      {event.event_type && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-gray-900/90 text-white text-xs font-semibold rounded-full uppercase">
                          {event.event_type}
                        </span>
                      )}
                      {/* Featured Badge */}
                      {event.is_featured && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-amber-500 rounded-full">
                          <Star size={14} className="text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h3>

                      <div className="space-y-1.5 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon size={14} className="mr-2 text-primary" />
                          {formatDate(event.start_date)}
                        </div>
                        {event.start_time && (
                          <div className="flex items-center">
                            <Clock size={14} className="mr-2 text-primary" />
                            {formatTime(event.start_time)}
                          </div>
                        )}
                        {event.venue_name && (
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2 text-primary" />
                            <span className="line-clamp-1">{event.venue_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && sortedEvents.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200">
                <CalendarIcon size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Asnjë ngjarje
                </h3>
                <p className="text-gray-600">
                  {selectedDate
                    ? 'Nuk ka ngjarje për këtë datë.'
                    : selectedCategory !== 'all'
                      ? 'Nuk ka ngjarje në këtë kategori.'
                      : 'Ngjarjet do të shtohen së shpejti.'
                  }
                </p>
                {(selectedDate || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedDate(null)
                      setSelectedCategory('all')
                    }}
                    className="mt-4 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                  >
                    Pastro filtrat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Events
