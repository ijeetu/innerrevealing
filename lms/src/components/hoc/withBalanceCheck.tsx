"use client";
import React from 'react';
import { useSelector } from 'react-redux';
import { isLoginSelector, userDataSelector } from '@/redux/reducers/userSlice';
import { UserDetails } from '@/utils/api/user/getUserDetails';
import AccessCourseNegativeWalletBalanceModal from '@/components/commonComp/AccessCourseNegativeWalletBalanceModal';

export default function withBalanceCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  isPurchasedOrGetter?: boolean | ((props: P) => boolean)
) {
  const WithBalanceCheck = (props: P) => {
    const isLogin = useSelector(isLoginSelector);
    const userData = useSelector(userDataSelector) as UserDetails;

    const hasNegativeBalance = isLogin && userData?.total_balance !== undefined && userData?.total_balance !== null && userData.total_balance < 0;

    const isPurchased = typeof isPurchasedOrGetter === 'function'
      ? isPurchasedOrGetter(props)
      : isPurchasedOrGetter;
    const isRestricted = hasNegativeBalance && isPurchased !== false;

    if (isRestricted) {
      return (
        <div className="relative min-h-[500px]">
          <AccessCourseNegativeWalletBalanceModal forceOpen={true} />
          <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-40 pointer-events-none" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithBalanceCheck.displayName = `WithBalanceCheck(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithBalanceCheck;
}
