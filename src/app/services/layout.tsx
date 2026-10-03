import type { ReactNode } from "react";
import SiteShell from "@/components/SiteShell";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
