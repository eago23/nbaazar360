import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, AlertCircle, Upload, Video, CheckCircle } from 'lucide-react'
import { adminStoriesAPI, uploadAPI } from '../../services/api'

function AdminAddStory() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "n'Bazaar360 - Shto Histori AR"
  }, [])

  const [formData, setFormData] = useState({
    title: '',           // NEW - Story title (optional)
    artisan_name: '',    // Business name (OPTIONAL)
    full_story: ''       // Description (required)
  })

  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [thumbnailBlob, setThumbnailBlob] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

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
        // Seek to 1 second (or first frame if video is shorter)
        video.currentTime = Math.min(1, video.duration / 2)
      }

      video.onseeked = () => {
        // Set canvas size to video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get preview URL
        const previewUrl = canvas.toDataURL('image/jpeg', 0.85)

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          // Clean up video element
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

      // Load video
      video.src = URL.createObjectURL(videoFile)
      video.load()
    })
  }

  const handleVideoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video eshte shume i madh. Maksimumi 100MB.')
        return
      }

      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setError('')
      setThumbnailBlob(null)
      setThumbnailPreview('')

      // Extract thumbnail from video
      try {
        const { blob, previewUrl } = await extractThumbnailFromVideo(file)
        setThumbnailBlob(blob)
        setThumbnailPreview(previewUrl)
        console.log('Thumbnail extracted successfully')
      } catch (error) {
        console.error('Failed to extract thumbnail:', error)
        // Continue without thumbnail - not critical
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation - only video and description are required
    if (!videoFile) {
      setError('Ju lutem ngarkoni nje video')
      return
    }
    if (!formData.full_story.trim()) {
      setError('Ju lutem vendosni pershkrimin')
      return
    }
    // Title and artisan_name are OPTIONAL!

    setLoading(true)
    setUploadProgress(10)

    try {
      let thumbnailUrl = null

      // 1. Upload thumbnail if generated
      if (thumbnailBlob) {
        setUploadProgress(20)
        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
        const thumbnailRes = await uploadAPI.uploadImage(thumbnailFile, 'stories')
        thumbnailUrl = thumbnailRes.data.file_url || thumbnailRes.data.url
      }

      // 2. Upload video
      setUploadProgress(40)
      const videoRes = await uploadAPI.uploadVideo(videoFile)
      const videoUrl = videoRes.data.file_url || videoRes.data.url

      setUploadProgress(70)

      // 3. Create story - title and artisan_name are optional
      const storyData = {
        title: formData.title.trim() || null,              // Optional title
        artisan_name: formData.artisan_name.trim() || null, // Optional business name
        full_story: formData.full_story,
        short_bio: formData.full_story.substring(0, 150),
        video_url: videoUrl,
        is_published: true
      }

      // Only add thumbnail if generated
      if (thumbnailUrl) {
        storyData.thumbnail_url = thumbnailUrl
      }

      setUploadProgress(90)
      await adminStoriesAPI.create(storyData)

      setUploadProgress(100)
      navigate('/admin/permbajtje')

    } catch (error) {
      console.error('Error creating story:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error ||
                       error.response?.data?.message ||
                       error.response?.data?.errors?.[0]?.message ||
                       JSON.stringify(error.response?.data) ||
                       'Gabim gjate krijimit te historise'
      setError(errorMsg)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
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
        <h1 className="text-2xl font-bold text-secondary">Shto Histori AR te Re</h1>
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
            Video e Historise AR *
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
                Video: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
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
            placeholder="Tregoni historine e plote..."
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
                <span>Krijo Historine</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminAddStory
