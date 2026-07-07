const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  Header, 
  Footer, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle, 
  WidthType, 
  LevelFormat, 
  TableOfContents, 
  PageNumber, 
  PageBreak,
  ShadingType,
  VerticalAlign
} = require('docx');
const fs = require('fs');
const path = require('path');

// Output path: Root of the workspace
const OUTPUT_PATH = path.join(__dirname, '../../Verdevia_Documentacao.docx');

// Colors
const COLOR_PRIMARY = '007AFF'; // Apple Blue
const COLOR_SECONDARY = '86868B'; // Gray
const COLOR_TEXT = '232323';
const COLOR_BORDER = 'CCCCCC';
const COLOR_SHADING = 'F4F6F9';

// Borders
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: "Arial",
          size: 24, // 12pt
          color: COLOR_TEXT
        }
      }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 56, bold: true, color: "000000", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Subtitle",
        name: "Subtitle",
        basedOn: "Normal",
        run: { size: 28, color: COLOR_SECONDARY, font: "Arial" },
        paragraph: { spacing: { before: 120, after: 240 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: "000000", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: COLOR_SECONDARY, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 60 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      },
      {
        reference: "setup-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      },
      {
        reference: "network-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "VERDEVIA — Manual de Documentação Técnica", size: 18, color: COLOR_SECONDARY })]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Página " }),
                new TextRun({ children: [PageNumber.CURRENT] }),
                new TextRun({ text: " de " }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES] })
              ]
            })
          ]
        })
      },
      children: [
        // --- COVER PAGE ---
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({ style: "Title", children: [new TextRun("VERDEVIA")] }),
        new Paragraph({ style: "Subtitle", children: [new TextRun("Manual Completo do Sistema e de Desenvolvimento Sem Fio")] }),
        new Paragraph({ spacing: { before: 1000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Arquitetura e Engenharia de Software Móvel", bold: true, size: 24 }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Concebido sob a ótica de Design-Driven Engineering", italics: true, size: 20, color: COLOR_SECONDARY })
          ]
        }),
        new Paragraph({ spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Desenvolvido por: Antigravity AI & Leon", size: 20 }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Data de Emissão: ${new Date().toLocaleDateString()}`, size: 18, color: COLOR_SECONDARY })
          ]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // --- TABLE OF CONTENTS ---
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Sumário")] }),
        new TableOfContents("Sumário", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ spacing: { after: 240 } }),
        new Paragraph({ children: [new PageBreak()] }),

        // --- SECTION 1: SYSTEM OVERVIEW ---
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Visão Geral do Ecossistema")] }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "O VERDEVIA é um ecossistema completo de fiscalização urbana e governança comunitária, projetado de forma modular sob a filosofia de acoplamento fraco e clean architecture (arquitetura hexagonal). Ele é dividido em três componentes centrais:"
            })
          ]
        }),
        new Paragraph({ spacing: { after: 120 } }),

        new Table({
          columnWidths: [2500, 6860],
          margins: { top: 120, bottom: 120, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  borders: cellBorders,
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Componente", bold: true })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                  width: { size: 6860, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Descrição Tecnológica", bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "VERDEVIA-MOBILE", bold: true })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 6860, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun("Aplicativo móvel desenvolvido em React Native e Expo 56. Focado em UX de alto impacto, criptografia de ponta a ponta (AES-GCM/X25519) e micro-interações fluidas.")] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "VERDEVIA-WEB", bold: true })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 6860, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun("Painel de gerenciamento administrativo e portal institucional desenvolvido em Next.js (App Router). Contém interface de download dinâmico para testadores.")] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "VERDEVIA-BACKEND", bold: true })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 6860, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun("API RESTful escalável construída em NestJS. Orquestra o processamento assíncrono via Apache Kafka e gerencia dados distribuídos em bancos de dados relacionais e não-relacionais.")] })]
                })
              ]
            })
          ]
        }),
        new Paragraph({ spacing: { before: 240 } }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Infraestrutura de Banco de Dados e Serviços")] }),
        new Paragraph({
          children: [
            new TextRun("Toda a infraestrutura secundária é orquestrada localmente via Docker Compose. Os principais serviços de armazenamento e comunicação consistem em:")
          ]
        }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "PostgreSQL", bold: true }), new TextRun(" — Banco de dados relacional principal para persistência de dados de usuários e denúncias.")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "MongoDB", bold: true }), new TextRun(" — Armazenamento de logs operacionais e conteúdos não-estruturados.")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Redis", bold: true }), new TextRun(" — Cache de alto desempenho e gerenciamento de estado de sessões temporárias.")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Apache Kafka", bold: true }), new TextRun(" — Barramento de mensagens distribuído para processamento de eventos assíncronos.")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // --- SECTION 2: MOBILE ARCHITECTURE ---
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Arquitetura do Aplicativo Móvel")] }),
        
        new Paragraph({
          children: [
            new TextRun("O aplicativo móvel segue o padrão de desenvolvimento do Expo (Bare Workflow integrado). Sua estrutura interna é desacoplada para facilitar testes e reuso de componentes:")
          ]
        }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Metro Bundler", bold: true }), new TextRun(" — Compilador JavaScript local que faz o push do código para o dispositivo físico em tempo real com Hot Reload.")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "EAS Build (Expo Application Services)", bold: true }), new TextRun(" — Serviço em nuvem utilizado para compilar o código nativo (Java/Kotlin e Swift) em pacotes instaláveis (APK) sem a necessidade de SDK local.")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Development Client", bold: true }), new TextRun(" — Versão modificada do Expo Go instalada no dispositivo do usuário, que inclui todas as bibliotecas nativas compiladas da aplicação e expõe o leitor para conexões de Metro.")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Criptografia e Handshake Seguro")] }),
        new Paragraph({
          children: [
            new TextRun("Para manter os dados de denúncias seguros e anônimos contra adulteração, o aplicativo executa um handshake de segurança baseado em chaves efêmeras Diffie-Hellman (X25519) e criptografia simétrica AES-GCM 128/256 bits com compactação fflate no transporte. As chaves são geradas dinamicamente a cada carregamento do aplicativo.")
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // --- SECTION 3: WIRELESS DEVELOPMENT ---
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Guia de Desenvolvimento Sem Fio (Cable-Free DX)")] }),
        new Paragraph({
          children: [
            new TextRun("A maior dor de cabeça no desenvolvimento móvel é a dependência de cabos USB e falhas de conexão de rede local. Implementamos um fluxo zero cabos (Cable-Free) estruturado em três passos:")
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Passo 1: Geração do APK do Development Client (Nuvem)")] }),
        new Paragraph({
          children: [
            new TextRun("O build é feito na nuvem da Expo para evitar conflitos de SDK e Java na máquina do desenvolvedor. No terminal do seu projeto, execute:")
          ]
        }),
        new Paragraph({
          shading: { fill: COLOR_SHADING, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "  npm run android:build", font: "Courier New", bold: true })]
        }),
        new Paragraph({
          children: [
            new TextRun("O EAS irá compilar o aplicativo de desenvolvimento nos servidores da Expo. Ao término, ele exibirá um link público e um QR Code de download do APK.")
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Passo 2: Download do APK e Instalação (Wi-Fi)")] }),
        new Paragraph({
          children: [
            new TextRun("Você pode baixar o APK de duas formas sem fio:")
          ]
        }),
        new Paragraph({ numbering: { reference: "setup-list", level: 0 }, children: [new TextRun("Aponte a câmera do seu celular diretamente para o QR Code gerado no terminal pelo EAS Build.")] }),
        new Paragraph({ numbering: { reference: "setup-list", level: 0 }, children: [new TextRun("Acessem a página de download do portal web (VERDEVIA-WEB) no endereço local do seu computador (ex: http://192.168.0.100:3000/baixar), selecione a aba 'Desenvolvimento' e clique em 'Baixar via Wi-Fi'.")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Passo 3: Execução e Conexão com Hot Reload")] }),
        new Paragraph({
          children: [
            new TextRun("Com o APK de desenvolvimento instalado no dispositivo móvel, inicie o Metro Bundler no seu computador:")
          ]
        }),
        new Paragraph({
          shading: { fill: COLOR_SHADING, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "  npm run start", font: "Courier New", bold: true })]
        }),
        new Paragraph({
          children: [
            new TextRun("Abra o aplicativo no celular. Ele carregará a tela do Expo Dev Launcher. Escaneie o QR Code do Metro impresso no console. O código JavaScript será transferido via rede Wi-Fi e qualquer mudança de código ativará o Hot Reload instantaneamente!")
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // --- SECTION 4: TROUBLESHOOTING ---
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Resolução de Problemas de Conectividade")] }),
        new Paragraph({
          children: [
            new TextRun("Caso o aplicativo fique em carregamento infinito ao conectar ao Metro Bundler ou retorne erros de rede, verifique as seguintes causas:")
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Bloqueio de Firewall do Windows")] }),
        new Paragraph({
          children: [
            new TextRun("O Windows Defender Firewall frequentemente bloqueia conexões de entrada vinda de dispositivos na rede local nas portas 8081 (Metro) e 8082 (Servidor APK). Abra o PowerShell como Administrador e rode os comandos para liberar as portas:")
          ]
        }),
        new Paragraph({
          shading: { fill: COLOR_SHADING, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "  New-NetFirewallRule -DisplayName \"Expo Metro Bundler\" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow", font: "Courier New", size: 18 })]
        }),
        new Paragraph({
          shading: { fill: COLOR_SHADING, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "  New-NetFirewallRule -DisplayName \"Expo APK Share\" -Direction Inbound -LocalPort 8082 -Protocol TCP -Action Allow", font: "Courier New", size: 18 })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Modo de Túnel (Ngrok) para Wi-Fi Restrito")] }),
        new Paragraph({
          children: [
            new TextRun("Se o roteador do seu Wi-Fi possui bloqueio de isolamento (AP Isolation) que impede dispositivos locais de conversarem entre si, você deve iniciar o Metro em modo túnel público. Primeiro adicione seu token do Ngrok no console:")
          ]
        }),
        new Paragraph({
          shading: { fill: COLOR_SHADING, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "  npx ngrok config add-authtoken <seu-authtoken-ngrok>", font: "Courier New", bold: true })]
        }),
        new Paragraph({
          children: [
            new TextRun("Depois, inicie o Metro no modo túnel:")
          ]
        }),
        new Paragraph({
          shading: { fill: COLOR_SHADING, type: ShadingType.CLEAR },
          children: [new TextRun({ text: "  npm run tunnel", font: "Courier New", bold: true })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Rede Wi-Fi Configurada como Pública")] }),
        new Paragraph({
          children: [
            new TextRun("Se o perfil do seu Wi-Fi no Windows estiver como 'Público', o sistema bloqueia conexões locais. Acesse as Propriedades do Wi-Fi perto do relógio do Windows e altere o perfil de rede para 'Privado' ou 'Particular'.")
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Conflitos de Variáveis de Java (JAVA_HOME)")] }),
        new Paragraph({
          children: [
            new TextRun("Caso necessite compilar localmente (offline) via gradle e encontre erros de diretório inválido do JAVA_HOME: o Gradle do React Native é incompatível com o Java 25. Instale o Java JDK 17 (versão padrão LTS suportada), marque a opção de definir variável de ambiente durante a instalação e reinicie o console.")
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Fim da Documentação Operacional")] }),
        new Paragraph({
          children: [
            new TextRun({ text: "VERDEVIA Mobile & Web — Desenvolvido com foco em escalabilidade de engenharia e beleza de design.", italics: true, color: COLOR_SECONDARY })
          ]
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`\n\x1b[32m%s\x1b[0m`, `Documento DOCX compilado e salvo com sucesso em:`);
  console.log(`\x1b[36m  ${OUTPUT_PATH}\x1b[0m\n`);
}).catch((err) => {
  console.error('Falha ao gerar o documento DOCX:', err);
  process.exit(1);
});
