import Image from "next/image";

/** Full-bleed image at the top of a `Card` — offsets Card's own `p-6` padding. */
export function CardImage({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={400}
      height={200}
      className="-mx-6 -mt-6 mb-4 h-32 w-[calc(100%+3rem)] rounded-t-2xl object-cover"
    />
  );
}
