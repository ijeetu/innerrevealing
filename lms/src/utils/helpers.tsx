"use client"
import { loadMorecategories, updateCategoryOffset } from "@/redux/reducers/categorySlice";
import { setNotificationLoadMore, setNotificationPage } from "@/redux/reducers/nottificationSlice";
import { loadMoreTeamMembers, updateTeamMemberOffset } from "@/redux/instructorReducers/teamMemberSlice";
import { store } from "@/redux/store";
import { BiSolidStar, BiSolidStarHalf } from "react-icons/bi";
import en from "@/utils/locale/en.json";
import toast from "react-hot-toast";

export const getDirection = () => {
  if (typeof document !== "undefined") {
    return document.documentElement.dir || "ltr";
  }
  return "ltr";
};

export const setCateOffset = (value: number) => {
  if (value === 1) {
    store.dispatch(loadMorecategories(true))
    setTimeout(() => {
      store.dispatch(loadMorecategories(false))
    }, 2000);
  }

  const { page } = store.getState().category ?? {};
  store.dispatch(updateCategoryOffset(value === 0 ? 1 : page + 1))
}

// Helper function for notification pagination - similar to setCateOffset
export const setNotificationOffset = (value: number) => {
  if (value === 1) {
    store.dispatch(setNotificationLoadMore(true))
    setTimeout(() => {
      store.dispatch(setNotificationLoadMore(false))
    }, 2000);
  }

  const { page } = store.getState().notification ?? {};
  store.dispatch(setNotificationPage(value === 0 ? 1 : page + 1))
}

// Helper function for team member pagination - similar to setCateOffset
export const setTeamMemberOffset = (value: number) => {
  if (value === 1) {
    store.dispatch(loadMoreTeamMembers(true))
    setTimeout(() => {
      store.dispatch(loadMoreTeamMembers(false))
    }, 2000);
  }

  const { page } = store.getState().teamMember ?? {};
  store.dispatch(updateTeamMemberOffset(value === 0 ? 1 : page + 1))
}


export const getStatusClass = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-[#83B8071F] text-[#83B807]";
    case "Rejected":
      return "bg-[#FF00001F] text-[#FF0000]";
    case "Re-submit":
      return "bg-[#6F42C11F] text-[#6F42C1]";
    case "Pending":
      return "bg-[#0186D81F] text-[#0186D8]";
    default:
      return "";
  }
};

export const renderStarRating = (rating: number, size: "sm" | "lg" = "sm") => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <BiSolidStar
          key={`full-${i}`}
          className={`fill-[#DB9305] text-[#DB9305] ${size === "sm" ? "w-4 h-4" : "w-5 h-5"
            }`}
        />
      ))}
      {hasHalfStar && (
        <BiSolidStarHalf
          className={`fill-[#DB9305] text-[#DB9305] ${size === "sm" ? "w-4 h-4" : "w-5 h-5"
            }`}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <BiSolidStar
          key={`empty-${i}`}
          className={`text-gray-300 ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`}
        />
      ))}
    </div>
  );
};


export const translate = (label: string) => {
  const languageState = store.getState().language;

  // First, check if translation exists in API response (currentTranslations) in Redux store
  if (languageState?.currentTranslations && languageState.currentTranslations[label]) {
    return languageState.currentTranslations[label];
  }

  // Check en.json first, then fallback to label
  if (en[label as keyof typeof en]) {
    return en[label as keyof typeof en];
  }

  // Final fallback - return the label itself if no translation is found
  return label;
}


export const extractApiErrorMessage = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  defaultMessage: string = "An error occurred"
): {
  message: string;
  statusCode: number;
  success: boolean;
} => {
  // Default values
  let errorMessage = defaultMessage;
  let statusCode = 500;
  const success = false;

  // Extract status code
  if (error?.response?.status) {
    statusCode = error.response.status;
  }

  // Extract detailed error message from API response
  if (error?.response?.data) {
    const responseData = error.response.data;

    // Check for direct message in response
    if (responseData.message) {
      errorMessage = responseData.message;
    }
    // Handle validation errors (like 422) with errors object
    else if (responseData.errors) {
      const errors = responseData.errors;
      const errorKeys = Object.keys(errors);

      if (errorKeys.length > 0) {
        // Get the first error message
        const firstError = errors[errorKeys[0]];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      }
    }
    // Handle error object with error property
    else if (responseData.error) {
      errorMessage = responseData.error;
    }
    // Handle error object with details property
    else if (responseData.details) {
      errorMessage = responseData.details;
    }
  }
  // Fallback to error message if no response data
  else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return {
    message: errorMessage,
    statusCode,
    success
  };
};

export const getDiscountPercentage = (price: string, discountPrice: string) => {
  const priceNumber = parseFloat(price);
  const discountPriceNumber = parseFloat(discountPrice);
  const discount = ((priceNumber - discountPriceNumber) / priceNumber) * 100
  return discount.toFixed(0);
}

