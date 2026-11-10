'use client'
import RichTextContent from '@/components/commonComp/RichText';
import { useTranslation } from '@/hooks/useTranslation';
import React, { useState } from 'react';

interface AboutMeProps {
    aboutMe: string;
}

const About = ({ aboutMe }: AboutMeProps) => {
    const [expanded, setExpanded] = useState(false);
    const { t } = useTranslation();
    // const shouldShowReadMore = aboutMe && aboutMe.length > 200;

    return (
        <div className="p-2 md:p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">{t("about_instructor")}</h2>

            {aboutMe ? (
                <>
                    <div className={`text-gray-700 space-y-4 ${expanded ? '' : 'line-clamp-10'}`}>
                        <div className="text-gray-700 break-all">
                            <RichTextContent content={aboutMe} />
                        </div>
                    </div>

                    {/* {shouldShowReadMore && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="primaryColor font-medium mt-3 flex items-center"
                        >
                            {expanded ? '- Read Less' : '+ Read More'}
                        </button>
                    )} */}
                </>
            ) : (
                <p className="text-gray-500">{t("no_information_available_about_this_instructor")}</p>
            )}
        </div>
    );
};

export default About;
