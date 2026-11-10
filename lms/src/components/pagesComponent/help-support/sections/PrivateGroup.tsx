"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { postPrivateGroupRequest } from "@/utils/api/user/helpdesk/private-group-request/privateGroupRequest";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import { useTranslation } from "@/hooks/useTranslation";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import { useRouter } from "next/navigation";

const PrivateGroup = ({ groupSlug, userRequestStatus }: { groupSlug: string; userRequestStatus: string; }) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isLogin = useSelector(isLoginSelector);

    const currentLanguageCode = useSelector(currentLanguageSelector)
    const [status, setStatus] = useState<string>(userRequestStatus || "none"); // none | pending | rejected | approved
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    // Keep status updated from prop
    useEffect(() => {
        if (userRequestStatus) {
            setStatus(userRequestStatus);
        }
    }, [userRequestStatus]);

    // Send request handler
    const handleSendRequest = async () => {
        if (!isLogin) {
            dispatch(setIsLoginModalOpen(true));
            toast.error(t("login_first"));
            return;
        }

        setLoading(true);
        try {
            const response = await postPrivateGroupRequest({ group_slug: groupSlug });

            if (response.success) {
                toast.success(response.data?.message || t("request_sent_successfully"));
                setStatus("pending"); // set status to pending after success
            } else {
                toast.error(response.message || t("something_went_wrong"));
            }
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error(t("something_went_wrong"));
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back()
    }

    return (
        <div className="flex-grow">
            <div className="p-4 md:p-6 bg-white">
                {/* Back link */}
                <div className="mb-4">
                    <button
                        className="flex items-center text-gray-700 hover:text-gray-900"
                        onClick={() => handleBack()}
                    >
                        <BiArrowBack
                            size={24}
                            className="sectionBg p-1 rounded-full mr-3 rtl:rotate-180"
                        />
                        {t("back_to_discussions")}
                    </button>
                </div>

                <hr className="my-4 border-gray-200" />

                {/* User has NOT sent a request yet Case */}
                {status === "none" && (
                    <div className="flex items-center justify-center">
                        <div className="w-full sectionBg rounded-[5px] p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                {t("private_group")}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {t("you_need_to_send_a_request_to_the_instructor_to_join")}
                            </p>
                            <button
                                className="commonBtn"
                                onClick={handleSendRequest}
                                disabled={loading}
                            >
                                {loading ? t("sending_request") : t("send_request")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Request Pending Case */}
                {status === "pending" && (
                    <div className="flex items-center justify-center mt-4">
                        <div className="w-full sectionBg rounded-[5px] p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                {t("private_group")}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {t("your_request_has_been_sent_successfully_please_wait_for_approval")}
                            </p>
                            <button
                                className="commonBtn bg-[#D8E0E6] hover:bg-[#D8E0E6]"
                                disabled
                            >
                                {t("request_sent")}
                            </button>
                        </div>
                    </div>
                )}


                {/* Request Rejected Case */}
                {status === "rejected" && (
                    <div className="flex items-center justify-center mt-4">
                        <div className="w-fullrounded-[5px] p-6 text-center">
                            <h2 className="text-xl font-semibold mb-2">
                                {t("request_rejected")}
                            </h2>
                            <p className="text-gray-700 mb-4">
                                {t("your_request_to_join_this_private_group_has_been_rejected")}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivateGroup;
