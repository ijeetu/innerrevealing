import InstructorDetail from '@/components/pagesComponent/instructorDetail/InstructorDetail'
import React from 'react'

interface PageProps{
    params:Promise<{slug:string}>;
}
const Page = async ({params}: PageProps) => {
    const {slug} =  await params;
    return (
        <InstructorDetail slug={slug} />
    )
}

export default Page
