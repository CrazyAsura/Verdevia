import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/administrador/', '/super-administrador/', '/prestadores/', '/super-prestadores/'],
    },
    sitemap: 'https://VERDEVIA.org.br/sitemap.xml',
  };
}
