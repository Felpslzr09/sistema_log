/**
 * app.js — Lógica da página de login (index.html)
 */

(function () {
  const form       = document.getElementById('login-form');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const rememberEl = document.getElementById('remember');
  const alertBox   = document.getElementById('alert-box');
  const btnLogin   = document.getElementById('btn-login');
  const btnText    = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const togglePw   = document.getElementById('toggle-pw');

  /* --- Se já está logado, vai direto ao dashboard --- */
  if (AuthService.getSession()) {
    window.location.href = 'dashboard.html';
    return;
  }

  /* --- Preenche usuário salvo em cookie --- */
  const saved = AuthService.getCookie(AuthService.COOKIE_USER);
  if (saved) {
    usernameEl.value   = saved;
    rememberEl.checked = true;
  }

  /* --- Toggle senha visível --- */
  togglePw.addEventListener('click', () => {
    const isText = passwordEl.type === 'text';
    passwordEl.type = isText ? 'password' : 'text';
    togglePw.setAttribute('aria-label', isText ? 'Mostrar senha' : 'Ocultar senha');
    document.getElementById('eye-icon').style.opacity = isText ? '1' : '.45';
  });

  /* --- Alerta --- */
  function showAlert(msg, type = 'error') {
    alertBox.textContent = msg;
    alertBox.className   = `alert ${type}`;
  }

  function hideAlert() {
    alertBox.className = 'alert hidden';
  }

  /* --- Validação inline --- */
  function validateField(input, errorId, message) {
    const errEl = document.getElementById(errorId);
    if (!input.value.trim()) {
      input.classList.add('invalid');
      errEl.textContent = message;
      return false;
    }
    input.classList.remove('invalid');
    errEl.textContent = '';
    return true;
  }

  usernameEl.addEventListener('input', () => {
    usernameEl.classList.remove('invalid');
    document.getElementById('error-username').textContent = '';
    hideAlert();
  });

  passwordEl.addEventListener('input', () => {
    passwordEl.classList.remove('invalid');
    document.getElementById('error-password').textContent = '';
    hideAlert();
  });

  /* --- Submissão --- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const validU = validateField(usernameEl, 'error-username', 'Informe o usuário.');
    const validP = validateField(passwordEl, 'error-password', 'Informe a senha.');
    if (!validU || !validP) return;

    /* Loading */
    btnLogin.disabled  = true;
    btnText.textContent = 'Entrando…';
    btnSpinner.classList.remove('hidden');

    try {
      await AuthService.login(
        usernameEl.value,
        passwordEl.value,
        rememberEl.checked
      );
      window.location.href = 'dashboard.html';
    } catch (err) {
      showAlert(err.message || 'Erro ao fazer login. Tente novamente.');
      passwordEl.value = '';
      passwordEl.focus();
    } finally {
      btnLogin.disabled   = false;
      btnText.textContent = 'Entrar';
      btnSpinner.classList.add('hidden');
    }
  });
})();
