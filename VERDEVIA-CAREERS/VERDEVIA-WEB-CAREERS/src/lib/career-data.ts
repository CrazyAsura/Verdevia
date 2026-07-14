import type { Job } from '@/services/jobs.service';

export const fallbackJobs: Job[] = [
  { id: 'analista-sustentabilidade', title: 'Analista de Sustentabilidade', description: 'Você transforma dados ambientais e operacionais em diagnósticos claros, indicadores de impacto e planos de melhoria para nossos parceiros.', requirements: 'Experiência com indicadores ESG ou ambientais; domínio de planilhas e visualização de dados; comunicação clara com públicos técnicos e não técnicos.', benefits: 'Trabalho híbrido, auxílio saúde, vale-refeição, apoio a cursos e horário flexível.', location: 'São Paulo, SP · Híbrido', salary: 5200, status: 'active', createdAt: '2026-07-01', updatedAt: '2026-07-01' },
  { id: 'engenharia-produto-pleno', title: 'Pessoa Engenheira de Produto Pleno', description: 'Você vai desenvolver experiências digitais e serviços confiáveis que conectam cidadãos, equipes de campo e gestores públicos.', requirements: 'Experiência com React, Next.js e TypeScript; familiaridade com APIs GraphQL; testes automatizados e colaboração em produto.', benefits: 'Trabalho remoto, auxílio saúde, orçamento de desenvolvimento, equipamento e horário flexível.', location: 'Remoto · Brasil', salary: 9800, status: 'active', createdAt: '2026-07-03', updatedAt: '2026-07-03' },
  { id: 'lider-operacoes', title: 'Liderança de Operações Ambientais', description: 'Você coordena rotinas de campo, prioriza ocorrências críticas e conecta equipes locais aos indicadores da plataforma.', requirements: 'Vivência em operações urbanas ou ambientais; gestão de equipes; organização de rotinas e relacionamento com stakeholders públicos.', benefits: 'Modelo híbrido, seguro de vida, auxílio saúde, vale-refeição e plano de desenvolvimento.', location: 'Curitiba, PR · Híbrido', salary: 7400, status: 'active', createdAt: '2026-07-05', updatedAt: '2026-07-05' },
  { id: 'designer-produto-senior', title: 'Pessoa Product Designer Sênior', description: 'Você pesquisa, prototipa e evolui produtos acessíveis para contextos urbanos complexos, trabalhando perto de engenharia e operações.', requirements: 'Portfólio de produtos digitais; pesquisa com usuários; Figma; sistemas de design e acessibilidade.', benefits: 'Trabalho remoto, auxílio saúde, orçamento para cursos, equipamento e encontro anual do time.', location: 'Remoto · Brasil', salary: 11200, status: 'active', createdAt: '2026-07-08', updatedAt: '2026-07-08' },
];

export const teams = ['Todos os times', 'Produto e Tecnologia', 'Sustentabilidade', 'Operações'];

export function jobTeam(job: Job) {
  const title = job.title.toLowerCase();
  if (title.includes('sustent')) return 'Sustentabilidade';
  if (title.includes('operaç') || title.includes('operac')) return 'Operações';
  return 'Produto e Tecnologia';
}
