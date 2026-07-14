import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/administrador/', '/super-administrador/', '/prestadores/', '/super-prestadores/'],
    },
    sitemap: 'https://ECOA.org.br/sitemap.xml',
  };
}
