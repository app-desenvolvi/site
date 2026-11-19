/* DesenvolVi — site público. Renderização dirigida pela configuração (config.js). */
(function () {
  'use strict';

  var CFG = window.DV_CONFIG;
  if (!CFG) { console.error('DV_CONFIG não encontrado. Verifique assets/js/config.js.'); return; }

  /* ---------- utilitários ---------- */
  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }
  function urlSegura(u) {
    var s = String(u || '').trim();
    return /^(https?:\/\/|assets\/|\/)/i.test(s) ? s : '';
  }
  function $(id) { return document.getElementById(id); }
  function unidades() { return (CFG.unidades || []).filter(function (u) { return u && u.ativa !== false && soDigitos(u.telefone); }); }
  function porId(id) {
    var alvo = String(id || '').trim().toUpperCase();
    return unidades().find(function (u) { return String(u.id).trim().toUpperCase() === alvo; }) || null;
  }
  function whatsapp(u, tipo) {
    var modelo = (CFG.mensagens || {})[tipo] || (CFG.mensagens || {}).contato || '';
    var msg = String(modelo).replace('{cidade}', u.nome || '');
    return 'https://api.whatsapp.com/send?phone=' + soDigitos(u.telefone) + '&text=' + encodeURIComponent(msg);
  }
  function embedMapa(u) {
    var s = String(u || '').trim();
    return /^https:\/\/www\.google\.com\/maps\/embed\?pb=[\w!.%\-:]+$/i.test(s) ? s : '';
  }
  function mapaUrl(u) {
    var m = urlSegura(u.mapa);
    if (m) return m;
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent([u.endereco || u.local, u.nome, u.uf].filter(Boolean).join(', '));
  }
  /* unidade escolhida pelo visitante: conveniência local, a página funciona sem ela */
  var CHAVE = 'dv-unidade';
  function unidadeSalva() { try { return porId(localStorage.getItem(CHAVE)); } catch (e) { return null; } }
  function salvarUnidade(id) { try { localStorage.setItem(CHAVE, String(id)); } catch (e) { /* armazenamento indisponível: segue sem lembrar */ } }

  /* gancho de medição: compatível com Google Tag Manager / GA4 (se instalados) */
  function track(evento, detalhe) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: evento, detalhe: detalhe || '' });
    } catch (e) { console.warn('track falhou', e); }
  }
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-evento]') : null;
    if (el) track(el.getAttribute('data-evento'), el.getAttribute('data-detalhe'));
  });

  var ICONE_WHATS = '<svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';

  /* ---------- renderizadores (montam HTML em buffer e escrevem uma única vez) ---------- */
  function renderUnidades() {
    var lista = unidades();
    document.querySelectorAll('[data-unidades]').forEach(function (el) {
      var modo = el.getAttribute('data-unidades');
      var buf = '';
      lista.forEach(function (u) {
        var nome = escapeHtml(u.nome), uf = escapeHtml(u.uf), id = escapeHtml(u.id);
        if (modo === 'rodape') {
          buf += `<li><a href="${escapeHtml(whatsapp(u, 'contato'))}" target="_blank" rel="noopener" data-evento="whatsapp_rodape" data-detalhe="${id}" data-unidade="${id}">${nome} · ${uf}</a>${u.local ? `<span>${escapeHtml(u.local)}</span>` : ''}</li>`;
          return;
        }
        /* 'completo' (página Onde nos encontrar) e 'mapas' (página inicial): dados da unidade e,
           embaixo, o mapa e a fachada (Street View), um sobre o outro, como no site antigo */
        var completo = modo === 'completo' || modo === 'mapas';
        var extras = '';
        if (completo && u.endereco) extras += `<p class="un-linha"><strong>Endereço:</strong> ${escapeHtml(u.endereco)}</p>`;
        if (completo && u.horarios) extras += `<p class="un-linha"><strong>Horários:</strong> ${escapeHtml(u.horarios)}</p>`;
        var Hn = modo === 'completo' ? 'h2' : 'h3';
        var mapa = completo ? embedMapa(u.mapaEmbed) : '', fachada = completo ? embedMapa(u.fachadaEmbed) : '';
        var blocoMapa = '';
        if (mapa) blocoMapa += `<div class="un-mapa"><iframe src="${escapeHtml(mapa)}" title="Mapa da unidade ${nome}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
        if (fachada) blocoMapa += `<div class="un-mapa"><iframe src="${escapeHtml(fachada)}" title="Fachada da unidade ${nome} no Street View" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
        if (blocoMapa) blocoMapa = `<div class="un-mapas">${blocoMapa}</div>`;
        buf += `<article class="cartao unidade${blocoMapa ? ' com-mapa' : ''}"><div class="un-info">
          <${Hn} class="un-nome">${nome} <span class="un-uf">${uf}</span></${Hn}>
          ${u.local ? `<p class="un-local">${escapeHtml(u.local)}</p>` : ''}
          ${extras}
        </div>${blocoMapa}</article>`;
      });
      el.innerHTML = buf || '<p class="aviso">Em breve, os dados das unidades aparecem aqui.</p>';
    });
    /* quem toca em uma unidade passa a tê-la como "sua unidade" */
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('[data-unidade]') : null;
      if (a) salvarUnidade(a.getAttribute('data-unidade'));
    });
  }

  /* avaliações do Google pelo widget Elfsight (carrega o script só na página que tem o espaço) */
  function renderAvaliacoes() {
    var el = document.querySelector('[data-avaliacoes]');
    if (!el) return;
    var id = String(((CFG.avaliacoes || {}).elfsightApp) || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) { el.hidden = true; return; }
    var alvo = document.createElement('div');
    alvo.className = 'elfsight-app-' + id;
    alvo.setAttribute('data-elfsight-app-lazy', '');
    el.querySelector('.avaliacoes-widget').appendChild(alvo);
    var sc = document.createElement('script');
    sc.src = 'https://static.elfsight.com/platform/platform.js';
    sc.defer = true; sc.setAttribute('data-use-service-core', '');
    sc.onerror = function () { el.querySelector('.avaliacoes-widget').innerHTML = '<p class="aviso">Não foi possível carregar as avaliações agora. Veja no Google Maps.</p>'; };
    document.body.appendChild(sc);
  }

  /* página de contatos (link da bio): um botão por canal, em grupos. Canal sem endereço em config.js não aparece. */
  var ICONES = (function () {
    function sv(p) { return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
    return {
      agenda: sv('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4"/>'),
      site: sv('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
      form: sv('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>'),
      tabela: sv('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>'),
      camera: sv('<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>'),
      nota: sv('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
      pessoas: sv('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>')
    };
  })();
  function renderContato() {
    var el = document.querySelector('[data-contato]');
    if (!el) return;
    var c = CFG.contato || {}, m = CFG.marca || {}, us = unidades();
    function botao(it) {
      var ext = it.externo !== false;
      var atr = it.agendar ? ' data-agendar="' + escapeHtml(it.agendar) + '"' : (ext ? ' target="_blank" rel="noopener"' : '');
      return `<a class="link-btn${it.destaque ? ' destaque' : ''}" href="${escapeHtml(it.url)}"${atr} data-evento="contato_link" data-detalhe="${escapeHtml(it.id)}">
        <span class="link-ic">${it.icone}</span><span class="link-txt">${escapeHtml(it.texto)}</span></a>`;
    }
    /* página da aula experimental: endereço completo (https://) ou página do próprio site (ex.: aula-experimental.html) */
    var expBase = String(c.experimentalUrl || '').trim();
    var experimental = /^https?:\/\/[^\s"'<>]+$/i.test(expBase) || /^[\w\-\/]+\.html$/i.test(expBase) ? expBase : '';
    function linkExperimental(u) {
      return experimental + (experimental.indexOf('?') >= 0 ? '&' : '?') + 'u=' + encodeURIComponent(String(u.id).trim().toLowerCase());
    }
    var grupos = [
      /* com a página em config.js: um botão por unidade, que abre o formulário já na unidade (?u=jf, ?u=sjc);
         sem ela: um botão que abre a escolha de unidade e segue pelo WhatsApp */
      experimental
        ? { titulo: 'Agendar aula experimental', itens: us.map(function (u) {
            return { id: 'experimental_' + u.id, texto: u.nome + (u.uf ? ' (' + u.uf + ')' : ''), url: linkExperimental(u), icone: ICONES.agenda, destaque: true, externo: !/^[\w\-\/]+\.html/i.test(experimental) };
          }) }
        : { titulo: '', itens: [us.length ? { id: 'experimental', texto: 'Agendar aula experimental', url: '#', agendar: 'experimental', icone: ICONES.agenda, destaque: true } : null] },
      { titulo: 'WhatsApp', itens: us.map(function (u) {
        return { id: 'whatsapp_' + u.id, texto: u.nome + (u.uf ? ' (' + u.uf + ')' : ''), url: whatsapp(u, 'contato'), icone: ICONE_WHATS };
      }) },
      { titulo: us.some(function (u) { return urlSegura(u.tabelaUrl); }) ? 'Matrícula e valores' : 'Matrícula', itens: [
        urlSegura(c.matriculaUrl) ? { id: 'matricula', texto: 'Formulário de matrícula', url: urlSegura(c.matriculaUrl), icone: ICONES.form } : null
      ].concat(us.map(function (u) {
        var t = urlSegura(u.tabelaUrl);
        return t ? { id: 'tabela_' + u.id, texto: 'Tabela de preços · ' + u.nome, url: t, icone: ICONES.tabela } : null;
      })) },
      { titulo: 'Conheça a DesenvolVi', itens: [
        { id: 'site', texto: 'Nosso site', url: 'index.html', icone: ICONES.site, externo: false },
        urlSegura(m.instagram) ? { id: 'instagram', texto: 'Instagram' + (m.instagramUsuario ? ' ' + m.instagramUsuario : ''), url: urlSegura(m.instagram), icone: ICONES.camera } : null,
        urlSegura(c.tiktok) ? { id: 'tiktok', texto: 'TikTok', url: urlSegura(c.tiktok), icone: ICONES.nota } : null,
        urlSegura(c.facebook) ? { id: 'facebook', texto: 'Facebook', url: urlSegura(c.facebook), icone: ICONES.pessoas } : null
      ] }
    ];
    var buf = '';
    grupos.forEach(function (g) {
      var itens = g.itens.filter(Boolean);
      if (!itens.length) return;
      var h = '';
      itens.forEach(function (it) { h += botao(it); });
      buf += `<section class="links-grupo">${g.titulo ? `<h2 class="links-grupo-tit">${escapeHtml(g.titulo)}</h2>` : ''}${h}</section>`;
    });
    el.innerHTML = buf;
  }

  function renderEquipe() {
    var el = document.querySelector('[data-equipe]');
    if (!el) return;
    var buf = '';
    (CFG.equipe || []).forEach(function (p) {
      var foto = urlSegura(p.foto);
      var avatar = foto
        ? `<img class="av" src="${escapeHtml(foto)}" alt="" loading="lazy" width="96" height="96">`
        : `<span class="av" aria-hidden="true">${escapeHtml(p.iniciais || '')}</span>`;
      buf += `<article class="cartao pessoa">${avatar}<div>
        <h3>${escapeHtml(p.nome)}</h3>
        ${p.apelido ? `<p class="apelido">${escapeHtml(p.apelido)}</p>` : ''}
        <p class="cargo">${escapeHtml(p.cargo)}</p>
        <p>${escapeHtml(p.texto)}</p></div></article>`;
    });
    el.innerHTML = buf;
  }

  function renderDepoimentos() {
    var el = document.querySelector('[data-depoimentos]');
    if (!el) return;
    var lista = CFG.depoimentos || [];
    if (!lista.length) {
      el.innerHTML = '<p class="aviso">Os depoimentos das famílias vão aparecer aqui, sempre com autorização de quem escreveu.</p>';
      return;
    }
    var buf = '';
    lista.forEach(function (d) {
      var u = porId(d.unidade);
      buf += `<figure class="cartao depo"><blockquote>${escapeHtml(d.texto)}</blockquote>
        <figcaption><strong>${escapeHtml(d.autor)}</strong>${d.detalhe ? ` · ${escapeHtml(d.detalhe)}` : ''}${u ? ` · ${escapeHtml(u.nome)}` : ''}</figcaption></figure>`;
    });
    el.innerHTML = buf;
  }

  function renderFotos() {
    var fotos = CFG.fotos || {};
    document.querySelectorAll('[data-foto]').forEach(function (el) {
      var chave = el.getAttribute('data-foto'), f = fotos[chave];
      var src = f && urlSegura(f.src);
      if (!src) { el.hidden = true; return; }
      var img = document.createElement('img');
      img.src = src; img.alt = f.alt || '';
      img.loading = chave === 'hero' ? 'eager' : 'lazy';
      img.decoding = 'async';
      el.innerHTML = '';
      el.appendChild(img);
      el.hidden = false;
    });
  }

  /* links e textos que vêm da configuração */
  function renderLinks() {
    var m = CFG.marca || {};
    var ig = urlSegura(m.instagram), app = urlSegura(m.appUrl), rede = m.rede || {}, consult = urlSegura(m.consultoriaUrl);
    document.querySelectorAll('[data-instagram]').forEach(function (a) {
      if (!ig) { a.hidden = true; return; }
      a.href = ig; a.target = '_blank'; a.rel = 'noopener';
      if (a.hasAttribute('data-usuario')) a.textContent = m.instagramUsuario || 'Instagram';
    });
    document.querySelectorAll('[data-app]').forEach(function (a) {
      if (!app) { a.hidden = true; return; }
      a.href = app; a.hidden = false;
    });
    document.querySelectorAll('[data-rede]').forEach(function (a) {
      var u = urlSegura(rede.url);
      if (!u) { a.removeAttribute('href'); return; }
      a.href = u; a.target = '_blank'; a.rel = 'noopener';
    });
    document.querySelectorAll('[data-consultoria]').forEach(function (a) {
      if (!consult) { a.hidden = true; return; }
      a.href = consult; a.target = '_blank'; a.rel = 'noopener';
    });
    var bebeminhada = urlSegura(m.bebeminhadaUrl);
    document.querySelectorAll('[data-bebeminhada]').forEach(function (a) {
      if (!bebeminhada) { a.hidden = true; return; }
      a.href = bebeminhada; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* "Agendar visita": abre a escolha de unidade e segue para o WhatsApp */
  function initAgendar() {
    var dlg = $('dlg-agendar'), lista = $('dlg-unidades');
    if (!dlg || !lista || typeof dlg.showModal !== 'function') return;  /* sem suporte: o link leva à página das unidades */
    var tipoAtual = 'agendar', origem = null;
    function montar() {
      var salva = unidadeSalva(), us = unidades().slice();
      if (salva) us.sort(function (a, b) { return a === salva ? -1 : b === salva ? 1 : 0; });
      var buf = '';
      us.forEach(function (u) {
        var id = escapeHtml(u.id);
        buf += `<li><a class="btn ${u === salva ? 'btn-primary' : 'btn-sec'} dlg-un" href="${escapeHtml(whatsapp(u, tipoAtual))}" target="_blank" rel="noopener" data-unidade="${id}" data-evento="agendar_${escapeHtml(tipoAtual)}" data-detalhe="${id}">${ICONE_WHATS}<span>${escapeHtml(u.nome)} · ${escapeHtml(u.uf)}${u.local ? `<small>${escapeHtml(u.local)}</small>` : ''}</span></a>${u === salva ? '<p class="dlg-sua">Sua unidade</p>' : ''}</li>`;
      });
      lista.innerHTML = buf;
    }
    document.addEventListener('click', function (ev) {
      var gatilho = ev.target.closest ? ev.target.closest('[data-agendar]') : null;
      if (!gatilho) return;
      var us = unidades();
      if (!us.length) return;   /* sem unidades configuradas: segue o link normal */
      ev.preventDefault();
      tipoAtual = gatilho.getAttribute('data-agendar') || 'agendar';
      if (!(CFG.mensagens || {})[tipoAtual]) tipoAtual = 'agendar';
      origem = gatilho;
      montar();
      dlg.showModal();
      track('abrir_agendar', tipoAtual);
    });
    dlg.addEventListener('click', function (ev) {
      if (ev.target === dlg || (ev.target.closest && ev.target.closest('[data-fechar]'))) dlg.close();
      else if (ev.target.closest && ev.target.closest('.dlg-un')) setTimeout(function () { dlg.close(); }, 150);
    });
    dlg.addEventListener('close', function () { if (origem && origem.focus) origem.focus({ preventScroll: true }); });
  }

  /* abertura em vídeo: tela cheia; ao terminar (ou ao pular) encolhe até a foto do topo.
     Clicar (ou Enter/Espaço) na foto do topo reabre o vídeo em tela cheia, já com som, de onde parou. */
  function initIntro() {
    var root = document.documentElement, el = $('intro');
    if (!el) return;
    var cfg = CFG.intro || {};
    var src = urlSegura(cfg.video || '');
    var alvo = document.querySelector('.ht-frame');
    var podeReabrir = !!(src && alvo && cfg.reabrir !== false);
    var poupar = !!(navigator.connection && navigator.connection.saveData);
    var semMov = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var automatico = !!src && root.classList.contains('intro-on') && cfg.ativo !== false && !poupar;
    /* a abertura automática toca só na primeira vez em cada visita; ao voltar para o início, a página
       abre direto com a foto (o vídeo só carrega se a pessoa clicar na moldura). O aviso fica no navegador
       da pessoa até ela fechar a aba. Com umaVezPorVisita:false, toca sempre. */
    if (cfg.umaVezPorVisita === false) { try { sessionStorage.removeItem('dv-intro-visto'); } catch (e) {} }
    else if (automatico) { try { sessionStorage.setItem('dv-intro-visto', '1'); } catch (e) {} }
    if (!automatico) {
      root.classList.remove('intro-on', 'intro-lock');
      if (!podeReabrir) { el.remove(); return; }
    }
    var v = $('intro-video'), clip = $('intro-clip'), pular = $('intro-pular'), som = $('intro-som');
    var de = document.documentElement;
    var encerrado = !automatico, tocou = false, tempo = null, reaberto = false, carregado = false;
    var aoTerminarTransicao = null;
    var borda = 8, ar = 16 / 9, dur = '1.2s cubic-bezier(.65,0,.25,1)';

    function px(n) { return n + 'px'; }
    function irPara(y) { de.style.scrollBehavior = 'auto'; window.scrollTo(0, y); de.style.scrollBehavior = ''; }
    /* geometria do vídeo dentro da caixa: cover (moldura / tela horizontal) ou contain (tela vertical) */
    function geo(w, h, cobrir, px_, py_) {
      var largo = w / h > ar, W, H;
      if (cobrir ? largo : !largo) { W = w; H = w / ar; } else { H = h; W = h * ar; }
      return { w: W, h: H, l: (w - W) * px_, t: (h - H) * py_ };
    }
    function transicoes(ligar) {
      clip.style.transition = ligar ? ['left', 'top', 'width', 'height', 'border-radius', 'border-width', 'box-shadow'].map(function (p) { return p + ' ' + dur; }).join(',') : 'none';
      v.style.transition = ligar ? ['left', 'top', 'width', 'height'].map(function (p) { return p + ' ' + dur; }).join(',') : 'none';
    }
    function caixa(r, cs) {   /* coloca o recorte exatamente sobre a moldura */
      clip.style.left = px(r.left); clip.style.top = px(r.top);
      clip.style.width = px(r.width); clip.style.height = px(r.height);
      clip.style.borderRadius = cs.borderRadius; clip.style.borderWidth = px(borda);
      clip.style.boxShadow = '0 28px 60px rgba(11,42,94,.35)';
      var g = geo(r.width - 2 * borda, r.height - 2 * borda, true, 0.58, 0.5);
      v.style.left = px(g.l); v.style.top = px(g.t); v.style.width = px(g.w); v.style.height = px(g.h);
    }
    function videoSolto(g) {
      v.style.cssText = 'position:absolute;object-fit:fill;max-width:none;left:' + px(g.l) + ';top:' + px(g.t) + ';width:' + px(g.w) + ';height:' + px(g.h);
    }
    clip.addEventListener('transitionend', function (e) {
      if (e.target !== clip || e.propertyName !== 'width' || !aoTerminarTransicao) return;
      var f = aoTerminarTransicao; aoTerminarTransicao = null; f();
    });
    function depoisDaTransicao(f, seguranca) {
      var feito = false;
      function uma() { if (feito) return; feito = true; if (aoTerminarTransicao === uma) aoTerminarTransicao = null; f(); }
      aoTerminarTransicao = uma;
      setTimeout(uma, seguranca);
    }

    function limpar() {
      root.classList.remove('intro-on', 'intro-lock');
      document.body.classList.remove('site-entra');
      if (!podeReabrir) { if (el.parentNode) el.remove(); return; }
      el.classList.remove('saindo', 'abrindo', 'manual');
      clip.classList.remove('fade');
      clip.removeAttribute('style');
      if (v.parentNode === clip) v.removeAttribute('style');
    }
    function colocarNaMoldura() {
      alvo.innerHTML = '';
      v.removeAttribute('style');
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:58% 50%;display:block';
      if (podeReabrir) { v.setAttribute('aria-hidden', 'true'); v.removeAttribute('aria-label'); }
      else { v.removeAttribute('aria-hidden'); v.setAttribute('aria-label', 'Vídeo de abertura'); }
      alvo.appendChild(v);
    }

    function encerrar(motivo) {
      if (encerrado) return; encerrado = true;
      clearTimeout(tempo);
      try { v.pause(); } catch (e) {}
      track((reaberto ? 'video_' : 'intro_') + motivo, tocou ? Math.round(v.currentTime) : 0);
      root.classList.remove('intro-lock');
      var yVolta = reaberto ? window.pageYOffset : 0;
      if (!reaberto) {
        irPara(0);
        document.body.classList.add('site-entra');
        setTimeout(function () { document.body.classList.remove('site-entra'); }, 2600);
      }
      el.classList.remove('abrindo');
      el.classList.add('saindo');
      if (!alvo || semMov) {
        clip.classList.add('fade');
        setTimeout(function () { limpar(); if (reaberto && alvo) alvo.focus({ preventScroll: true }); }, 900);
        return;
      }
      /* se a moldura não estiver toda visível (celular), rola a página por baixo da abertura até ela */
      var topoFixo = 0;
      ['.site-header', '.site-bar'].forEach(function (s) {
        var n = document.querySelector(s);
        if (n && getComputedStyle(n).position !== 'static') { var b = n.getBoundingClientRect(); if (b.height && b.bottom > topoFixo && b.top < 5) topoFixo = b.bottom; }
      });
      var r = alvo.getBoundingClientRect(), vh = window.innerHeight, rolou = false;
      if (r.top < topoFixo + 8 || r.bottom > vh - 8) {
        var desejado = Math.max(topoFixo + 16, (vh - r.height) / 2);
        var maxY = Math.max(0, de.scrollHeight - vh);
        irPara(Math.min(maxY, Math.max(0, window.pageYOffset + r.top - desejado)));
        rolou = Math.abs(window.pageYOffset - yVolta) > 4;
        r = alvo.getBoundingClientRect();
      }
      var voltou = false;
      function cancelarVolta() { voltou = true; }
      ['touchstart', 'wheel', 'keydown'].forEach(function (ev) { window.addEventListener(ev, cancelarVolta, { once: true, passive: true }); });
      var cr = clip.getBoundingClientRect();
      transicoes(false);
      videoSolto(geo(cr.width, cr.height, cr.width >= cr.height, 0.5, 0.5));
      void clip.offsetWidth;
      transicoes(true);
      void clip.offsetWidth;
      caixa(r, getComputedStyle(alvo));
      depoisDaTransicao(function () {
        if (cfg.final === 'video') {
          colocarNaMoldura();
          limpar();
        } else {
          clip.style.transition = 'opacity .6s ease'; clip.style.opacity = '0';
          setTimeout(limpar, 650);
        }
        if (reaberto) alvo.focus({ preventScroll: true });
        /* se a página foi rolada para mostrar a moldura, volta suavemente, a menos que a pessoa já tenha interagido */
        if (rolou) setTimeout(function () { if (!voltou) window.scrollTo({ top: yVolta, behavior: 'smooth' }); }, 1100);
      }, 1600);
    }

    function marcarSom() {
      var on = !v.muted;
      som.setAttribute('aria-pressed', on ? 'true' : 'false');
      som.setAttribute('aria-label', on ? 'Desligar o som do vídeo' : 'Ativar o som do vídeo');
      som.classList.toggle('pede-som', !on && !!cfg.avisoSom);
    }
    function tocar(comSom, aoFalhar) {
      v.muted = !comSom;
      if (comSom) v.removeAttribute('muted');
      marcarSom();
      var p = v.play();
      if (p && p.catch) p.catch(aoFalhar);
    }
    /* se o navegador bloquear o som, toca mudo e liga o som no primeiro toque/clique/tecla */
    function ligarNoGesto(e) {
      if (e && e.target && e.target.closest && e.target.closest('.intro-ctrl')) return;
      ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.removeEventListener(ev, ligarNoGesto, true); });
      if (encerrado || !v.muted) return;
      v.muted = false; marcarSom();
      if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    }
    function tocarMudo() {
      tocar(false, function () { encerrar('bloqueado'); });
      ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, ligarNoGesto, true); });
    }

    /* reabre o vídeo a partir da moldura do topo */
    function abrir() {
      if (!encerrado || !podeReabrir) return;
      encerrado = false; reaberto = true; tocou = false;
      clearTimeout(tempo);
      var r = alvo.getBoundingClientRect(), cs = getComputedStyle(alvo);
      if (v.parentNode !== clip) { v.removeAttribute('style'); clip.appendChild(v); }
      v.setAttribute('aria-hidden', 'true');
      clip.classList.remove('fade');
      clip.removeAttribute('style');
      if (cfg.textoFechar) {
        pular.textContent = String(cfg.textoFechar) + ' ';
        var x = document.createElement('span'); x.setAttribute('aria-hidden', 'true'); x.textContent = '×'; pular.appendChild(x);
      }
      el.classList.add('manual', 'saindo', 'abrindo');
      if (!semMov) { transicoes(false); caixa(r, cs); v.style.position = 'absolute'; v.style.objectFit = 'fill'; v.style.maxWidth = 'none'; }
      root.classList.add('intro-on', 'intro-lock');
      if (!carregado || v.error) { v.src = src; carregado = true; }
      /* continua de onde parou; só recomeça se o vídeo já tinha chegado ao fim */
      var fim = v.ended || (v.duration && v.currentTime >= v.duration - 0.3);
      if (fim) { try { v.currentTime = 0; } catch (e) {} }
      tocar(true, function () { tocar(false, function () { encerrar('erro'); }); });
      tempo = setTimeout(function () { if (!tocou) encerrar('lento'); }, 15000);
      track('video_abriu');
      void clip.offsetWidth;
      el.classList.remove('saindo');
      if (!semMov) {
        var W = window.innerWidth, H = window.innerHeight;
        transicoes(true);
        void clip.offsetWidth;
        clip.style.left = '0px'; clip.style.top = '0px'; clip.style.width = px(W); clip.style.height = px(H);
        clip.style.borderRadius = '0px'; clip.style.borderWidth = '0px'; clip.style.boxShadow = 'none';
        videoSolto(geo(W, H, W >= H, 0.5, 0.5));
        v.style.transition = ['left', 'top', 'width', 'height'].map(function (p) { return p + ' ' + dur; }).join(',');
        depoisDaTransicao(function () {
          if (encerrado) return;
          clip.removeAttribute('style'); v.removeAttribute('style');
          el.classList.remove('abrindo');
        }, 1600);
      } else {
        el.classList.remove('abrindo');
      }
      pular.focus({ preventScroll: true });
    }

    v.addEventListener('ended', function () { setTimeout(function () { encerrar('assistiu'); }, 700); });
    v.addEventListener('error', function () { encerrar('erro'); });
    v.addEventListener('playing', function () { tocou = true; clearTimeout(tempo); });
    pular.addEventListener('click', function () { encerrar(reaberto ? 'fechou' : 'pulou'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') encerrar(reaberto ? 'fechou' : 'pulou'); });
    som.addEventListener('click', function () {
      v.muted = !v.muted;
      marcarSom();
      if (v.paused && !encerrado) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    });
    if (cfg.avisoSom) { var av = document.createElement('span'); av.className = 'som-txt'; av.textContent = String(cfg.avisoSom); som.appendChild(av); }

    if (podeReabrir) {
      alvo.classList.add('ht-play');
      alvo.setAttribute('role', 'button');
      alvo.setAttribute('tabindex', '0');
      alvo.setAttribute('aria-label', String(cfg.textoAssistir || 'Assistir ao vídeo em tela cheia'));
      alvo.addEventListener('click', abrir);
      alvo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); abrir(); }
      });
    }

    if (!automatico) return;
    v.src = src; carregado = true;
    if (cfg.som === true) tocar(true, tocarMudo);
    else tocarMudo();
    tempo = setTimeout(function () { if (!tocou) encerrar('lento'); }, 6000);
    pular.focus({ preventScroll: true });
  }

  /* menu do celular e cabeçalho compacto ao rolar */
  function initMenu() {
    var btn = $('menu-toggle'), nav = $('menu'), hd = document.querySelector('.site-header');
    if (!hd) return;
    function medir() { document.documentElement.style.setProperty('--hh', hd.offsetHeight + 'px'); }
    function fechar() {
      if (!btn || !nav) return;
      nav.classList.remove('aberto'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir menu');
    }
    if (btn && nav) {
      btn.addEventListener('click', function () {
        medir();
        var abrir = !nav.classList.contains('aberto');
        nav.classList.toggle('aberto', abrir);
        btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        btn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) fechar(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    }
    window.addEventListener('resize', function () { medir(); if (window.innerWidth >= 1200) fechar(); });
    var compacto = false;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (!compacto && y > 80) { compacto = true; hd.classList.add('compacto'); medir(); }
      else if (compacto && y < 16) { compacto = false; hd.classList.remove('compacto'); medir(); }
    }, { passive: true });
    window.addEventListener('load', medir);
    medir();
  }

  function init() {
    initIntro();
    initMenu();
    renderLinks();
    renderFotos();
    renderUnidades();
    renderEquipe();
    renderDepoimentos();
    renderAvaliacoes();
    renderContato();
    initAgendar();
    var ano = $('ano');
    if (ano) ano.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
