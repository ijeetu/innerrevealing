'use client'
import Link from 'next/link'
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';
import img from '../../../assets/images/homePage/faq.svg'
import { FiArrowRight } from 'react-icons/fi';
import { FaqData } from '@/utils/api/user/getFaqs';
import FaqsSkeleton from '@/components/skeletons/FaqsSkeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from 'react-redux';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';

interface FaqsProps {
    faqs: FaqData[];
    loadingFaqs: boolean;
}

const Faqs = ({ faqs, loadingFaqs }: FaqsProps) => {

    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector);

    return (
        <section className='container commonMT space-y-8 md:space-y-12 lg:space-y-16'>
            <div className='flex flex-col items-start md:items-center text-left md:text-center gap-2'>
                <h6 className='sectionTitle'>{t("have_questions_we_ve_got_answers")}</h6>
                <p className='sectionPara'>{t("explore_our_faqs_for_quick_solutions_to_common_inquiries_and_get_the_help_you_need_in_no_time")}</p>
            </div>

            <div className='grid grid-cols-12 gap-6 h-full'>

                <div className='col-span-12 lg:col-span-8 order-2 lg:order-1'>
                    {loadingFaqs ? (
                        <FaqsSkeleton />
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-6 mb-3">
                            {
                                faqs.length > 0 && faqs.slice(0, 5).map((item: FaqData) => {
                                    return <AccordionItem value={item.id.toString()} key={item.id} className='overflow-hidden border border-[#D8E0E6] rounded-[8px] shadow-[0px_2px_12px_0px_#ADB3B829]'>
                                        <AccordionTrigger className='text-base px-4 [&>svg]:w-[24px] rounded-none [&>svg]:h-[24px] data-[state=open]:bg-[#F2F5F7] hover:no-underline'>{item.question}</AccordionTrigger>
                                        <AccordionContent
                                            className="p-4 text-base border-none font-medium overflow-hidden transition-all duration-500 ease-in-out"
                                        >

                                            {item.answer}
                                        </AccordionContent>

                                    </AccordionItem>
                                })
                            }

                        </Accordion>
                    )}
                </div>
                <div className='col-span-12 lg:col-span-4 order-1 lg:order-2 flex flex-col lg:flexColCenter commonTextGap py-4 sm:py-6 md:py-8 sm:px-6 px-4 border borderColor rounded-[8px]'>
                    <div className='border-2 borderColor rounded-2xl p-1 pb-2 w-[96px] h-[100px]'>
                        <Image src={img} height={0} width={0} alt='faq-img' className='w-[88px] h-[88px] rounded-2xl' />
                    </div>
                    <div className='flex flex-col lg:flexColCenter gap-2'>
                        <h6 className='text-xl md:text-[22px] font-bold lg:text-center'>{t("do_you_have_more_questions")}</h6>
                        <p className='lg:text-center secondaryText'>{t("end_to_end_payments")}</p>
                    </div>

                    <div className='!w-full mt-4 sm:mt-8 md:mt-10 lg:mt-12 flexCenter commonBtn text-center gap-2'>
                        <Link href={`/help-support?lang=${currentLanguageCode}`} title='Read All FAQs' className=''> {t("read_all_faqs")}</Link>
                        <FiArrowRight size={22} />

                    </div>
                </div>
            </div>
        </section >
    )
}

export default Faqs