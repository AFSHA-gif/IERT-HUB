import { DEFAULT_RESOURCES } from '../data/resources';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { uploadPDFFile, deletePDFFile, validatePDFFile } from './storageService';
import { logAdminAction } from './adminLogService';

const STORAGE_KEY = 'iert_hub_resources_v3';

/**
 * Fetch all resources (From Supabase DB if configured, else LocalStorage)
 */
export function getStoredResources() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESOURCES));
    return DEFAULT_RESOURCES;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading resources cache:', err);
    return DEFAULT_RESOURCES;
  }
}

export async function fetchResourcesFromDB() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map database fields to application model
        const mapped = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.category,
          subjectId: item.subject_code,
          subjectName: item.subject_name,
          semester: item.semester || 3,
          unit: item.unit,
          year: item.year,
          experimentNo: item.experiment_number,
          tags: item.tags || [],
          fileName: item.file_name,
          fileUrl: item.file_url,
          storagePath: item.storage_path,
          fileSize: item.file_size,
          uploadedBy: item.uploaded_by || 'admin@iert.ac.in',
          status: item.status || 'Active',
          downloads: item.download_count || 0,
          views: item.views_count || 0,
          createdAt: item.uploaded_at
        }));

        saveResourcesToCache(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase DB fetch failed, using local cache:', err);
    }
  }

  return getStoredResources();
}

export function saveResources(resources) {
  saveResourcesToCache(resources);
}

function saveResourcesToCache(resources) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  window.dispatchEvent(new Event('iert_resources_updated'));
}

export function getResourceById(id) {
  const list = getStoredResources();
  return list.find(r => String(r.id) === String(id)) || null;
}

export async function addResource(newResource) {
  const resourceObj = {
    id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    views: 0,
    downloads: 0,
    status: 'Active',
    uploadedBy: 'admin@iert.ac.in',
    createdAt: new Date().toISOString(),
    ...newResource
  };

  // SUPABASE DB INSERT
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          title: resourceObj.title,
          description: resourceObj.description,
          category: resourceObj.type,
          subject_code: resourceObj.subjectId,
          subject_name: resourceObj.subjectName,
          semester: resourceObj.semester || 3,
          unit: resourceObj.unit,
          year: resourceObj.year,
          experiment_number: resourceObj.experimentNo,
          tags: resourceObj.tags,
          file_name: resourceObj.fileName || resourceObj.title,
          file_url: resourceObj.fileUrl,
          storage_path: resourceObj.storagePath || resourceObj.storageKey,
          file_size: resourceObj.fileSize,
          uploaded_by: resourceObj.uploadedBy || 'admin@iert.ac.in',
          status: resourceObj.status || 'Active'
        }])
        .select();

      if (error) {
        console.error('Supabase DB Insert Error:', error);
      } else if (data && data[0]) {
        resourceObj.id = data[0].id;
      }
    } catch (err) {
      console.error('Cloud DB Insert Exception:', err);
    }
  }

  // Update local cache & dispatch reactive event
  const current = getStoredResources();
  const updated = [resourceObj, ...current];
  saveResourcesToCache(updated);

  logAdminAction('PDF Uploaded', resourceObj.title, 'Resource');

  return resourceObj;
}

export async function addBulkResources(resourcesList) {
  const createdItems = [];
  for (const item of resourcesList) {
    const res = await addResource(item);
    createdItems.push(res);
  }
  logAdminAction('Bulk PDFs Uploaded', `${createdItems.length} resources uploaded`, 'Resource');
  return createdItems;
}

