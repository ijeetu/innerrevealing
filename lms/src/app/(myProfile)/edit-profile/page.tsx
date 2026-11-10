import React from 'react'
import EditProfile from '@/components/profile/tabsPagesContent/EditProfile'

// Force dynamic rendering to prevent SSR/prerendering errors
// This is needed because react-hot-toast and other client-side libraries
// access browser APIs like 'document' which aren't available during SSR
export const dynamic = 'force-dynamic';

const Page = () => {
  return (
    <div>
      <EditProfile />
    </div>
  )
}

export default Page
