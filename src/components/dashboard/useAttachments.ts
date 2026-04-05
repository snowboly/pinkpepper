"use client";

import { useCallback, useState } from "react";

type UseAttachmentsOptions = {
  canUploadImages: boolean;
  setError: (message: string | null) => void;
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];
const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "docx", "txt", "md"];

export function useAttachments({ canUploadImages, setError }: UseAttachmentsOptions) {
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);

  const isSupportedDocument = useCallback((file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return ALLOWED_DOCUMENT_TYPES.includes(file.type) || ALLOWED_DOCUMENT_EXTENSIONS.includes(extension);
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    if (!canUploadImages) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
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

  const handleDocumentSelect = useCallback((file: File) => {
    if (!isSupportedDocument(file)) {
      setError("Only PDF, DOCX, TXT, and Markdown documents are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Document must be under 10MB.");
      return;
    }
    setAttachedDocument(file);
  }, [isSupportedDocument, setError]);

  const handleDroppedAttachment = useCallback((file: File) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      handleImageSelect(file);
      return;
    }

    if (isSupportedDocument(file)) {
      handleDocumentSelect(file);
      return;
    }

    setError("Only images, PDF, DOCX, TXT, and Markdown files are supported.");
  }, [handleDocumentSelect, handleImageSelect, isSupportedDocument, setError]);

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
    handleDocumentSelect,
    handleDroppedAttachment,
    clearImage,
    restoreImage,
    clearDocument,
  };
}
