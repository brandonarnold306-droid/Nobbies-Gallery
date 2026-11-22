import { createFileRoute } from "@tanstack/react-router";
import { Footer, Marquee, Nav } from "../components/nb/chrome";
import { About, Banner, Faq, Hero, Pricing, Process, Results, Services, Testimonials } from "../components/nb/sections";
import { WorkCarousel } from "../components/nb/work";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <WorkCarousel />
        <Banner />
        <Results />
        <Process />
        <Pricing />
        <Faq />
        <Testimonials />
        <Marquee />
      </main>
      <Footer />
    </>
  );
}
