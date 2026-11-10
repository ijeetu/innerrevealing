"use client";
import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { settingsSelector } from '@/redux/reducers/settingsSlice';

export default function checkInstructorMode<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    const InstructorModeCheck = (props: P) => {
        const router = useRouter();
        const settings = useSelector(settingsSelector);


        const isInstructorMode = settings?.data?.instructor_mode;
        if (isInstructorMode == "single") {
            router.push("/");
            return null;
        } else {
            return <WrappedComponent {...props} />;
        }
    };



    return InstructorModeCheck;
}
