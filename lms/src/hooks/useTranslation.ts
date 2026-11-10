import { useSelector } from "react-redux";
import { currentLanguageSelector, currentTranslationsSelector } from "@/redux/reducers/languageSlice";
import en from "@/utils/locale/en.json";

// Simple translation hook
export const useTranslation = () => {
  const currentLanguage = useSelector(currentLanguageSelector);
  const currentTranslations = useSelector(currentTranslationsSelector);

  // Simple translation function with fallback
  const t = (label: string): string => {
    // Try API translations first
    if (currentTranslations?.[label]) {
      return currentTranslations[label];
    }

    // Fallback to en.json
    if (en[label as keyof typeof en]) {
      return en[label as keyof typeof en];
    }

    return label;
  };

  return { t, currentLanguage };
};
