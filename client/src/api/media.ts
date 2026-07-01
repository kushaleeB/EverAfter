import { apiUpload, ApiError, isSuccessStatus } from '@/lib/api';
import { API_BASE, resolveMediaUrl } from '@/lib/apiBase';
import { getAccessToken } from '@/lib/auth';
import { refreshAccessToken } from '@/lib/tokenRefresh';
import { useAuthStore } from '@/stores/authStore';

export interface MediaAsset {
  id: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

function extractMediaPayload(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const nested = record.data;

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }

  if (record.id && (record.fileUrl || record.file_url)) {
    return record;
  }

  return null;
}

function normalizeMediaAsset(data: Record<string, unknown>): MediaAsset {
  const fileUrl = data.fileUrl ?? data.file_url;
  const fileName = data.fileName ?? data.file_name;
  const mimeType = data.mimeType ?? data.mime_type;

  if (!data.id || !fileUrl) {
    throw new ApiError('Upload succeeded but the server returned an invalid response.', 200);
  }

  return {
    id: String(data.id),
    fileUrl: resolveMediaUrl(String(fileUrl)),
    fileName: String(fileName ?? 'upload.jpg'),
    mimeType: String(mimeType ?? 'image/jpeg'),
  };
}

async function parseUploadResponse(xhr: XMLHttpRequest): Promise<MediaAsset> {
  if (xhr.status === 0) {
    throw new ApiError(
      'Unable to reach the API server. Make sure `npm run dev` is running and port 3001 is free.',
      0,
    );
  }

  let body: unknown = null;
  try {
    body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
  } catch {
    if (isSuccessStatus(xhr.status)) {
      throw new ApiError('Upload succeeded but the server returned an invalid response.', xhr.status);
    }
    throw new ApiError('Invalid server response.', xhr.status);
  }

  if (!isSuccessStatus(xhr.status)) {
    const record = body as { error?: { message?: string } } | null;
    throw new ApiError(record?.error?.message ?? `Upload failed (${xhr.status}).`, xhr.status);
  }

  const payload = extractMediaPayload(body);
  if (!payload) {
    const record = body as { error?: { message?: string }; success?: boolean } | null;
    if (record?.success === false) {
      throw new ApiError(record.error?.message ?? 'Upload failed.', xhr.status);
    }
    throw new ApiError('Upload succeeded but the server did not return file data.', xhr.status);
  }

  return normalizeMediaAsset(payload);
}

function uploadEventMediaWithProgressInternal(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
  invitationId: string | undefined,
  skipAuthRetry: boolean,
): Promise<MediaAsset> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    if (invitationId) {
      formData.append('invitationId', invitationId);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${path}`);

    const token = getAccessToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      void (async () => {
        try {
          if (xhr.status === 401 && !skipAuthRetry) {
            const session = await refreshAccessToken();
            if (session) {
              useAuthStore.getState().setSession(session);
              resolve(
                await uploadEventMediaWithProgressInternal(
                  path,
                  file,
                  onProgress,
                  invitationId,
                  true,
                ),
              );
              return;
            }
            useAuthStore.getState().clearSession();
          }

          resolve(await parseUploadResponse(xhr));
        } catch (error) {
          reject(error);
        }
      })();
    };

    xhr.onerror = () => {
      reject(
        new ApiError(
          'Network error during upload. Check that the API server is running on port 3001.',
          0,
        ),
      );
    };

    xhr.send(formData);
  });
}

export function uploadEventMedia(eventId: string, file: File, invitationId?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (invitationId) {
    formData.append('invitationId', invitationId);
  }
  return apiUpload<MediaAsset>(`/events/${eventId}/media`, formData);
}

export function uploadEventMediaWithProgress(
  eventId: string,
  file: File,
  onProgress: (percent: number) => void,
  invitationId?: string,
): Promise<MediaAsset> {
  return uploadEventMediaWithProgressInternal(
    `/events/${eventId}/media`,
    file,
    onProgress,
    invitationId,
    false,
  );
}