export const getStatus = (status: string) => {
  switch (status) {
    case "publish":
      return translate("active");
    case "pending":
      return translate("pending");
    case "draft":
      return translate("draft");
    case "rejected":
      return translate("rejected");
    default:
      return translate("draft");
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "publish":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "";
  }
};


export const instructorResourceTypes = [
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "external_url", label: "External URL" },
  { value: "document", label: "Document" },
];

export const getFileType = (fileExtension: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'avif'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];

  const ext = fileExtension.toLowerCase();
  if (ext.startsWith('http://') || ext.startsWith('https://')) {
    return 'url';
  }
  if (imageExtensions.includes(ext)) {
    return 'image';
  } else if (audioExtensions.includes(ext)) {
    return 'audio';
  } else if (videoExtensions.includes(ext)) {
    return 'video';
  } else if (documentExtensions.includes(ext)) {
    return 'document';
  } else {
    return 'unknown';
  }
};

// Helper function to convert due_days to actual date
export const convertDueDaysToDate = (dueDays: number): string => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + (dueDays * 24 * 60 * 60 * 1000));
  return dueDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
};

export const convertDateToDueDays = (date: string): number => {
  const dueDate = new Date(date);
  const today = new Date();
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};


export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

export const formatDateForLessonsOverview = (dateString: string) => {
  const date = new Date(dateString.replace(' ', 'T')); // important
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).replace(' ', ', ').replace(',', '');
};

export const formatedSlug = (slug: string) =>
  slug
    .split(/[-_]/) // split by hyphen or underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractErrorMessage = (error: any) => {
  const msg = 'Something went wrong';
  console.log(msg, error);
  toast.error(msg);
}

// function to handle download of file
export const handleDownload = async (fileUrl: string, fileName?: string) => {
  if (typeof window !== 'undefined') {
    try {
      // Attempt normal fetch (works if CORS or same-origin)
      const response = await fetch(fileUrl);

      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;

      // Guess file extension
      const ext = fileUrl.split('.').pop()?.split('?')[0];
      a.download = fileName || `download.${ext || 'file'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('Fetch failed — using fallback open method:', error);

      // Fallback: works for PNG, JPG, etc. (CORS-safe)
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.setAttribute('download', fileName || '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};


export const getCurrencySymbol = () => {
  const { data } = store.getState().settings;

  return data?.currency_symbol || '$';
}

export const formatCount = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+`;
  }
  return `${count}`;
};


export const extractTextFromHTML = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const allowedVideoTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mpeg",
  "video/3gpp",
  "video/x-ms-wmv"
];

export const allowedDocTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];



export const formatCourseDurationCustom = (totalSeconds: number, t: (key: string) => string) => {
  if (!totalSeconds || totalSeconds === 0) return "";
  const totalHours = totalSeconds / 3600;

  if (totalHours < 24) {
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    let result = "";
    if (h > 0) result += `${h}${t("h")} `;
    if (m > 0 || h === 0) result += `${m}${t("m")}`;
    return result.trim();
  }

  const totalDays = totalHours / 24;

  if (totalDays < 7) {
    const d = Math.floor(totalDays);
    if (totalHours % 24 === 0) {
      return `${d} ${t(d === 1 ? "day" : "days")}`;
    }
    return `${d}-${d + 1} ${t("days")}`;
  }

  if (totalDays < 30) {
    const totalWeeks = totalDays / 7;
    const w = Math.floor(totalWeeks);
    if (totalHours % (24 * 7) === 0) {
      return `${w} ${t(w === 1 ? "week" : "weeks")}`;
    }
    return `${w}-${w + 1} ${t("weeks")}`;
  }

  const totalMonths = totalDays / 30;
  const mo = Math.floor(totalMonths);
  if (totalHours % (24 * 30) === 0) {
    return `${mo} ${t(mo === 1 ? "month" : "months")}`;
  }
  return `${mo}-${mo + 1} ${t("months")}`;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToFile = (base64String: string, filename: string): File | null => {
  try {
    if (!base64String.startsWith('data:')) {
      return null;
    }

    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    return null;
  }
};

export const getDurationLabel = (seconds: number): string => {
  const { data } = store.getState().settings;
  const totalSeconds = seconds;

  if (isNaN(totalSeconds) || totalSeconds < 0) return "Invalid";

  const totalMinutes = totalSeconds / 60;

  const totalHours = totalMinutes > 60 ? totalMinutes / 60 : totalMinutes / 60;
  const weeks = Math.max(1, Math.ceil(totalHours / data.weekly_average_watch_hours));

  if (weeks === 1) return "1 week";
  if (weeks <= 2) return "1 - 2 weeks";
  if (weeks <= 4) return "2 - 4 weeks";
  if (weeks <= 8) return "4 - 8 weeks";
  if (weeks <= 12) return "3 - 4 months";
  if (weeks <= 16) return "4 - 6 months";
  if (weeks <= 20) return "6 - 8 months";
  if (weeks <= 24) return "8 - 10 months";
  if (weeks <= 28) return "10 - 12 months";

  return "12+ months";
};