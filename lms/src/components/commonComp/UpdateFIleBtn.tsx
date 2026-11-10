'use client'
import { useTranslation } from '@/hooks/useTranslation';
import { setCourseDetailsData } from '@/redux/instructorReducers/AddCourseSlice';
import { setIsUpdateFile } from '@/redux/reducers/helpersReducer';
import { CourseDetailsDataType } from '@/types/instructorTypes/instructorTypes';
import React from 'react'
import { useDispatch } from 'react-redux';

const UpdateFIleBtn = ({ thumbanil, video }: { thumbanil?: boolean, video?: boolean }) => {
    const { t } = useTranslation();

    const dispatch = useDispatch();

    const handleUpdateFile = () => {
        if (thumbanil) {
            dispatch(setIsUpdateFile({ courseThumbnail: false }));
            dispatch(setCourseDetailsData({ thumbnail: null } as unknown as CourseDetailsDataType));
        }
        else if (video) {
            dispatch(setIsUpdateFile({ coursePreviewVideo: false }));
            dispatch(setCourseDetailsData({ video: null } as unknown as CourseDetailsDataType));
        }
        else {
            dispatch(setIsUpdateFile({ curriculum: false }));
        }
    }

    return (
        <span className="text-sm primaryBg text-white p-1 rounded-md cursor-pointer" onClick={() => {
            handleUpdateFile();
        }}>
            {t("update_file")}
        </span>
    )
}

export default UpdateFIleBtn
