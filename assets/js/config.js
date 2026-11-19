/* ==========================================================================
   DESENVOLVI — CONFIGURAÇÃO DO SITE
   Edite SOMENTE este arquivo para: unidades, telefones, endereços, horários,
   mensagens de WhatsApp, equipe, depoimentos, fotos e links.
   Nenhum telefone ou texto operacional fica "chumbado" no HTML.
   ========================================================================== */
window.DV_CONFIG = {
  marca: {
    nome: 'DesenvolVi',
    instagram: 'https://www.instagram.com/desenvol.vi/',
    instagramUsuario: '@desenvol.vi',
    /* destaque do Instagram que explica a avaliação neuropsicomotora (consultoria) */
    consultoriaUrl: 'https://www.instagram.com/stories/highlights/18205305811158664/',
    rede: { nome: 'Rede Primeiros Anos', url: 'https://redeprimeirosanos.com.br' },
    /* site da Bebêminhada Solidária; vazio = o botão "Conheça a Bebêminhada" não aparece */
    bebeminhadaUrl: 'https://bebeminhada.desenvolvi.site',
    /* link do app das famílias e da equipe; vazio = o link "Entrar no app" não aparece */
    appUrl: ''
  },

  /* Página de contatos (contato.html), para usar como link da bio das redes sociais.
     Campo vazio = o botão não aparece. O WhatsApp e a tabela de preços de cada unidade ficam em "unidades".
     experimentalUrl: página da aula experimental (cria o lead no app). A página de contatos mostra
     um botão por unidade e acrescenta ?u=<id da unidade> (jf, sjc) para o formulário já abrir na unidade certa.
     Vazio = um botão "Agendar aula experimental" que abre a escolha de unidade e segue pelo WhatsApp. */
  contato: {
    experimentalUrl: 'aula-experimental.html',
    /* endereço do app (Apps Script) que recebe o pedido da página aula-experimental.html e cria o lead */
    experimentalApi: 'https://script.google.com/macros/s/AKfycbytQm1L6r_0wrZM1mXiTO2HFM_DAfd2tDEF6h7OVxYS0xWfUG5j0y_zGVz-zOLyT1w-/exec',
    matriculaUrl: 'https://matricula.desenvolvi.site',
    tiktok: '',
    facebook: ''
  },

  /* Abertura em vídeo (tela cheia) só na página inicial. ativo:false desliga.
     final: 'video' = o vídeo fica parado no último quadro, na moldura do topo; 'foto' = vira a foto.
     reabrir: clicar na moldura do topo abre o vídeo de novo, com som, de onde parou.
     umaVezPorVisita: true = a abertura toca só na primeira vez que o site é aberto; ao navegar e voltar
     para o início, a página abre direto, sem carregar o vídeo. false = toca sempre. */
  intro: {
    ativo: true, video: 'assets/video/intro.mp4', final: 'video', som: true, avisoSom: 'Toque para ouvir',
    reabrir: true, textoAssistir: 'Assistir ao vídeo em tela cheia', textoFechar: 'Fechar vídeo',
    umaVezPorVisita: true
  },

  /* Fotos. Coloque os arquivos em assets/img/fotos/ e preencha "src". */
  fotos: {
    hero: { src: 'assets/img/fotos/01.jpg', alt: 'Fisioterapeuta sorrindo e estimulando um bebê deitado de bruços em um tapete de atividades' },
    sensorial: { src: 'assets/img/fotos/sensorial.jpg', alt: 'Bebê explorando brinquedos de texturas e cores' },
    psicomotor: { src: 'assets/img/fotos/psicomotor.jpg', alt: 'Bebê se movimentando no chão com apoio de um adulto' },
    afetivo: { src: 'assets/img/fotos/afetivo.jpg', alt: 'Mãe e bebê trocando olhares e carinho' },
    social: { src: 'assets/img/fotos/social.jpg', alt: 'Bebês interagindo lado a lado durante a aula' },
    tia_vivi: { src: 'assets/img/fotos/tia_vivi.jpg', alt: 'Drª Viviane Hipólito, a Tia Vivi, sorrindo' },
    consultoria: { src: 'assets/img/fotos/consultoria.jpg', alt: 'Fisioterapeuta sentada no chão com uma mãe e o bebê, fazendo anotações enquanto segura a mão do bebê' }
  },

  /* Mensagens pré-preenchidas do WhatsApp ({cidade} é trocado pelo nome da unidade) */
  mensagens: {
    agendar: 'Olá! Gostaria de agendar uma visita na DesenvolVi ({cidade}).',
    experimental: 'Olá! Gostaria de agendar uma aula experimental na DesenvolVi ({cidade}).',
    avaliacao: 'Olá! Gostaria de saber mais sobre a consultoria personalizada (avaliação neuropsicomotora) na DesenvolVi ({cidade}).',
    contato: 'Olá! Gostaria de saber mais sobre a DesenvolVi ({cidade}).'
  },

  /* Uma linha por unidade. Campos vazios não aparecem no site.
     telefone: DDI + DDD + número, só dígitos. mapa: link do Google Maps para o botão "Ver no mapa" (opcional).
     mapaEmbed e fachadaEmbed: mapa e Street View incorporados na página Onde nos encontrar. */
  unidades: [
    {
      id: 'jf',
      nome: 'Juiz de Fora',
      uf: 'MG',
      local: 'Shopping Alameda',
      endereco: 'R. Morais e Castro, 300 · Piso P1 · Passos · CEP 36025-160',
      horarios: '',
      telefone: '5532991359888',
      /* tabela de preços na página de contatos (vazio = não aparece). Ex.: 'https://jf.desenvolvi.site/tabela' */
      tabelaUrl: '',
      mapa: '',
      /* endereços dos mapas incorporados (copiados do site atual). Só links que começam com https://www.google.com/maps/embed */
      mapaEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3705.1144368500663!2d-43.34811699057653!3d-21.775831586553544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x989b8a59b03d31%3A0x2a6d3ac0fcff81c4!2sDesenvolVi%20-%20Centro%20de%20Desenvolvimento%20Infantil!5e0!3m2!1sen!2sbr!4v1748119333025!5m2!1sen!2sbr',
      fachadaEmbed: 'https://www.google.com/maps/embed?pb=!4v1699056709631!6m8!1m7!1skmjawaa0hqfRJdY5S5JahQ!2m2!1d-21.77621358118132!2d-43.34781975460185!3f358.79383718456324!4f5.742431034378001!5f0.7820865974627469',
      ativa: true
    },
    {
      id: 'sjc',
      nome: 'São José dos Campos',
      uf: 'SP',
      local: 'Boulevard Lugo',
      endereco: 'R. Nelson Cesar de Oliveira, 450 · Jardim das Indústrias · CEP 12240-220',
      horarios: '',
      telefone: '5512992009404',
      tabelaUrl: '',
      mapa: '',
      mapaEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.4364489621526!2d-45.923388223833165!3d-23.227199779030816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cc35748b3928f9%3A0x9a49e282d835cf42!2sR.%20Nelson%20Cesar%20de%20Oliveira%2C%20450%20-%20Jardim%20das%20Industrias%2C%20S%C3%A3o%20Jos%C3%A9%20dos%20Campos%20-%20SP%2C%2012240-220!5e0!3m2!1spt-BR!2sbr!4v1754953651960!5m2!1spt-BR!2sbr',
      fachadaEmbed: 'https://www.google.com/maps/embed?pb=!4v1754953469311!6m8!1m7!1sxOYwwIEXyU9pOCGIJQs3BQ!2m2!1d-23.22732641787419!2d-45.92066869885393!3f127.91492132390954!4f-1.5660314068639138!5f0.4000000000000002',
      ativa: true
    }
  ],

  /* Equipe. Para usar foto, preencha "foto" (ex.: 'assets/img/equipe/vivi.jpg'). */
  equipe: [
    {
      nome: 'Drª Viviane Hipólito',
      apelido: 'Tia Vivi',
      cargo: 'Fisioterapeuta e administradora · sócia-fundadora',
      texto: 'Apaixonada pelo universo das crianças, em especial pelos primeiros anos de vida. Há 15 anos ajuda bebês a se desenvolverem de forma plena e orienta suas famílias.',
      foto: '',
      iniciais: 'VH'
    },
    {
      nome: 'Drª Amanda Baio',
      apelido: '',
      cargo: 'Fisioterapeuta (UFJF) · responsável pela unidade Juiz de Fora',
      texto: 'Encantada pela fisioterapia pediátrica, direciona seu conhecimento para ajudar bebês e crianças a explorarem todo o seu potencial.',
      foto: '',
      iniciais: 'AB'
    }
  ],

  /* Depoimentos reais, sempre com autorização. Enquanto a lista estiver vazia, aparece um aviso.
     Exemplo: { texto: '...', autor: 'Nome', detalhe: 'mãe do João, 8 meses', unidade: 'jf' } */
  depoimentos: [],

  /* Avaliações do Google (widget Elfsight, o mesmo do site atual). Vazio = não aparece. */
  avaliacoes: { elfsightApp: '6bd4b4e1-e073-4371-895a-e5c5fba40d6c' }
};
