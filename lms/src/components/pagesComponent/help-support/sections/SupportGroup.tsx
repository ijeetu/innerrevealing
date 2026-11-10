"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/community/PageHeader";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { checkGroupApproval, CheckGroupApprovalData } from "@/utils/api/user/helpdesk/private-group-request/checkGroupApproval";
import { useSelector } from "react-redux";
import PrivateGroup from "./PrivateGroup";
import GroupAllQuestion from "./GroupAllQuestion";
import SupportGroupSkeleton from "@/components/skeletons/help-support/SupportGroupSkeleton";
import { extractErrorMessage, formatedSlug } from "@/utils/helpers";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { toast } from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { IoChevronDownSharp } from "react-icons/io5";

const SupportGroup: React.FC<{ groupSlug: string }> = ({ groupSlug }) => {

  const currentLanguageCode = useSelector(currentLanguageSelector)
  const { t } = useTranslation();
  // State for the check-group-approval api
  const [checkGroupApprovalData, setCheckGroupApprovalData] = useState<CheckGroupApprovalData | null>(null);
  const [loadingCheckGroupApproval, setLoadingCheckGroupApproval] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const group = checkGroupApprovalData?.group;
  const isPrivate = group?.is_private === 1;
  const isApproved = checkGroupApprovalData?.is_approved;

  // Fetch check-group-approval api data with proper error handling
  const fetchCheckGroupApproval = async () => {
    try {
      setLoadingCheckGroupApproval(true);
      const response = await checkGroupApproval({ group_slug: groupSlug });
      if (response) {
        if (!response.error) {
          if (response.data?.data && response.data?.data.group) {
            setCheckGroupApprovalData(response.data.data);
          } else {
            toast.error(response.message);
            setCheckGroupApprovalData(null);
          }
        } else {
          console.log("API error: ", response.message);
          setCheckGroupApprovalData(null);
        }
      } else {
        setCheckGroupApprovalData(null);
      }
    } catch (error) {
      extractErrorMessage(error);
      setCheckGroupApprovalData(null);
    } finally {
      setLoadingCheckGroupApproval(false);
    }
  }

  // Call API when component mounts or group slug changes
  useEffect(() => {
    if (groupSlug) {
      fetchCheckGroupApproval();
    }
  }, [groupSlug]);


  return (
    <Layout>
      <PageHeader
        title={formatedSlug(groupSlug)}
        description="Discuss course creation, content delivery methods, and best practices for engaging learners."
        breadcrumbs={[
          { label: t("home"), href: `/?lang=${currentLanguageCode}` },
          { label: t("help_support"), href: `/help-support?lang=${currentLanguageCode}` },
          { label: formatedSlug(groupSlug) },
        ]}
      />
        <div className=" bg-[#FFFFFF] border-b border-[#D8E0E6]">
          <div className="mb-6 container mx-auto mt-2 px-6 ">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
               <div>
                <div className="flex justify-between items-start gap-3">
                  <h3 className={`text-lg md:text-xl font-semibold text-gray-900 flex-1 ${isExpanded ? "" : "line-clamp-1"}`} style={{ lineBreak: 'anywhere' }}>
                  {group?.name || formatedSlug(groupSlug)}
                </h3>
                <div 
                  className="flex items-center gap-2 border border-[#010211] rounded-[4px] p-1.5 cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                    <IoChevronDownSharp 
                      size={18} 
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm text-gray-500 transition-all duration-300 ${isExpanded ? "" : "line-clamp-1"}`}>
                    {group?.description}
                  </p>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
         <div className="sectionBg ">
           
        <div className="container mx-auto px-4 ">
          <div className="flex flex-col md:flex-row gap-0">
            {/* Sidebar Component */}
            <CommunitySidebar currentSlug={groupSlug} />
            {loadingCheckGroupApproval ? (
              <div className="flex-grow">
                <SupportGroupSkeleton />
              </div>
            ) : (
              <>
                {isPrivate && !isApproved ? (
                  <PrivateGroup groupSlug={groupSlug} userRequestStatus={checkGroupApprovalData?.user_request_status || ""} />
                ) : (
                  <GroupAllQuestion groupSlug={groupSlug} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportGroup;
