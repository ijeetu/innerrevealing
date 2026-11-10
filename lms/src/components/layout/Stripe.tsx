'use client'
import { setShowTopHeader, showTopHeaderSelector } from '@/redux/reducers/helpersReducer';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import React, { useEffect, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';

const Stripe: React.FC = () => {

    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => {
        setIsClient(true)
    }, []);

    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const stripeBanner = settings?.data?.announcement_bar;
    const showTopHeader = useSelector(showTopHeaderSelector);

    return (
        isClient && showTopHeader &&
        <div className='primaryBg flexCenter text-white p-2 md:p-4 sm:text-base text-sm font-normal relative flex-wrap text-center'>
            {stripeBanner}
            <span className='absolute top-0 bottom-0 my-auto w-max h-max cursor-pointer ltr:right-4 rtl:left-4' onClick={() => dispatch(setShowTopHeader(false))}><IoMdClose size={24} /></span>
        </div>
    )
}

export default Stripe