/**
 * dashboard.js — Lógica da página do dashboard (dashboard.html)
 */

(function () {

  /* --- Protege a rota --- */
  if (!AuthService.requireAuth()) return;

  const session = AuthService.getSession();

  /* -------------------------------------------------------
     NAVBAR
  ------------------------------------------------------- */
  const navAvatar   = document.getElementById('nav-avatar');
  const navUsername = document.getElementById('nav-username');

  navAvatar.textContent   = session.username.charAt(0).toUpperCase();
  navUsername.textContent = session.username;

  document.getElementById('btn-logout').addEventListener('click', () => {
    AuthService.logout();
    window.location.href = 'index.html';
  });

  /* -------------------------------------------------------
     BOAS-VINDAS
  ------------------------------------------------------- */
  document.getElementById('greeting-text').textContent =
    AuthService.getGreeting() + ',';

  document.getElementById('user-fullname').textContent = session.fullname;

  /* -------------------------------------------------------
     STATS
  ------------------------------------------------------- */
  document.getElementById('last-access').textContent =
    AuthService.getLastSuccessfulLogin(session.username);

  document.getElementById('total-access').textContent =
    AuthService.countLogins(session.username) + ' login(s)';

  document.getElementById('session-expiry').textContent =
    AuthService.getSessionExpiry();

  /* Atualiza expiração a cada minuto */
  setInterval(() => {
    const el = document.getElementById('session-expiry');
    if (el) el.textContent = AuthService.getSessionExpiry();
  }, 60_000);

  /* -------------------------------------------------------
     LOG DE ACESSOS
  ------------------------------------------------------- */
  function renderLog() {
    const tbody = document.getElementById('log-body');
    const logs  = AuthService.getLogs();

    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="log-empty">Nenhum registro encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map((entry, i) => {
      const badgeClass = entry.status === 'success' ? 'success'
                       : entry.status === 'error'   ? 'error'
                       : 'warning';

      const statusLabel = entry.status === 'success' ? '✓ Sucesso'
                        : entry.status === 'error'   ? '✗ Falha'
                        : '⇠ Logout';

      return `
        <tr>
          <td>${logs.length - i}</td>
          <td>${escapeHtml(entry.fullname || entry.username)}</td>
          <td>${AuthService.formatDate(entry.timestamp)}</td>
          <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
        </tr>`;
    }).join('');
  }

  renderLog();

  document.getElementById('btn-clear-log').addEventListener('click', () => {
    if (confirm('Deseja limpar todo o log de acessos?')) {
      AuthService.clearLogs();
      renderLog();
    }
  });

  /* -------------------------------------------------------
     UTILITÁRIO
  ------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
