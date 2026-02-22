/**
 * Albanian Error Messages Utility
 * Provides user-friendly Albanian error messages for the application
 */

// Error message mappings
export const ERROR_MESSAGES = {
  // Authentication - Login specific
  USER_NOT_FOUND: 'Ky email nuk është i regjistruar',
  WRONG_PASSWORD: 'Fjalëkalimi është i gabuar',
  INVALID_CREDENTIALS: 'Email ose fjalëkalim i gabuar',
  AUTH_FAILED: 'Email ose fjalëkalim i gabuar',

  // Registration
  EMAIL_EXISTS: 'Ky email është i regjistruar tashmë',
  USERNAME_EXISTS: 'Ky emër përdoruesi është i zënë',
  BUSINESS_NAME_EXISTS: 'Ky emër biznesi është i regjistruar tashmë',
  INVALID_EMAIL: 'Formati i email-it është i pasaktë',

  // Account Status
  ACCOUNT_PENDING: 'Llogaria juaj nuk është aprovuar ende. Ju lutem prisni miratimin nga administratori.',
  ACCOUNT_REJECTED: 'Llogaria juaj është refuzuar. Kontaktoni administratorin për më shumë informacion.',
  ACCOUNT_SUSPENDED: 'Llogaria juaj është pezulluar. Kontaktoni administratorin.',
  ACCOUNT_INACTIVE: 'Llogaria juaj nuk është aktive',

  // Session
  SESSION_EXPIRED: 'Sesioni ka skaduar. Ju lutem hyni përsëri',
  UNAUTHORIZED: 'Nuk jeni i autorizuar',
  FORBIDDEN: 'Nuk keni leje për këtë veprim',
  TOKEN_INVALID: 'Tokeni është i pavlefshëm',
  TOKEN_EXPIRED: 'Tokeni ka skaduar',

  // Form Validation
  REQUIRED_FIELD: 'Kjo fushë është e detyrueshme',
  INVALID_PHONE: 'Numri i telefonit është i pasaktë',
  INVALID_URL: 'Formati i URL-së është i pasaktë',
  PASSWORD_TOO_SHORT: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere',
  PASSWORDS_DONT_MATCH: 'Fjalëkalimet nuk përputhen',
  INVALID_DATE: 'Data është e pasaktë',
  INVALID_TIME: 'Ora është e pasaktë',
  INVALID_COORDINATES: 'Koordinatat janë të pasakta',
  TERMS_NOT_ACCEPTED: 'Duhet të pranoni kushtet e përdorimit',

  // File Upload
  FILE_TOO_LARGE: 'Skedari është shumë i madh. Maksimumi: 20MB',
  INVALID_FILE_TYPE: 'Lloji i skedarit nuk është i vlefshëm',
  UPLOAD_FAILED: 'Ngarkimi dështoi. Provoni përsëri',
  NO_FILE: 'Asnjë skedar nuk u zgjodh',

  // Server/Network
  SERVER_ERROR: 'Gabim në server. Provoni përsëri',
  NETWORK_ERROR: 'Gabim në lidhje. Kontrolloni internetin',
  NOT_FOUND: 'Nuk u gjet',
  DATABASE_ERROR: 'Gabim në bazën e të dhënave',
  TIMEOUT: 'Kërkesa zgjati shumë. Provoni përsëri',

  // Resources
  VENDOR_NOT_FOUND: 'Biznesi nuk u gjet',
  STORY_NOT_FOUND: 'Historia nuk u gjet',
  EVENT_NOT_FOUND: 'Ngjarja nuk u gjet',
  LOCATION_NOT_FOUND: 'Vendndodhja nuk u gjet',

  // Generic
  SOMETHING_WRONG: 'Diçka shkoi keq. Provoni përsëri',
  TRY_AGAIN: 'Provoni përsëri',
  INVALID_DATA: 'Të dhënat e dërguara janë të pasakta'
}

