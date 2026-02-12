/* eslint-disable react/prop-types */
import ImageUploader from './ImageUploader';

const charColor = (len, min, max) => {
  if (len === 0) return 'text-light-text-tertiary dark:text-dark-text-tertiary';
  if (len >= min && len <= max) return 'text-green-500';
  if (len > max) return 'text-error';
  return 'text-yellow-500';
};

const SEOFields = ({ formData, onFieldChange }) => {
  return (
    <div className="space-y-4">
      {/* Meta Title */}
      <div>
        <label htmlFor="seo-meta-title" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Meta titulo
        </label>
        <input
          id="seo-meta-title"
          type="text"
          value={formData.meta_title}
          onChange={(e) => onFieldChange('meta_title', e.target.value)}
          maxLength={70}
          className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
          placeholder="Titulo para motores de busqueda (usa el titulo si esta vacio)"
        />
        <p className={`text-xs mt-1 ${charColor(formData.meta_title.length, 30, 60)}`}>
          {formData.meta_title.length}/60 caracteres {formData.meta_title.length >= 30 && formData.meta_title.length <= 60 ? '(optimo)' : formData.meta_title.length > 60 ? '(muy largo)' : ''}
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="seo-meta-description" className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Meta descripcion
        </label>
        <textarea
          id="seo-meta-description"
          value={formData.meta_description}
          onChange={(e) => onFieldChange('meta_description', e.target.value)}
          maxLength={170}
          rows={3}
          className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300 resize-none"
          placeholder="Descripcion para motores de busqueda"
        />
        <p className={`text-xs mt-1 ${charColor(formData.meta_description.length, 120, 160)}`}>
          {formData.meta_description.length}/160 caracteres {formData.meta_description.length >= 120 && formData.meta_description.length <= 160 ? '(optimo)' : formData.meta_description.length > 160 ? '(muy largo)' : ''}
        </p>
      </div>

      {/* OG Image */}
      <ImageUploader
        value={formData.og_image}
        onChange={(url) => onFieldChange('og_image', url)}
        label="Imagen Open Graph (redes sociales)"
      />
    </div>
  );
};

export default SEOFields;
