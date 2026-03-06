import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Share2, ExternalLink, Users, ChevronRight } from 'lucide-react'
import { eventsAPI, getMediaUrl } from '../services/api'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedEvents, setRelatedEvents] = useState([])

  useEffect(() => {
    fetchEvent()
  }, [id])

  useEffect(() => {
    if (event?.title) {
      document.title = `n'Bazaar360 - ${event.title}`
    } else {
      document.title = "n'Bazaar360 - Ngjarje"
    }
  }, [event])

  const fetchEvent = async () => {
    try {
      const [eventRes, allEventsRes] = await Promise.all([
        eventsAPI.getById(id),
        eventsAPI.getAll()
      ])
      const eventData = eventRes.data?.event || eventRes.data
      const eventsData = allEventsRes.data?.events || allEventsRes.data || []
      const eventsArray = Array.isArray(eventsData) ? eventsData : []
      setEvent(eventData)
      setRelatedEvents(eventsArray.filter(e => e.id !== parseInt(id)).slice(0, 3))
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return null
    return timeString.substring(0, 5)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Lidhja u kopjua!')
    }
  }

  const addToCalendar = () => {
    const startDate = new Date(event.start_date)
    if (event.start_time && typeof event.start_time === 'string') {
      const timeParts = event.start_time.split(':')
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10)
        const minutes = parseInt(timeParts[1], 10)
        if (!isNaN(hours) && !isNaN(minutes)) {
          startDate.setHours(hours, minutes)
        }
      }
    }
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

    const formatDateForCal = (date) => {
      try {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      } catch {
        return ''
      }
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title || '')}&dates=${formatDateForCal(startDate)}/${formatDateForCal(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue_name || 'Pazari i Ri, Tiranë')}`

    window.open(googleCalendarUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Calendar size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ngjarja nuk u gjet</h2>
        <button
          onClick={() => navigate('/ngjarje')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Kthehu te Ngjarjet
        </button>
      </div>
    )
  }

  const eventDate = new Date(event.start_date)
  const isPast = eventDate < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/ngjarje')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kthehu te Ngjarjet</span>
          </button>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* LEFT COLUMN - Image & Key Info (2/5 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Event Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={getMediaUrl(event.banner_url) || getMediaUrl(event.thumbnail_url) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                alt={event.title}
                className="w-full h-72 md:h-80 object-cover"
              />

              {/* Event Type Badge */}
              {event.event_type && String(event.event_type).trim() !== '' && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                  <span className="text-sm font-bold text-primary capitalize">
                    {event.event_type}
                  </span>
                </div>
              )}

              {/* Past Event Badge */}
              {isPast && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-gray-600 rounded-full shadow-lg">
                  <span className="text-xs font-bold text-white">
                    E kaluar
                  </span>
                </div>
              )}

              {/* Featured Badge */}
              {Boolean(event.is_featured) && !isPast && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 rounded-full shadow-lg">
                  <span className="text-xs font-bold text-white">
                    ★ I veçantë
                  </span>
                </div>
              )}
            </div>

            {/* Key Information Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-5">
              <h3 className="text-lg font-bold text-gray-900">
                Informacione Kryesore
              </h3>

              {/* Date */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(event.start_date)}
                  </p>
                </div>
              </div>

              {/* Time */}
              {event.start_time && String(event.start_time).trim() !== '' && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ora</p>
                    <p className="text-gray-900 font-medium">
                      {formatTime(event.start_time)}
                      {event.end_time && String(event.end_time).trim() !== '' && ` - ${formatTime(event.end_time)}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Venue */}
              {event.venue_name && String(event.venue_name).trim() !== '' && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vendndodhja</p>
                    <p className="text-gray-900 font-medium">
                      {event.venue_name}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue_name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary text-sm mt-1 hover:underline"
                    >
                      Hap në Google Maps
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                </div>
              )}

              {/* Max Participants */}
              {event.max_participants > 0 && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pjesëmarrësit</p>
                    <p className="text-gray-900 font-medium">
                      Deri në {event.max_participants} persona
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Add to Calendar Button */}
              {!isPast && (
                <button
                  onClick={addToCalendar}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
                >
                  <Calendar size={20} />
                  <span>Shto në Kalendar</span>
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl hover:border-primary hover:bg-red-50 transition-all font-semibold"
              >
                <Share2 size={20} />
                <span>Ndaj Ngjarjen</span>
              </button>
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ngjarje të Tjera</h3>
                <div className="space-y-3">
                  {relatedEvents.map((relEvent) => (
                    <Link
                      key={relEvent.id}
                      to={`/ngjarje/${relEvent.id}`}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={getMediaUrl(relEvent.thumbnail_url) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100'}
                        alt={relEvent.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {relEvent.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(relEvent.start_date).toLocaleDateString('sq-AL', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Details (3/5 width) */}
          <div className="lg:col-span-3 space-y-8">

            {/* Event Title & Short Description */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              {event.short_description && event.short_description.trim() && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {event.short_description}
                </p>
              )}
            </div>

            {/* Full Description */}
            {event.description && event.description.trim() && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Rreth Ngjarjes
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Detaje Shtesë
              </h2>
              <div className="space-y-4">
                {event.registration_required ? (
                  <div className="flex items-center space-x-3 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                    <ChevronRight size={20} />
                    <span className="font-medium">Regjistrim i nevojshëm</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-blue-700 bg-blue-50 px-4 py-3 rounded-lg">
                    <ChevronRight size={20} />
                    <span className="font-medium">Hyrje e lirë, pa regjistrim</span>
                  </div>
                )}

                {event.price && String(event.price).trim() !== '' && String(event.price) !== '0' && (
                  <div className="flex items-center space-x-3 text-amber-700 bg-amber-50 px-4 py-3 rounded-lg">
                    <ChevronRight size={20} />
                    <span className="font-medium">Çmimi: {event.price}</span>
                  </div>
                )}

                {isPast ? (
                  <div className="flex items-center space-x-3 text-gray-600 bg-gray-100 px-4 py-3 rounded-lg">
                    <ChevronRight size={20} />
                    <span className="font-medium">Kjo ngjarje ka përfunduar</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                    <ChevronRight size={20} />
                    <span className="font-medium">Ngjarja është e konfirmuar</span>
                  </div>
                )}
              </div>
            </div>

            {/* Back to Events Link */}
            <div className="pt-6 border-t-2 border-gray-200">
              <Link
                to="/ngjarje"
                className="inline-flex items-center space-x-2 text-primary font-semibold hover:underline"
              >
                <span>Shiko ngjarje të tjera</span>
                <ArrowLeft size={18} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
