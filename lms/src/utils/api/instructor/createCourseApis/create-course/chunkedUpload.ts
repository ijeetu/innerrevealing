import axiosClient from "../../../axiosClient";
import { curriculumLectureUploadApiRoute } from '@/utils/apiRoutes';




export type ChunkUploadProgressCallback = (progress: ChunkUploadProgress) => void;

export interface ChunkUploadProgress {
  uploadedChunks: number;
  totalChunks: number;
  percentage: number;
  bytesUploaded: number;
  totalBytes: number;
  status: 'preparing' | 'uploading' | 'completed' | 'error' | 'cancelled';
  currentChunkIndex: number;
}

export interface ChunkedUploadResult {
  success: boolean;
  cancelled?: boolean;
  videoName?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}



const MAX_RETRIES = 3;

const RETRY_DELAY_MS = 2000;


interface FileChunk {
  blob: Blob;

  chunkNumber: number;
  start: number;
  end: number;
}

let CHUNK_SIZE = 100 * 1024 * 1024;


const splitFileIntoChunks = (file: File, maxChunkSize?: number): FileChunk[] => {

  // CHUNK_SIZE = maxChunkSize ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const chunks: FileChunk[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push({
      blob: file.slice(start, end),
      chunkNumber: i + 1,
      start,
      end,
    });

  }

  return chunks;
};


const generateResumableIdentifier = (file: File): string => {
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${file.size}-${sanitized}-${Date.now()}`;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isCancelledError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  return e['name'] === 'AbortError' || e['code'] === 'ERR_CANCELED' || e['__CANCEL__'] === true;
};

const uploadSingleChunk = async (
  chunk: FileChunk,
  fileName: string,
  resumableIdentifier: string,
  totalChunks: number,
  retries = MAX_RETRIES,
  signal?: AbortSignal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; cancelled?: boolean; data?: any }> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    if (signal?.aborted) return { success: false, cancelled: true };

    try {
      const formData = new FormData();
      formData.append("resumableChunkNumber", chunk.chunkNumber.toString());
      formData.append("resumableTotalChunks", totalChunks.toString());
      formData.append("resumableIdentifier", resumableIdentifier);
      formData.append("resumableFilename", fileName);
      formData.append("file", chunk.blob, fileName);

      const response = await axiosClient.post(curriculumLectureUploadApiRoute, formData, {
        timeout: 600000,
        signal,
      });
      if (response.data && !response.data.error) {
        return { success: true, data: response.data };
      }
    } catch (error) {
      if (isCancelledError(error)) return { success: false, cancelled: true };
      console.error(
        `[ChunkedUpload] ❌ Chunk ${chunk.chunkNumber}/${totalChunks} upload error (attempt ${attempt}/${retries}):`,
        error instanceof Error ? error.message : String(error),
      );
    }

    if (attempt < retries) {
      const waitMs = RETRY_DELAY_MS * attempt;
      console.log(`[ChunkedUpload] Retrying chunk ${chunk.chunkNumber} in ${waitMs}ms...`);
      await delay(waitMs);
    }
  }

  return { success: false };
};


export const shouldUseChunkedUpload = (file: File): boolean => {
  return file.size > CHUNK_SIZE;
};

export const uploadFileInChunks = async (
  file: File,
  onProgress?: ChunkUploadProgressCallback,
  maxChunkSize?: number,
  signal?: AbortSignal,
): Promise<ChunkedUploadResult> => {
  try {

    const chunks = splitFileIntoChunks(file, maxChunkSize);
    const totalChunks = chunks.length;
    const resumableIdentifier = generateResumableIdentifier(file);


    onProgress?.({
      uploadedChunks: 0,
      totalChunks,
      percentage: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: 'preparing',
      currentChunkIndex: 0,
    });


    let bytesUploaded = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastResponseData: any = null;

    for (let i = 0; i < totalChunks; i++) {
      if (signal?.aborted) {
        onProgress?.({ uploadedChunks: i, totalChunks, percentage: Math.round((i / totalChunks) * 100), bytesUploaded, totalBytes: file.size, status: 'cancelled', currentChunkIndex: i });
        return { success: false, cancelled: true };
      }

      const chunk = chunks[i];

      onProgress?.({
        uploadedChunks: i,
        totalChunks,
        percentage: Math.round((i / totalChunks) * 100),
        bytesUploaded,
        totalBytes: file.size,
        status: 'uploading',
        currentChunkIndex: chunk.chunkNumber,
      });

      const result = await uploadSingleChunk(chunk, file.name, resumableIdentifier, totalChunks, MAX_RETRIES, signal);

      if (result.cancelled) {
        onProgress?.({ uploadedChunks: i, totalChunks, percentage: Math.round((i / totalChunks) * 100), bytesUploaded, totalBytes: file.size, status: 'cancelled', currentChunkIndex: chunk.chunkNumber });
        return { success: false, cancelled: true };
      }

      if (!result.success) {
        onProgress?.({
          uploadedChunks: i,
          totalChunks,
          percentage: Math.round((i / totalChunks) * 100),
          bytesUploaded,
          totalBytes: file.size,
          status: 'error',
          currentChunkIndex: chunk.chunkNumber,
        });

        return {
          success: false,
          error: `Failed to upload chunk ${chunk.chunkNumber}/${totalChunks} after ${MAX_RETRIES} retries`,
        };
      }

      bytesUploaded += chunk.blob.size;
      lastResponseData = result.data;
    }


    const videoName =
      lastResponseData?.data?.video_name ||
      lastResponseData?.data?.file_name ||
      lastResponseData?.data?.filename ||
      lastResponseData?.video_name ||
      lastResponseData?.file_name ||
      lastResponseData?.filename ||
      null;


    onProgress?.({
      uploadedChunks: totalChunks,
      totalChunks,
      percentage: 100,
      bytesUploaded: file.size,
      totalBytes: file.size,
      status: 'completed',
      currentChunkIndex: totalChunks,
    });

    if (videoName) {
      return {
        success: true,
        videoName,
        data: lastResponseData?.data || lastResponseData,
      };
    }


    return {
      success: true,
      videoName: undefined,
      data: lastResponseData?.data || lastResponseData,
    };
  } catch (error) {
    console.error("Chunked upload error:", error);

    onProgress?.({
      uploadedChunks: 0,
      totalChunks: 0,
      percentage: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      status: 'error',
      currentChunkIndex: 0,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Chunked upload failed",
    };
  }
};


