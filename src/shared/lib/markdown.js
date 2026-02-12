import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const parseMarkdown = (content) => marked.parse(content);

export const sanitize = (html) =>
  DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });

export const renderMarkdown = (content) => sanitize(parseMarkdown(content));
