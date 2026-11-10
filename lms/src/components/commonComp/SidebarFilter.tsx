'use client'
import { SidebarFilterTypes } from '@/types';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { courseLanguageDataSelector } from '@/redux/reducers/courseLanguageSlice';
import { useTranslation } from '@/hooks/useTranslation';

type FilterItem = { name: string; filterValue: string | number };
type FilterSection = {
  title: string;
  items: FilterItem[];
  filterKey: keyof SidebarFilterTypes;
};

interface SidebarFilterProps {
  sidebarFilter: SidebarFilterTypes;
  setSidebarFilter: (filter: SidebarFilterTypes) => void;
  mobileComp?: boolean;
  isInstructorPage?: boolean;
  // Kept for callers that still support direct backend category routes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCategorySelect?: (category: any) => void;
}

const SidebarFilter: React.FC<SidebarFilterProps> = ({ sidebarFilter, setSidebarFilter, mobileComp }) => {
  const pathname = usePathname();
  const isInstructorPage = pathname.includes('/instructors');
  const { t } = useTranslation();
  const courseLanguages = useSelector(courseLanguageDataSelector);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const filterSections: FilterSection[] = [
    ...(!isInstructorPage ? [
      {
        title: t('course_level'), filterKey: 'level' as const,
        items: [
          { name: t('beginner'), filterValue: 'beginner' },
          { name: t('intermediate'), filterValue: 'intermediate' },
          { name: t('advanced'), filterValue: 'advanced' },
        ],
      },
      {
        title: t('language'), filterKey: 'language' as const,
        items: courseLanguages.map(language => ({ name: language.name, filterValue: language.id })),
      },
      {
        title: t('course_duration'), filterKey: 'duration' as const,
        items: [
          { name: t('weeks_1_4'), filterValue: '1-4_weeks' },
          { name: t('weeks_4_12'), filterValue: '4-12_weeks' },
          { name: t('months_3_6'), filterValue: '3-6_months' },
          { name: t('months_6_12'), filterValue: '6-12_months' },
        ],
      },
      {
        title: t('price'), filterKey: 'price' as const,
        items: [{ name: t('free'), filterValue: 'free' }, { name: t('paid'), filterValue: 'paid' }],
      },
    ] : []),
    {
      title: t('rating'), filterKey: 'rating',
      items: [5, 4, 3, 2, 1].map(rating => ({ name: String(rating), filterValue: rating })),
    },
  ];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const updateFilter = useCallback((section: FilterSection, item: FilterItem, checked: boolean) => {
    const values = String(sidebarFilter[section.filterKey] || '').split(',').filter(Boolean);
    const value = String(item.filterValue);
    const nextValues = checked ? Array.from(new Set([...values, value])) : values.filter(existing => existing !== value);
    setSidebarFilter({ ...sidebarFilter, [section.filterKey]: nextValues.join(',') });
  }, [sidebarFilter, setSidebarFilter]);

  return (
    <div className={`w-full bg-white border borderColor h-full overflow-y-auto rounded-2xl ${mobileComp ? 'border-none' : ''}`}>
      {filterSections.map(section => (
        <section key={section.filterKey} className='border-b borderColor last:border-b-0'>
          <button
            type='button'
            className='flex w-full items-center justify-between p-4 text-left font-semibold'
            aria-expanded={expandedSections[section.filterKey] !== false}
            onClick={() => setExpandedSections(previous => ({ ...previous, [section.filterKey]: previous[section.filterKey] === false }))}
          >
            {section.title}
            {expandedSections[section.filterKey] !== false ? <FaChevronUp aria-hidden='true' /> : <FaChevronDown aria-hidden='true' />}
          </button>
          {expandedSections[section.filterKey] !== false && <div className='px-4 pb-4 space-y-2'>
            {(section.filterKey === 'language' && !showAllLanguages ? section.items.slice(0, 6) : section.items).map(item => (
              <label key={item.filterValue} className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  className='h-4 w-4 accent-primaryBg'
                  checked={String(sidebarFilter[section.filterKey] || '').split(',').includes(String(item.filterValue))}
                  onChange={event => updateFilter(section, item, event.target.checked)}
                  aria-label={`Filter by ${section.title}: ${item.name}`}
                />
                <span>{item.name}</span>
                {section.filterKey === 'rating' && <span className='flex gap-0.5' aria-hidden='true'>
                  {[1, 2, 3, 4, 5].map(star => <FaStar key={star} className={`text-xs ${star <= Number(item.filterValue) ? 'text-[#DB9305]' : 'text-[#A5B7C4]'}`} />)}
                </span>}
              </label>
            ))}
            {section.filterKey === 'language' && section.items.length > 6 && <button type='button' onClick={() => setShowAllLanguages(previous => !previous)} className='primaryColor text-sm underline'>
              {showAllLanguages ? t('show_less') : t('show_more')}
            </button>}
          </div>}
        </section>
      ))}
    </div>
  );
};

export default memo(SidebarFilter);
