import { useState } from 'react';
import { cmsAPI } from '../services/cmsService';

export const usePublish = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);

  const publish = async (id) => {
    try {
      setIsPublishing(true);
      setPublishError(null);
      const data = await cmsAPI.publish(id);
      return data;
    } catch (err) {
      console.error('Error publishing post:', err);
      setPublishError(err.message);
      return null;
    } finally {
      setIsPublishing(false);
    }
  };

  const unpublish = async (id) => {
    try {
      setIsPublishing(true);
      setPublishError(null);
      const data = await cmsAPI.unpublish(id);
      return data;
    } catch (err) {
      console.error('Error unpublishing post:', err);
      setPublishError(err.message);
      return null;
    } finally {
      setIsPublishing(false);
    }
  };

  const archive = async (id) => {
    try {
      setIsPublishing(true);
      setPublishError(null);
      const data = await cmsAPI.archive(id);
      return data;
    } catch (err) {
      console.error('Error archiving post:', err);
      setPublishError(err.message);
      return null;
    } finally {
      setIsPublishing(false);
    }
  };

  return { publish, unpublish, archive, isPublishing, publishError };
};
