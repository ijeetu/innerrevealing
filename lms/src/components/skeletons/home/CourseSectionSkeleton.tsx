'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import CourseCardSkeleton from "../CourseCardSkeleton";
import { Skeleton } from '@/components/ui/skeleton';
import CourseHorizontalCardSkeleton from '../CourseHorizontalCardSkeleton';

interface horizontalCardSkeleton {
    horizontalCard?: boolean; 
}

const CourseSectionSkeleton: React.FC<horizontalCardSkeleton> = ({horizontalCard}) => {
    return (
        <div className='container space-y-6'>
            <div className='flex items-center justify-between flex-wrap gap-y-3'>
                <Skeleton className="h-8 w-[40%]" />
                <Skeleton className="h-8 w-[60px]" />
            </div>

            <div className="w-full">
                <div className={`hidden md:grid ${horizontalCard ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                    {[...Array(horizontalCard ? 6 : 8)].map((_, index) => (
                        <div key={index} className='col-span-1'>
                            {horizontalCard ?
                                <CourseHorizontalCardSkeleton /> :
                                <CourseCardSkeleton />}
                        </div>
                    ))}
                </div>
                <div className="md:hidden w-full category-swiper">
                    <Swiper
                        // key={getDirection()}
                        freeMode={true}
                        modules={[FreeMode, Pagination]}
                        pagination={{
                            clickable: true,
                        }}
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
                        {[...Array(horizontalCard ? 6 : 8)].map((_, index) => (
                            <SwiperSlide key={index}>
                                {horizontalCard ?
                                    <CourseHorizontalCardSkeleton /> :
                                    <CourseCardSkeleton />}
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

export default CourseSectionSkeleton;

