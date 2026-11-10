'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';
import { getSliders, Slider } from '@/utils/api/user/getSlider';
import { extractErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';
import { Skeleton } from '@/components/ui/skeleton';


const HeroSect: React.FC = () => {
    const swiperRef = useRef<SwiperType | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sliderData, setSliderData] = useState<Slider[]>([]);
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const isRTL = useSelector(isRTLSelector);

    const fetchSlider = async () => {
        try {
            setLoading(true);
            const response = await getSliders();
            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data && response.data.length > 0) {
                        setSliderData(response.data);
                    } else {
                        console.log('No slider data found in response');
                        setSliderData([]);
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch sliders");
                    setSliderData([]);
                }
            } else {
                console.log("response is null in component", response);
                setSliderData([]);
            }
        } catch (error) {
            extractErrorMessage(error);
            setSliderData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch sliders on component mount or when language changes
    useEffect(() => {
        fetchSlider();
    }, [currentLanguageCode]);


    const handleSlideClick = (slide: Slider) => {
        if (slide.third_party_link) {
            window.open(slide.third_party_link, "_blank");
        } else if (slide.type === 'course') {
            router.push(`/course-details/${slide.slug}?lang=${currentLanguageCode}`);
        } else if (slide.type === 'instructor') {
            router.push(`/instructors/${slide.slug}?lang=${currentLanguageCode}`);
        }
        else {
            console.log("No valid link for this slide");
        }
    };

    return (
        <>
            {loading ? (
                <Skeleton className="w-full h-[260px] md:h-[500px] lg:h-[600px] xl:h-[700px]" />
            ) : sliderData.length > 0 && (
                <div className="relative w-full h-[290px] md:h-[500px] lg:h-[600px] xl:h-[700px]">

                    <Swiper
                        key={currentLanguageCode || 'default'}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        modules={[Navigation, Pagination]}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        slidesPerView={1}
                        className="h-full w-full heroSwiper"
                        pagination={{ clickable: true }}
                        preventClicks={false}
                        preventClicksPropagation={false}
                    >
                        {sliderData.map((slide, index) => (
                            <SwiperSlide key={`${slide.id}-${index}`} className="w-full h-full cursor-pointer"
                                onClick={() => handleSlideClick(slide)}
                            >
                                <div className="w-full h-full">
                                    <Image
                                        src={slide.image}
                                        alt={`slider-${slide.id}`}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-full h-full object-cover xl:aspect-1920/700 lg:aspect-1440/525 md:aspect-920/335 aspect-390/142"
                                        priority={index < 3} // Optimize first 3 images
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation */}
                    {sliderData.length > 1 && (
                        // Adding pointer-events-none keeps the navigation wrapper from blocking slide clicks.
                        <div className="absolute inset-x-0 bottom-0 top-0 flex justify-between items-center px-6 py-4 z-[1] pointer-events-none">
                            <button
                                onClick={() => swiperRef.current?.slidePrev()}
                                aria-label="Previous slide"
                                className="w-10 md:w-12 h-10 md:h-12 rounded-full primaryBg text-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto"
                            >
                                {isRTL ? <FaArrowRight className="text-lg md:text-xl" /> : <FaArrowLeft className="text-lg md:text-xl" />}
                            </button>

                            <button
                                onClick={() => swiperRef.current?.slideNext()}
                                aria-label="Next slide"
                                className="w-10 md:w-12 h-10 md:h-12 rounded-full primaryBg text-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto"
                            >
                                {isRTL ? <FaArrowLeft className="text-lg md:text-xl" /> : <FaArrowRight className="text-lg md:text-xl" />}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default HeroSect;