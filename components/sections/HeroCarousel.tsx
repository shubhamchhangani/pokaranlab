"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LandingMediaItem } from "@/lib/data/media";

export function HeroCarousel({
  images,
  locale,
}: {
  images: LandingMediaItem[];
  locale: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative mx-auto mt-10 h-56 w-full max-w-3xl overflow-hidden rounded-2xl sm:h-72">
      {images.map((image, i) => {
        const caption = locale === "hi" ? image.caption_hi : image.caption_en;
        return (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image src={image.url} alt={caption ?? ""} fill className="object-cover" priority={i === 0} />
            {caption && (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-sm text-white">
                {caption}
              </p>
            )}
          </div>
        );
      })}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-3 flex gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
