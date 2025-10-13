declare module "next" {
    export interface PageProps {
      params?: { slug?: string } | Promise<{ slug?: string }>;
    }
  }
  