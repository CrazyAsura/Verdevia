export enum ComplaintStatus {
  PENDENTE = 'pendente',
  EM_ANALISE = 'em_analise',
  RESOLVIDO = 'resolvido',
  REJEITADO = 'rejeitado',
}

export enum PollutionType {
  AGUA = 'Oceano / Rios',
  FLORESTA = 'Florestas / Parques',
  URBANO = 'Áreas Urbanas',
  INDUSTRIAL = 'Zonas Industriais',
  OUTRO = 'Outro',
}

export enum ComplaintPrivacy {
  PUBLICO = 'publico',
  PRIVADO = 'privado',
  MISTO = 'misto',
}
