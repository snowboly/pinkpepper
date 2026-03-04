"use client";

import { useState, type ImgHTMLAttributes } from "react";

type LogoImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  primarySrc?: string;
  fallbackSrc?: string;
};

export function LogoImage({
  primarySrc = "/logo/logoV3.png",
  fallbackSrc = "/logo/LogoV2.png",
  alt = "PinkPepper",
  ...props
}: LogoImageProps) {
  const [src, setSrc] = useState(primarySrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      alt={alt}
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}
