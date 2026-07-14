import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Baggit service docs',
    },
    githubUrl: "https://github.com/afsnk/baggit",
    links: [
      {
        type: "menu",
        text: "Guide",
        active: "url",
        items: [
          {
            text: "Getting started",
            description: "Quick start guide",
            url: "docs/"
          }
        ]
      }
    ]
  };
}
