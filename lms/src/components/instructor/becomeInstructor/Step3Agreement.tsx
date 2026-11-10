"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import { useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { WebSettings } from "@/utils/api/general/getSettings";
import { useTranslation } from "@/hooks/useTranslation";
import { becomeInstructorDataSelector } from "@/redux/instructorReducers/becomeInstructor";
import RichTextContent from "@/components/commonComp/RichText";

interface Step3AgreementProps {
  agreementAccepted: boolean;
  setAgreementAccepted: (accepted: boolean) => void;
}

const Step3Agreement: React.FC<Step3AgreementProps> = ({
  agreementAccepted,
  setAgreementAccepted,
}) => {

  const settingsData = useSelector(settingsSelector);
  const becomeInstructorData = useSelector(becomeInstructorDataSelector);
  const { t } = useTranslation();

  // Cast data to SettingsData type since we know its structure
  const data = settingsData.data as unknown as WebSettings;
  const companyName = settingsData?.data?.app_name;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6">
      <div className="prose prose-sm max-w-none dark:prose-invert overflow-y-auto max-h-[400px] p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
        {becomeInstructorData.instructorType === 'individual' ? (
          <div>
            <RichTextContent content={data?.individual_instructor_terms || ""} />
          </div>
        ) : (
          <div>
            <RichTextContent content={data?.team_instructor_terms || ""} />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mt-6">
        <Checkbox
          id="agreement-checkbox"
          checked={agreementAccepted}
          onCheckedChange={(checked: boolean | "indeterminate") => {
            setAgreementAccepted(Boolean(checked));
          }}
          className="border-gray-400 dark:border-gray-500 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
        />
        <label
          htmlFor="agreement-checkbox"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {t("instructor_agreement_text")}{" "}{companyName}.
        </label>
      </div>
    </div>
  );
};

export default Step3Agreement;