// Success message mappings
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'U hytë me sukses!',
  LOGOUT_SUCCESS: 'U dolët me sukses!',
  REGISTER_SUCCESS: 'Regjistrimi u krye me sukses! Llogaria juaj do të shqyrtohet.',

  // Profile
  PROFILE_UPDATED: 'Profili u përditësua me sukses!',
  LOGO_UPLOADED: 'Logo u ngarkua me sukses!',
  COVER_UPLOADED: 'Foto e kopertinës u ngarkua me sukses!',

  // CRUD Operations
  CREATED_SUCCESS: 'U krijua me sukses!',
  UPDATED_SUCCESS: 'U përditësua me sukses!',
  DELETED_SUCCESS: 'U fshi me sukses!',
  SAVED_SUCCESS: 'U ruajt me sukses!',

  // File Upload
  FILE_UPLOADED: 'Skedari u ngarkua me sukses!',
  IMAGE_UPLOADED: 'Imazhi u ngarkua me sukses!',
  VIDEO_UPLOADED: 'Video u ngarkua me sukses!',

  // Admin Actions
  VENDOR_APPROVED: 'Biznesi u aprovua me sukses!',
  VENDOR_REJECTED: 'Aplikimi u refuzua',
  VENDOR_SUSPENDED: 'Biznesi u pezullua',
  VENDOR_REACTIVATED: 'Biznesi u riaktivizua',

  // Stories
  STORY_PUBLISHED: 'Historia u publikua me sukses!',
  STORY_UNPUBLISHED: 'Historia u çpublikua',
  PRIMARY_STORY_SET: 'Historia kryesore u vendos!'
}

/**
 * Get user-friendly error message from API error
 * @param {Error} error - Axios error object
 * @returns {string} Albanian error message
 */
export const getErrorMessage = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return ERROR_MESSAGES.TIMEOUT
    }
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  const data = error.response?.data

  // Priority 1: Use 'message' field (contains Albanian message from backend)
  if (data?.message && typeof data.message === 'string' && data.message !== 'Validation failed') {
    return data.message
  }

  // Priority 2: Check for error code and map to our messages
  const errorCode = data?.error
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode]
  }

  // Priority 3: Validation errors array
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].message || ERROR_MESSAGES.INVALID_DATA
  }

  // Priority 4: Status code based fallback
  const status = error.response?.status

  switch (status) {
    case 400:
      return ERROR_MESSAGES.INVALID_DATA
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.FORBIDDEN
    case 404:
      return ERROR_MESSAGES.NOT_FOUND
    case 413:
      return ERROR_MESSAGES.FILE_TOO_LARGE
    case 422:
      return ERROR_MESSAGES.INVALID_DATA
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR
    default:
      return ERROR_MESSAGES.SOMETHING_WRONG
  }
}

/**
 * Get validation error message for form fields
 * @param {string} fieldName - Name of the field
 * @param {string} errorType - Type of validation error
 * @returns {string} Albanian validation message
 */
export const getValidationMessage = (fieldName, errorType) => {
  const fieldLabels = {
    email: 'Email',
    password: 'Fjalëkalimi',
    username: 'Emri i përdoruesit',
    business_name: 'Emri i biznesit',
    full_name: 'Emri i plotë',
    phone: 'Telefoni',
    address: 'Adresa',
    title: 'Titulli',
    description: 'Përshkrimi',
    start_date: 'Data e fillimit',
    end_date: 'Data e mbarimit'
  }

  const label = fieldLabels[fieldName] || fieldName

  switch (errorType) {
    case 'required':
      return `${label} është i detyrueshëm`
    case 'minLength':
      return `${label} është shumë i shkurtër`
    case 'maxLength':
      return `${label} është shumë i gjatë`
    case 'pattern':
      return `${label} ka format të pasaktë`
    case 'email':
      return 'Formati i email-it është i pasaktë'
    default:
      return ERROR_MESSAGES.INVALID_DATA
  }
}

export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  getValidationMessage
}
