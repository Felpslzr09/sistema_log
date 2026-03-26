/**
 * auth.js — Módulo de autenticação, sessão e cookies
 * ====================================================
 * Gerencia: login, logout, sessão (sessionStorage),
 * cookies de "lembrar" e log de acessos (localStorage).
 *
 * ⚠️  USUÁRIOS DEMO (substituir pela chamada ao backend MongoDB)
 *     Para integrar com backend real, veja as funções
 *     AuthService.login() e AuthService.fetchUser()
 */

const AuthService = (() => {

  /* -------------------------------------------------------
     CONFIGURAÇÃO
  ------------------------------------------------------- */
  const SESSION_KEY   = 'auth_session';
  const LOG_KEY       = 'access_log';
  const COOKIE_USER   = 'remembered_user';
  const SESSION_TTL   = 30 * 60 * 1000;   // 30 minutos

  /* -------------------------------------------------------
     USUÁRIOS DEMO — remova ao integrar com MongoDB
  ------------------------------------------------------- */
  const DEMO_USERS = [
    { id: '1', username: 'admin',  password: '1234',   fullname: 'Administrador' },
    { id: '2', username: 'joao',   password: 'senha1', fullname: 'João da Silva' },
    { id: '3', username: 'maria',  password: 'senha2', fullname: 'Maria Oliveira'},
  ];

  /* -------------------------------------------------------
     COOKIES
  ------------------------------------------------------- */
  function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Strict`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }

  /* -------------------------------------------------------
     SESSÃO
  ------------------------------------------------------- */
  function setSession(user) {
    const session = {
      userId:    user.id,
      username:  user.username,
      fullname:  user.fullname,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_TTL,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getSessionExpiry() {
    const s = getSession();
    if (!s) return '—';
    const mins = Math.round((s.expiresAt - Date.now()) / 60000);
    return mins > 0 ? `em ${mins} min` : 'Expirada';
  }

  /* -------------------------------------------------------
     LOG DE ACESSOS
  ------------------------------------------------------- */
  function appendLog(entry) {
    try {
      const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      logs.unshift({ ...entry, timestamp: new Date().toISOString() });
      if (logs.length > 50) logs.length = 50;       // máximo 50 entradas
      localStorage.setItem(LOG_KEY, JSON.stringify(logs));
    } catch { /* quota excedida, ignora */ }
  }

  function getLogs() {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function clearLogs() {
    localStorage.removeItem(LOG_KEY);
  }

  function getLastSuccessfulLogin(username) {
    const logs = getLogs();
    const found = logs.find(l => l.username === username && l.status === 'success' && l !== logs[0]);
    return found ? formatDate(found.timestamp) : 'Primeiro acesso';
  }

  function countLogins(username) {
    return getLogs().filter(l => l.username === username && l.status === 'success').length;
  }

  /* -------------------------------------------------------
     AUTENTICAÇÃO PRINCIPAL
     Para integrar MongoDB: substitua o bloco DEMO_USERS
     por uma chamada fetch() ao seu backend PHP/Node.
  ------------------------------------------------------- */
  async function login(username, password, remember) {
    // --- Simulação de latência de rede ---
    await new Promise(r => setTimeout(r, 600));

    // --- Validação demo ---
    const user = DEMO_USERS.find(
      u => u.username === username.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      appendLog({ username: username.trim(), status: 'error', reason: 'Credenciais inválidas' });
      throw new Error('Usuário ou senha incorretos.');
    }

    // --- Sessão ---
    const session = setSession(user);

    // --- Cookie "lembrar" ---
    if (remember) {
      setCookie(COOKIE_USER, user.username, 30);
    } else {
      deleteCookie(COOKIE_USER);
    }

    // --- Log ---
    appendLog({ username: user.username, fullname: user.fullname, status: 'success', reason: 'Login realizado' });

    return { user, session };
  }

  function logout() {
    const session = getSession();
    if (session) {
      appendLog({ username: session.username, fullname: session.fullname, status: 'warning', reason: 'Logout' });
    }
    clearSession();
  }

  function requireAuth() {
    if (!getSession()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  /* -------------------------------------------------------
     UTILITÁRIOS
  ------------------------------------------------------- */
  function formatDate(iso) {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso));
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  /* -------------------------------------------------------
     API PÚBLICA
  ------------------------------------------------------- */
  return {
    login,
    logout,
    getSession,
    requireAuth,
    getCookie,
    getSessionExpiry,
    getLogs,
    clearLogs,
    getLastSuccessfulLogin,
    countLogins,
    formatDate,
    getGreeting,
    COOKIE_USER,
  };

})();

/* -------------------------------------------------------
   INTEGRAÇÃO COM MONGODB (backend PHP)
   -------------------------------------------------------
   Quando você tiver o backend pronto, substitua a função
   AuthService.login() por algo como:

   async function login(username, password, remember) {
     const res = await fetch('/api/login.php', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password })
     });
     if (!res.ok) throw new Error('Erro ao conectar ao servidor');
     const data = await res.json();
     if (!data.success) throw new Error(data.message);
     const session = setSession(data.user);
     if (remember) setCookie(COOKIE_USER, username, 30);
     appendLog({ username, fullname: data.user.fullname, status:'success', reason:'Login' });
     return { user: data.user, session };
   }

   O backend login.php deve:
   1. Conectar ao MongoDB com a extensão mongodb
   2. Buscar o usuário pela coleção "users"
   3. Verificar o hash da senha (password_verify)
   4. Retornar JSON: { success: true, user: { id, username, fullname } }
------------------------------------------------------- */
