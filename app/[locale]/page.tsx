import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { PopularTests } from "@/components/sections/PopularTests";
import { LocationMap } from "@/components/sections/LocationMap";

export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ServicesGrid />
      <PopularTests />
      <LocationMap />
    </>
  );
}
