"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import bgLines from "../../../assets/images/testimonialsLines.png";
import { toast } from "react-hot-toast";
import { getCourseReviews, Review } from "@/utils/api/user/getCourseReviews";
import { useTranslation } from "@/hooks/useTranslation";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { currentLanguageSelector, isRTLSelector } from '@/redux/reducers/languageSlice';

const Testimonials: React.FC = () => {

  // Static testimonials data
  const [testimonialsData, setTestimonialsData] = useState<Review[]>([]);
  const settings = useSelector(settingsSelector);
  const currentLanguageCode = useSelector(currentLanguageSelector);
  const isRTL = useSelector(isRTLSelector);
  const companyName = settings?.data?.app_name || process.env.NEXT_PUBLIC_WEB_NAME || 'eLMS';

  const { t } = useTranslation();

  // Fetch testimonials data from the API
  const fetchTestimonialsData = async () => {
    try {
      const response = await getCourseReviews({ per_page: 10 });
      if (response) {
        if (!response.error) {
          if (response.data) {
            setTestimonialsData(response.data.reviews.data);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch testimonials data");
          setTestimonialsData([]);
        }
      } else {
        console.log("response is null in fetchTestimonialsData");
        setTestimonialsData([]);
      }
    } catch (error) {
      console.error("Error fetching testimonials data:", error);
      toast.error("Failed to fetch testimonials data");
      setTestimonialsData([]);
    }
  }

  useEffect(() => {
    fetchTestimonialsData();
  }, []);

  return (
    testimonialsData.length > 0 && (
      <div className="sectionBg commonMT py-8 md:py-12 md:pb-32">
        <div className="container space-y-8 md:space-y-20 lg:space-y-32">
          <div className="flexColCenter gap-2">
            <h6 className="sectionTitle">{t("what_our_learners_say")}</h6>
            <p className="md:w-[80%] xl:w-[70%] 2xl:w-[40%] sectionPara text-center">
              {t("real_feedback_from_students")}
            </p>
          </div>
          <div className={`relative `}>
            <div
              className="testimonialsBgDiv absolute top-0 bottom-0 left-0 right-0 m-auto w-[70%] h-0 md:h-[350px] lg:h-[406px] rounded-2xl"
              style={{
                background: `url(${bgLines.src})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            <Swiper
              key={currentLanguageCode || 'default'}
              dir={isRTL ? 'rtl' : 'ltr'}
              modules={[Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{
                clickable: true,
                bulletClass:
                  "swiper-pagination-bullet swiper-pagination-bullet-custom",
                bulletActiveClass:
                  "swiper-pagination-bullet-active swiper-pagination-bullet-active-custom",
                renderBullet: function (index, className) {
                  return `<span class="${className}"></span>`;
                },
              }}
              // autoplay={{
              //     delay: 5000,
              //     disableOnInteraction: false,
              // }}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="testimonialSwiper [&>.swiper-wrapper]:pb-12  md:[&>.swiper-wrapper]:pb-20 [&>.swiper-pagination]:flex [&>.swiper-pagination]:items-center [&>.swiper-pagination]:justify-center [&>.swiper-pagination]:pb-[6px] [&>.swiper-pagination]:gap-2"
            >
              {testimonialsData.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="bg-white rounded-[14px] p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4 gap-2">
                      <div className="border !border-black p-0.5 rounded-full overflow-hidden">
                        <CustomImageTag
                          src={testimonial.user.avatar}
                          alt="courseInstructorProfile"
                          className="w-[34px] sm:h-[34px] rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{testimonial.user.name}</h3>
                        <p className="text-sm secondaryText">
                          {companyName}{" "}{t("student")}
                        </p>
                      </div>
                      <div className="ml-auto bg-[#DB9305] text-white text-xs font-bold px-2 py-1 rounded-full">
                        {`★ ${testimonial.rating}`}
                      </div>
                    </div>
                    <p className="flex-grow line-clamp-4 min-h-[100px]">
                      {testimonial.review}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    )
  )
};

export default Testimonials;
