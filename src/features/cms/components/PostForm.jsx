/* eslint-disable react/prop-types */
import ImageUploader from './ImageUploader';
import CategorySelector from './CategorySelector';

const TYPE_OPTIONS = [
  { value: 'article', label: 'Articulo' },
  { value: 'news', label: 'Noticia' },
  { value: 'resource', label: 'Recurso' },
];

const PostForm = ({ formData, errors, slug, isChecking, isAvailable, onFieldChange, onSlugChange }) => {
  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Tipo de contenido
        </label>
        <div className="flex gap-3" role="radiogroup" aria-label="Tipo de contenido">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={formData.type === opt.value}
              onClick={() => onFieldChange('type', opt.value)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200 ${
                formData.type === opt.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:border-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="post-title" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Titulo *
        </label>
        <input
          id="post-title"
          type="text"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          maxLength={200}
          className={`w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300 ${
            errors.title ? 'border-error' : 'border-light-border-primary dark:border-dark-border-primary'
          }`}
          placeholder="Titulo del post"
          aria-required="true"
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={errors.title ? 'true' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-xs text-error mt-1">{errors.title}</p>
        )}
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
          {formData.title.length}/200 caracteres
        </p>
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="post-slug" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          URL (slug)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            /blog/
          </span>
          <input
            id="post-slug"
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className={`w-full pl-16 pr-10 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300 ${
              errors.slug ? 'border-error' : 'border-light-border-primary dark:border-dark-border-primary'
            }`}
            placeholder="url-del-post"
            aria-describedby={errors.slug ? 'slug-error' : 'slug-status'}
            aria-invalid={errors.slug ? 'true' : undefined}
          />
          {/* Availability indicator */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {isChecking && (
              <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            )}
            {!isChecking && isAvailable === true && slug && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {!isChecking && isAvailable === false && slug && (
              <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
        </div>
        {errors.slug ? (
          <p id="slug-error" className="text-xs text-error mt-1">{errors.slug}</p>
        ) : (
          <p id="slug-status" className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1" aria-live="polite">
            {isChecking ? 'Verificando disponibilidad...' : isAvailable === true && slug ? 'Slug disponible' : isAvailable === false ? 'Slug no disponible' : 'Se genera automaticamente del titulo'}
          </p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="post-excerpt" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Extracto
        </label>
        <textarea
          id="post-excerpt"
          value={formData.excerpt}
          onChange={(e) => onFieldChange('excerpt', e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300 resize-none"
          placeholder="Breve descripcion del post (opcional)"
        />
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
          {formData.excerpt.length}/300 caracteres
        </p>
      </div>

      {/* Featured Image */}
      <ImageUploader
        value={formData.featured_image}
        onChange={(url) => onFieldChange('featured_image', url)}
        label="Imagen destacada"
      />

      {/* Categories */}
      <CategorySelector
        selectedIds={formData.categoryIds}
        onChange={(ids) => onFieldChange('categoryIds', ids)}
      />

      {/* Resource-specific fields */}
      {formData.type === 'resource' && (
        <div className="space-y-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border-primary dark:border-dark-border-primary">
          <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Campos de recurso
          </p>
          <div>
            <label htmlFor="post-file-url" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              URL del archivo
            </label>
            <input
              id="post-file-url"
              type="url"
              value={formData.file_url}
              onChange={(e) => onFieldChange('file_url', e.target.value)}
              className="w-full px-4 py-3 bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
              placeholder="https://ejemplo.com/archivo.pdf"
            />
          </div>
          <div>
            <label htmlFor="post-file-name" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Nombre del archivo
            </label>
            <input
              id="post-file-name"
              type="text"
              value={formData.file_name}
              onChange={(e) => onFieldChange('file_name', e.target.value)}
              className="w-full px-4 py-3 bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
              placeholder="documento.pdf"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;
