"use client";
import InstructorCard from "@/components/cards/InstructorCard";
import Breadcrumb from "@/components/commonComp/Breadcrumb";
import SidebarFilter from "@/components/commonComp/SidebarFilter";
import Layout from "@/components/layout/Layout";
import SidebarFilterSheet from "@/components/responsiveComponents/coursedComponests/SidebarFilterSheet";
import { SidebarFilterTypes } from "@/types";
import {
  getInstructors,
  GetInstructorsParams,
  InstructorData,
} from "@/utils/api/user/getInstructors";
import { extractErrorMessage } from "@/utils/helpers";
import InstructorSkeleton from "@/components/skeletons/InstructorSkeleton";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useDispatch } from "react-redux";
import { clearSelectedCategory } from "@/redux/reducers/categorySlice";
import DataNotFound from "@/components/commonComp/DataNotFound";

const Instructor = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isInitialized = useRef(false);

  // Helper function to safely decode URL parameters
  const safeDecodeParam = (value: string | null): string => {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const getFiltersFromURL = (paramsStr: string): SidebarFilterTypes => {
    const params = new URLSearchParams(paramsStr);
    return {
      level: safeDecodeParam(params.get("level")),
      language: safeDecodeParam(params.get("language")),
      duration: Number(params.get("duration")) || 0,
      price: safeDecodeParam(params.get("price")),
      rating: safeDecodeParam(params.get("rating")),
      category: safeDecodeParam(params.get('category')),
      feature_section: safeDecodeParam(params.get('feature_section')),
      feature_section_slug: safeDecodeParam(params.get('feature_section_slug')),
    };
  };

  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilterTypes>(() =>
    getFiltersFromURL(searchParams.toString())
  );

  // State for instructors data and pagination
  const [instrucotrs, setInstructors] = useState<InstructorData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalInstructors, setTotalInstructors] = useState(0);


  const updateURLWithFilters = (filters: SidebarFilterTypes) => {
    const params: string[] = []

    // Add non-empty filter values to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        const stringValue = String(value)
        params.push(`${key}=${stringValue}`)
      }
    })

    // Update URL without page reload
    const newURL = params.length > 0 ? `?${params.join('&')}` : window.location.pathname
    router.replace(newURL, { scroll: false })
  }
  // Function to clear all filters and update URL
  const clearAllFilters = () => {
    const emptyFilters: SidebarFilterTypes = {
      level: "",
      language: "",
      duration: 0,
      price: "",
      rating: "",
      category: "",
      feature_section: "",
      feature_section_slug: "",
    };
    setSidebarFilter(emptyFilters);
    // Clear Redux state for selected categories to reset all checkboxes
    dispatch(clearSelectedCategory());
    router.replace(window.location.pathname, { scroll: false });
  };

  const fetchInstructors = async (
    page: number = 1,
    append: boolean = false,
    filtersOverride?: SidebarFilterTypes
  ) => {
    const activeFilters = filtersOverride ?? sidebarFilter
    if (!hasMorePages && page > 1) return;
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }
      // Prepare Api parameters with filters
      const params: GetInstructorsParams = {
        page: page,
        per_page: 12,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (activeFilters.rating) (params as any).rating = activeFilters.rating;
      if (activeFilters.category) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (params as any).category_slug = activeFilters.category;
      }
      if (activeFilters.feature_section) {
        params.feature_section_slug = activeFilters.feature_section;
      }

      // Call the API
      const response = await getInstructors(params);
      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            const instructorsData = response.data.data;

            // Update instructors state
            if (append) {
              // Append new instructors to existing list
              setInstructors((prevInstructors) => [
                ...prevInstructors,
                ...instructorsData,
              ]);
            } else {
              // Replace instructors list with new data
              setInstructors(instructorsData);
            }
          } else {
            console.log("No instructors data found in response");
            if (!append) {
              setInstructors([]);
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((response.data as any)?.pagination) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pagination = (response.data as any).pagination;
            setTotalInstructors(pagination.total);
            setHasMorePages(
              pagination.has_more_pages ||
              pagination.current_page < pagination.last_page
            );
          } else if (response.data) {

            setTotalInstructors(response.data.total || 0);
            setHasMorePages(
              response.data.current_page < response.data.last_page
            );
          } else {
            setTotalInstructors(0);
            setHasMorePages(false);
          }
        } else {
          console.log("API error:", response.message);
          if (!append) {
            setInstructors([]);
          }
          setTotalInstructors(0);
          setHasMorePages(false);
        }
      } else {
        console.log("response is null in component", response);
        if (!append) {
          setInstructors([]);
        }
        setTotalInstructors(0);
        setHasMorePages(false);
      }
    } catch (error) {
      extractErrorMessage(error);
      if (!append) {
        setInstructors([]);
      }
      setTotalInstructors(0);
      setHasMorePages(false);
    } finally {
      // Reset loading states
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // function to handle load more button click
  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchInstructors(nextPage, true);
  };

  //  function to map API instructors data to InstructorCard props
  const mapInstructorTopCardProps = (instructor: InstructorData) => {
    return {
      name: instructor.name,
      title: instructor.qualification,
      description:
        instructor.about_me ||
        "Professional Instructor with a passion for teaching and sharing knowledge.",
      rating: instructor.average_rating || 0,
      reviewCount: instructor.total_ratings || 0,
      coursesCount: instructor.active_courses_count || 0,
      previewVideo:
        instructor.preview_video,
      profileUrl: instructor.profile,
      slug: `/instructors/${instructor.slug}`,
      type: instructor.type,
      team_name: instructor.team_name,
    };
  };

  useEffect(() => {
    const urlFilters = getFiltersFromURL(searchParams.toString());
    setSidebarFilter(urlFilters);
    setCurrentPage(1);
    fetchInstructors(1, false, urlFilters); // pass urlFilters directly to avoid stale closure
    isInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!isInitialized.current) return
    const urlFilters = getFiltersFromURL(searchParams.toString());
    const isInSync = (Object.keys(sidebarFilter) as Array<keyof SidebarFilterTypes>)
      .every(key => sidebarFilter[key] === urlFilters[key])
    if (!isInSync) {
      setIsLoading(true);
      updateURLWithFilters(sidebarFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarFilter]);

  return (
    <Layout>
      <div className="commonGap">
        <Breadcrumb title={t("instructor")} firstElement={t("instructor")} />
        <div className="container grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="mt-2 lg:hidden space-y-4">
              <h4 className="font-semibold">
                {totalInstructors}{" "}
                {totalInstructors > 1 ? t("instructors") : t("instructor")}{" "}
                {t("available")}
              </h4>
              <div className=" w-full flex justify-between items-center gap-6 mb-2 sm:mb-4">
                <SidebarFilterSheet
                  sidebarFilter={sidebarFilter}
                  setSidebarFilter={setSidebarFilter}
                  isInstructorPage={true}
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <SidebarFilter
                sidebarFilter={sidebarFilter}
                setSidebarFilter={setSidebarFilter}
                isInstructorPage={true}
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Filter Header */}
            <div className="hidden lg:flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <h4 className="font-semibold">
                  {totalInstructors}{" "}
                  {totalInstructors > 1 ? t("instructors") : t("instructor")}{" "}
                  {t("available")}
                </h4>
                {/* Clear Filters Button - only show if any filter is applied */}
                {((sidebarFilter.category && sidebarFilter.category !== "") ||
                  (sidebarFilter.rating && sidebarFilter.rating !== "")) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      {t("clear_filters")}
                    </button>
                  )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Show skeleton loading cards */}
              {isLoading && (
                <>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <InstructorSkeleton key={index} />
                  ))}
                </>
              )}

              {/* Show actual instructor cards when not loading */}
              {!isLoading && (
                <>
                  {instrucotrs.map((instructor) => (
                    <InstructorCard
                      key={instructor.id}
                      {...mapInstructorTopCardProps(instructor)}
                    />
                  ))}
                </>
              )}
            </div>

            {!error && instrucotrs.length === 0 && !isLoading && (
              <DataNotFound />
            )}

            {!isLoading && !error && hasMorePages && (
              <div className="flexCenter">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="commonBtn w-full md:w-max disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t("loading")}
                    </div>
                  ) : (
                    t("load_more_instructors")
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Instructor;
