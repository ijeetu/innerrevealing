"use client";
import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BiSearchAlt } from "react-icons/bi";
import DashboardBreadcrumb from "@/components/instructor/commonCommponents/instructorBreadcrumb/DashboardBreadcrumb";
import InviteTeamMemberModal from "./InviteTeamMemberModal";
import ViewAllCourses from "./ViewAllCourses";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";
import CustomPagination from "@/components/instructor/commonCommponents/pagination/CustomPagination";
import TableCellSkeleton from "@/components/skeletons/instrutor/TableCellSkeleton";
import { getTeamMembers, SearchOptions, TeamMemberDataType } from "@/utils/api/instructor/team-member/getTeamMembers";
import { removeMemberWithData } from "@/utils/api/instructor/team-member/removeMember";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";

export default function TeamMemberPage() {

    const { t } = useTranslation();

    const [teamMembers, setTeamMembers] = useState<TeamMemberDataType[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalTeamMembers, setTotalTeamMembers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        if (status === "rejected") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-[4px] text-sm font-medium bg-[#DB93051F] text-[#DB9305] w-max">
                    {t("pending")}
                </span>
            );
        } else if (status === "approved") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-[4px] text-sm font-medium bg-[#83B8071F] text-[#83B807] w-max">
                    {t("accepted")}
                </span>
            );
        }
        return null;
    };

    const fetchTeamMembers = async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
    }) => {
        try {
            setIsLoading(true);

            // Build API parameters based on current filters
            const apiParams: SearchOptions = {
                per_page: params?.per_page || rowsPerPage,
                page: params?.page || currentPage,
            };

            // Add search parameter if provided
            if (params?.search !== undefined) {
                apiParams.search = params.search;
            } else if (search.trim()) {
                apiParams.search = search.trim();
            }

            // Use the new getTeamMembers utility function
            const response = await getTeamMembers(apiParams);

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    // Handle successful response - extract team members data
                    if (response.data?.data) {
                        setTeamMembers(response.data.data);
                    } else {
                        setTeamMembers([]);
                    }

                    // Set pagination data directly from response
                    if (response.data) {
                        setTotalTeamMembers(response.data.total);
                        setTotalPages(response.data.last_page);
                    } else {
                        setTotalTeamMembers(0);
                        setTotalPages(0);
                    }
                } else {
                    // Handle API error case (like "No Team Members Found")
                    console.log("API error in team members:", response.message);
                    toast.error(response.message || "Failed to fetch team members");
                    setTeamMembers([]);
                    setTotalTeamMembers(0);
                    setTotalPages(0);
                }
            } else {
                // Handle network error case (response is null)
                console.log("response is null in component", response);
                setTeamMembers([]);
                setTotalTeamMembers(0);
                setTotalPages(0);
            }
        } catch (error) {
            extractErrorMessage(error);
            setTeamMembers([]);
            setTotalTeamMembers(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!search.trim()) {

            fetchTeamMembers();
        }
    }, [search]);

    // Handler functions for pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchTeamMembers({ page });
    };

    const handleRowsPerPageChange = (perPage: number) => {
        setRowsPerPage(perPage);
        setCurrentPage(1); // Reset to first page when changing rows per page
        fetchTeamMembers({ per_page: perPage, page: 1 });
    };

    const handleRowsPerPageSelectChange = (value: string): void => {
        handleRowsPerPageChange(parseInt(value, 10));
    };

    const handleRemoveTeamMember = async (userId: number, email: string) => {
        try {
            // Call the remove member API
            const response = await removeMemberWithData(
                {
                    member_email: email,
                    user_id: userId
                }
            );

            // Handle the response
            if (response.success) {
                // Show success message
                toast.success(response.message || "Team member removed successfully!");

                // Update local state by removing the member from the list
                const updatedTeamMembers = teamMembers.filter(member => member.user_id !== userId);
                setTeamMembers(updatedTeamMembers);
            } else {
                // Show error message
                toast.error(response.error || response.message || "Failed to remove team member");
                console.error("Failed to remove team member:", response.error);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // Handle unexpected errors
            console.error("Error removing team member:", error);
            toast.error("Something went wrong while removing the team member");
        }
    }

    // Debounced search effect
    useEffect(() => {
        if (search.trim()) {
            const timeoutId = setTimeout(() => {
                setCurrentPage(1);
                fetchTeamMembers({ search: search, page: 1 });
            }, 1500); // 1500ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [search]);

    return (
        <div className="">
            {/* Breadcrumbs */}
            <DashboardBreadcrumb title={t("co_instructor")} firstElement={t("co_instructor")} />

            {/* Invite Co-Instructor Section */}
            {/* Used Shadcn Card component */}
            <Card className="mb-8 rounded-2xl border-none">
                <CardContent className="flex items-center flex-wrap justify-between p-4 gap-4">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="!mt-0 text-md">
                            {t("collaborate_instructor")}
                        </CardTitle>
                        <CardDescription className="text-black">
                            {t("collaborate_instructor_description")}
                        </CardDescription>
                    </div>
                    <InviteTeamMemberModal />
                </CardContent>
            </Card>

            {/* Team List Section */}
            {/* Used Shadcn Card component */}
            <Card className="p-0 rounded-2xl">
                <div className="flex justify-between flex-wrap items-center p-4 gap-4">
                    <CardHeader className="p-0">
                        <CardTitle className="text-md font-medium">{t("team_list")}</CardTitle>
                    </CardHeader>

                    {

                        isLoading ? (
                            <Skeleton className="w-full md:w-60 h-10 bg-gray-400" />
                        )
                            :
                            teamMembers.length > 0 &&
                            <form className="flex w-full md:w-auto">
                                <div className="relative flex-1 md:flex-initial bg-[#F8F8F9]">
                                    <input
                                        type="text"
                                        placeholder={t("search")}
                                        className="border borderColor rounded-s-md px-4 py-2 w-full md:w-60 text-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentPage(1);
                                        fetchTeamMembers({ search: search, page: 1 });
                                    }}
                                    className="bg-black text-white rounded-e-md px-4 py-2 flex items-center text-sm whitespace-nowrap"
                                >
                                    {t("search")} <BiSearchAlt className="ms-2" size={18} />
                                </button>
                            </form>
                    }

                </div>

                <CardContent className="p-0 ">
                    {/* Table Section */}
                    {/* Used Shadcn Table components */}
                    <div className="w-full overflow-auto hidden md:block ">
                        <Table className="pt-0 mt-0 ">
                            {/* Table Header */}
                            <TableHeader className="sectionBg">
                                <TableRow className="">
                                    <TableHead className="w-[50px] border-y borderColor font-semibold text-start">
                                        #
                                    </TableHead>
                                    <TableHead className="border-y borderColor font-semibold text-start">
                                        {t("name")}
                                    </TableHead>
                                    <TableHead className="border-y borderColor font-semibold text-start">
                                        {t("assigned_courses")}
                                    </TableHead>
                                    <TableHead className="border-y borderColor font-semibold text-start">
                                        {t("approval_status")}
                                    </TableHead>
                                    <TableHead className="border-y borderColor font-semibold text-start">
                                        {t("action")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            {/* Table Body with Team Member Data */}
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            <TableCellSkeleton />
                                        </TableCell>
                                    </TableRow>
                                ) : teamMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            <DataNotFound />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teamMembers.map((member) => (
                                        <TableRow key={member.id} className="border-b borderColor last:border-b-0">
                                            <TableCell className="font-medium text-gray-900">
                                                {member.id}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar placeholder */}
                                                    <div className="w-10 h-10 rounded flex-shrink-0">
                                                        <CustomImageTag
                                                            src={member.user.profile}
                                                            alt={member.user.name}
                                                            className="w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900 text-sm">
                                                            {member.user.name}
                                                        </span>
                                                        <span className="text-sm">
                                                            {t("email")} - <a href={`mailto:${member.user.email}`} className="primaryColor">{member.user.email}</a>
                                                        </span>
                                                    </div>
                                                    {
                                                        member.user?.instructor_status === 'suspended' &&
                                                        <div className="">
                                                            <span className="bg-red-200 text-red-400 rounded p-1 text-xs capitalize font-semibold">{member.user.instructor_status}</span>
                                                        </div>
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {member?.courses?.length === 0 ? (
                                                    <span className="text-gray-500">-</span>
                                                ) : (
                                                    <>
                                                        <ol className="list-decimal list-inside space-y-1">
                                                            {member?.courses?.slice(0, 4)?.map((course, index) => (
                                                                <li key={index} className="text-sm">
                                                                    {course.title}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                        {member?.courses?.length > 4 && (
                                                            <ViewAllCourses
                                                                courses={member?.courses}
                                                                memberName={member?.user?.name}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(member.status)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <button className="inline-flex items-center px-3 py-1 rounded-[4px] text-sm font-medium text-red-500 bg-red-100 w-max" onClick={() => handleRemoveTeamMember(member.user_id, member.user.email)}>
                                                    {t("remove")}
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* mobile view */}
                    <div className="md:hidden p-4 space-y-4">
                        {isLoading ? (
                            <div className="text-center">
                                <TableCellSkeleton />
                            </div>
                        ) : teamMembers.length === 0 ? (
                            <DataNotFound />
                        ) : (
                            teamMembers.map((member) => (
                                <div key={member.id} className="bg-white border borderColor rounded-lg p-4 relative">
                                    <div className="flex justify-between items-center">
                                        {/* Number badge */}
                                        <div className=" w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                                            {member.id}
                                        </div>

                                        {/* Three dots menu */}
                                        <div className="absolute top-3 right-3">
                                            <button className="inline-flex items-center px-3 py-1 rounded-[4px] text-sm font-medium text-red-500 bg-red-100 w-max" onClick={() => handleRemoveTeamMember(member.user_id, member.user.email)}>
                                                {t("remove")}
                                            </button>
                                        </div>
                                    </div>

                                    {/* User info section */}
                                    <div className="flex items-start gap-3 mt-6">
                                        {/* Profile placeholder - light blue-grey square */}

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded flex-shrink-0">
                                                    <CustomImageTag
                                                        src={member.user.profile}
                                                        alt={member.user.name}
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    {/* Name */}
                                                    <h3 className="font-semibold text-gray-900 text-base">
                                                        {member.user.name}
                                                    </h3>

                                                    {/* Email */}
                                                    <p className="text-sm text-gray-600 break-all">
                                                        {t("email")} - <a href={`mailto:${member.user.email}`} className="primaryColor">{member.user.email}</a>
                                                    </p>
                                                    {
                                                        member.user?.instructor_status === 'suspended' &&
                                                        <div className="">
                                                            <span className="bg-red-200 text-red-400 rounded p-1 text-xs capitalize font-semibold">{member.user.instructor_status}</span>
                                                        </div>
                                                    }
                                                </div>
                                            </div>

                                            {/* Assigned Courses */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <p className="text-sm font-semibold mb-2">{t("assigned_courses")}:</p>
                                                {member?.courses?.length === 0 ? (
                                                    <span className="text-gray-500 text-sm">-</span>
                                                ) : (
                                                    <ol className="list-decimal list-inside space-y-1">
                                                        {member?.courses?.slice(0, 4)?.map((course, index) => (
                                                            <li key={index} className="text-sm text-gray-700">
                                                                {course.title}
                                                            </li>
                                                        ))}
                                                        {member?.courses?.length > 4 && (
                                                            <ViewAllCourses
                                                                courses={member?.courses}
                                                                memberName={member?.user?.name}
                                                            />
                                                        )}
                                                    </ol>
                                                )}
                                            </div>

                                            {/* Approval Status */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <span className="text-sm font-semibold">{t("approval_status")}:</span>
                                                {getStatusBadge(member.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="p-4 border-t borderColor">
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                rowsPerPage={rowsPerPage}
                                totalItems={totalTeamMembers}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleRowsPerPageSelectChange}
                                showResultText={true}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
