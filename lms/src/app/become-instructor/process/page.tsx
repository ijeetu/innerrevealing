import Process from "@/components/instructor/becomeInstructor/Process";

// Force dynamic rendering to prevent SSR/prerendering errors
// This is needed because react-hot-toast and other client-side libraries
// access browser APIs like 'document' which aren't available during SSR
export const dynamic = 'force-dynamic';

export default function page() {
  return (
    <>
      <Process />
    </>
  );
}
