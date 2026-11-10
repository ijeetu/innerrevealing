'use client'
import React, { useEffect } from 'react'
import Breadcrumb from '@/components/commonComp/Breadcrumb'
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import type { Page } from '@/utils/api/general/getPages';
import DataNotFound from '@/components/commonComp/DataNotFound';
import RichTextContent from '@/components/commonComp/RichText';
import toast from 'react-hot-toast';

// Interface for the response structure passed from parent
// Matches the structure returned by fetchPageData
interface PageResponse {
    error: string | null;
    message: string | null;
    data: Page | null;
    code?: number;
}

const PolicyPagesContent = ({ pagesResponse }: { pagesResponse: PageResponse | null }) => {

    const { t } = useTranslation();
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();

    // Determine page type based on slug for breadcrumb
    const pageType = slug === 'cookies-policy' ? `${t('cookie_policy')}`
        : slug === 'privacy-policy' ? `${t('privacy_policy')}`
            : slug === 'terms-and-conditions' ? `${t('terms_condition')}`
                : slug === 'about-us' ? `${t('about_us')}`
                    : pagesResponse?.data?.title || '';

    // Extract page data from response
    const page = pagesResponse?.data;

    useEffect(() => {
        if (!page) {
            // router.replace('/');
            toast.error(t('page_not_found'))
        }
    }, [page])


    return (
        <div className="">
            {/* Breadcrumb navigation */}
            <Breadcrumb title={pageType} firstElement={pageType} />

            {/* Page content */}
            {page ? (
                <div className="my-8 container">
                    <div className="prose prose-lg max-w-none break-all">
                        <RichTextContent content={page.page_content || ''} />
                    </div>
                </div>
            ) : (
                <DataNotFound />
            )}
        </div>
    )
}

export default PolicyPagesContent
