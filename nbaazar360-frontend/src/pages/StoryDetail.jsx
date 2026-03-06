import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { storiesAPI, getMediaUrl } from '../services/api'

function StoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStory()
  }, [id])

  useEffect(() => {
    if (story?.title) {
      document.title = `n'Bazaar360 - ${story.title}`
    } else {
      document.title = "n'Bazaar360 - Histori AR"
    }
  }, [story])

  const fetchStory = async () => {
    try {
      const response = await storiesAPI.getById(id)
      const storyData = response.data?.story || response.data
      setStory(storyData)
    } catch (error) {
      console.error('Error fetching story:', error)
      navigate(-1) // Go back to previous page on error
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    navigate(-1) // Go back to previous page (works for vendor profile, AR stories, etc.)
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Historia nuk u gjet</p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Kthehu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Close button - Top Right - Fixed position with highest z-index */}
        <button
          onClick={handleClose}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] w-11 h-11 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 transition-all hover:scale-110 active:scale-95"
        >
          <X size={22} className="sm:w-6 sm:h-6" />
        </button>

        {/* Video Container - Top Section */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-16">
          <div className="w-full max-w-4xl">
            {story.video_url ? (
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-lg shadow-2xl bg-black"
                style={{ maxHeight: '60vh' }}
                poster={getMediaUrl(story.thumbnail_url)}
                onLoadedMetadata={(e) => {
                  console.log('Video loaded:', e.target.duration, 'seconds')
                }}
              >
                <source src={getMediaUrl(story.video_url)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : story.thumbnail_url ? (
              <img
                src={getMediaUrl(story.thumbnail_url)}
                alt={story.title}
                className="w-full rounded-lg shadow-2xl"
                style={{ maxHeight: '60vh', objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Nuk ka media</p>
              </div>
            )}
          </div>
        </div>

        {/* Story Content - White Card at Bottom */}
        <div className="flex justify-center px-4 pb-8">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8">
            {/* Title - Main Heading (or fallback to business name) */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {story.title || story.artisan_name || 'Histori AR'}
            </h1>

            {/* Business/Artisan Name - Show as subtitle if title exists and is different */}
            {story.artisan_name && story.title && story.artisan_name !== story.title && (
              <p className="text-primary font-semibold text-xl mb-4">
                {story.artisan_name}
              </p>
            )}

            {/* Profession if available */}
            {story.profession && (
              <p className="text-gray-600 font-medium text-lg mb-4">
                {story.profession}
              </p>
            )}

            {/* Description/Story */}
            {story.full_story && (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {story.full_story}
              </p>
            )}

            {/* Fallback to short_bio if no full_story */}
            {!story.full_story && story.short_bio && (
              <p className="text-gray-700 text-lg leading-relaxed">
                {story.short_bio}
              </p>
            )}

            {/* Location if available */}
            {story.location_name && (
              <p className="text-gray-500 mt-4 text-sm">
                Vendndodhja: {story.location_name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryDetail
