import { createFileRoute } from "@tanstack/react-router";
import { Footer, Nav } from "../components/nb/chrome";
import { WorkGrid } from "../components/nb/work";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work | Nobbie's Gallery" },
      {
        name: "description",
        content: "Logo designs and graphic designs by Nobbie's Gallery: business, church and social media designs.",
      },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <>
      <Nav />
      <main className="work-page">
        <div className="c">
          <div className="center">
            <span className="eyebrow">Work</span>
            <h1 className="h2">
              Selected <em>Work</em>
            </h1>
            <p className="lead mx">Explore a selection of projects that showcase my creativity, design approach, and attention to detail.</p>
          </div>
          <WorkGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
