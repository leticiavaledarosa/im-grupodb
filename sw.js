// ============================================================
// Service Worker – IM Grupo DB
// Lembrete semanal toda segunda-feira às 8h
// ============================================================

const CACHE_NAME = 'im-grupodb-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  // Agenda o primeiro lembrete ao ativar
  agendarLembrete();
});

self.addEventListener('message', event => {
  if (event.data === 'agendar') {
    agendarLembrete();
  }
});

function agendarLembrete() {
  const agora = new Date();

  // ── TESTES DE HOJE: 20h e 21h ──
  const horariosTeste = [20, 21];
  horariosTeste.forEach(hora => {
    const teste = new Date(agora);
    teste.setHours(hora, 0, 0, 0);
    const ms = teste.getTime() - agora.getTime();
    if (ms > 0) {
      setTimeout(() => {
        self.registration.showNotification('🧪 TESTE – IM Grupo DB', {
          body: `Notificação de teste das ${hora}h! Se chegou, está funcionando! 🎉`,
          icon: '/im-grupodb/icon_grupodb.png',
          badge: '/im-grupodb/icon_grupodb.png',
          tag: `im-teste-${hora}`,
          renotify: true,
          actions: [
            { action: 'abrir', title: '📋 Abrir canal' },
            { action: 'fechar', title: 'Fechar' }
          ]
        });
      }, ms);
    }
  });

  // ── PRODUÇÃO: Segunda às 8h ──
  agendarDiaSemana(1, 8, 0);

  // ── PRODUÇÃO: Sexta às 15h ──
  agendarDiaSemana(5, 15, 0);
}

function agendarDiaSemana(diaSemana, hora, minuto) {
  const agora = new Date();
  const alvo = new Date(agora);

  const diaAtual = agora.getDay();
  let diasAte = (diaSemana - diaAtual + 7) % 7;

  // Se é o mesmo dia mas já passou do horário, agenda pra semana que vem
  if (diasAte === 0 && (agora.getHours() > hora || (agora.getHours() === hora && agora.getMinutes() >= minuto))) {
    diasAte = 7;
  }

  alvo.setDate(agora.getDate() + diasAte);
  alvo.setHours(hora, minuto, 0, 0);

  const ms = alvo.getTime() - agora.getTime();

  setTimeout(() => {
    dispararNotificacao(diaSemana);
    // Repete semanalmente
    setInterval(() => dispararNotificacao(diaSemana), 7 * 24 * 60 * 60 * 1000);
  }, ms);
}

function dispararNotificacao(diaSemana) {
  const isSegunda = diaSemana === 1;
  self.registration.showNotification('🤖 Intel de Mercado – Grupo DB', {
    body: isSegunda
      ? 'Boa semana! Teve alguma novidade do mercado? Registre agora em 2 minutinhos 👇'
      : 'Sexta-feira! Antes de fechar a semana, registre sua inteligência de mercado 📋',
    icon: '/im-grupodb/icon_grupodb.png',
    badge: '/im-grupodb/icon_grupodb.png',
    tag: `im-lembrete-${isSegunda ? 'segunda' : 'sexta'}`,
    renotify: true,
    actions: [
      { action: 'abrir', title: '📋 Registrar agora' },
      { action: 'depois', title: 'Depois' }
    ]
  });
}

function dispararNotificacao() {
  self.registration.showNotification('🤖 Intel de Mercado – Grupo DB', {
    body: 'Boa semana! Teve alguma novidade do mercado? Registre agora em 2 minutinhos 👇',
    icon: '/im-grupodb/icon_grupodb.png',
    badge: '/im-grupodb/icon_grupodb.png',
    tag: 'im-lembrete-semanal',
    renotify: true,
    actions: [
      { action: 'abrir', title: '📋 Registrar agora' },
      { action: 'depois', title: 'Depois' }
    ]
  });
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'abrir' || !event.action) {
    event.waitUntil(
      clients.openWindow('https://leticiavaledarosa.github.io/im-grupodb/')
    );
  }
});
