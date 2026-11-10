'use client'
import React from 'react'

interface EmptyStatesContentProps {
    title: string;
    description: string;
}
const EmptyStatesContent = ({ title, description }: EmptyStatesContentProps) => {
    return (
        <div className='flexColCenter gap-2 mt-6'>
            <h3 className="text-xl md:text-2xl font-bold text-black">{title}</h3>
            <p className="text-sm md:text-base text-[#010211] md:w-[80%] text-center m-auto">{description}</p>
        </div>
    )
}

export default EmptyStatesContent
