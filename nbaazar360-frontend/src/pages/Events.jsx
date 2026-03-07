import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Calendar as CalendarIcon } from 'lucide-react'
import { eventsAPI, getMediaUrl } from '../services/api'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [calendarDate, setCalendarDate] = useState(new Date())

  const categories = [
    { id: 'all', label: 'Të gjitha' },
    { id: 'Festival', label: 'Festival' },
    { id: 'Koncert & Muzikë', label: 'Koncert & Muzikë' },
    { id: 'Ekspozitë & Art', label: 'Ekspozitë & Art' },
    { id: 'Teatër & Performancë', label: 'Teatër & Performancë' },
    { id: 'Treg & Artizanat', label: 'Treg & Artizanat' },
    { id: 'Workshop', label: 'Workshop' }
  ]

  useEffect(() => {
    document.title = "n'Bazaar360 - Ngjarje"
  }, [])

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

  // Sort by date descending (newest first), featured events prioritized
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    // Featured events first
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    // Then by date (newest/upcoming first, oldest last)
    return new Date(b.start_date) - new Date(a.start_date)
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('sq-AL', { month: 'short' }).toUpperCase()
    }
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
    setCalendarDate(new Date())
  }

  // Simplified Event Card - Only date/time and title on image
  const EventCard = ({ event }) => {
    const dateInfo = formatDateShort(event.start_date)
    const timeStr = formatTime(event.start_time)

    return (
      <Link
        to={`/ngjarje/${event.id}`}
        className="group relative block overflow-hidden rounded-xl aspect-[4/3]"
      >
        {/* Full-bleed Image */}
        <img
          src={getMediaUrl(event.thumbnail_url) || getMediaUrl(event.banner_url) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
          {/* Date/Time */}
          <p className="text-white/90 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
            {dateInfo.day} {dateInfo.month}{timeStr ? ` • ${timeStr}` : ''}
          </p>

          {/* Title */}
          <h3 className="font-bold text-white leading-tight group-hover:text-primary-light transition-colors text-base sm:text-lg md:text-xl">
            {event.title}
          </h3>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-gray-900 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3">
            Ngjarje në Pazarin e Ri
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl">
            Zbuloni ngjarjet, aktivitetet dhe festivalet që japin jetë Pazarit të Ri gjatë gjithë vitit.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Category Filter - Horizontal scroll */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Left Sidebar - Filters (hidden on mobile, shown on desktop) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide">
                Zgjidh Datën
              </h3>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                activeStartDate={calendarDate}
                onActiveStartDateChange={({ activeStartDate }) => setCalendarDate(activeStartDate)}
                className="events-calendar border-none w-full"
                tileClassName={tileClassName}
                locale="sq-AL"
              />
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="w-full mt-4 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors min-h-[44px]"
                >
                  Kthehu te sot
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide">
                Kategoritë
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm min-h-[44px] ${
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

            {/* Active Filters Summary */}
            {(selectedDate || selectedCategory !== 'all') && (
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Filtrat aktive</span>
                  <button
                    onClick={() => {
                      setSelectedDate(null)
                      setSelectedCategory('all')
                    }}
                    className="text-xs text-primary hover:underline min-h-[44px] flex items-center"
                  >
                    Pastro të gjitha
                  </button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {selectedDate && (
                    <p>Data: {formatDate(selectedDate)}</p>
                  )}
                  {selectedCategory !== 'all' && (
                    <p>Kategoria: {categories.find(c => c.id === selectedCategory)?.label}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Magazine Grid */}
          <div className="lg:col-span-3">

            {/* Section Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Ngjarjet e Ardhshme
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                {sortedEvents.length} ngjarje{sortedEvents.length !== 1 ? '' : ''} të gjetura
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12 sm:py-20">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Events Grid */}
            {!loading && !error && sortedEvents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {sortedEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && sortedEvents.length === 0 && (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl shadow-sm px-4">
                <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4 sm:w-16 sm:h-16" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Asnjë ngjarje
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedDate
                    ? 'Nuk ka ngjarje për këtë datë.'
                    : selectedCategory !== 'all'
                      ? 'Nuk ka ngjarje në këtë kategori.'
                      : 'Ngjarjet do të shtohen së shpejti.'
                  }
                </p>
                {!selectedDate && selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="mt-4 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium min-h-[44px]"
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
