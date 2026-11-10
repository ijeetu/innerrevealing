'use client'
import React from 'react'
import { CategoryDataType } from '@/types'
import CategoryCard from '@/components/cards/CategoryCard'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { categoryDataSelector } from '@/redux/reducers/categorySlice'
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { useTranslation } from '@/hooks/useTranslation'
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice'

const TopCategories: React.FC = () => {

    const categories = useSelector(categoryDataSelector);
    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);
    const isRTL = useSelector(isRTLSelector);

    return (
        categories && categories?.length > 0 &&
        <section className='container commonMT commonMB space-y-6 md:space-y-8 lg:space-y-10'>
            <div className="flexColCenter commonTextGap sm:w-[80%] lg:w-[60%] xl:w-[35%] text-center mx-auto">
                <h2 className='sectionTitle'>{t('explore_top_cat')}</h2>
                <p>{t('explore_top_cat_description')}</p>
            </div>
            <div className='hidden md:grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {
                    categories?.slice(0, 8)?.map((cate: CategoryDataType, index) => {
                        return <CategoryCard data={cate} key={index} />
                    })
                }
            </div>

            <div className="md:hidden w-full category-swiper">
                <Swiper
                    key={`${isRTL}-swiper`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    freeMode={true}
                    modules={[FreeMode]}
                    spaceBetween={16}
                    slidesPerView={1}
                    breakpoints={{
                        0: {
                            slidesPerView: 1.2,
                        },
                        480: {
                            slidesPerView: 2.2,
                        }

                    }}
                    className="relative [&>.swiper-wrapper]:pb-4 md:[&>.swiper-wrapper]:pb-12 [&>.swiper-pagination]:flex [&>.swiper-pagination]:items-center [&>.swiper-pagination]:justify-center [&>.swiper-pagination]:pb-[6px] md:[&>.swiper-pagination]:pb-[12px] [&>.swiper-pagination]:gap-3"
                >
                    {
                        categories?.slice(0, 8)?.map((cate: CategoryDataType, index) => {
                            return <SwiperSlide key={index}>
                                <CategoryCard data={cate} key={index} />
                            </SwiperSlide>
                        })
                    }
                </Swiper>
            </div>

            {
                categories && categories.length > 8 &&
                <div className='flexCenter'>
                    <Link href={`/all-categories?lang=${currentLanguageCode}`} className='!w-full md:!w-max commonBtn text-center'>{t('all_categories')}</Link>
                </div>
            }

        </section>

    )
}

export default TopCategories


