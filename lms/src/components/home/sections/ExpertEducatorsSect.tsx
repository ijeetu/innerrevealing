'use client'
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import type { Swiper as SwiperType } from 'swiper';
import Link from 'next/link';
import { educatorCardDataTypes } from '@/types';
import EducatorCard from '@/components/cards/EducatorCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from 'react-redux';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';

const ExpertEducatorsSect = ({ instructors }: { instructors: educatorCardDataTypes[] }) => {
    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const isRTL = useSelector(isRTLSelector);
    const swiperRef = useRef<SwiperType | null>(null);
    if (!instructors || instructors.length === 0) return null;

    return (
        <section className="primaryBg py-6 md:py-8 lg:py-12">
            <div className="container space-y-8 md:space-y-12 lg:space-y-16">
                <div className="flex flex-col gap-y-8 lg:gap-4 lg:flex-row justify-between items-start lg:items-center">
                    <div className="flex flex-col gap-6 text-white lg:w-[50%]">
                        <div className='flex flex-col gap-4'>
                            <div className="flexCenter gap-3 bg-[#FFFFFF29] p-2 rounded-full text-sm font-normal w-max">
                                <span className='border-[0.5px] border-white w-5'></span>
                                <span>
                                    {t("expert_educators")}
                                </span>
                                <span className='border-[0.5px] border-white w-5'></span>
                            </div>
                            <h6 className="sectionTitle">
                                {t("learn_from_experts")}
                            </h6>

                        </div>
                        <p className="">
                            {t("learn_from_best_instructors")}
                        </p>
                    </div>

                    <Link href={`/instructors?lang=${currentLanguageCode}&feature_section=top_rated_instructors`} title='Become an Instructor' className="max-[390px]:w-full commonBtn border-white border bg-transparent flexCenter gap-2">
                        <span>{t("view_all_tutors")} </span>
                        <span>{isRTL ? <FiArrowLeft /> : <FiArrowRight />}</span>
                    </Link>
                </div>

                <div className="relative instructor-carousel">
                    <div className="flex justify-end gap-4 items-center px-6 py-4 lg:hidden">
                        <button
                            onClick={() => isRTL ? swiperRef.current?.slideNext() : swiperRef.current?.slidePrev()}
                            className="w-8 h-8 rounded-full bg-white primaryColor flex items-center justify-center cursor-pointer"
                        >
                            <FiArrowLeft className='md:text-2xl' />
                        </button>
                        <button
                            onClick={() => isRTL ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext()}
                            className="w-8 h-8 rounded-full bg-white primaryColor flex items-center justify-center cursor-pointer"
                        >
                            <FiArrowRight className='md:text-2xl' />
                        </button>
                    </div>
                    <Swiper
                        key={currentLanguageCode || 'default'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        modules={[Navigation, Pagination]}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        spaceBetween={16}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            0: {
                                slidesPerView: 1.1,
                            },
                            400: {
                                slidesPerView: 1.4,
                            },
                            550: {
                                slidesPerView: 2,
                            },
                            680: {
                                slidesPerView: 2.3,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                            1280: {
                                slidesPerView: 4,
                            },
                        }}
                        className="instructor-swiper pb-10"
                    >
                        {instructors.map((instructor: educatorCardDataTypes, index: number) => (
                            <SwiperSlide key={index}>
                                <EducatorCard {...instructor} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation */}
                    <div className="absolute inset-x-0 bottom-0 top-0 gap-4 mt-0 justify-between items-center px-6 py-4 hidden lg:flex">
                        <button
                            onClick={() => isRTL ? swiperRef.current?.slideNext() : swiperRef.current?.slidePrev()}
                            className="absolute -left-10 w-8 h-8 rounded-full bg-white primaryColor flex items-center justify-center cursor-pointer"
                        >
                            <FiArrowLeft className='md:text-2xl' />
                        </button>
                        <button
                            onClick={() => isRTL ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext()}
                            className="absolute -right-10 w-8 h-8 rounded-full bg-white primaryColor flex items-center justify-center cursor-pointer"
                        >
                            <FiArrowRight className='md:text-2xl' />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExpertEducatorsSect;