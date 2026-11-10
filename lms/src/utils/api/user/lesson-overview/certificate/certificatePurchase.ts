import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { purchaseCertificateApiRoute } from "@/utils/apiRoutes";

// Interface for certificate purchase order data (matches API response)
export interface CertificatePurchaseOrderData {
  order_id: number;
  order_number: string;
  course_id: number;
  course_title: string;
  certificate_fee: number;
  payment_method: string;
  status: string;
  payment_url: string;
  created_at: string;
}

// Use the common ApiResponse interface for consistent response handling
export type CertificatePurchaseResponse = ApiResponse<CertificatePurchaseOrderData>;

// Interface for API parameters (matches the API documentation)
export interface CertificatePurchaseParams {
  course_id: number;
  payment_method: "wallet" | "stripe" | "flutterwave" | "razorpay";
  type: "web" | "app";
}

/**
 * Purchase a certificate for a course from the API
 * @param params - Parameters for the certificate purchase request
 * @returns Promise with certificate purchase data or null if error
 */
export const purchaseCertificate = async (
  params: CertificatePurchaseParams
): Promise<CertificatePurchaseResponse | null> => {
  try {
    // Create FormData object for the POST request
    const formData = new FormData();

    // Add required parameters to FormData (as shown in API documentation)
    formData.append('course_id', params.course_id.toString());
    formData.append('payment_method', params.payment_method);
    formData.append('type', params.type);

    // Send the POST request to the backend API with FormData
    // Using the correct endpoint from the API documentation: purchaseCertificateApiRoute
    const response = await axiosClient.post<CertificatePurchaseResponse>(purchaseCertificateApiRoute, formData);

    // Always return the response data, even if error: true
    // This allows the component to handle API errors properly
    return response.data;
  } catch (error) {
    // Handle both HTTP errors (422, 500, etc.) and network errors
    const axiosError = error as { response?: { data?: CertificatePurchaseResponse } };
    console.log("Error in purchaseCertificate:", axiosError?.response?.data);

    // If it's an HTTP error with response data, return the API error response
    if (axiosError?.response?.data) {
      return axiosError.response.data;
    }

    // If it's a network error (no response), return null
    return null;
  }
};
