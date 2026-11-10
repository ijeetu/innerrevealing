import axiosClient from "@/utils/api/axiosClient";
import { certificateCourseDownloadApiRoute } from '@/utils/apiRoutes';


/**
 * Download a certificate PDF from the API
 * @param courseId - Certificate ID to download
 * @returns Promise with certificate PDF blob or null if error
 */
export const downloadCertificate = async (
  courseId: string | number
): Promise<Blob | null> => {
  try {
    console.log('=== Starting Certificate Download ===');
    console.log('Certificate ID:', courseId);

    // Create FormData for the request
    const formData = new FormData();
    formData.append('course_id', courseId.toString());

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation: /api/certificate/course/download
    const response = await axiosClient.post(certificateCourseDownloadApiRoute, formData, {
      responseType: 'blob', // Essential for PDF download
      timeout: 30000, // 30 second timeout
    });

    console.log('=== API Response Details ===');
    console.log('Response Status:', response.status);
    console.log('Response Data Type:', typeof response.data);
    console.log('Response Data Size:', response.data?.size || 'unknown');

    // Check if we got a blob (PDF file)
    if (response.data instanceof Blob) {
      // Check if it's actually a PDF by looking at the content type
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      console.log('Content-Type:', contentType);

      // For PDF files, we should return the blob directly without converting to text
      // Converting to text and back can corrupt binary data
      if (contentType && typeof contentType === 'string' && contentType.includes('application/pdf')) {
        console.log('✅ Confirmed PDF content type');
        return response.data;
      }

      // If content type is not set or unclear, check the first few bytes
      const firstBytes = await response.data.slice(0, 4).arrayBuffer();
      const firstBytesArray = new Uint8Array(firstBytes);
      const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF in bytes

      const isPDF = firstBytesArray.every((byte, index) => byte === pdfSignature[index]);

      if (isPDF) {
        console.log('✅ Confirmed PDF by signature');
        return response.data;
      } else {
        // Only check for HTML if it's not a PDF
        const text = await response.data.text();
        console.log('First 200 characters of response:', text.substring(0, 200));

        if (text.includes('<html') || text.includes('<!DOCTYPE')) {
          console.error('❌ Received HTML instead of PDF - likely an error page');
          console.error('Full HTML response:', text);
          throw new Error('Server returned HTML error page instead of PDF');
        } else {
          console.error('❌ Blob does not contain PDF content');
          console.error('Response content:', text);
          throw new Error('Server did not return a valid PDF file');
        }
      }
    }

    // If we got JSON instead of blob, handle the error response
    if (typeof response.data === 'string') {
      try {
        const jsonData = JSON.parse(response.data);
        console.log('Received JSON error response:', jsonData);

        // Handle specific error cases
        if (jsonData.error && jsonData.message) {
          if (jsonData.message.includes('Certificate not found') || jsonData.message.includes('not found')) {
            throw new Error('CERTIFICATE_NOT_FOUND');
          } else if (jsonData.message.includes('permission') || jsonData.message.includes('unauthorized')) {
            throw new Error('NO_PERMISSION');
          } else {
            throw new Error(`API_ERROR: ${jsonData.message}`);
          }
        } else {
          throw new Error(`API returned JSON error: ${JSON.stringify(jsonData)}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e instanceof Error && (e.message.startsWith('CERTIFICATE_') || e.message.startsWith('API_ERROR'))) {
          throw e; // Re-throw our custom errors
        }
        console.log('Received string response:', response.data);
        throw new Error(`API returned unexpected string response: ${response.data}`);
      }
    }

    throw new Error('Unexpected response type from API');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('=== Certificate Download Error ===');
    console.error('Error:', error);

    if (error.response) {
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Data:', error.response.data);
    }

    return null;
  }
};

/**
 * Download and save certificate PDF to user's device
 * @param courseId - Certificate ID to download
 * @param certificateTitle - Optional certificate title for filename
 * @returns Promise with boolean indicating success or failure
 */
export const downloadAndSaveCertificate = async (
  courseId: string | number,
  certificateTitle?: string
): Promise<boolean> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.error('downloadAndSaveCertificate can only be called in browser environment');
    return false;
  }

  try {
    console.log(`Starting certificate download for certificate ${courseId}`);

    const pdfBlob = await downloadCertificate(courseId);

    if (!pdfBlob) {
      throw new Error('Failed to download certificate - No PDF blob received from API');
    }

    // Verify the blob has content
    if (pdfBlob.size === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    console.log(`PDF blob size: ${pdfBlob.size} bytes`);

    // Create download link with proper MIME type
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;

    // Set filename with proper sanitization
    const sanitizedTitle = certificateTitle
      ? certificateTitle.replace(/[^a-zA-Z0-9-_]/g, '_')
      : `courseId-${courseId}`;
    const filename = `${sanitizedTitle}.pdf`;
    link.download = filename;

    // Ensure the link has proper attributes
    link.setAttribute('type', 'application/pdf');
    link.style.display = 'none';

    // Add link to DOM temporarily
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup immediately after click
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log(`Certificate download initiated: ${filename}`);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error saving certificate:', error);

    // Show user-friendly error message
    if (error.message) {
      console.error('Error details:', error.message);

      // Log specific error message for debugging
      if (error.message === 'CERTIFICATE_NOT_FOUND') {
        console.error('Certificate not found: This certificate does not exist.');
      } else if (error.message === 'NO_PERMISSION') {
        console.error('No permission: You do not have permission to download this certificate.');
      } else if (error.message.includes('HTML error page')) {
        console.error('Server error: The certificate service is currently unavailable. Please try again later or contact support.');
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        console.error('Authentication error: Please log in again and try downloading the certificate.');
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        console.error('Certificate not found: This certificate may not exist or you may not have permission to download it.');
      } else {
        console.error(`Download failed: ${error.message}`);
      }
    }

    return false;
  }
};
