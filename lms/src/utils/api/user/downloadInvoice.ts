import axiosClient from "../axiosClient";
import { downloadInvoiceApiRoute } from '@/utils/apiRoutes';



export const downloadInvoice = async (orderId: string | number): Promise<Blob | null> => {
  try {
    console.log('=== Starting Invoice Download ===');
    console.log('Order ID:', orderId);

    // Create FormData for the request
    const formData = new FormData();
    formData.append('order_id', orderId.toString());

    const response = await axiosClient.post(downloadInvoiceApiRoute, formData, {
      responseType: 'blob', // Essential for PDF download
      timeout: 30000, // 30 second timeout
    });


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
        
        // Handle specific error cases
        if (jsonData.error && jsonData.message) {
          if (jsonData.message.includes('Order not found or not completed')) {
            throw new Error('ORDER_NOT_COMPLETED');
          } else if (jsonData.message.includes('not found')) {
            throw new Error('ORDER_NOT_FOUND');
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
        if (e instanceof Error && (e.message.startsWith('ORDER_') || e.message.startsWith('API_ERROR'))) {
          throw e; // Re-throw our custom errors
        }
        console.log('Received string response:', response.data);
        throw new Error(`API returned unexpected string response: ${response.data}`);
      }
    }

    throw new Error('Unexpected response type from API');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('=== Invoice Download Error ===');
    console.error('Error:', error);
    
    if (error.response) {
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Data:', error.response.data);
    }
    
    return null;
  }
};

export const downloadAndSaveInvoice = async (
  orderId: string | number, 
  orderNumber: string
): Promise<boolean> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.error('downloadAndSaveInvoice can only be called in browser environment');
    return false;
  }

  try {
    
    const pdfBlob = await downloadInvoice( orderId);
    
    if (!pdfBlob) {
      throw new Error('Failed to download invoice - No PDF blob received from API');
    }

    // Verify the blob has content
    if (pdfBlob.size === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    // Create download link with proper MIME type
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename with proper sanitization
    const sanitizedOrderNumber = orderNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `invoice-${sanitizedOrderNumber}.pdf`;
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
    
    console.log(`Invoice download initiated: ${filename}`);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error saving invoice:', error);
    
    // Show user-friendly error message
    if (error.message) {
      console.error('Error details:', error.message);
      
      // Log specific error message for debugging
      if (error.message === 'ORDER_NOT_COMPLETED') {
        console.error('Order not completed: Cannot download invoice for incomplete orders.');
      } else if (error.message === 'ORDER_NOT_FOUND') {
        console.error('Order not found: This order does not exist.');
      } else if (error.message === 'NO_PERMISSION') {
        console.error('No permission: You do not have permission to download this invoice.');
      } else if (error.message.includes('HTML error page')) {
        console.error('Server error: The invoice service is currently unavailable. Please try again later or contact support.');
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        console.error('Authentication error: Please log in again and try downloading the invoice.');
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        console.error('Invoice not found: This invoice may not exist or you may not have permission to download it.');
      } else {
        console.error(`Download failed: ${error.message}`);
      }
    }
    
    return false;
  }
};