import { icon } from '../components/icons.js';
import { navigate } from '../router.js';
import { authService, DEMO_CREDENTIALS } from '../services/authService.js';
import { isRequired, isEmail, isMinLength } from '../utils/validators.js';
import { store } from '../state/store.js';

let currentTab = 'login'; // 'login' o 'register'

export function renderAuthView() {
    return `
        <div class="auth-container">
            <div class="auth-logo">
                <img src="/logo.png" alt="LegalMusic Logo" class="auth-logo-img" />
                <h1>LegalMusic</h1>
                <p>Gestión de Estudios Musicales</p>
            </div>
            
            <div class="auth-tabs">
                <button class="auth-tab ${currentTab === 'login' ? 'active' : ''}" data-tab="login">Iniciar Sesión</button>
                <button class="auth-tab ${currentTab === 'register' ? 'active' : ''}" data-tab="register">Crear Cuenta</button>
            </div>

            <div class="auth-form-container">
                ${currentTab === 'login' ? renderLoginForm() : renderRegisterForm()}
            </div>

            <button class="btn btn--ghost btn--block auth-demo-btn" id="demoLoginBtn">
                Acceso Demo Rápido
            </button>
        </div>
    `;
}

function renderLoginForm() {
    return `
        <form class="auth-form" id="loginForm">
            <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="correo@ejemplo.com">
                <span class="form-error"></span>
            </div>
            <div class="form-group">
                <label class="form-label" for="password">Contraseña</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="••••••••">
                <span class="form-error"></span>
            </div>
            <button type="submit" class="btn btn--primary btn--block">Iniciar Sesión</button>
        </form>
    `;
}

function renderRegisterForm() {
    return `
        <form class="auth-form" id="registerForm">
            <div class="form-group">
                <label class="form-label" for="fullName">Nombre completo</label>
                <input type="text" class="form-control" id="fullName" name="fullName" placeholder="Tu nombre">
                <span class="form-error"></span>
            </div>
            <div class="form-group">
                <label class="form-label" for="studioName">Nombre del estudio</label>
                <input type="text" class="form-control" id="studioName" name="studioName" placeholder="Tu estudio">
                <span class="form-error"></span>
            </div>
            <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="correo@ejemplo.com">
                <span class="form-error"></span>
            </div>
            <div class="form-group">
                <label class="form-label" for="password">Contraseña</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="••••••••">
                <span class="form-error"></span>
            </div>
            <div class="form-group">
                <label class="form-label" for="confirmPassword">Confirmar contraseña</label>
                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="••••••••">
                <span class="form-error"></span>
            </div>
            <button type="submit" class="btn btn--primary btn--block">Crear Cuenta</button>
        </form>
    `;
}

export function initAuthViewEvents() {
    const container = document.querySelector('.auth-container');
    if (!container) return;

    // Delegación de eventos para las pestañas
    container.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.auth-tab');
        if (tabBtn) {
            const selectedTab = tabBtn.dataset.tab;
            if (currentTab !== selectedTab) {
                currentTab = selectedTab;

                // Actualizar estado visual de las pestañas sin destruir el layout
                container.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tabBtn.classList.add('active');

                // Solo reemplazar el contenido del formulario
                const formContainer = container.querySelector('.auth-form-container');
                if (formContainer) {
                    formContainer.innerHTML = currentTab === 'login' ? renderLoginForm() : renderRegisterForm();
                }

                // Re-bind eventos del formulario nuevo
                bindFormEvents();
            }
        }
    });

    // Bind inicial de formulario y botón demo
    bindFormEvents();
    bindDemoButton();
}

// Vincular eventos del formulario activo (login o registro)
function bindFormEvents() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            let valid = true;

            if (!isRequired(email) || !isEmail(email)) {
                loginForm.email.nextElementSibling.textContent = 'Email inválido';
                valid = false;
            } else {
                loginForm.email.nextElementSibling.textContent = '';
            }

            if (!isRequired(password)) {
                loginForm.password.nextElementSibling.textContent = 'Contraseña requerida';
                valid = false;
            } else {
                loginForm.password.nextElementSibling.textContent = '';
            }

            if (valid) {
                try {
                    authService.login(email, password);
                    store.loadFromStorage();
                    navigate('dashboard');
                } catch (err) {
                    loginForm.password.nextElementSibling.textContent = err.message;
                }
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = registerForm.fullName.value;
            const studioName = registerForm.studioName ? registerForm.studioName.value : '';
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;
            let valid = true;

            if (!isRequired(fullName)) {
                registerForm.fullName.nextElementSibling.textContent = 'Nombre requerido';
                valid = false;
            } else {
                registerForm.fullName.nextElementSibling.textContent = '';
            }

            if (!isRequired(email) || !isEmail(email)) {
                registerForm.email.nextElementSibling.textContent = 'Email inválido';
                valid = false;
            } else {
                registerForm.email.nextElementSibling.textContent = '';
            }

            if (!isMinLength(password, 6)) {
                registerForm.password.nextElementSibling.textContent = 'Mínimo 6 caracteres';
                valid = false;
            } else {
                registerForm.password.nextElementSibling.textContent = '';
            }

            if (password !== confirmPassword) {
                registerForm.confirmPassword.nextElementSibling.textContent = 'Las contraseñas no coinciden';
                valid = false;
            } else {
                registerForm.confirmPassword.nextElementSibling.textContent = '';
            }

            if (valid) {
                try {
                    authService.register({ name: fullName, studio: studioName, email, password });
                    store.loadFromStorage();
                    navigate('dashboard');
                } catch (err) {
                    registerForm.email.nextElementSibling.textContent = err.message;
                }
            }
        });
    }
}

// Vincular botón de acceso demo
function bindDemoButton() {
    const demoBtn = document.getElementById('demoLoginBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            try {
                authService.login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
                store.loadFromStorage();
                navigate('dashboard');
            } catch (err) {
                // Si falla el demo, mostrar error en consola
                console.error('Demo login failed:', err.message);
            }
        });
    }
}
