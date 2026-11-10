'use client'
import Breadcrumb from '@/components/commonComp/Breadcrumb'
import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'

const practiceAreas = [
  { title: 'Meditation', search: 'meditation', description: 'Find a little stillness and reconnect with yourself through guided meditation.' },
  { title: 'Yoga', search: 'yoga', description: 'Bring breath, movement and awareness together in your daily practice.' },
  { title: 'Personal growth', search: 'mindfulness', description: 'Explore self-awareness and mindfulness as you grow at your own pace.' },
];

const AllCategories = () => {
  return (
    <Layout>
      <div className='commonGap'>
        <Breadcrumb firstElement='Practice areas' title='Find your practice' />
        <section className='container space-y-6 mb-12'>
          <div className='flexColCenter items-start gap-2'>
            <h2 className='sectionTitle'>Three ways to reconnect.</h2>
            <p className='sectionPara lg:w-[52%]'>Choose a focus and explore the practices available to support your journey.</p>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            {practiceAreas.map((area) => (
              <Link key={area.search} href={`/courses/search/${area.search}`} className='rounded-3xl border borderColor bg-white p-8 space-y-5 hover:primaryColor'>
                <h3 className='text-2xl font-semibold flex items-center justify-between gap-4'>{area.title}<FiArrowUpRight aria-hidden='true' /></h3>
                <p className='sectionPara'>{area.description}</p>
                <span className='inline-block primaryColor font-medium'>Explore practices</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default AllCategories
