/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { renderMarkdown } from '../../../shared/lib/markdown';

const PostContent = ({ content }) => {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    return renderMarkdown(content);
  }, [content]);

  return (
    <div
      className="prose prose-lg max-w-none dark:prose-invert
        prose-headings:text-light-text-primary dark:prose-headings:text-dark-text-primary
        prose-p:text-light-text-secondary dark:prose-p:text-dark-text-secondary
        prose-a:text-accent hover:prose-a:text-accent-hover
        prose-strong:text-light-text-primary dark:prose-strong:text-dark-text-primary
        prose-code:text-accent prose-code:bg-light-bg-secondary dark:prose-code:bg-dark-bg-secondary
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-light-bg-secondary dark:prose-pre:bg-dark-bg-secondary
        prose-blockquote:border-accent prose-blockquote:text-light-text-secondary dark:prose-blockquote:text-dark-text-secondary
        prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default PostContent;
