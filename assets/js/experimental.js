/* DesenvolVi — formulário da aula experimental (aula-experimental.html).
   Lê as unidades e o endereço do servidor em config.js (DV_CONFIG). Envia o pedido ao app (cria o lead) e, em seguida,
   oferece o botão do WhatsApp com o texto pronto (dias e períodos e observações vão SÓ nesse texto). */
(function () {
  'use strict';

  var CFG = window.DV_CONFIG || {};
  var API = String((CFG.contato || {}).experimentalApi || '').trim();
  var T0 = Date.now();

  var DIAS = [['seg', 'Segunda-feira'], ['ter', 'Terça-feira'], ['qua', 'Quarta-feira'], ['qui', 'Quinta-feira'], ['sex', 'Sexta-feira'], ['sab', 'Sábado']];
  var PERIODOS = [['manha', 'Manhã'], ['tarde', 'Tarde']];
  var unidade = null;     // objeto da unidade (config.js)
  var sel = {};           // sel['seg|manha'] = true
  var enviando = false;

  function $(id) { return document.getElementById(id); }
  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }
  function minusculo(s) { return String(s || '').toLowerCase(); }
  function unidadesAtivas() { return (CFG.unidades || []).filter(function (u) { return u && u.ativa !== false && soDigitos(u.telefone); }); }
  function porId(id) {
    var alvo = String(id || '').trim().toUpperCase();
    return unidadesAtivas().filter(function (u) { return String(u.id).trim().toUpperCase() === alvo; })[0] || null;
  }
  /* nome da unidade como está na planilha do app (padrão: o id em maiúsculas, ex.: jf -> JF); config.js pode trocar com "appUnidade" */
  function unidadeNoApp(u) { return String(u.appUnidade || u.id || '').trim().toUpperCase(); }

  function whatsappUrl(u, texto) {
    return 'https://api.whatsapp.com/send?phone=' + soDigitos(u.telefone) + '&text=' + encodeURIComponent(texto);
  }
  function textoBase(u) {
    var modelo = (CFG.mensagens || {}).experimental || 'Olá! Gostaria de agendar uma aula experimental na DesenvolVi ({cidade}).';
    return String(modelo).replace('{cidade}', u.nome || '');
  }

  /* ---------- telas ---------- */
  function mostrar(qual) {
    ['fm-escolha', 'fm-form-area', 'fm-ok'].forEach(function (id) { $(id).hidden = id !== qual; });
  }

  function iniciar() {
    var param = new URLSearchParams(window.location.search).get('u');
    var u = porId(param);
    if (u) { escolherUnidade(u, false); return; }
    montarEscolha();
  }

  function montarEscolha() {
    var lista = $('fm-escolha-lista');
    lista.innerHTML = '';
    var us = unidadesAtivas();
    if (!us.length) {
      lista.innerHTML = '<li><p class="fm-aviso erro">Não foi possível carregar as unidades agora. Tente novamente em instantes.</p></li>';
    }
    us.forEach(function (u) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-sec'; b.style.width = '100%'; b.style.justifyContent = 'flex-start';
      b.textContent = u.nome + (u.uf ? ' · ' + u.uf : '') + (u.local ? ' — ' + u.local : '');
      b.addEventListener('click', function () { escolherUnidade(u, true); });
      li.appendChild(b); lista.appendChild(li);
    });
    mostrar('fm-escolha');
  }

  function escolherUnidade(u, atualizarEndereco) {
    unidade = u;
    if (atualizarEndereco) {
      try { history.replaceState(null, '', '?u=' + encodeURIComponent(String(u.id).toLowerCase())); } catch (e) { /* sem histórico: segue */ }
    }
    $('fm-un-nome').textContent = 'Unidade ' + u.nome + (u.uf ? ' · ' + u.uf : '');
    $('fm-trocar').hidden = unidadesAtivas().length < 2;
    mostrar('fm-form-area');
    montarMatriz();
    carregarListas();
  }

  /* ---------- servidor ---------- */
  function chamar(fn, args, ok, falha) {
    if (!API) { falha(new Error('sem endereço do servidor')); return; }
    var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var limite = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ api: 'experimental', fn: fn, args: args }), signal: ctl ? ctl.signal : undefined
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (res) { clearTimeout(limite); ok(res); })
      .catch(function (err) { clearTimeout(limite); falha(err); });
  }

  function preencherSelect(id, itens) {
    var s = $(id);
    s.innerHTML = '<option value="">Escolha...</option>';
    (itens || []).forEach(function (v) {
      var o = document.createElement('option'); o.value = v; o.textContent = v; s.appendChild(o);
    });
  }

  function falhaCarregar(msg) {
    $('fm-carregando').hidden = true;
    var f = $('fm-falha');
    f.hidden = false;
    f.innerHTML = '';
    var p = document.createElement('p'); p.style.margin = '0 0 12px'; p.textContent = msg;
    var a = document.createElement('a'); a.className = 'btn btn-primary'; a.target = '_blank'; a.rel = 'noopener';
    a.href = whatsappUrl(unidade, textoBase(unidade)); a.textContent = 'Falar pelo WhatsApp';
    f.appendChild(p); f.appendChild(a);
  }

  function carregarListas() {
    $('fm-form').hidden = true; $('fm-falha').hidden = true; $('fm-carregando').hidden = false;
    chamar('expPublicoListas', [], function (res) {
      if (!res || res.erro) { falhaCarregar((res && res.msg) || 'Não foi possível carregar o formulário agora.'); return; }
      preencherSelect('f-faixa', res.faixasEtarias);
      preencherSelect('f-origem', res.origens);
      var existe = (res.unidades || []).some(function (n) { return String(n).trim().toUpperCase() === unidadeNoApp(unidade); });
      if (!existe) { falhaCarregar('Esta unidade ainda não está disponível para pedidos pelo site. Fale com a gente pelo WhatsApp.'); return; }
      $('fm-carregando').hidden = true; $('fm-form').hidden = false;
    }, function () {
      falhaCarregar('Não foi possível carregar o formulário agora. Você pode pedir a aula experimental pelo WhatsApp.');
    });
  }

  /* ---------- matriz de dias e períodos ---------- */
  var ICONE_OK = '<svg class="mx-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function montarMatriz() {
    sel = {};
    var m = $('fm-matriz');
    m.innerHTML = '';
    var vazio = document.createElement('span'); m.appendChild(vazio);
    PERIODOS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mx-col'; b.textContent = p[1];
      b.setAttribute('aria-label', 'Marcar ou desmarcar todos os dias de ' + minusculo(p[1]));
      b.addEventListener('click', function () { alternarGrupo(DIAS.map(function (d) { return d[0] + '|' + p[0]; })); });
      m.appendChild(b);
    });
    DIAS.forEach(function (d) {
      var nome = document.createElement('button');
      nome.type = 'button'; nome.className = 'mx-dia'; nome.textContent = d[1];
      nome.setAttribute('aria-label', 'Marcar ou desmarcar manhã e tarde de ' + d[1]);
      nome.addEventListener('click', function () { alternarGrupo(PERIODOS.map(function (p) { return d[0] + '|' + p[0]; })); });
      m.appendChild(nome);
      PERIODOS.forEach(function (p) {
        var c = document.createElement('button');
        c.type = 'button'; c.className = 'mx-cel'; c.setAttribute('aria-pressed', 'false');
        c.setAttribute('data-k', d[0] + '|' + p[0]);
        c.setAttribute('aria-label', d[1] + ', ' + minusculo(p[1]));
        c.innerHTML = ICONE_OK + '<span>' + p[1] + '</span>';
        c.addEventListener('click', function () { alternarGrupo([d[0] + '|' + p[0]]); });
        m.appendChild(c);
      });
    });
  }

  function atualizarMatriz() {
    Array.prototype.forEach.call($('fm-matriz').querySelectorAll('.mx-cel'), function (c) {
      c.setAttribute('aria-pressed', sel[c.getAttribute('data-k')] ? 'true' : 'false');
    });
    limparErro($('c-matriz'));
  }
  /* se todas as chaves do grupo já estão marcadas, desmarca; senão marca todas */
  function alternarGrupo(chaves) {
    var todas = chaves.every(function (k) { return sel[k]; });
    chaves.forEach(function (k) { if (todas) delete sel[k]; else sel[k] = true; });
    atualizarMatriz();
  }
  function resumoDisponibilidade() {
    var linhas = [];
    DIAS.forEach(function (d) {
      var ps = PERIODOS.filter(function (p) { return sel[d[0] + '|' + p[0]]; }).map(function (p) { return minusculo(p[1]); });
      if (ps.length) linhas.push('• ' + d[1] + ': ' + ps.join(' e '));
    });
    return linhas;
  }

  /* ---------- máscara, contador, erros ---------- */
  function mascaraTelefone(v) {
    var d = soDigitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function limparErro(caixa) {
    if (!caixa) return;
    caixa.classList.remove('tem-erro');
    var e = caixa.querySelector('.fm-erro'); if (e) { e.hidden = true; e.textContent = ''; }
  }
  function marcarErro(caixa, msg) {
    caixa.classList.add('tem-erro');
    var e = caixa.querySelector('.fm-erro');
    if (e) { e.textContent = msg; e.hidden = false; }
  }

  function validar() {
    var erros = [];   // [{ caixa, campo, msg }]
    var crianca = $('f-crianca').value.trim(), resp = $('f-resp').value.trim();
    var cel = soDigitos($('f-cel').value);
    if (crianca.length < 2) erros.push({ caixa: $('c-crianca'), campo: $('f-crianca'), msg: 'Informe o nome da criança.' });
    if (!$('f-faixa').value) erros.push({ caixa: $('c-faixa'), campo: $('f-faixa'), msg: 'Escolha a idade da criança.' });
    if (resp.length < 2) erros.push({ caixa: $('c-resp'), campo: $('f-resp'), msg: 'Informe o nome do responsável.' });
    if (cel.length < 10 || cel.length > 11) erros.push({ caixa: $('c-cel'), campo: $('f-cel'), msg: 'Informe o WhatsApp com DDD, por exemplo (32) 99999-9999.' });
    if (!$('f-origem').value) erros.push({ caixa: $('c-origem'), campo: $('f-origem'), msg: 'Conte como conheceu a DesenvolVi.' });
    if (!Object.keys(sel).length) erros.push({ caixa: $('c-matriz'), campo: $('fm-matriz').querySelector('.mx-cel'), msg: 'Marque ao menos um dia e período em que vocês podem.' });
    if (!$('f-aceite').checked) erros.push({ caixa: $('c-aceite'), campo: $('f-aceite'), msg: 'Marque a autorização para continuar.', aceite: true });
    return erros;
  }

  /* ---------- envio ---------- */
  function textoWhatsApp() {
    var l = [textoBase(unidade), ''];
    l.push('Criança: ' + $('f-crianca').value.trim() + ' (' + $('f-faixa').value + ')');
    l.push('Responsável: ' + $('f-resp').value.trim());
    l.push('Dias e períodos em que podemos:');
    resumoDisponibilidade().forEach(function (x) { l.push(x); });
    var obs = $('f-obs').value.trim();
    if (obs) { l.push(''); l.push('Observações: ' + obs.replace(/\s+/g, ' ')); }
    return l.join('\n');
  }

  function mostrarResultado(recebido) {
    var texto = textoWhatsApp();
    $('fm-ok-resumo').textContent = texto;
    var a = $('fm-ok-whats');
    a.href = whatsappUrl(unidade, texto);
    a.textContent = 'Enviar pelo WhatsApp da unidade';
    $('fm-ok-txt').textContent = recebido
      ? 'Agora é só enviar esta mensagem pelo WhatsApp da unidade. A equipe responde com o horário disponível.'
      : 'Não conseguimos registrar o pedido agora, mas você pode enviar esta mensagem pelo WhatsApp da unidade e a equipe responde com o horário disponível.';
    mostrar('fm-ok');
    var alvo = $('fm-ok'); alvo.focus({ preventScroll: true });
    if (alvo.scrollIntoView) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function aoEnviar(ev) {
    ev.preventDefault();
    if (enviando) return;
    var resumo = $('fm-resumo-erros');
    resumo.hidden = true;
    ['c-crianca', 'c-faixa', 'c-resp', 'c-cel', 'c-origem', 'c-matriz', 'c-aceite'].forEach(function (id) { limparErro($(id)); });
    $('c-aceite-erro').hidden = true;

    var erros = validar();
    if (erros.length) {
      erros.forEach(function (e) {
        if (e.aceite) { e.caixa.classList.add('tem-erro'); var x = $('c-aceite-erro'); x.textContent = e.msg; x.hidden = false; }
        else marcarErro(e.caixa, e.msg);
      });
      resumo.textContent = 'Confira os campos em destaque.'; resumo.hidden = false;
      var primeiro = erros[0].campo; if (primeiro && primeiro.focus) primeiro.focus();
      return;
    }

    var dados = {
      unidade: unidadeNoApp(unidade), nomeCrianca: $('f-crianca').value.trim(), faixa: $('f-faixa').value,
      nomeResponsavel: $('f-resp').value.trim(), celular: $('f-cel').value, origem: $('f-origem').value,
      consentimento: true, site: $('f-isca').value, t0: T0
    };
    var botao = $('fm-enviar');
    enviando = true; botao.disabled = true; botao.textContent = 'Enviando...';
    chamar('expPublicoSolicitar', [dados], function (res) {
      enviando = false; botao.disabled = false; botao.textContent = 'Enviar pedido';
      if (res && !res.erro) { mostrarResultado(true); return; }
      resumo.textContent = (res && res.msg) || 'Não foi possível enviar agora.';
      resumo.hidden = false;
      if (resumo.scrollIntoView) resumo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, function () {
      enviando = false; botao.disabled = false; botao.textContent = 'Enviar pedido';
      mostrarResultado(false);   // sem conexão com o servidor: o WhatsApp com o texto pronto continua funcionando
    });
  }

  /* ---------- ligações ---------- */
  var cel = $('f-cel');
  if (cel) cel.addEventListener('input', function () { cel.value = mascaraTelefone(cel.value); limparErro($('c-cel')); });
  ['f-crianca', 'f-faixa', 'f-resp', 'f-origem'].forEach(function (id) {
    var el = $(id), caixa = el && el.closest('.fm-campo');
    if (el) el.addEventListener(id === 'f-faixa' || id === 'f-origem' ? 'change' : 'input', function () { limparErro(caixa); });
  });
  var aceite = $('f-aceite');
  if (aceite) aceite.addEventListener('change', function () { $('c-aceite').classList.remove('tem-erro'); $('c-aceite-erro').hidden = true; });
  var obs = $('f-obs');
  if (obs) obs.addEventListener('input', function () { $('fm-obs-cont').textContent = obs.value.length + '/300'; });
  var trocar = $('fm-trocar');
  if (trocar) trocar.addEventListener('click', function () { try { history.replaceState(null, '', window.location.pathname); } catch (e) {} unidade = null; montarEscolha(); });
  var form = $('fm-form');
  if (form) form.addEventListener('submit', aoEnviar);

  iniciar();
})();
