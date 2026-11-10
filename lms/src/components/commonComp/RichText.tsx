import React from 'react';

const RichTextContent = ({ content }: { content: string }) => {

  const cleanedContent = content
    ?.replace(/&nbsp;/g, " ")
    ?.replace(/word-break:\s*break-all;?/gi, "");

  return (
    <div
      className="rich-text-content break-words whitespace-normal leading-relaxed w-full"
      dangerouslySetInnerHTML={{ __html: cleanedContent || "" }}
    />
  );
};

export default RichTextContent;
