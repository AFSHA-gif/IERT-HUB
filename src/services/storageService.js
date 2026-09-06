import { supabase, isSupabaseConfigured, BUCKET_NAME } from './supabaseClient';
import { savePdfBlob, getPdfBlob, deletePdfBlob } from './indexedDBService';
import { isStudentAuthenticated } from './studentAuthService';
import { isAdminAuthenticated } from './authService';

export const isCloudStorageConfigured = isSupabaseConfigured;

/**
 * Sanitize filename to avoid invalid storage path characters
 */
export function sanitizeFileName(name) {
  const ext = name.includes('.') ? name.substring(name.lastIndexOf('.')) : '.pdf';
  const base = name.substring(0, name.lastIndexOf('.')) || name;
  const cleanBase = base.toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_');
  return `${cleanBase}_${Date.now()}${ext}`;
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Build structured private storage path based on resource category and metadata
 * - notes/{subject}/{unit}/filename.pdf
 * - pyq/{year}/filename.pdf
 * - study-material/{subject}/filename.pdf
 * - assignments/{subject}/filename.pdf
 * - practicals/{subject}/filename.pdf
 * - syllabus/filename.pdf
 */
export function buildStructuredStoragePath(metadata, cleanFileName) {
  const type = metadata.type || metadata.category || 'Notes';
  const subject = (metadata.subjectId || metadata.subject_code || 'general').toLowerCase().replace(/[^a-z0-9]/g, '');
  const unit = metadata.unit || 1;
  const year = metadata.year || '2025';

  switch (type) {
    case 'Notes':
      return `notes/${subject}/unit-${unit}/${cleanFileName}`;
    case 'Previous Year Paper':
      return `pyq/${year}/${cleanFileName}`;
    case 'Study Material':
    case 'Important Questions':
    case 'Reference Material':
      return `study-material/${subject}/${cleanFileName}`;
    case 'Assignment':
      return `assignments/${subject}/${cleanFileName}`;
    case 'Practical':
      return `practicals/${subject}/${cleanFileName}`;
    case 'Syllabus':
      return `syllabus/${cleanFileName}`;
    default:
      return `materials/${subject}/${cleanFileName}`;
  }
}

/**
 * Validate PDF file format and size limits
 */
export function validatePDFFile(file, maxMb = 50) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return { valid: false, error: 'Invalid file format. Only PDF files (.pdf) are permitted.' };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds the limit of ${maxMb}MB.` };
  }

  return { valid: true };
}

/**
 * Upload PDF File to Private Cloud Storage or Local IndexedDB Engine
 */
export async function uploadPDFFile(file, resourceId, onProgress, metadata = {}) {
  const validation = validatePDFFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanName = sanitizeFileName(file.name);
  const fileSizeFormatted = formatBytes(file.size);
  const structuredPath = buildStructuredStoragePath(metadata, cleanName);

  // SUPABASE PRIVATE CLOUD STORAGE MODE
  if (isSupabaseConfigured && supabase) {
    if (onProgress) onProgress(20);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(structuredPath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      throw new Error(`Private Cloud Storage error: ${error.message}`);
    }

    if (onProgress) onProgress(90);

    // Create a temporary 1-hour signed URL for immediate view/download feedback
    const { data: signedData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(structuredPath, 3600);

    if (onProgress) onProgress(100);

    return {
      fileUrl: signedData?.signedUrl || structuredPath,
      storagePath: structuredPath,
      fileName: cleanName,
      fileSize: fileSizeFormatted,
      storageType: 'supabase'
    };
  }

  // LOCAL INDEXEDDB STORAGE ENGINE (Local Testing/Fallback)
  const storageId = `idb_pdf_${resourceId}_${Date.now()}`;
  
  if (onProgress) onProgress(30);
  await savePdfBlob(storageId, file);
  if (onProgress) onProgress(80);

  const objectUrl = URL.createObjectURL(file);
  if (onProgress) onProgress(100);

  return {
    fileUrl: objectUrl,
    storageKey: storageId,
    storagePath: storageId,
    fileName: file.name,
    fileSize: fileSizeFormatted,
    storageType: 'indexedDB'
  };
}

/**
 * Get Authorized Viewable/Downloadable PDF URL
 * Enforces authentication & uses short-lived signed URLs for private Supabase storage
 */
export async function getPDFUrl(storagePathOrKey, defaultUrl) {
  // STRICT SECURITY CHECK: Requester MUST be authenticated student or admin
  const isStudent = isStudentAuthenticated();
  const isAdmin = isAdminAuthenticated();

  if (!isStudent && !isAdmin) {
    console.warn('Unauthorized PDF URL request denied: User is not authenticated.');
    return null;
  }

  const targetPath = storagePathOrKey || defaultUrl;
  if (!targetPath) return null;

  // 1. Direct Blob or Data URLs
  if (targetPath.startsWith('blob:') || targetPath.startsWith('data:')) {
    return targetPath;
  }

  // 2. Supabase Private Storage Signed URL Generation
  if (isSupabaseConfigured && supabase && !targetPath.startsWith('idb_pdf_')) {
    const cleanPath = targetPath.startsWith('http') 
      ? targetPath.split(`/${BUCKET_NAME}/`)[1]?.split('?')[0] || targetPath 
      : targetPath;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(cleanPath, 3600); // 1 Hour short-lived signed URL

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      } else if (error) {
        console.warn(`Supabase Storage createSignedUrl info for "${cleanPath}":`, error.message);
      }
    } catch (err) {
      console.warn('Signed URL generation error, checking fallback:', err);
    }
  }

  // 3. Local IndexedDB Storage Blobs
  if (targetPath.startsWith('idb_pdf_')) {
    try {
      const blob = await getPdfBlob(targetPath);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (err) {
      console.error('IndexedDB blob retrieval failed:', err);
    }
    return null;
  }

  // 4. Valid external or pre-signed HTTP/HTTPS URLs
  if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
    return targetPath;
  }

  // Return null if relative path cannot be resolved to a valid signed URL or Blob
  return null;
}

/**
 * Delete PDF File
 */
export async function deletePDFFile(storagePathOrKey) {
  if (!storagePathOrKey) return;

  if (storagePathOrKey.startsWith('idb_pdf_')) {
    try {
      await deletePdfBlob(storagePathOrKey);
    } catch (err) {
      console.error('Failed deleting IndexedDB blob:', err);
    }
    return;
  }

  if (isSupabaseConfigured && supabase && !storagePathOrKey.startsWith('/pdfs/')) {
    try {
      await supabase.storage.from(BUCKET_NAME).remove([storagePathOrKey]);
    } catch (err) {
      console.error('Supabase private file deletion error:', err);
    }
  }
}
