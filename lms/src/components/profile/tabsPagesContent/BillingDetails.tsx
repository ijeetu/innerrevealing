"use client";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useState, useEffect } from "react";
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector, useDispatch } from "react-redux";
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import { createBillingDetails, BillingDetailsParams } from "@/utils/api/user/billing-details/createBillingDetails";
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { getBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { getUserBillingDetails } from "@/utils/api/user/billing-details/getBillingDeatils";
import { setBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { editBillingDetails } from "@/utils/api/user/billing-details/editBillingDetails";

export default function BillingDetails() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const userBillingDetails = useSelector(getBillingDetails);

    // functio to call get-billing-details api
    const fetchUserBillingDetails = async () => {
        try {
            const response = await getUserBillingDetails();
            if (response) {
                if (!response.error) {
                    if (response && !response.error && response.data && Object.keys(response.data).length > 0) {
                        dispatch(setBillingDetails(response.data));
                    } else {
                        dispatch(setBillingDetails(null));
                    }
                } else {
                    console.error("API error fetching billing details:", response.message);
                    toast.error(response.message || "Failed to fetch billing details");
                    dispatch(setBillingDetails(null));
                }
            } else {
                console.log("Response is null in component", response);
                dispatch(setBillingDetails(null));
            }
        } catch (error) {
            extractErrorMessage(error);
            dispatch(setBillingDetails(null));
        }
    };

    // useEffect to call fetchUserBillingDetails function
    useEffect(() => {
        fetchUserBillingDetails();
    }, []);

    // useState for the billing details form
    const [billingData, setBillingData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        country: "",
        city: "",
        state: "",
        zipCode: "",
        gstin: "",
    });

    // useEffect to set the billing details form
    useEffect(() => {
        if (userBillingDetails) {
            setBillingData({
                firstName: userBillingDetails.first_name || "",
                lastName: userBillingDetails.last_name || "",
                address: userBillingDetails.address || "",
                country: userBillingDetails.country_code || "",
                city: userBillingDetails.city || "",
                state: userBillingDetails.state || "",
                zipCode: userBillingDetails.postal_code || "",
                gstin: userBillingDetails.tax_id || "",
            });
        }
    }, [userBillingDetails]);

    // function to create and update the billing details
    const handleUpdateBillingDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setIsUpdating(true);

            const params: BillingDetailsParams = {
                first_name: billingData.firstName,
                last_name: billingData.lastName,
                country_code: billingData.country,
                address: billingData.address,
                city: billingData.city,
                state: billingData.state,
                postal_code: billingData.zipCode,
                tax_id: billingData.gstin,
            };

            const hasExistingDetails = userBillingDetails && Object.keys(userBillingDetails).length > 0;

            const response = hasExistingDetails
                ? await editBillingDetails(params)
                : await createBillingDetails(params);

            if (response && !response.error) {
                toast.success(response.message || "Billing details updated successfully");
            } else {
                toast.error(response?.message || "Failed to update billing details");
            }

        } catch (error) {
            extractErrorMessage(error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        (
            <Layout>
                <div className="sectionBg py-8 md:py-12 border-b borderColor">
                    <div className="container space-y-4">
                        <div className="flexColCenter items-start gap-2">
                            <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
                                {t("billing_details")}
                            </h1>
                        </div>
                        <div className="bg-white rounded-full py-2 px-4 flex-wrap inline-flex items-center gap-1 max-w-full">
                            <Link href={"/"} className="primaryColor" title={t("home")}>
                                {t("home")}
                            </Link>
                            <span>
                                <MdKeyboardArrowRight size={22} />
                            </span>
                            <span>{t("my_profile")}</span>
                            <span>
                                <MdKeyboardArrowRight size={22} />
                            </span>
                            <span>{t("billing_details")}</span>
                        </div>
                    </div>
                </div>

                <div className="sectionBg">
                    <div className="container py-8 md:py-12">
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            <ProfileSidebar />

                            <form className="bg-white flex-1 w-full space-y-3 rounded-[10px]" onSubmit={handleUpdateBillingDetails}>
                                <h2 className="text-xl font-semibold text-gray-800 py-4 px-6 mb-0">
                                    {t("billing_details")}
                                </h2>

                                <hr className="borderColor" />

                                <div className="bg-white rounded-[10px] overflow-hidden p-2 mt-0">
                                    <div className="p-3 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label
                                                    htmlFor="firstName"
                                                    className="block text-sm font-medium text-gray-700 mb-1 requireField"
                                                >
                                                    {t("first_name")}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    placeholder={t("e_g_emily")}
                                                    className="bg-[#F8F8F9] w-full rounded-[4px] p-2 border borderColor text-sm"
                                                    value={billingData.firstName}
                                                    onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="lastName"
                                                    className="block text-sm font-medium text-gray-700 mb-1 requireField"
                                                >
                                                    {t("last_name")}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    placeholder={t("e_g_denes")}
                                                    className="bg-[#F8F8F9] w-full rounded-[4px] p-2 border borderColor text-sm"
                                                    value={billingData.lastName}
                                                    onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="address"
                                                className="block text-sm font-medium text-gray-700 mb-1 requireField"
                                            >
                                                {t("address")}
                                            </label>
                                            <input
                                                type="text"
                                                id="address"
                                                placeholder={t("e_g_street_102_new_bob_bank")}
                                                className="bg-[#F8F8F9] w-full p-2 border borderColor rounded-[4px] text-sm"
                                                value={billingData.address}
                                                onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label
                                                    htmlFor="country"
                                                    className="block text-sm font-medium text-gray-700 mb-1 requireField"
                                                >
                                                    {t("country")}
                                                </label>
                                                <CountryDropdown
                                                    id="country"
                                                    className="bg-[#F8F8F9] w-full p-2 border borderColor rounded-[4px] text-sm focus:outline-none"
                                                    value={billingData.country}
                                                    valueType="short"
                                                    onChange={(val) => setBillingData({ ...billingData, country: val, state: "" })}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="city"
                                                    className="block text-sm font-medium text-gray-700 mb-1 requireField"
                                                >
                                                    {t("city")}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="city"
                                                    placeholder={t("e_g_bhuj")}
                                                    className="bg-[#F8F8F9] w-full p-2 border borderColor rounded-[4px] text-sm"
                                                    value={billingData.city}
                                                    onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label
                                                    htmlFor="state"
                                                    className="block text-sm font-medium text-gray-700 mb-1 requireField"
                                                >
                                                    {t("state_province_region")}
                                                </label>
                                                <RegionDropdown
                                                    id="state"
                                                    country={billingData.country}
                                                    countryValueType="short"
                                                    className="bg-[#F8F8F9] w-full p-2 border borderColor rounded-[4px] text-sm focus:outline-none"
                                                    value={billingData.state}
                                                    onChange={(val) => setBillingData({ ...billingData, state: val })}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="zipCode"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    {t("zip_postal_code")}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="zipCode"
                                                    placeholder={t("e_g_370001")}
                                                    className="bg-[#F8F8F9] w-full p-2 border borderColor rounded-[4px] text-sm"
                                                    value={billingData.zipCode}
                                                    onChange={(e) => setBillingData({ ...billingData, zipCode: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="gstin"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                {t("gstin")}
                                            </label>
                                            <input
                                                type="text"
                                                id="gstin"
                                                placeholder={t("e_g_22aaaa922222a1z223")}
                                                className="bg-[#F8F8F9] w-full p-2 border borderColor rounded-[4px] text-sm"
                                                value={billingData.gstin}
                                                onChange={(e) => setBillingData({ ...billingData, gstin: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-start m-4">
                                        <button
                                            type="submit"
                                            className={`primaryBg hover:primaryBg text-white py-2 px-4 rounded-[4px] transition-colors ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                                            disabled={isUpdating}
                                        >
                                            {t("save_details")}
                                        </button>
                                    </div>
                                </div>


                            </form>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    );
}