/* ============================================================
   SITE DE NOIVADO — script.js
   ============================================================ */

/* ============================================================
   ⚙️  CONFIGURAÇÕES — edite aqui!
   ============================================================ */
const CONFIG = {
  // Nome do casal para o PDF
  coupleName: 'Richlecia & Isaac',

  // Data de início do relacionamento (YYYY, MM-1, DD)
  // Ex: 12 de março de 2018 → [2018, 2, 12]
  togetherSince: [2024, 3, 27],

  // Data do casamento (deixe null se ainda não definida)
  // Ex: 15 de dezembro de 2027 → [2027, 11, 15]
  weddingDate: [2029, 6, 15],

  // Mensagem personalizada para dias ao casamento
  weddingMsg: (days) => `Faltam <strong>${days}</strong> dias para o grande dia. 🎉`,
};
/* ============================================================ */

/* ---------- Lightbox ---------- */
(function () {
  const lightbox   = document.getElementById('lightbox');
  const track      = document.getElementById('lightboxTrack');
  const dotsWrap   = document.getElementById('lightboxDots');
  const btnClose   = document.getElementById('lightboxClose');
  const btnPrev    = document.getElementById('lightboxPrev');
  const btnNext    = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let images       = [];

  /* ---- Abre o lightbox ---- */
  function openLightbox(albumImages, startIndex) {
    images       = albumImages;
    currentIndex = startIndex;

    // Monta as imagens no track
    images.forEach(src => {
  if (src.startsWith('video:')) {
  const video = document.createElement('video');
  video.src = src.replace('video:', '');
  video.controls = true;
  video.style.cssText = 'flex-shrink:0; width:min(90vw,860px); max-height:80vh; border-radius:.8rem; display:block;';
  track.appendChild(video);
}
   else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto do álbum';
    track.appendChild(img);
  }
});

    // Cria os dots
    dotsWrap.innerHTML = '';
    images.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    goTo(currentIndex, false);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ---- Navega para um índice ---- */
  function goTo(index, animate = true) {
    currentIndex = Math.max(0, Math.min(index, images.length - 1));
    const imgWidth = track.firstChild ? track.firstChild.offsetWidth : 0;

    if (!animate) track.style.transition = 'none';
    track.querySelectorAll('video').forEach(v => v.pause());
    track.style.transform = `translateX(-${currentIndex * imgWidth}px)`;
    if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });

    // Autoplay no item atual se for vídeo com autoplay
    const currentEl = track.children[currentIndex];
    if (currentEl && currentEl.tagName === 'VIDEO') {
  setTimeout(() => currentEl.play().catch(() => {}), 100);
  }

    // Atualiza dots
    dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentIndex));

    // Atualiza setas
    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === images.length - 1;
  }

  /* ---- Fecha o lightbox ---- */
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    track.querySelectorAll('video').forEach(v => v.pause());
    track.innerHTML = '';
    dotsWrap.innerHTML = '';
    images = [];
  }

  /* ---- Swipe touch ---- */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  });

  /* ---- Eventos ---- */
  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', () => goTo(currentIndex - 1));
  btnNext.addEventListener('click', () => goTo(currentIndex + 1));

  // Fecha ao clicar fora da imagem
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Teclado
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  // Clique nas fotos da galeria
  document.querySelectorAll('.gallery-item[data-album] .gallery-img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const item   = wrap.closest('.gallery-item');
      const album  = JSON.parse(item.dataset.album);
      openLightbox(album, 0);
    });
  });

  // Recalcula posição ao redimensionar
  window.addEventListener('resize', () => {
    if (lightbox.classList.contains('open')) goTo(currentIndex, false);
  });
})();

/* ---------- Timeline scroll animations ---------- */
(function initTimelineAnimations() {
  const cards = document.querySelectorAll('.timeline-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card) => observer.observe(card));
})();

/* ---------- Mensagem surpresa / envelope ---------- */
(function initMessage() {
  const btn        = document.getElementById('btnOpenMsg');
  const envelope   = document.getElementById('envelope');
  const letterWrap = document.getElementById('letterWrap');
  let opened       = false;

  btn.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('opened');

    setTimeout(() => {
      letterWrap.classList.add('visible');
      letterWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 600);

    btn.textContent = '💌 Mensagem aberta';
    btn.style.opacity = '.5';
    btn.style.cursor = 'default';
  });
})();

/* ---------- Contador: tempo juntos ---------- */
(function initTogetherCounter() {
  function update() {
    const now   = new Date();
    const start = new Date(...CONFIG.togetherSince);
    const diff  = now - start;

    const totalMs = diff;
    const ms_per_hour = 3600000;
    const ms_per_day  = ms_per_hour * 24;

    // Years
    let years = now.getFullYear() - start.getFullYear();
    let tempDate = new Date(start);
    tempDate.setFullYear(tempDate.getFullYear() + years);
    if (tempDate > now) { years--; tempDate.setFullYear(tempDate.getFullYear() - 1); }

    // Months
    let months = now.getMonth() - tempDate.getMonth();
    if (months < 0) { months += 12; tempDate.setFullYear(tempDate.getFullYear() - 1); }
    tempDate.setMonth(tempDate.getMonth() + months);
    if (tempDate > now) { months--; tempDate.setMonth(tempDate.getMonth() - 1); }

    // Days
    let days = Math.floor((now - tempDate) / ms_per_day);
    tempDate.setDate(tempDate.getDate() + days);
    if (tempDate > now) { days--; tempDate.setDate(tempDate.getDate() - 1); }

    // Hours
    const hours = Math.floor((now - tempDate) / ms_per_hour);

    document.getElementById('togYears').textContent  = years;
    document.getElementById('togMonths').textContent = months;
    document.getElementById('togDays').textContent   = days;
    document.getElementById('togHours').textContent  = hours;
  }

  update();
  setInterval(update, 60000);
})();

