"use client";
import { Button } from "@/components/ui/button";
import { IoArrowBackOutline } from "react-icons/io5";
import Layout from "./Layout";
// import Layout from "@/components/layout/Layout";
import { setUserData, setUserLastFetch, userDataSelector } from "@/redux/reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { User } from "../courses/types";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { isInstructorFromResubmitSelector, setFetchUserDeatils, setIsInstructorFromResubmit } from "@/redux/reducers/helpersReducer";
import pendingImg from "@/assets/images/becom-instructor/ApplicationReview.svg";
import rejectedImg from "@/assets/images/becom-instructor/ApplicationRejected.svg";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import ThemeSvg from "@/components/commonComp/customImage/ThemeSvg";
import { getUserDetails, UserDetails } from "@/utils/api/user/getUserDetails";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { BiSolidErrorCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";

export default function SubmitApplication() {
  const router = useRouter();
  const userData = useSelector(userDataSelector) as User;
  const { t } = useTranslation();
  const isInstructorFromResubmit = useSelector(isInstructorFromResubmitSelector);
  const dispatch = useDispatch();



  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await getUserDetails();

      if (response) {
        if (!response.error) {
          if (response.data) {
            const data: UserDetails = response.data;
            dispatch(setUserData(data));
            dispatch(setUserLastFetch(Date.now()));

            if (isInstructorFromResubmit) {
              dispatch(setIsInstructorFromResubmit(false));
            }

            if (data?.is_instructor && data?.instructor_process_status === "approved") {
              router.push(`/instructor/dashboard?lang=${currentLanguageCode}`);
            }
          } else {
            console.log('No user details data found in response');
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch user details");
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);

    }
    finally {
      dispatch(setFetchUserDeatils(false));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const chnageIsInstructorFromResubmit = () => {
    dispatch(setIsInstructorFromResubmit(true));
  }

  const currentLanguageCode = useSelector(currentLanguageSelector);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-800" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto h-screen container min-h-[518px]">
        {/* Placeholder for an icon or image */}
        {userData?.instructor_process_status === 'rejected' &&
          <div className="bg-[#DB3D261F] w-full p-4 rounded-lg text-[#DB3D26] flex flex-row items-center justify-center gap-2 text-sm">
            <div className="bg-[#DB3D26] text-white p-2 rounded-md flex items-center justify-center">
              <BiSolidErrorCircle size={20} />
            </div>
            {userData?.instructor_details?.reason}
          </div>
        }

        <div className="w-full h-[254px] lg:w-[400px] lg:h-[400px] flex items-center justify-center mb-6">
          <ThemeSvg
            src={userData?.instructor_process_status === 'pending'
              || isInstructorFromResubmit ? pendingImg : userData?.instructor_process_status === 'rejected'
                || isInstructorFromResubmit ? rejectedImg : pendingImg}
            alt="pending-img"
            colorMap={{
              "#5A5BB5": "var(--primary-color)",
              "#04294C": "var(--hover-color)",
              "#EEF2FA": "var(--primary-light-color)",
            }}
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3">

          {
            `${t("your_application_is")} ${userData?.instructor_process_status === "pending" || isInstructorFromResubmit
              ? t("under_review")
              : userData?.instructor_process_status === "rejected" || isInstructorFromResubmit
                ? t("rejected")
                : userData?.instructor_process_status === "suspended" || isInstructorFromResubmit
                  ? t("suspended")
                  : ""
            }`


          }
        </h1>
        <p className="mb-6 text-sm leading-relaxed">
          {

            userData?.instructor_process_status === 'pending' || isInstructorFromResubmit
              ? t("thank_you_submitting_application")
              : userData?.instructor_process_status === 'rejected' || isInstructorFromResubmit
                ? t("your_application_rejected")
                : userData?.instructor_process_status === 'suspended' || isInstructorFromResubmit
                  ? t("your_account_suspended")
                  : ""

          }
        </p>
        <div className="flexCenter gap-6 flex-wrap">
          <Link href="/">
            <Button
              className={`${userData?.instructor_process_status === 'rejected' ? 'bg-transparent text-black border hover:bg-transparent' : 'bg-black text-white hover:bg-gray-800'} px-6 py-2 flex items-center gap-2 rounded-md transition-colors`}
            >
              <IoArrowBackOutline /> {t("go_back")}
            </Button>
          </Link>
          {
            (userData?.instructor_process_status === 'rejected' && !isInstructorFromResubmit) &&
            <Link href={`/become-instructor/process?lang=${currentLanguageCode}`}>
              <Button
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 flex items-center gap-2 rounded-md transition-colors"
                onClick={chnageIsInstructorFromResubmit}
              >
                {t("resubmit")}
              </Button>
            </Link>
          }
        </div>
      </div>
    </Layout>
  );
}
