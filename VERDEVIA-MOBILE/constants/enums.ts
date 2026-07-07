export enum UserGender {
  MASCULINO = 'Masculino',
  FEMININO = 'Feminino',
  OUTRO = 'Outro',
  NAO_INFORMAR = 'Prefiro não dizer',
}

export enum UserEthnicity {
  BRANCA = 'Branca',
  PRETA = 'Preta',
  PARDA = 'Parda',
  AMARELA = 'Amarela',
  INDIGENA = 'Indígena',
}

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