export async function updateResource(id, updatedFields) {
  const current = getStoredResources();
  const index = current.findIndex(r => String(r.id) === String(id));
  if (index === -1) return null;

  const merged = {
    ...current[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('resources')
        .update({
          title: merged.title,
          description: merged.description,
          category: merged.type,
          subject_code: merged.subjectId,
          subject_name: merged.subjectName,
          unit: merged.unit,
          year: merged.year,
          experiment_number: merged.experimentNo,
          tags: merged.tags,
          status: merged.status || 'Active',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (err) {
      console.error('Supabase DB Update Error:', err);
    }
  }

  current[index] = merged;
  saveResourcesToCache(current);

  logAdminAction('Resource Metadata Updated', merged.title, 'Resource');

  return merged;
}

/**
 * Replace PDF file for an existing resource without losing metadata
 */
export async function replaceResourcePDF(id, newFile, onProgress) {
  const current = getStoredResources();
  const index = current.findIndex(r => String(r.id) === String(id));
  if (index === -1) throw new Error('Target resource not found.');

  const target = current[index];
  const oldStoragePath = target.storagePath || target.storageKey;

  // Validate new PDF file
  const val = validatePDFFile(newFile);
  if (!val.valid) throw new Error(val.error);

  const uploadMeta = {
    type: target.type,
    subjectId: target.subjectId,
    unit: target.unit,
    year: target.year
  };

  // Upload new file FIRST to prevent data loss if upload fails
  const uploadRes = await uploadPDFFile(newFile, id, onProgress, uploadMeta);

  // If upload succeeds, remove old storage file object
  if (oldStoragePath && oldStoragePath !== uploadRes.storagePath) {
    await deletePDFFile(oldStoragePath);
  }

  // Update resource record
  const updatedResource = {
    ...target,
    fileUrl: uploadRes.fileUrl,
    storagePath: uploadRes.storagePath || uploadRes.storageKey,
    fileName: uploadRes.fileName,
    fileSize: uploadRes.fileSize,
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('resources')
        .update({
          file_name: uploadRes.fileName,
          file_url: uploadRes.fileUrl,
          storage_path: uploadRes.storagePath,
          file_size: uploadRes.fileSize,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (err) {
      console.error('Supabase DB Replace PDF update error:', err);
    }
  }

  current[index] = updatedResource;
  saveResourcesToCache(current);

  logAdminAction('PDF File Replaced', updatedResource.title, 'Resource');

  return updatedResource;
}

export async function toggleResourceStatus(id) {
  const current = getStoredResources();
  const target = current.find(r => String(r.id) === String(id));
  if (!target) return null;

  const newStatus = target.status === 'Inactive' ? 'Active' : 'Inactive';
  return await updateResource(id, { status: newStatus });
}

export async function deleteResource(id) {
  const current = getStoredResources();
  const target = current.find(r => String(r.id) === String(id));
  
  if (target) {
    await deletePDFFile(target.storagePath || target.storageKey);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('resources').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase DB Delete Error:', err);
    }
  }

  const filtered = current.filter(r => String(r.id) !== String(id));
  saveResourcesToCache(filtered);

  if (target) {
    logAdminAction('Resource Deleted', target.title, 'Resource');
  }

  return true;
}

export async function incrementViewCount(id) {
  const current = getStoredResources();
  const item = current.find(r => String(r.id) === String(id));
  if (item) {
    item.views = (item.views || 0) + 1;
    saveResourcesToCache(current);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('resources')
          .update({ views_count: item.views })
          .eq('id', id);
      } catch (err) {
        console.error('View counter update error:', err);
      }
    }
  }
}

export async function incrementDownloadCount(id) {
  const current = getStoredResources();
  const item = current.find(r => String(r.id) === String(id));
  if (item) {
    item.downloads = (item.downloads || 0) + 1;
    saveResourcesToCache(current);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('resources')
          .update({ download_count: item.downloads })
          .eq('id', id);
      } catch (err) {
        console.error('Download counter update error:', err);
      }
    }
  }
}

export function getAdminAnalytics() {
  const list = getStoredResources();

  const totalResources = list.length;
  const activeResources = list.filter(r => r.status !== 'Inactive').length;
  const totalViews = list.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalDownloads = list.reduce((sum, item) => sum + (item.downloads || 0), 0);

  const byCategory = {
    Notes: list.filter(r => r.type === 'Notes').length,
    'Previous Year Paper': list.filter(r => r.type === 'Previous Year Paper').length,
    'Study Material': list.filter(r => r.type === 'Study Material').length,
    Assignment: list.filter(r => r.type === 'Assignment').length,
    Practical: list.filter(r => r.type === 'Practical').length,
    Syllabus: list.filter(r => r.type === 'Syllabus').length,
    'Important Questions': list.filter(r => r.type === 'Important Questions').length,
    'Reference Material': list.filter(r => r.type === 'Reference Material').length,
  };

  const bySubject = {
    CS301: list.filter(r => r.subjectId === 'CS301').length,
    CS302: list.filter(r => r.subjectId === 'CS302').length,
    CS303: list.filter(r => r.subjectId === 'CS303').length,
    CY301: list.filter(r => r.subjectId === 'CY301').length,
    MA301: list.filter(r => r.subjectId === 'MA301').length,
    HU301: list.filter(r => r.subjectId === 'HU301').length,
  };

  const mostDownloaded = [...list]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 5);

  const recentUploads = [...list]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return {
    totalResources,
    activeResources,
    totalViews,
    totalDownloads,
    byCategory,
    bySubject,
    mostDownloaded,
    recentUploads
  };
}
