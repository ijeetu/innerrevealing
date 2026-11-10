"use client";

import { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import AccountPanel from "@/components/profile/AccountPanel";
import { Input } from "@/components/ui/input";
import { changeLocalPassword } from "@/utils/localAuth";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { logoutSuccess as clearCoupons } from "@/redux/reducers/couponSlice";
import { resetTeamMemberData } from "@/redux/instructorReducers/teamMemberSlice";
import { clearBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { setCartData } from "@/redux/reducers/cartSlice";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import toast from "react-hot-toast";

export default function AccountSecurityPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (password !== confirmation) { setError("Your new passwords do not match."); return; }
    setPending(true);
    try {
      const response = await changeLocalPassword(currentPassword, password, confirmation);
      dispatch(logoutSuccess());
      dispatch(clearCoupons());
      dispatch(resetTeamMemberData());
      dispatch(clearBillingDetails());
      dispatch(setCartData(null));
      toast.success(response.message || "Password updated. Please sign in again.");
      router.replace("/");
      dispatch(setIsLoginModalOpen(true));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update your password.");
    } finally { setPending(false); }
  };

  return <AccountPanel title="Account security" description="Keep your account secure with a strong, unique password.">
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      <h2 className="text-xl font-semibold">Change password</h2>
      <div className="space-y-2">
        <label htmlFor="current-password" className="text-sm font-medium">Current password</label>
        <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required maxLength={128} disabled={pending} />
      </div>
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">New password</label>
        <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} maxLength={128} disabled={pending} aria-describedby="new-password-help" />
        <p id="new-password-help" className="text-xs text-muted-foreground">Use 10 or more characters. You will sign in again after this change.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm-new-password" className="text-sm font-medium">Confirm new password</label>
        <Input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={10} maxLength={128} disabled={pending} />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="ir-lms-register disabled:opacity-60" disabled={pending}>{pending ? "Updating…" : "Update password"}</button>
    </form>
  </AccountPanel>;
}
