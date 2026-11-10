import React from 'react'
import { useTranslation } from '@/hooks/useTranslation';
import icon1 from '@/assets/images/helpSupport/StartConversation.svg'
import icon2 from '@/assets/images/helpSupport/ShareYourKnowledge.svg'
import icon3 from '@/assets/images/helpSupport/CollaborateTogether.svg'
import icon4 from '@/assets/images/helpSupport/FindQuickFAQs.svg'
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';

const UpperCardSect = () => {

  const { t } = useTranslation();
  const cardData = [
    {
      icon: icon1,
      title: t("start_a_conversation"),
      description: t("ask_questions_and_engage_with_the_community"),
    },
    {
      icon: icon2,
      title: t("share_your_knowledge"),
      description: t("answer_questions_and_contribute_valuable_insights_to_the_group"),
    },
    {
      icon: icon3,
      title: t("collaborate_together"),
      description: t("support_and_learn_with_fellow_members"),
    },
    {
      icon: icon4,
      title: t("find_quick_faqs"),
      description: t("explore_answers_to_common_questions"),
    }
  ]

  return (
    <div className="container">
      <div className="-mt-14 md:-mt-[124px] bg-white shadow-[0px_2px_12px_0px_#ADB3B829] rounded-2xl relative p-3 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {cardData.map((card, index) => (
              <div className="p-3 md:p-4 lg:p-6 bg-[#F2F5F7] rounded-2xl" key={index}>
                <div className="flex items-center gap-4">
                  <div className="w-[100px] sm:w-[72px] h-[72px] bg-white rounded-[8px] flex items-center justify-center border-4 border-white">
                    <div className='flexCenter w-12 h-12 bg-[#D9D9D9] rounded'>
                      <CustomImageTag src={card.icon} alt={card.title} className="w-8 h-8 object-contain" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-xl mb-1">{card.title}</h3>
                    <p className="text-sm sm:text-base">{card.description}</p>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UpperCardSect
