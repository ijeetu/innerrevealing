"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { Notification } from "@/utils/api/user/notification/getNotification";
import { useState } from "react";
import CustomImageTag from "../commonComp/customImage/CustomImageTag";
import { acceptInvitation } from "@/utils/api/user/team-invitation/acceptInvitation";
import { useDispatch, useSelector } from "react-redux";
import { userDataSelector } from "@/redux/reducers/userSlice";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { useRouter } from "next/navigation";
import { isInvitationStatusUpdated } from "@/redux/reducers/nottificationSlice";
import { setInstructorNotificationStatus } from "@/redux/reducers/helpersReducer";

interface TeamInvitationModalProps {
    notification: Notification;
    invitationToken: string;
}

const TeamInvitationModal = ({ notification, invitationToken }: TeamInvitationModalProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);
    const userData = useSelector(userDataSelector) as UserDetails;
    const isInstructor = userData?.is_instructor;
    const instructorStatus = userData?.instructor_process_status;
    const instructorDetails = notification.instructor_details;
    const router = useRouter();

    // Handle invitation accept/reject function with proper error handling
    const handleInvitation = async (action: "accept" | "reject") => {
        if (instructorStatus === "pending") {
            toast.error(t("application_pending"));
            return;
        }
        if (!isInstructor) {
            toast.error(t("become_an_instructor_first"));
            router.push(`/become-instructor/process`);
            return;
        }
        try {
            setLoadingAction(action);
            if (!invitationToken) {
                toast.error("Invitation token not found");
                return;
            }

            const response = await acceptInvitation({
                action: action,
                invitation_token: invitationToken,
            });

            if (response) {
                // Check if API returned an error (error: true in response)
                if (response.error) {
                    console.log("API error:", response.message);
                    toast.error(response.message || `Failed to ${action} invitation`);
                } else {
                    // Show success message
                    const successMessage = action === "accept"
                        ? "Invitation accepted successfully"
                        : "Invitation rejected successfully";
                    toast.success(response.message || successMessage);
                    // Close the modal after successful action
                    if (isInstructor) {
                        dispatch(setInstructorNotificationStatus(true));
                    }
                    setIsOpen(false);
                    dispatch(isInvitationStatusUpdated(true));
                    setTimeout(() => {
                        dispatch(isInvitationStatusUpdated(false));
                    }, 2000);
                }
            } else {
                console.log("response is null in component", response);
            }
        } catch (error) {
            extractErrorMessage(error);
        } finally {
            setLoadingAction(null);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="w-full">
                <div className="flex items-start justify-end gap-3">
                    <div className="h-14 border-l border-gray-300 lg:block hidden"></div>
                    <button className="bg-black text-white py-1 px-2 rounded-md text-sm min-[400px]:w-max w-full">
                        {t("view_request")}
                    </button>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[532px] rounded-2xl p-0 shadow-lg">
                <DialogHeader className="border-b border-gray-200 px-6 py-4">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        {t("invitation_request")}
                    </DialogTitle>
                    <DialogDescription className="hidden">
                        {t("invitation_details_for_joining_a_team")}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 space-y-6">
                    <div className="grid grid-cols-12 gap-4">
                        <div
                            className="col-span-2 rounded-md bg-gray-200 w-full h-[71px]"
                            aria-hidden="true"
                        >
                            <CustomImageTag
                                src={instructorDetails?.profile || ""}
                                alt={instructorDetails?.name || "Instructor"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="col-span-10 space-y-2">
                            <p className="text-base font-semibold text-gray-900">
                                {instructorDetails?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                {instructorDetails?.name} {t("has_invited_you")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-baseline w-full gap-4">
                        <button
                            type="button"
                            disabled={loadingAction !== null}
                            className="w-full primaryBg text-white py-2 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleInvitation("accept")}
                        >
                            {loadingAction === "accept" ? t("loading") : t("accept")}
                        </button>
                        <button
                            type="button"
                            disabled={loadingAction !== null}
                            className="w-full border py-2 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleInvitation("reject")}
                        >
                            {loadingAction === "reject" ? t("loading") : t("decline")}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TeamInvitationModal;
