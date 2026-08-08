import Image from "next/image";
import type { MediaItem } from "@/lib/data/media";

export function PhotoGallery({ media, locale }: { media: MediaItem[]; locale: string }) {
  if (media.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {media.map((item) => {
        const caption = locale === "hi" ? item.caption_hi : item.caption_en;
        return (
          <Image
            key={item.id}
            src={item.url}
            alt={caption ?? ""}
            width={200}
            height={150}
            className="h-24 w-full rounded-lg object-cover"
          />
        );
      })}
    </div>
  );
}
