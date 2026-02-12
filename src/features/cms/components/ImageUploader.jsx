/* eslint-disable react/prop-types */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useUpload } from '../hooks/useUpload';

const ImageUploader = ({ value, onChange, label = 'Imagen' }) => {
  const fileInputRef = useRef(null);
  const { upload, isUploading, uploadError } = useUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file);
    if (result) {
      onChange(result.url);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-light-border-primary dark:border-dark-border-primary">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <motion.button
            type="button"
            onClick={handleRemove}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 w-8 h-8 bg-error/90 text-white rounded-full flex items-center justify-center hover:bg-error transition-colors"
            aria-label="Eliminar imagen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-48 border-2 border-dashed border-light-border-primary dark:border-dark-border-primary rounded-lg flex flex-col items-center justify-center gap-2 hover:border-secondary transition-colors bg-light-bg-secondary dark:bg-dark-bg-secondary"
        >
          {isUploading ? (
            <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
          ) : (
            <>
              <svg className="w-10 h-10 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                Haz clic para subir una imagen
              </span>
              <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                Max 5MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Subir ${label}`}
      />

      {uploadError && (
        <p className="text-xs text-error mt-1">{uploadError}</p>
      )}
    </div>
  );
};

export default ImageUploader;
