'use client'
import CategoryCard from '@/components/cards/CategoryCard'
import Breadcrumb from '@/components/commonComp/Breadcrumb'
import Layout from '@/components/layout/Layout'
import React from 'react'
import { CategoryDataType } from '@/types'
import { useSelector } from 'react-redux'
import { categoryDataSelector, categoryLimit, totalCates } from '@/redux/reducers/categorySlice'
import { setCateOffset } from '@/utils/helpers'
import { useTranslation } from '@/hooks/useTranslation';

const AllCategories = () => {

  const categories = useSelector(categoryDataSelector);
  const cateLimit = useSelector(categoryLimit)
  const totalCatesCount = useSelector(totalCates)
  const { t } = useTranslation();
  return (
    <Layout>
      <div className='commonGap'>
        <Breadcrumb firstElement={t("all_categories")} title={t("all_categories")} />
        <section className='container space-y-6 mb-12'>
          <div className='flexColCenter items-start gap-2'>
            <h2 className='sectionTitle'>{t("explore_top_cat")}</h2>
            <p className='sectionPara lg:w-[52%]'>{t("explore_top_cat_description")}</p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {
              categories?.map((cate: CategoryDataType, index) => {
                return <CategoryCard data={cate} key={index} />
              })
            }
          </div>
          {
            totalCatesCount > cateLimit && totalCatesCount !== categories?.length &&
            <div className='flexCenter mt-8 md:mt-12'>
              <button className='commonBtn' onClick={() => setCateOffset(1)}>{t("load_more_categories")}</button>
            </div>
          }
        </section>

      </div>
    </Layout>
  )
}

export default AllCategories