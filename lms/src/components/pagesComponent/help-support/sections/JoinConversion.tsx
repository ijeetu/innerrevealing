'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getGroups, GroupItem } from '@/utils/api/user/helpdesk/groups/groups';
import { extractGroupsData, isGroupsResponseSuccess } from '@/utils/api/user/helpdesk/groups/groupsHelper';
import JoinConversationCardSkeleton from '@/components/skeletons/help-support/JoinConversationCardSkeleton';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import { useDispatch, useSelector } from 'react-redux';
import { setGroupsData } from '@/redux/reducers/groupsSlice';
import { AppDispatch } from '@/redux/store';
import { useTranslation } from '@/hooks/useTranslation';
import { currentLanguageSelector } from '@/redux/reducers/languageSlice';

const JoinConversion: React.FC = () => {

    const { t } = useTranslation();
    const currentLanguageCode = useSelector(currentLanguageSelector)

    const dispatch = useDispatch<AppDispatch>();
    // State for all communities data (fetched once)
    const [allCommunitiesData, setAllCommunitiesData] = useState<GroupItem[]>([]);
    // State for currently displayed communities (paginated)
    const [conversationData, setConversationData] = useState<GroupItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [hasMoreCommunities, setHasMoreCommunities] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Constants for pagination
    const ITEMS_PER_PAGE = 8;

    const fetchCommunitiesData = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const response = await getGroups();
            if (isGroupsResponseSuccess(response)) {
                const data = extractGroupsData(response);
                if (data) {

                    // store data in redux
                    dispatch(setGroupsData(data));

                    // Store all data
                    setAllCommunitiesData(data);

                    // Show first 8 items initially
                    const initialData = data.slice(0, ITEMS_PER_PAGE);
                    setConversationData(initialData);

                    // Check if there are more items to show
                    setHasMoreCommunities(data.length > ITEMS_PER_PAGE);
                    setCurrentPage(1);
                }
            }
        } catch (error) {
            console.error('Error fetching communities data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // Initial data fetch
    useEffect(() => {
        fetchCommunitiesData();
    }, []);

    const handleMoreCommunities = (): void => {
        setIsLoadingMore(true);

        // Calculate next page data
        const nextPage = currentPage + 1;
        const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        // Get next batch of communities
        const nextBatch = allCommunitiesData.slice(startIndex, endIndex);

        // Append to existing data
        setConversationData(prevData => [...prevData, ...nextBatch]);
        setCurrentPage(nextPage);

        // Check if there are more items to load
        const totalLoaded = endIndex;
        setHasMoreCommunities(totalLoaded < allCommunitiesData.length);
        setIsLoadingMore(false);
    };
    // if there is no data and not loading, return null
    if (allCommunitiesData.length === 0 && !isLoading) return null;

    return (
        <div className="py-8 md:py-12 lg:py-16 sectionBg">
            <div className="container">
                <div className="flex flex-col gap-2 mb-8 md:mb-12">
                    <h2 className="sectionTitle">{t("join_the_conversation")}</h2>
                    <p className="sectionPara">{t("explore_community_groups")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 between-992-1199:grid-cols-3 between-1200-1399:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <JoinConversationCardSkeleton key={index} />
                        ))
                    ) : (
                        // Show actual data
                        conversationData.map((item: GroupItem, index: number) => (
                            <div key={index} className="bg-white p-6 rounded-2xl border borderColor flexColCenter group hover:shadow-[0px_7px_28px_2px_#ADB3B83D] transition-all duration-300">
                                <div className="flexColCenter text-center gap-2 mb-6">
                                    <CustomImageTag
                                        src={item.image}
                                        alt={item.name}
                                        className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] bg-gray-100 rounded-[14px] border border-[#E8E8EC] mb-8 overflow-hidden"
                                    />
                                    <h3 className="font-semibold md:text-lg group-hover:primaryColor transition-all duration-300 line-clamp-1">{item.name}</h3>
                                    <p className="text-[#010211] opacity-50 line-clamp-2">{item.description}</p>
                                </div>
                                <Link href={`/help-support/support-group/${item.slug}?lang=${currentLanguageCode}`}>
                                    <button className="border text-[#010211] px-4 py-2 text-sm rounded-[4px] hover:bg-black hover:text-white transition-colors duration-300">
                                        {t("let_s_discuss")}
                                    </button>
                                </Link>
                            </div>
                        ))
                    )}

                    {/* show skeleton when loading more communities */}
                    {isLoadingMore && (
                        Array.from({ length: 8 }).map((_, index) => (
                            <JoinConversationCardSkeleton key={index} />
                        ))
                    )}

                </div>

                {/* Click Button for load more communities */}
                <div className='mt-8 text-center'>
                    {hasMoreCommunities && (
                        <button
                            onClick={handleMoreCommunities}
                            disabled={isLoadingMore}
                            className={`commonBtn ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoadingMore ? t("loading_more_communities") : t("more_communities")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default JoinConversion
