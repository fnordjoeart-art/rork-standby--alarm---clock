export type ProjectLink = {
  key: string;
  title: string;
  url: string;
  subtitle?: string;
};

// TODO: Replace placeholder URLs with your real install/open links
export const PROJECT_LINKS: ProjectLink[] = [
  {
    key: "ex-borgo",
    title: "ex Borgo",
    url: "https://example.com/ex-borgo", // replace with the real URL
    subtitle: "Apri/installa su dispositivo",
  },
  {
    key: "ricc-up",
    title: "RICC Up",
    url: "https://example.com/ricc-up", // replace with the real URL
    subtitle: "Apri/installa su dispositivo",
  },
];
