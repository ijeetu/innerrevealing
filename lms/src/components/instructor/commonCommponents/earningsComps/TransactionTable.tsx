'use client'
import DataNotFound from '@/components/commonComp/DataNotFound';
import TableCellSkeleton from '@/components/skeletons/instrutor/TableCellSkeleton';
import { WithdrawalItem } from '@/utils/api/instructor/earnings/getWithdrawalHistory';
import { formatDate, getCurrencySymbol } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
interface TransactionTableProps {
  data: WithdrawalItem[];
  isLoading: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#83B8071F] text-[#83B807]';
      case 'Rejected':
        return 'bg-[#DB3D261F] text-[#DB3D26]';
      case 'Pending':
        return 'bg-[#0186D81F] text-[#0186D8]';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  // Mobile view for transactions (vertically stacked with dividers)
  const renderMobileView = () => {
    return (
      <div className="space-y-4">
        {

          isLoading ? (
            <div className="text-center p-4">
              <TableCellSkeleton />
            </div>
          ) :
            data.length > 0 ? (
              data.map((transaction) => (
                <div key={transaction?.id} className="border-b borderColor pb-4 last:border-b-0 p-4 m-0 ">
                  {/* Transaction Number */}
                  <div className="text-2xl font-bold text-black mb-4">

                  </div>

                  {/* Transaction Details - Vertically Stacked */}
                  <div className="space-y-0">
                    {/* Transaction ID */}
                    <div className="grid grid-cols-2 gap-2 pb-3 border-b borderColor">
                      <div className="text-sm font-bold text-black">{t("transaction_id")}:</div>
                      <div className="text-sm text-black mt-1">{transaction?.id}</div>
                    </div>

                    {/* Transaction Date */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-b borderColor">
                      <div className="text-sm font-bold text-black">{t("transaction_date")}:</div>
                      <div className="text-sm text-black mt-1">{formatDate(transaction?.requested_at)}</div>
                    </div>

                    {/* Amount */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-b borderColor">
                      <div className="text-sm font-bold text-black">{t("amount")}:</div>
                      <div className="text-sm text-black mt-1">{getCurrencySymbol()}{transaction?.amount}</div>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-b borderColor">
                      <div className="text-sm font-bold text-black">{t("status")}:</div>
                      <div className="mt-1">
                        <span className={`${getStatusBadge(transaction?.status_label)} text-sm w-[100px] h-[26px] flexCenter rounded`}>
                          {transaction?.status_label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <DataNotFound />
              </div>
            )
        }
      </div>
    )
  }


  return (
    <div className=''>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b sectionBg borderColor">
                <th className="text-start p-3 font-semibold">
                  {t("transaction_id")}
                </th>
                <th className="text-start p-3 font-semibold">
                  {t("transaction_date")}
                </th>
                <th className="text-start p-3 font-semibold">{t("amount")}</th>
                <th className="text-start p-3 font-semibold">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {
                isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
                      <TableCellSkeleton />
                    </td>
                  </tr>
                ) :
                  data.length > 0 ? (
                    data.map((transaction, index) => (
                      <tr key={transaction?.id} className="border-b hover:sectionBg last:border-b-0 borderColor">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{transaction?.id}</td>
                        <td className="p-3">{formatDate(transaction?.requested_at)}</td>
                        <td className="p-3">{getCurrencySymbol()}{transaction?.amount}</td>
                        <td className="p-3">
                          <span className={`${getStatusBadge(transaction?.status_label)} text-sm w-[100px] h-[26px] flexCenter rounded`}>
                            {transaction?.status_label}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <DataNotFound />
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {renderMobileView()}
      </div>
    </div>
  )
}

export default TransactionTable 