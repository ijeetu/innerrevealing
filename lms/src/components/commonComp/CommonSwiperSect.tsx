'use client'
import React from 'react';
import CourseCard from '../cards/CourseCard';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link';
import CourseHorizontalCard from '../cards/CourseHorizontalCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import { Course } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from 'react-redux';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';

interface dataProps {
    sectionTitle: string,
    link: string,
    data: Course[]
    horizontalCard?: boolean
    onWishlistToggle?: (courseId: number, newStatus: boolean) => void
}

const CommonSwiperSect: React.FC<dataProps> = ({ sectionTitle, link, data, horizontalCard, onWishlistToggle }) => {

    const showBrowseAll = data && data.length > (horizontalCard ? 6 : 8)
    const { t } = useTranslation();
    const isRTL = useSelector(isRTLSelector);
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const slicedData = data.slice(0, horizontalCard ? 6 : 8)

    return (
        <div className='container space-y-6'>
            <div className='flex items-center justify-between flex-wrap gap-y-3'>
                <h3 className='sectionTitle'>{sectionTitle}</h3>
                {
                    showBrowseAll && (
                        <Link href={link} title='Browse All' className='text-base md:text-xl flex items-center gap-1 rtl:flex-row-reverse'>
                            {isRTL ? (
                                <>
                                    <span className=''>
                                        <FiArrowLeft size={18} />
                                    </span>
                                    <span>{t("browse_all")}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t("browse_all")}</span>
                                    <span className=''>
                                        <FiArrowRight size={18} />
                                    </span>
                                </>
                            )}
                        </Link>
                    )
                }
            </div>

            <div className="w-full">
                <div className={`hidden md:grid ${horizontalCard ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                    {slicedData.map((course, index) => (
                        <div key={index} className='col-span-1'>
                            {horizontalCard ?
                                <CourseHorizontalCard courseData={course} onWishlistToggle={onWishlistToggle} /> :
                                <CourseCard courseData={course} onWishlistToggle={onWishlistToggle} />}
                        </div>
                    ))}
                </div>
                <div className="md:hidden w-full category-swiper">
                    <Swiper
                        key={currentLanguageCode || 'default'}
                        freeMode={true}
                        modules={[FreeMode, Pagination]}
                        pagination={{
                            clickable: true,
                        }}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        spaceBetween={16}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        breakpoints={{
                            0: {
                                slidesPerView: 1.2,
                            },
                            480: {
                                slidesPerView: 2.2,
                            }
                        }}
                        className="relative [&>.swiper-wrapper]:pb-8 md:[&>.swiper-wrapper]:pb-12 [&>.swiper-pagination]:flex [&>.swiper-pagination]:items-center [&>.swiper-pagination]:justify-center [&>.swiper-pagination]:pb-[6px] md:[&>.swiper-pagination]:pb-[12px] [&>.swiper-pagination]:gap-3"
                    >
                        {slicedData.map((course, index) => (
                            <SwiperSlide key={index}>
                                {horizontalCard ?
                                    <CourseHorizontalCard courseData={course} onWishlistToggle={onWishlistToggle} /> :
                                    <CourseCard courseData={course} onWishlistToggle={onWishlistToggle} />}
                            </SwiperSlide>
                        ))}
                        <div className="mt-6 flex justify-center">
                            <div className="swiper-pagination"></div>
                        </div>
                    </Swiper>
                </div>
            </div>
        </div>
    )
}

export default CommonSwiperSect
