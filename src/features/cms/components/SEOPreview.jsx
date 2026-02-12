/* eslint-disable react/prop-types */

const SEOPreview = ({ title, slug, description, ogImage }) => {
  const displayTitle = title || 'Titulo del post';
  const displayUrl = `cchia.cl/blog/${slug || 'url-del-post'}`;
  const displayDescription = description || 'Descripcion del post para motores de busqueda...';

  return (
    <div className="space-y-6">
      {/* Google SERP Preview */}
      <div>
        <p className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary mb-3 uppercase tracking-wider">
          Vista previa en Google
        </p>
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-4 border border-light-border-primary dark:border-dark-border-primary">
          <p className="text-sm text-green-700 dark:text-green-400 truncate">
            {displayUrl}
          </p>
          <h3 className="text-lg text-blue-700 dark:text-blue-400 font-medium truncate mt-0.5 hover:underline cursor-default">
            {displayTitle.length > 60 ? `${displayTitle.slice(0, 60)}...` : displayTitle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {displayDescription.length > 160 ? `${displayDescription.slice(0, 160)}...` : displayDescription}
          </p>
        </div>
      </div>

      {/* Social Card Preview */}
      <div>
        <p className="text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary mb-3 uppercase tracking-wider">
          Vista previa en redes sociales
        </p>
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg overflow-hidden max-w-md">
          {ogImage ? (
            <img
              src={ogImage}
              alt="Open Graph preview"
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center">
              <svg className="w-12 h-12 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary">
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary uppercase">
              cchia.cl
            </p>
            <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary truncate mt-0.5">
              {displayTitle}
            </p>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5 line-clamp-2">
              {displayDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOPreview;
