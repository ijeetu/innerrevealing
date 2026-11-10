import SupportGroup from "@/components/pagesComponent/help-support/sections/SupportGroup";

interface SupportGroupPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: SupportGroupPageProps) {
  const resolvedParams = await params;
  const groupSlug = typeof resolvedParams.slug === "string" ? resolvedParams.slug : "";

  return <SupportGroup groupSlug={groupSlug} />;
}
