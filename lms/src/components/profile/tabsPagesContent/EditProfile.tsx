"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountPanel from "@/components/profile/AccountPanel";
import { Input } from "@/components/ui/input";
import { userDataSelector, setUserData, setUserLastFetch } from "@/redux/reducers/userSlice";
import type { UserDetails } from "@/utils/api/user/getUserDetails";
import { updateLocalProfile } from "@/utils/localAuth";
import toast from "react-hot-toast";

export default function EditProfile() {
  const user = useSelector(userDataSelector) as Partial<UserDetails>;
  const dispatch = useDispatch();
  const [name, setName] = useState(user.name || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setName(user.name || ""); }, [user.name]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await updateLocalProfile(name.trim());
      if (!response.data?.user) throw new Error("Could not load your updated profile.");
      dispatch(setUserData(response.data.user));
      dispatch(setUserLastFetch(Date.now()));
      toast.success(response.message || "Profile updated.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update your profile.");
    } finally { setPending(false); }
  };

  return <AccountPanel title="Your profile" description="A few details to make your learning space feel like yours.">
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      <h2 className="text-xl font-semibold">Personal details</h2>
      <div className="space-y-2">
        <label htmlFor="profile-name" className="text-sm font-medium">Your name</label>
        <Input id="profile-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} disabled={pending} />
      </div>
      <div className="space-y-2">
        <label htmlFor="profile-email" className="text-sm font-medium">Email address</label>
        <Input id="profile-email" type="email" value={user.email || ""} readOnly aria-describedby="profile-email-help" className="bg-muted text-muted-foreground" />
        <p id="profile-email-help" className="text-xs text-muted-foreground">This is the email you use to sign in. Contact the centre if you need help with your account.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="ir-lms-register disabled:opacity-60">{pending ? "Saving…" : "Save changes"}</button>
    </form>
  </AccountPanel>;
}
