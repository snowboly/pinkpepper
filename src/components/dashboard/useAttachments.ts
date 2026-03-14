"use client";

import { useCallback, useState } from "react";

type UseAttachmentsOptions = {
  canUploadImages: boolean;
  setError: (message: string | null) => void;
};

export function useAttachments({ canUploadImages, setError }: UseAttachmentsOptions) {
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    if (!canUploadImages) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setAttachedImage(file);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
  }, [canUploadImages, setError]);

  const clearImage = useCallback(() => {
    setAttachedImage(null);
    setImagePreview(null);
  }, []);

  const restoreImage = useCallback((file: File | null, preview: string | null) => {
    setAttachedImage(file);
    setImagePreview(preview);
  }, []);

  const clearDocument = useCallback(() => {
    setAttachedDocument(null);
  }, []);

  return {
    attachedImage,
    imagePreview,
    attachedDocument,
    setAttachedDocument,
    handleImageSelect,
    clearImage,
    restoreImage,
    clearDocument,
  };
}
