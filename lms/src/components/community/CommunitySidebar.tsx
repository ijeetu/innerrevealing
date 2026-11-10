"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BiLockAlt } from "react-icons/bi";
import { useSelector } from "react-redux";
import { groupsSelector } from "@/redux/reducers/groupsSlice";
import { GroupItem } from "@/utils/api/user/helpdesk/groups/groups";
import { useTranslation } from "@/hooks/useTranslation";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";

type CommunitySidebarProps = {
  currentSlug: string;
};

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ currentSlug }) => {
  console.log("currentSlug", currentSlug);

  const { t } = useTranslation();
  const currentLanguageCode = useSelector(currentLanguageSelector)
  const groupsData = useSelector(groupsSelector);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      {/* Mobile Dropdown Sidebar */}
      <div className="md:hidden w-full border-b border-gray-200 py-4">
        <div
          className="relative w-full cursor-pointer dropdown-container"
          onClick={toggleDropdown}
        >
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3">
            <h2 className="font-medium text-gray-900">{"activeGroupName"}</h2>
            <MdKeyboardArrowDown
              size={20}
              className={`transition-transform ${dropdownOpen ? "rotate-180" : ""
                }`}
            />
          </div>

          {dropdownOpen && (
            <ul className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[60vh] overflow-y-auto">
              {groupsData.map((group: GroupItem, index: number) => {
                return (
                  <li key={group.id}>
                    <Link
                      href={`/help-support/support-group/${group.slug}?lang=${currentLanguageCode}`}
                      className={`flex items-center justify-between py-2 px-3 text-sm ${group.slug === currentSlug
                          ? "bg-gray-100 font-medium"
                          : "hover:bg-gray-50"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(false);
                      }}
                    >
                      <span>
                        {index + 1}. {group.name}
                      </span>
                      {group.is_private === 1 && (
                        <BiLockAlt className="text-gray-500" size={14} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-[250px] lg:w-[350px]  border-r border-gray-200 py-8 flex-shrink-0">
        <h2 className="font-semibold text-gray-900 px-3 mb-5 text-xl">
          {t("community_groups")}
        </h2>
        <ul className="space-y-1">
          {groupsData.map((group: GroupItem, index: number) => {
            return (
              <li key={group.id}>
                <Link
                  href={`/help-support/support-group/${group.slug}?lang=${currentLanguageCode}`}
                  className={`flex items-center justify-between py-2 px-3 text-sm ${group.slug === currentSlug
                      ? "border-r-[3px] !border-[var(--primary-color)] font-medium bg-white"
                      : ""
                    }`}
                >
                  <span>
                    {index + 1}. {group.name}
                  </span>
                  {group.is_private === 1 && (
                    <BiLockAlt className="text-gray-500 mr-1" size={14} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default CommunitySidebar;
