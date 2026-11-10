import React from 'react'

const FormSubmitLoader = ({ primaryBorder }: { primaryBorder?: boolean }) => {
    return (
        <div className={`animate-spin rounded-full border-b-2 ${primaryBorder ? 'primaryBorder h-8 w-8' : 'h-4 w-4'}`}></div>
    )
}

export default FormSubmitLoader
