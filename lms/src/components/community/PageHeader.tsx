import React from "react";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: {
    label: string;
    href?: string;
  }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
}) => {
  
  return (
    <div className="bg-[#010211] py-8 md:py-20 text-white relative">
      <div className="container space-y-4 px-4">
        <div className="bg-[#FFFFFF3D] rounded-full py-2 px-4 md:w-max flex gap-1 flex-wrap text-sm sm:text-base">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span>
                  <MdKeyboardArrowRight size={22} className="rtl:rotate-180" />
                </span>
              )}
              {crumb.href ? (
                <Link href={crumb.href} className="">
                  <span>{(crumb.label).slice(0, 17)} {crumb.label.length > 17 ? "..." : ""}</span>
                </Link>
              ) : (
                <span>{(crumb.label).slice(0, 17)} {crumb.label.length > 17 ? "..." : ""}</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flexColCenter items-start gap-2">
          <h1 className="font-semibold text-2xl sm:text-3xl md:text-3xl lg:text-[40px]">
            {title}
          </h1>
          {description && (
            <p className="sectionPara lg:w-[52%] opacity-75">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
