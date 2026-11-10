"use client";

import { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import AccountPanel from "@/components/profile/AccountPanel";
import { Input } from "@/components/ui/input";
import { deleteLocalAccount } from "@/utils/localAuth";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { logoutSuccess as clearCoupons } from "@/redux/reducers/couponSlice";
import { resetTeamMemberData } from "@/redux/instructorReducers/teamMemberSlice";
import { clearBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { setCartData } from "@/redux/reducers/cartSlice";
import toast from "react-hot-toast";

export default function DeleteAccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !confirmed) return;
    setError("");
    setPending(true);
    try {
      const response = await deleteLocalAccount(password);
      dispatch(logoutSuccess());
      dispatch(clearCoupons());
      dispatch(resetTeamMemberData());
      dispatch(clearBillingDetails());
      dispatch(setCartData(null));
      toast.success(response.message || "Your account has been deleted.");
      router.replace("/");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not delete your account.");
    } finally { setPending(false); }
  };

  return <AccountPanel title="Delete account" description="Manage the account you use for your Inner Revealing practice.">
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      <h2 className="text-xl font-semibold">Permanently delete your account</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">This permanently removes your account and signs you out of all devices. This action cannot be undone.</p>
      <div className="space-y-2">
        <label htmlFor="delete-account-password" className="text-sm font-medium">Confirm your password</label>
        <Input id="delete-account-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={128} disabled={pending} />
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required disabled={pending} className="mt-1 shrink-0" />
        I understand that my account will be permanently deleted.
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-3 text-sm font-medium disabled:opacity-60" disabled={pending || !confirmed}>{pending ? "Deleting…" : "Delete my account"}</button>
    </form>
  </AccountPanel>;
}
