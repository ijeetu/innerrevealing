'use client'
import React, { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FaqData, getFaqs } from '@/utils/api/user/getFaqs';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/utils/helpers';
import FaqsSkeleton from '@/components/skeletons/FaqsSkeleton';
import { useTranslation } from '@/hooks/useTranslation'

const Faqs = () => {

  const { t } = useTranslation();
  // state for faqs
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  // Track current page and pagination info
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // fetch faqs - initial load or load more
  const fetchFaqs = async (page: number, append: boolean = false) => {
    try {
      // Show main loader only on initial load
      if (!append) {
        setLoadingFaqs(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getFaqs({ page: page, per_page: 10 });
      if (response) {
        if (!response.error) {
          // Handle paginated response: response.data.data contains the array of FAQs
          if (response.data && response.data.data && response.data.data.length > 0) {
            const data = response.data.data;

            // Append new FAQs to existing ones if loading more, otherwise replace
            if (append) {
              setFaqs(prevFaqs => [...prevFaqs, ...data]);
            } else {
              setFaqs(data);
            }

            // Check if there are more pages available
            // Compare current_page with last_page to determine if more pages exist
            const hasMore = response.data.current_page < response.data.last_page;
            setHasMorePages(hasMore);

            // Update current page
            setCurrentPage(response.data.current_page);
          }
          else {
            console.log("No faqs data found in response");
            if (!append) {
              setFaqs([]);
            }
            setHasMorePages(false);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch faqs");
          if (!append) {
            setFaqs([]);
          }
          setHasMorePages(false);
        }
      } else {
        console.log("response is null in component", response);
        if (!append) {
          setFaqs([]);
        }
        setHasMorePages(false);
      }
    }
    catch (error) {
      extractErrorMessage(error);
      if (!append) {
        setFaqs([]);
      }
      setHasMorePages(false);
    }
    finally {
      setLoadingFaqs(false);
      setLoadingMore(false);
    }

  }

  // Handle load more button click
  const handleLoadMore = () => {
    if (hasMorePages && !loadingMore) {
      fetchFaqs(currentPage + 1, true);
    }
  }

  // useEffect for faqs - initial load
  useEffect(() => {
    fetchFaqs(1, false);
  }, []);

  return (
    faqs.length > 0 && (
      <section className='container commonMT space-y-6 md:space-y-8 lg:space-y-12'>
        <div className='flex flex-col commonTextGap'>
          <h6 className='sectionTitle'>{t("have_questions_we_ve_got_answers")}</h6>
          <p className='sectionPara'>{t("explore_our_faqs_for_quick_solutions_to_common_inquiries_and_get_the_help_you_need_in_no_time")}</p>
        </div>

        <div className='grid grid-cols-1'>
          {loadingFaqs ? (
            <FaqsSkeleton />
          ) : (
            <Accordion type="single" collapsible className="w-full flex flex-col gap-6 mb-6">
              {
                faqs.map((item: FaqData) => {
                  return <AccordionItem value={item.id.toString()} key={item.id} className='overflow-hidden border border-[#D8E0E6] rounded-[8px] shadow-[0px_2px_12px_0px_#ADB3B829]'>
                    <AccordionTrigger className='text-base px-4 [&>svg]:w-[24px] rounded-none [&>svg]:h-[24px] data-[state=open]:bg-[#F2F5F7] hover:no-underline'>{item.question}</AccordionTrigger>
                    <AccordionContent
                      className="p-4 text-base border-none font-medium break-words"
                    >

                      {item.answer}
                    </AccordionContent>

                  </AccordionItem>
                })
              }

            </Accordion>
          )}
          {loadingMore && (
            <FaqsSkeleton />
          )}
          {/* Show Load More button only when more FAQs are available */}
          {hasMorePages && (
            <button
              className='commonBtn w-max mx-auto'
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? t("loading") || "Loading..." : t("load_more")}
            </button>
          )}
        </div>
      </section>
    ))
}

export default Faqs

