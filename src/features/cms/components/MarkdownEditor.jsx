/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownEditor = ({ value, onChange, error }) => {
  const sanitizedHtml = useMemo(() => {
    if (!value) return '';
    const rawHtml = marked.parse(value);
    return DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel'],
    });
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
        Contenido (Markdown)
      </label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={20}
            className={`w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300 resize-y font-mono text-sm ${
              error
                ? 'border-error'
                : 'border-light-border-primary dark:border-dark-border-primary'
            }`}
            placeholder="Escribe el contenido en Markdown..."
            aria-label="Editor de contenido Markdown"
            aria-describedby={error ? 'body-error' : undefined}
            aria-invalid={error ? 'true' : undefined}
            style={{ minHeight: '400px' }}
          />
          <div className="flex justify-between mt-1">
            {error ? (
              <p id="body-error" className="text-xs text-error">{error}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              {value.length} caracteres
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-4 overflow-y-auto bg-light-bg-primary dark:bg-dark-bg-primary" style={{ minHeight: '400px' }}>
          <p className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary mb-3 uppercase tracking-wider">
            Vista previa
          </p>
          {value ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert
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
          ) : (
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary italic">
              La vista previa aparecera aqui...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
