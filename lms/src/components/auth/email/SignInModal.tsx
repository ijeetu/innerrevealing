"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { setToken, setUserData, setUserLastFetch } from "@/redux/reducers/userSlice";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import { loginLocalAccount, registerLocalAccount } from "@/utils/localAuth";
import toast from "react-hot-toast";
import Link from "next/link";

interface SignInModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setIsRegisterOptionModalOpen: (open: boolean) => void;
  isRegisterOptionModalOpen: boolean;
}

export default function SignInModal({ isOpen, onOpenChange, setIsRegisterOptionModalOpen, isRegisterOptionModalOpen }: SignInModalProps) {
  const dispatch = useDispatch();
  const isRegister = isRegisterOptionModalOpen;
  const open = isOpen || isRegister;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    onOpenChange(false);
    setIsRegisterOptionModalOpen(false);
    dispatch(setIsLoginModalOpen(false));
  };

  useEffect(() => {
    setError("");
    setPassword("");
    setConfirmation("");
    setShowPassword(false);
    if (!open) dispatch(setIsLoginModalOpen(false));
  }, [open, isRegister, dispatch]);

  const switchMode = () => {
    onOpenChange(isRegister);
    setIsRegisterOptionModalOpen(!isRegister);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (isRegister && password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const response = isRegister
        ? await registerLocalAccount(name.trim(), email.trim(), password)
        : await loginLocalAccount(email.trim(), password);
      if (!response.data?.user) throw new Error("We could not load your account. Please try again.");
      dispatch(setToken("web-session"));
      dispatch(setUserData(response.data.user));
      dispatch(setUserLastFetch(Date.now()));
      toast.success(isRegister ? "Welcome to Inner Revealing." : "Welcome back.");
      setPassword("");
      setConfirmation("");
      close();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value && !pending) close(); }}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl borderColor bg-background p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2">
          <p className="primaryColor text-xs font-semibold uppercase tracking-[0.16em]">Inner Revealing</p>
          <DialogTitle className="text-2xl secondaryColor">{isRegister ? "Begin your practice" : "Welcome back"}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {isRegister ? "Create your account and make space for your wellbeing." : "Sign in to continue your learning journey."}
          </DialogDescription>
        </div>
        {!isRegister && <Link href="/forgot-password" onClick={close} className="primaryColor text-sm">Forgot your password?</Link>}
        <form onSubmit={submit} className="space-y-4">
          {isRegister && <div className="space-y-2">
            <label htmlFor="local-auth-name" className="text-sm font-medium">Your name</label>
            <Input id="local-auth-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} disabled={pending} />
          </div>}
          <div className="space-y-2">
            <label htmlFor="local-auth-email" className="text-sm font-medium">Email address</label>
            <Input id="local-auth-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} disabled={pending} />
          </div>
          <div className="space-y-2">
            <label htmlFor="local-auth-password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input id="local-auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isRegister ? 10 : 1} maxLength={128} className="pr-12" disabled={pending} aria-describedby={isRegister ? "local-auth-password-help" : undefined} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" disabled={pending}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isRegister && <p id="local-auth-password-help" className="text-xs text-muted-foreground">Use 10 or more characters.</p>}
          </div>
          {isRegister && <div className="space-y-2">
            <label htmlFor="local-auth-confirmation" className="text-sm font-medium">Confirm password</label>
            <Input id="local-auth-confirmation" name="confirm_password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={10} maxLength={128} disabled={pending} />
          </div>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={pending} className="ir-lms-register w-full gap-2 disabled:opacity-60">
            {pending && <Loader2 size={16} className="animate-spin" />}
            {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "New to Inner Revealing?"}{" "}
          <button type="button" onClick={switchMode} disabled={pending} className="primaryColor font-medium">{isRegister ? "Sign in" : "Create an account"}</button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
