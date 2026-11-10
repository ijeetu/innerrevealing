import { Button } from '@/components/ui/button'
import React from 'react'
import { BiSolidShow } from 'react-icons/bi'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import TableCellSkeleton from "@/components/skeletons/instrutor/TableCellSkeleton";
import DataNotFound from "@/components/commonComp/DataNotFound";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { CourseDataType } from '@/utils/api/instructor/course/getAddedCourses';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrencySymbol } from '@/utils/helpers';

interface EarningListTableProps {
  data: CourseDataType[];
  isEarningsPage?: boolean;
  isLoading?: boolean;
}

const EarningListTable: React.FC<EarningListTableProps> = ({
  isLoading = false,
  data,
  isEarningsPage = false,
}) => {

  const { t } = useTranslation();
  const router = useRouter()

  const tableColumns = [
    {
      key: "name",
      header: t("course_name"),
      className: "",
    },
    {
      key: "revenue",
      header: t("revenue"),
      render: (item: { revenue?: number }) => `${getCurrencySymbol()}${item.revenue || 0}`,
      className: " w-32",
    },
    {
      key: "action",
      header: t("action"),
      render: (item: CourseDataType) => (
        <Link href={`/instructor/earnings/${item.slug}`}>

          <Button
            className="h-7 md:h-9 px-2 md:px-4 text-xs bg-[var(--primary-color)] hover:bg-[var(--primary-color)]"
          >
            <BiSolidShow />
          </Button>
        </Link>
      ),
      className: "text-right w-16",
    },
  ];

  return (
    <Card className="bg-white rounded-[8px] pt-0">

      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table className='border-none border-spacing-y-0 rounded-[8px]'>
            <TableHeader>
              <TableRow className="sectionBg rounded-[8px]">
                <TableHead className="w-12 font-semibold text-base text-start">
                  #
                </TableHead>
                {tableColumns.map((column) => (
                  <TableHead key={column.key} className={`font-semibold text-base text-start ${column.className}`}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length + 1} className="text-center">
                    <TableCellSkeleton />
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((item, rowIndex) => (
                  <TableRow key={item.id || rowIndex} className="hover:bg-gray-50 border-b borderColor last:border-b-0">
                    <TableCell className="text-base font-normal text-start">
                      {item.id}
                    </TableCell>
                    <TableCell className="text-start">
                      <div className="flex items-center">
                        <div className="me-3 flex-shrink-0">
                          <CustomImageTag
                            src={item.thumbnail || ''}
                            alt={item.title || ''}
                            className="w-12 h-12 rounded-[8px]"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-semibold max-w-[200px] lg:max-w-xs truncate text-base"
                            title={item.title}
                          >
                            {item.title}
                          </div>
                          {!isEarningsPage && item.category && (
                            <div className="text-sm">
                              {t("category")} -{" "}
                              <span className="primaryColor font-medium">
                                {item.category.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isEarningsPage && (
                      <TableCell className="text-start">
                        <div className="font-semibold">
                          {item.total_lesson_count || 0}
                        </div>
                        <div className="text-sm">{t("total_lesson")}</div>
                      </TableCell>
                    )}
                    <TableCell className="text-start">
                      {item.price === '0' || item.price === null ? (
                        <div className="font-medium text-base text-green-600">
                          {t("free")}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-semibold text-base">
                            {getCurrencySymbol()}{item.total_revenue}
                          </span>
                          {/* {item.discount_price && isEarningsPage && (
                            <span className="text-gray-700 text-base line-through">
                              {getCurrencySymbol()}{item.price}
                            </span>
                          )} */}
                        </div>
                      )}
                    </TableCell>
                    {!isEarningsPage && (
                      <TableCell className="text-sm text-start">
                        {item.discount_price && item.price ? `${Math.round(((Number(item.price) - Number(item.discount_price)) / Number(item.price)) * 100)}%` : "-"}
                      </TableCell>
                    )}
                    {!isEarningsPage && (
                      <TableCell className="text-start">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {item.total_enrolled_students || 0}
                          </span>
                          <span className="text-sm">
                            {t("total_enrollment")}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    {!isEarningsPage && (
                      <TableCell className="text-start">
                        <div className="px-2 py-1 text-sm rounded-[5px] w-full font-medium bg-[#83B8071F] text-[#83B807]">
                          {item.status || 'Active'}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-start">
                      {!isEarningsPage ? (
                        <Link href={`/instructor/earnings/${item.slug}`} className="pl-2 rtl:pl-0 rtl:pr-2">
                          <Button
                            className="h-10 px-6 primaryBg text-white rounded-lg hover:hoverBgColor transition-all duration-300"
                          >
                            {t("view_details")}
                          </Button>
                        </Link>
                      ) : (
                        <div className="pl-2 rtl:pl-0 rtl:pr-2 flex justify-start">
                          <Button
                            className="h-7 md:h-9 px-2 md:px-4 text-xs bg-[var(--primary-color)] hover:bg-[var(--primary-color)]"
                            onClick={() => router.push(`/instructor/earnings/${item.slug}`)}
                          >
                            <BiSolidShow />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="text-center">
                    <DataNotFound />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="p-4">
                <TableCellSkeleton />
              </div>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <div key={item.id || index} className="border-b border-gray-200 p-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-shrink-0 w-8 font-semibold text-gray-900">
                          {item.id}
                        </div>
                        <Button
                          className="h-8 px-2 primaryBg text-white rounded-lg w-fit hover:hoverBgColor transition-all duration-300"
                          onClick={() => router.push(`/instructor/earnings/${item.slug}`)}
                        >
                          {t("view_details")}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-[60px] h-[60px] bg-gray-300 rounded overflow-hidden">
                          <CustomImageTag
                            src={item.thumbnail || ''}
                            alt={item.title || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                          {!isEarningsPage && item.category && (
                            <p className="text-sm text-gray-600">
                              {t("category")} - <span className="primaryColor">{item.category.name}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-2 text-sm">
                    {!isEarningsPage && (
                      <div className="flex justify-between items-center border-b borderColor pb-2">
                        <span className="font-semibold">{t("lessons")}:</span>
                        <div className="flex w-1/2">
                          <span className="font-medium text-gray-900">{item.total_lesson_count || 0}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-b borderColor pb-2">
                      <span className="font-semibold">{t("price")}:</span>
                      <div className="flex space-x-2 w-1/2">
                        {item.price === '0' || item.price === null ? (
                          <span className="font-medium text-green-600">{t("free")}</span>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900">
                              {getCurrencySymbol()}{item.discount_price || item.price}
                            </span>
                            {item.discount_price && !isEarningsPage && (
                              <span className="text-gray-400 line-through">
                                {getCurrencySymbol()}{item.price}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {!isEarningsPage && (
                      <div className="flex justify-between items-center border-b borderColor pb-2">
                        <span className="font-semibold">{t("discount")}:</span>
                        <div className="flex w-1/2">
                          <span className="font-medium text-gray-900">
                            {item.discount_price && item.price ? `${Math.round(((Number(item.price) - Number(item.discount_price)) / Number(item.price)) * 100)}%` : "-"}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isEarningsPage && (
                      <div className="flex justify-between items-center border-b borderColor pb-2">
                        <span className="font-semibold">{t("total_enrollment")}:</span>
                        <div className="flex w-1/2">
                          <span className="font-medium text-gray-900">
                            {item.total_enrolled_students || 0}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isEarningsPage && (
                      <div className="flex justify-between items-center border-b borderColor pb-2">
                        <span className="font-semibold">{t("status")}:</span>
                        <div className="flex w-1/2">
                          <div className="px-3 py-1 text-sm rounded-full font-medium bg-[#83B8071F] text-[#83B807]">
                            {item.status}
                          </div>
                        </div>
                      </div>
                    )}

                    {isEarningsPage && (
                      <div className="flex justify-between items-center border-b borderColor pb-2">
                        <span className="font-semibold">{t("ratings")}:</span>
                        <div className="flex w-1/2">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-[#DB9305]" />
                            <span className="font-semibold">{item.average_rating || 0}</span>
                            <span className="text-sm text-gray-500">
                              ({item.rating_count || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <DataNotFound />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EarningListTable
