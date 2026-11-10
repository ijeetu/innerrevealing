import axiosClient from "@/utils/api/axiosClient";
import { ApiResponse } from "@/types/instructorTypes/instructorTypes";
import { earningsApiRoute } from "@/utils/apiRoutes";

// TypeScript interfaces for earnings response data structure

// Chart data point interface for summary cards
export interface SummaryChartDataPoint {
    name: string;
    earning: number;
}

// Summary card interface with chart data
export interface SummaryCard {
    value: string;
    formatted_value: string;
    chartData: SummaryChartDataPoint[];
}

// Action card interface
export interface ActionCard {
    value: string;
    formatted_value: string;
    button_text: string;
    button_action: string;
}

// Chart data point interfaces for different time periods
export interface ChartDataType {
    name: string;
    revenue: number;
    commission: number;
}

// Earnings chart data point interfaces
export interface EarningsDataType {
    name: string;
    earning: number;
}

// Revenue chart structure
export interface RevenueChart {
    yearly: ChartDataType[];
    monthly: ChartDataType[];
    weekly: ChartDataType[];
}

// Earnings chart structure
export interface EarningsChart {
    yearly: EarningsDataType[];
    monthly: EarningsDataType[];
    weekly: EarningsDataType[];
}

// Recent withdrawal interface
export interface RecentWithdrawal {
    id: number;
    amount: string;
    status: string;
    requested_at: string;
    processed_at: string;
    status_label: string;
}

// Filters interface
export interface Filters {
    year: string;
    available_years: number[];
}

// Main earnings data interface
export interface EarningsData {
    summary_cards: SummaryCardType;
    action_cards: ActionCardType;
    charts: {
        revenue_chart: RevenueChart;
        earnings_chart: EarningsChart;
    };
    recent_withdrawals: RecentWithdrawal[];
    filters: Filters;
}

export interface AmountOnHold {
    value: string;
    formatted_value: string;
}

// Summary cards type
export interface SummaryCardType {
    total_revenue: SummaryCard;
    total_commission: SummaryCard;
    total_earning: SummaryCard;
    amount_on_hold: AmountOnHold,
}

// Action cards type
export interface ActionCardType {
    available_to_withdraw: ActionCard;
    total_withdrawal: ActionCard;
}

// Use the common ApiResponse interface for consistent response handling
export type GetEarningsResponse = ApiResponse<EarningsData>;

/**
 * Fetch instructor earnings data from the API
 * @param params - Parameters for fetching earnings data ( year)
 * @returns Promise with earnings response or null
 */
export const getEarnings = async (): Promise<GetEarningsResponse | null> => {
    try {
        const response = await axiosClient.get<GetEarningsResponse>(earningsApiRoute);

        // Always return the response data, even if error: true
        // This allows the component to handle API errors properly
        return response.data;
    } catch (error) {
        // Handle both HTTP errors (422, 500, etc.) and network errors
        const axiosError = error as { response?: { data?: GetEarningsResponse } };
        console.log("Error in getEarnings:", axiosError?.response?.data);

        // If it's an HTTP error with response data, return the API error response
        if (axiosError?.response?.data) {
            return axiosError.response.data;
        }

        // If it's a network error (no response), return null
        return null;
    }
};
