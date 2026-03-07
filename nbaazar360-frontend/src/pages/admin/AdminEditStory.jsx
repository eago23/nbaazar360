import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertCircle, Upload, Video, CheckCircle } from 'lucide-react'
import { adminStoriesAPI, uploadAPI, getMediaUrl } from '../../services/api'

function AdminEditStory() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',           // Story title (optional)
    artisan_name: '',    // Business name (optional)
    full_story: ''       // Description (required)
  })

  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [thumbnailBlob, setThumbnailBlob] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [existingVideoUrl, setExistingVideoUrl] = useState('')
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    document.title = "n'Bazaar360 - Ndrysho Historinë AR"
  }, [])

  useEffect(() => {
    fetchStory()
  }, [id])

  const fetchStory = async () => {
    try {
      const response = await adminStoriesAPI.getAll()
      const stories = response.data?.stories || response.data || []
      const story = stories.find(s => s.id === parseInt(id))
      if (story) {
        setFormData({
          title: story.title || '',
          artisan_name: story.artisan_name || '',
          full_story: story.full_story || story.short_bio || ''
        })
        setExistingVideoUrl(story.video_url || '')
        setExistingThumbnailUrl(story.thumbnail_url || '')
        // Use getMediaUrl to construct full URLs for video and thumbnail previews
        setVideoPreview(story.video_url ? getMediaUrl(story.video_url) : '')
        setThumbnailPreview(story.thumbnail_url ? getMediaUrl(story.thumbnail_url) : '')
      } else {
        setError('Historia nuk u gjet')
      }
    } catch (error) {
      console.error('Error fetching story:', error)
      setError('Gabim gjate ngarkimit te historise')
    } finally {
      setFetchLoading(false)
    }
  }

  // Function to extract thumbnail from video
  const extractThumbnailFromVideo = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2)
      }

      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const previewUrl = canvas.toDataURL('image/jpeg', 0.85)

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src)
          if (blob) {
            resolve({ blob, previewUrl })
          } else {
            reject(new Error('Failed to generate thumbnail'))
          }
        }, 'image/jpeg', 0.85)
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('Failed to load video for thumbnail extraction'))
      }

      video.src = URL.createObjectURL(videoFile)
      video.load()
    })
  }

  const handleVideoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('Video eshte shume i madh. Maksimumi 100MB.')
        return
      }

      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setError('')
      setThumbnailBlob(null)
      setThumbnailPreview('')

      try {
        const { blob, previewUrl } = await extractThumbnailFromVideo(file)
        setThumbnailBlob(blob)
        setThumbnailPreview(previewUrl)
      } catch (error) {
        console.error('Failed to extract thumbnail:', error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation - only description is required
    if (!formData.full_story.trim()) {
      setError('Ju lutem vendosni pershkrimin')
      return
    }
    // Title and artisan_name are OPTIONAL!

    setLoading(true)
    setUploadProgress(10)

    try {
      let thumbnailUrl = existingThumbnailUrl
      let videoUrl = existingVideoUrl

      // Upload new thumbnail if generated
      if (thumbnailBlob) {
        setUploadProgress(20)
        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
        const thumbnailRes = await uploadAPI.uploadImage(thumbnailFile, 'stories')
        thumbnailUrl = thumbnailRes.data.file_url || thumbnailRes.data.url
      }

      // Upload new video if selected
      if (videoFile) {
        setUploadProgress(40)
        const videoRes = await uploadAPI.uploadVideo(videoFile)
        videoUrl = videoRes.data.file_url || videoRes.data.url
      }

      setUploadProgress(70)

      // Update story data - title and artisan_name are optional
      const storyData = {
        title: formData.title.trim() || null,
        artisan_name: formData.artisan_name.trim() || null,
        full_story: formData.full_story,
        short_bio: formData.full_story.substring(0, 150),
        video_url: videoUrl,
        is_published: true
      }

      if (thumbnailUrl) {
        storyData.thumbnail_url = thumbnailUrl
      }

      setUploadProgress(90)
      await adminStoriesAPI.update(id, storyData)

      setUploadProgress(100)
      navigate('/admin/permbajtje')

    } catch (error) {
      console.error('Error updating story:', error)
      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       'Gabim gjate perditesimit te historise'
      setError(errorMsg)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admin/permbajtje')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-secondary">Ndrysho Historine AR</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Duke ngarkuar...</span>
              <span className="text-sm font-medium text-blue-800">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 1. VIDEO UPLOAD */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">
            Video e Historise AR
          </h2>

          <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
            {videoPreview ? (
              <video
                src={videoPreview}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Video size={48} className="text-gray-400 mb-3" />
                <span className="text-gray-600 font-medium">Kliko per te ngarkuar video</span>
                <span className="text-gray-400 text-sm mt-1">MP4, maksimumi 100MB</span>
                <span className="text-gray-400 text-xs mt-1 italic">
                  Thumbnail do te gjenerohet automatikisht
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}

            {videoPreview && (
              <label className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg cursor-pointer shadow-lg transition-colors">
                <Upload size={16} className="inline mr-2" />
                Ndrysho Video
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {videoFile && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">
                Video e re: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              {thumbnailBlob && (
                <div className="flex items-center space-x-3">
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Thumbnail u gjenerua automatikisht
                  </p>
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-16 h-10 object-cover rounded border"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. TITLE (Optional) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">
            Titulli i Historise
            <span className="text-gray-400 text-sm font-normal ml-2">(Opsional)</span>
          </h2>
          <input
            name="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            placeholder="p.sh. Mengjesi ne Pazar, Festa e Veres, etj."
          />
          <p className="text-sm text-gray-500 mt-2">
            Lini bosh per te perdorur emrin e biznesit si titull
          </p>
        </div>

        {/* 3. BUSINESS NAME (Optional) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">
            Emri i Biznesit
            <span className="text-gray-400 text-sm font-normal ml-2">(Opsional)</span>
          </h2>
          <input
            name="artisan_name"
            type="text"
            value={formData.artisan_name}
            onChange={(e) => setFormData(prev => ({ ...prev, artisan_name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            placeholder="p.sh. Agim Gjini - Mjeshter Metali, Kafe Lori, etj."
          />
          <p className="text-sm text-gray-500 mt-2">
            Lini bosh per histori te pergjithshme te Komunes (pa biznese specifik)
          </p>
        </div>

        {/* 4. DESCRIPTION */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary mb-4">
            Pershkrimi i Historise *
          </h2>
          <textarea
            name="full_story"
            value={formData.full_story}
            onChange={(e) => setFormData(prev => ({ ...prev, full_story: e.target.value }))}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-lg"
            placeholder="Tregoni historine e plote te artizanit dhe biznesit te tij..."
          />
          <p className="text-sm text-gray-500 mt-2">
            {formData.full_story.length} karaktere
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/permbajtje')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Anulo
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Duke ruajtur...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Ruaj Ndryshimet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminEditStory
