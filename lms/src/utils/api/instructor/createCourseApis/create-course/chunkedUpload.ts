import axiosClient from '../../../axiosClient';

export type ChunkUploadProgressCallback = (progress: ChunkUploadProgress) => void;
export interface ChunkUploadProgress {
  uploadedChunks: number; totalChunks: number; percentage: number; bytesUploaded: number;
  totalBytes: number; status: 'preparing' | 'uploading' | 'completed' | 'error' | 'cancelled'; currentChunkIndex: number;
}
export interface ChunkedUploadResult { success: boolean; cancelled?: boolean; videoName?: string; error?: string; data?: Record<string, unknown>; }
export const MAX_LECTURE_BYTES = 50 * 1024 * 1024;

// Keep the supplied progress component's contract while uploading to protected
// local media storage. No browser path or filename is accepted as a media token.
export const shouldUseChunkedUpload = (_file: File): boolean => false;
export async function uploadFileInChunks(file: File, onProgress?: ChunkUploadProgressCallback, _maxChunkSize?: number, signal?: AbortSignal): Promise<ChunkedUploadResult> {
  let bytesUploaded = 0;
  const progress = (status: ChunkUploadProgress['status'], percentage = 0) => onProgress?.({ uploadedChunks: status === 'completed' ? 1 : 0, totalChunks: 1, percentage, bytesUploaded, totalBytes: file.size, status, currentChunkIndex: 1 });
  if (signal?.aborted) return { success: false, cancelled: true };
  if (file.size > MAX_LECTURE_BYTES) return { success: false, error: 'Please choose a lecture file of 50 MB or smaller.' };
  if (!file.size) return { success: false, error: 'The selected file is empty. Please choose another file.' };
  progress('preparing');
  try {
    const form = new FormData(); form.append('file', file); form.append('purpose', 'course');
    const response = await axiosClient.post('/admin/media', form, { timeout: 600000, signal, onUploadProgress(event) {
      bytesUploaded = Math.min(event.loaded, file.size);
      progress('uploading', Math.min(99, Math.round(bytesUploaded / file.size * 100)));
    } });
    if (response.data.error || !Number.isSafeInteger(Number(response.data.data?.id)) || Number(response.data.data.id) < 1) throw new Error(response.data.message || 'The file could not be saved. Please try again.');
    bytesUploaded = file.size;
    progress('completed', 100);
    return { success: true, videoName: `media:${Number(response.data.data.id)}`, data: response.data.data };
  } catch (failure) {
    const error = failure as { name?: string; code?: string; response?: { data?: { message?: string } }; message?: string };
    if (signal?.aborted || error.code === 'ERR_CANCELED' || error.name === 'AbortError') { progress('cancelled'); return { success: false, cancelled: true }; }
    progress('error');
    return { success: false, error: error.response?.data?.message || error.message || 'The upload failed. Please try again.' };
  }
}
