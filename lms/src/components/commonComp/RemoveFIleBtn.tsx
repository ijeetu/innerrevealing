'use client'
import React from 'react'
import { useTranslation } from "@/hooks/useTranslation";

const RemoveFIleBtn = ({handleRemoveFile}: {handleRemoveFile: () => void}) => {
  const { t } = useTranslation();
  return (
    <span className="text-xs sm:text-sm text-red-500 bg-red-100 p-1 rounded-md cursor-pointer" onClick={() => {
        handleRemoveFile();
      }}>{t("remove")}</span>
  )
}

export default RemoveFIleBtn