/* ---------- Contador: dias para o casamento ---------- */
(function initWeddingCounter() {
  const block = document.getElementById('weddingCounter');

  if (!CONFIG.weddingDate) {
    block.style.display = 'none';
    return;
  }

  function update() {
    const now     = new Date();
    const wedding = new Date(...CONFIG.weddingDate);
    const diff    = Math.ceil((wedding - now) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
      document.getElementById('weddingDays').textContent = '🎉';
      document.getElementById('weddingMsg').innerHTML = 'Hoje é o grande dia! Parabéns! 🎊';
      return;
    }

    document.getElementById('weddingDays').textContent = diff;
    document.getElementById('weddingMsg').innerHTML = CONFIG.weddingMsg(diff);
  }

  update();
  setInterval(update, 60000);
})();



/* ---------- Cápsula do Tempo → PDF ---------- */
(function initCapsule() {
  const btn = document.getElementById('btnCapsule');

  btn.addEventListener('click', () => {
    const home   = document.getElementById('capsuleHome').value.trim();
    const travel = document.getElementById('capsuleTravel').value.trim();
    const dreams = document.getElementById('capsuleDreams').value.trim();

    if (!home && !travel && !dreams) {
      alert('💌 Preencha pelo menos um campo para gerar a cápsula do tempo.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
    const W    = 210; // largura A4
    const padX = 20;  // margem lateral
    const textW = W - padX * 2; // largura útil para texto

    // Paleta
    const ROSE      = [201, 132, 138];
    const GOLD      = [184, 151,  90];
    const DARK      = [ 42,  31,  26];
    const DARK_SOFT = [138, 112, 104];
    const BEGE      = [247, 239, 227];
    const BORDER    = [212, 176, 122];

    let y = 18; // cursor vertical

    // ── Bordas decorativas ──
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.rect(8, 8, W - 16, 281);      // borda externa
    doc.setLineWidth(0.15);
    doc.rect(11, 11, W - 22, 275);    // borda interna

    // ── Ornamento topo ──
    doc.setFontSize(10);
    doc.setTextColor(...GOLD);
    doc.text('- o - o - o -', W / 2, y, { align: 'center' });
    y += 10;

    // ── Título ──
    doc.setFontSize(26);
    doc.setTextColor(...ROSE);
    doc.setFont('helvetica', 'italic');
    doc.text('Cápsula do Tempo', W / 2, y, { align: 'center' });
    y += 8;

    // ── Nome do casal ──
    doc.setFontSize(13);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'normal');
    doc.text(CONFIG.coupleName, W / 2, y, { align: 'center' });
    y += 6;

    // ── Data ──
    const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setFontSize(8);
    doc.setTextColor(...DARK_SOFT);
    doc.text(('Gerado em ' + dateStr).toUpperCase(), W / 2, y, { align: 'center' });
    y += 8;

    // ── Linha divisória ──
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 20, y, W / 2 + 20, y);
    y += 10;

    // ── Função para desenhar seção ──
    function drawSection(icon, title, content) {
      // Label da seção
      doc.setFontSize(8);
      doc.setTextColor(...GOLD);
      doc.setFont('helvetica', 'normal');
      doc.text((icon + '  ' + title).toUpperCase(), padX, y);
      y += 5;

      // Caixa de conteúdo
      const lines   = doc.splitTextToSize(content, textW - 10);
      const boxH    = lines.length * 5.5 + 10;

      doc.setFillColor(...BEGE);
      doc.setDrawColor(...ROSE);
      doc.setLineWidth(0.5);
      // Linha lateral esquerda rosé
      doc.line(padX, y, padX, y + boxH);
      // Fundo bege
      doc.setDrawColor(...BEGE);
      doc.setLineWidth(0);
      doc.rect(padX + 0.5, y, textW - 0.5, boxH, 'F');

      // Texto do conteúdo
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, padX + 6, y + 7);

      y += boxH + 8;
    }

    if (home)   drawSection('\u00BB', 'Onde desejamos morar', home);
    if (travel) drawSection('\u00BB', 'Viagens que queremos fazer', travel);
    if (dreams) drawSection('\u00BB', 'Sonhos para os proximos anos', dreams);

    // ── Rodapé ──
    y += 4;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 20, y, W / 2 + 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(...ROSE);
    doc.setFont('helvetica', 'italic');
    doc.text('"Que estes sonhos se tornem memórias inesquecíveis."', W / 2, y, { align: 'center' });
    y += 7;

    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'normal');
    doc.text('- o - o - o -', W / 2, y, { align: 'center' });

    // ── Download ──
    const filename = 'capsula-do-tempo-' + CONFIG.coupleName.replace(/\s+/g, '-').replace('&', 'e') + '.pdf';
    doc.save(filename);

    btn.innerHTML = '<span class="btn-capsule-icon">✅</span> PDF gerado com sucesso!';
    setTimeout(() => {
      btn.innerHTML = '<span class="btn-capsule-icon">💍</span> Gerar Cápsula do Tempo';
    }, 3000);
  });
})();