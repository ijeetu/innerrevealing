"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { z } from "zod";
import toast from "react-hot-toast";
import { createBillingDetails, BillingDetailsParams } from "@/utils/api/user/billing-details/createBillingDetails";
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { useDispatch, useSelector } from "react-redux";
import { getBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { editBillingDetails } from "@/utils/api/user/billing-details/editBillingDetails";

interface BillingFormData {
    firstName: string;
    lastName: string;
    country: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    gstin: string;
}

export default function BillngDeatilsModal({
    open,
    onOpneChange,
    editUserBillingDetails,
}: {
    open: boolean;
    onOpneChange: (open: boolean) => void;
    editUserBillingDetails?: string;
}) {
    const [formData, setFormData] = useState<BillingFormData>({
        firstName: "",
        lastName: "",
        country: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        gstin: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Partial<BillingFormData>>({});
    const userBillingDetails = useSelector(getBillingDetails);
    const dispatch = useDispatch();

    const { t } = useTranslation();

    // Handle form population on open and reset on close
    useEffect(() => {
        if (open) {
            // Populate form fields if data exists in Redux
            if (userBillingDetails) {
                setFormData({
                    firstName: userBillingDetails.first_name || "",
                    lastName: userBillingDetails.last_name || "",
                    country: userBillingDetails.country_code || "",
                    address: userBillingDetails.address || "",
                    city: userBillingDetails.city || "",
                    state: userBillingDetails.state || "",
                    zipCode: userBillingDetails.postal_code || "",
                    gstin: userBillingDetails.tax_id || "",
                });
            }
        } else {
            // Reset form fields and states when modal closes
            setFormData({
                firstName: "",
                lastName: "",
                country: "",
                address: "",
                city: "",
                state: "",
                zipCode: "",
                gstin: "",
            });
            setErrors({});
            setLoading(false);
        }
    }, [open, userBillingDetails]);

    const schema = z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        country: z.string().min(1, "Country is required"),
        address: z.string().min(1, "Address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State / Province / Region is required"),
        zipCode: z.string().optional(),
        gstin: z.string().optional(),
    });

    const validateForm = () => {
        try {
            schema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Partial<BillingFormData> = {};
                error.errors.forEach((err) => {
                    const fieldName = err.path[0] as keyof BillingFormData;
                    newErrors[fieldName] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleInputChange = (field: keyof BillingFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            const params: BillingDetailsParams = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                country_code: formData.country,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                tax_id: formData.gstin,
            };

            const hasExistingDetails = userBillingDetails && Object.keys(userBillingDetails).length > 0;

            // here is the condition for edit and create billing details
            const response = hasExistingDetails
                ? await editBillingDetails(params)
                : await createBillingDetails(params);

            if (response && !response.error) {
                toast.success(response.message || "Billing details saved successfully");
                onOpneChange(false);
            } else {
                toast.error(response?.message || "Failed to save billing details");
            }
        } catch (error) {
            toast.error("Failed to save billing details");
            console.error("Error saving billing details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpneChange}>
            {/* MODAL */}
            <DialogContent className="sm:max-w-xl p-0 rounded-xl overflow-hidden gap-0 max-h-[calc(100vh-10px)] ">
                {/* HEADER */}
                <DialogHeader className="flex flex-row justify-between px-3 py-4 sm:px-4 sm:py-6 border-b border-[#D8E0E6] text-left">
                    <div>
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-[#010211]">
                            {editUserBillingDetails || t("billing_details")}
                        </DialogTitle>
                        <p className="font-normal text-[14px] text-[#010211]">
                            {t("enter_your_billing_details_required_for_invoicing")}
                        </p>
                    </div>
                    <DialogClose />
                </DialogHeader>

                {/* BODY */}
                <div className="p-4 sm:px-4 sm:py-6 space-y-4 max-h-[85vh] overflow-y-auto customScrollbar">
                    {/* First Name */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("first_name")} <span className="text-[#DB3D26]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.firstName ? "border-red-500" : ""
                                }`}
                            placeholder="Emily"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("last_name")} <span className="text-[#DB3D26]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.lastName ? "border-red-500" : ""
                                }`}
                            placeholder="Denes"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Country */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("country")} <span className="text-[#DB3D26]">*</span>
                        </label>
                        <CountryDropdown
                            value={formData.country}
                            valueType="short"
                            onChange={(val) => {
                                handleInputChange("country", val);
                                handleInputChange("state", ""); // Reset state when country changes
                            }}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.country ? "border-red-500" : ""
                                }`}
                        />
                        {errors.country && (
                            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("address")} <span className="text-[#DB3D26]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.address ? "border-red-500" : ""
                                }`}
                            placeholder="Street 201, near bob bank"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("city")} <span className="text-[#DB3D26]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.city ? "border-red-500" : ""
                                }`}
                            placeholder="Bhuj"
                        />
                        {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                    </div>

                    {/* State / Province / Region */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("state_province_region")} <span className="text-[#DB3D26]">*</span>
                        </label>
                        <RegionDropdown
                            country={formData.country}
                            countryValueType="short"
                            value={formData.state}
                            onChange={(val) => handleInputChange("state", val)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.state ? "border-red-500" : ""
                                }`}
                        />
                        {errors.state && (
                            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                        )}
                    </div>

                    {/* Zip / Postal code */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("zip_postal_code")}
                        </label>
                        <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.zipCode ? "border-red-500" : ""
                                }`}
                            placeholder="370001"
                        />
                        {errors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                        )}
                    </div>

                    {/* GSTIN */}
                    <div>
                        <label className="font-normal text-[14px] text-[#010211] mb-2 block">
                            {t("gstin")}
                        </label>
                        <input
                            type="text"
                            value={formData.gstin}
                            onChange={(e) => handleInputChange("gstin", e.target.value)}
                            className={`w-full border border-[#D8E0E6] rounded-md p-3 text-[14px] font-normal focus:outline-none bg-[#F8F8F9] placeholder:text-[#A2A2A5] ${errors?.gstin ? "border-red-500" : ""
                                }`}
                            placeholder="22AAAA222222A1Z223"
                        />
                        {errors.gstin && (
                            <p className="text-red-500 text-sm mt-1">{errors.gstin}</p>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className={`commonBtn w-full mt-2 ${loading && "opacity-50 cursor-not-allowed"}`}
                    >
                        {loading ? t("Saving") : t("save_and_continue")}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}