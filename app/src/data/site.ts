import raw from "./items.json";

export type Cat = "logo" | "design";
export type Sub = "logo" | "business" | "church" | "social";
export type Item = {
  id: string;
  cat: Cat;
  sub: Sub;
  title: string;
  kind: string;
  w: number;
  h: number;
};

export const ITEMS = raw as Item[];

export const SUB_LABEL: Record<Sub, string> = {
  logo: "Logo Design",
  business: "Business Design",
  church: "Church Design",
  social: "Social Media Design",
};

export const WA_NUMBER = "2348142056679";
export const PHONE_MAIN = "+2348142056679";
export const PHONE_SECOND = "+2349166978180";
export const EMAIL = "noblemanokosa@gmail.com";
export const SOCIAL = {
  instagram: "https://www.instagram.com/nobbies_gallery?dlrf=dm8xNm5tczYxZTVo",
  facebook: "https://www.facebook.com/nobleman.okosa.2025",
  pinterest: "https://pin.it/3pPCp4NU4",
};

export const SERVICES = [
  {
    a: "Logo",
    b: "Design",
    d: "Creating distinctive and memorable logos that represent your brand's identity, values, and personality.",
  },
  {
    a: "Brand Identity",
    b: "Design",
    d: "Developing cohesive visual identities that help brands maintain consistency and stand out across different platforms.",
  },
  {
    a: "Graphic",
    b: "Design",
    d: "Creating compelling visual materials for businesses, organisations, churches, and other purposes, with attention to clarity, presentation, and communication.",
  },
  {
    a: "Website",
    b: "Design",
    d: "Designing modern, responsive, and visually engaging websites that present your brand professionally and provide a smooth user experience.",
  },
];
export const SERVICE_NAMES = SERVICES.map((s) => `${s.a} ${s.b}`);

export const STEPS = [
  { t: "Discover", d: "We discuss your ideas, goals, audience, preferences, and project requirements to understand what you need." },
  { t: "Plan", d: "We establish the creative direction and organise the project around your objectives and expectations." },
  { t: "Design", d: "I develop the design based on the agreed requirements, paying attention to visual quality, clarity, and consistency." },
  { t: "Review", d: "You review the work and provide feedback. Revisions are available within the limits of your selected package." },
  { t: "Deliver", d: "Once the project is approved, I deliver the completed files through a suitable digital delivery platform." },
];

export const FAQ: { q: string; a: string[] }[] = [
  { q: "What design services do you offer?", a: ["I offer Logo Design, Brand Identity Design, Graphic Design, and Website Design. Each service is tailored to your needs, helping you communicate your ideas, establish your brand, and stand out."] },
  { q: "How do I start a project with you?", a: ["Getting started is simple! Click the Book Me, Hire Me, or Message Me button on the website to get in touch. Tell me about your project, and we'll discuss your requirements and the next steps."] },
  { q: "How much do your services cost?", a: ["Pricing depends on the type and scope of your project.", "Graphic Design: ₦25,000–₦60,000.", "Website Design: ₦90,000–₦300,000.", "For an accurate quote, get in touch with your project requirements."] },
  { q: "How long does a project take?", a: ["Projects typically take between 24 hours and 7 days, depending on the complexity, scope, and requirements. I'll communicate the expected delivery time before we begin."] },
  { q: "Do you accept revisions?", a: ["Yes! Revisions are available, but they're limited to the number included in your selected package. We'll agree on the revision terms before the project begins."] },
  { q: "What information do you need before starting a project?", a: ["It depends on the project. I'll send you a suitable project brief or questionnaire to collect the information, requirements, and materials needed to get started."] },
  { q: "How do I receive my completed files?", a: ["Your completed files will be delivered through convenient platforms such as Google Drive, email, Dropbox, or WeTransfer, depending on the project and file requirements. You'll receive your files in the appropriate formats for their intended use."] },
  { q: "Do you work with clients outside Nigeria?", a: ["Absolutely! I work with clients in Nigeria and internationally. We can communicate online, collaborate remotely, and deliver your completed projects digitally, wherever you are."] },
  { q: "Do you offer design training?", a: ["Yes! I offer comprehensive design training through my Design Lab Accelerator Masterclass (DLAM). The programme helps aspiring designers develop their skills, understand design principles, and create better designs through practical learning."] },
];

export const TESTIMONIALS = [
  { name: "Ola Easy", initials: "OE", q: "Honestly, I really appreciate the work Nobbie did for me. The design came out nicely, and you could tell he paid attention to the details. Communication was good, and I'm happy with how everything turned out. I'd definitely recommend him." },
  { name: "Diginomads", initials: "DN", q: "Working with Nobbie was a good experience. He understood what we wanted and brought his creativity into the work. I really like the way he approaches design, and the final result was impressive. Looking forward to working together again." },
  { name: "Kings Firm Global", initials: "KF", q: "Nobbie did a great job with the design. We wanted something that looked professional and stood out, and he put real effort into making that happen. The whole experience was smooth, and we appreciate his creativity and attention to detail." },
  { name: "Veeyonn Brands", initials: "VB", q: "What I like about Nobbie's work is the creativity behind it. He doesn't just put things together; there's actually thought behind the design. We appreciate the effort he puts into his work, and the result was really good." },
  { name: "Elon Dimensions", initials: "ED", q: "Nobbie is creative and takes his work seriously. I like how he pays attention to the little details and tries to make sure the design comes out well. It was a good experience, and I'd recommend Nobbie's Gallery to anyone looking for quality design." },
];

export const FEATURED_IDS = [
  "helios-stacked", "sunday-service", "eazi-logo", "anniversary-17", "swiftmec-logo", "africa-day",
  "ola-green", "big-changes", "camp-meeting", "flimora-hoodie", "harry-birthday", "festive-slash",
];

export function waLink(o: { name?: string; service?: string; details?: string } = {}) {
  const text =
    `Hello Nobbie's Gallery! My name is ${o.name?.trim() || "[Your Name]"}.\n\n` +
    `I'm interested in your ${o.service?.trim() || "[Selected Service]"} service.\n\n` +
    `Here are my project details:\n${o.details?.trim() || "[Briefly describe your project and requirements.]"}\n\n` +
    `Please let me know how we can get started. Thank you!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
