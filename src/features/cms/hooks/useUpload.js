import { useState } from 'react';
import { cmsAPI } from '../services/cmsService';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const upload = async (file) => {
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten archivos de imagen');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('El archivo no debe superar 5MB');
      return null;
    }

    try {
      setIsUploading(true);
      const result = await cmsAPI.uploadImage(file);
      return result;
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadError(err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (filePath) => {
    if (!filePath) return;
    try {
      await cmsAPI.deleteImage(filePath);
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  return { upload, removeImage, isUploading, uploadError };
};
