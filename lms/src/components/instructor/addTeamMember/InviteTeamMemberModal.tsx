'use client'
import React, { useState } from 'react'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BiCheckCircle } from 'react-icons/bi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { addNewMember } from '@/utils/api/instructor/team-member/addNewMember'
import { useTranslation } from '@/hooks/useTranslation'
import { extractErrorMessage } from '@/utils/helpers'
import { FiPlusCircle } from 'react-icons/fi'
import { setIsNewMemberAdded } from '@/redux/instructorReducers/teamMemberSlice'

// Define a type for form errors
type FormErrors = {
    email?: string;
};

const InviteTeamMemberModal = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch()
    const [InviteTeamModal, setInviteTeamModal] = useState(false);
    const [email, setEmail] = useState('')
    const [requestSent, setRequestSent] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)

    // Define Zod schema for email validation
    const emailSchema = z.object({
        email: z.string().min(1, t("email_required")).email(t("valid_email_required")),
    });
    // Validate form using Zod
    const validateForm = () => {
        try {
            // Validate form data with Zod schema
            emailSchema.parse({ email });

            // Clear all errors if validation passes
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Convert Zod errors to our error format
                const newErrors: FormErrors = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        const fieldName = err.path[0] as keyof FormErrors;
                        newErrors[fieldName] = err.message;
                    }
                });

                setErrors(newErrors);
            }
            return false;
        }
    };

    // Handle email change with validation
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        // Clear error when user types
        if (errors.email) {
            setErrors({ ...errors, email: "" });
        }
    };

    const handleSendInvite = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Call the add new member API
            const response = await addNewMember({ member_email: email });

            if (response) {
                // Check if API returned an error (error: true in response)
                if (response.error) {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to send invite");
                } else {
                    // Show success message
                    toast.success(response.message || "Invite sent successfully!");
                    dispatch(setIsNewMemberAdded(true));
                    setRequestSent(true);

                    setTimeout(() => {
                        setRequestSent(false)
                    }, 3000)

                    // Reset form
                    setEmail('');
                    setErrors({});
                }
            } else {
                console.log("response is null in component", response);
            }
        } catch (error) {
            extractErrorMessage(error);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div>
            <Dialog open={InviteTeamModal} onOpenChange={setInviteTeamModal} >
                <DialogTrigger>
                    <Button
                        className="primaryBg text-white md:text-xl  font-normal"
                    >
                        <FiPlusCircle />
                        {t("invite_co_instructor")}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-0">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-xl font-semibold">
                            {t("invite_co_instructor")}
                        </DialogTitle>
                    </DialogHeader>

                    {/* divider */}
                    <div className="w-full h-[0.5px] bg-gray-300"></div>

                    <div className="p-5 pt-2">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-200 rounded p-4 w-16 h-16"></div>
                            <div>
                                <h3 className="font-semibold text-base">
                                    {t("invite_co_instructor_via_email")}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {t("enter_email_address_description")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="instructor-email"
                                className="block text-sm font-medium mb-2"
                            >
                                {t("invite_instructor")}
                            </label>
                            <div className="grid grid-cols-12 gap-y-4 sm:gap-2 py-3 rounded-md px-4 sectionBg border borderColor">
                                <input
                                    id="instructor-email"
                                    type="email"
                                    className={`col-span-12 sm:col-span-9 p-0 ${errors.email ? "ring-red-500" : "ring-gray-300"}`}
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                                <Button
                                    className="bg-black text-white col-span-12 sm:col-span-3"
                                    onClick={handleSendInvite}
                                    disabled={isLoading}
                                >
                                    {isLoading ? t("sending") : t("send_invite")}
                                </Button>
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                        {requestSent && (
                            <Alert className="bg-[#83B807] text-white border-none my-4 flex items-center gap-2">
                                <div className="flex items-center justify-center gap-2 w-10 h-10 bg-white rounded-[5px]">
                                    <BiCheckCircle
                                        size={28}
                                        className="text-white  bg-[#83B807] rounded-full"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold">{t("request_sent")}</div>
                                    <AlertDescription className="text-sm text-white">
                                        {t("request_successfully_submitted")}
                                    </AlertDescription>
                                </div>
                                <button
                                    className="ml-auto"
                                    onClick={() => setRequestSent(false)}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </Alert>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default InviteTeamMemberModal
