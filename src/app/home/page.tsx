import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { Verticals } from "@/components/home/verticals";
import { HotelSection } from "@/components/home/hotel-section";
import { RestaurantSection } from "@/components/home/restaurant-section";
import { SuiteSection } from "@/components/home/suite-section";
import { Benefits } from "@/components/home/benefits";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { CtaBand } from "@/components/home/cta-band";

export const metadata = {
  title: "Hospitality OS | Modern Restaurant & Hotel Management",
  description: "The complete platform to manage your hotel, restaurant, or both.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Verticals />
      <HotelSection />
      <RestaurantSection />
      <SuiteSection />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <CtaBand />
    </>
  );
}
