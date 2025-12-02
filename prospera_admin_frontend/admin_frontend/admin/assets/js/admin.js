// Elementos do DOM
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

const adminSidebar = document.getElementById('adminSidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const menuItems = document.querySelectorAll('.menu-item');
const adminSections = document.querySelectorAll('.admin-section');
const pageTitle = document.getElementById('pageTitle');
const logoutBtn = document.getElementById('logoutBtn');

const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const confirmActionBtn = document.getElementById('confirmActionBtn');
const lastLoginTime = document.getElementById('lastLoginTime');

// Configuração do Backend
// Use a URL completa para o backend para evitar 404 quando o frontend
// for servido por outro servidor (ex: live-server em :5500).
const API_BASE_URL = 'http://localhost:3000/api';

// Estado da aplicação
let currentAdmin = null;

// Funções auxiliares
function formatDateTime(date) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleString('pt-BR', options);
}

function showSection(sectionId) {
    adminSections.forEach(section => {
        section.classList.remove('active');
    });

    const sectionElement = document.getElementById(`${sectionId}Section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
        
        // Atualizar título da página
        const menuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
        if (menuItem) {
            pageTitle.textContent = menuItem.textContent.trim();
        }

        // Se for dashboard ou users, atualiza os dados
        if (sectionId === 'dashboard') {
            updateUserCount();
            updateGoalsCount();
            // também buscar metas recentes para dashboard
            fetchGoals();
        } else if (sectionId === 'users') {
            fetchUsers();
        } else if (sectionId === 'goals') {
            fetchGoals();
            updateGoalsCount();
        }

        // Adicionar classe de animação
        sectionElement.classList.add('fade-in');
        setTimeout(() => {
            sectionElement.classList.remove('fade-in');
        }, 500);
    }
}

function showConfirmModal(title, message, callback) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.style.display = 'flex';

    // Remove listeners anteriores para evitar múltiplos disparos
    const newConfirmActionBtn = confirmActionBtn.cloneNode(true);
    confirmActionBtn.parentNode.replaceChild(newConfirmActionBtn, confirmActionBtn);

    const handleConfirm = () => {
        callback();
        confirmModal.style.display = 'none';
    };

    newConfirmActionBtn.addEventListener('click', handleConfirm);
}

function renderUsersTable(users) {
    const tableBody = document.querySelector('#usersSection .admin-table tbody');
    tableBody.innerHTML = ''; // Limpa a tabela

    users.forEach(user => {
        const row = document.createElement('tr');
        // Marcar a linha para facilitar remoção/seleção futura
        row.setAttribute('data-user-id', user.Usuario_Id);
        row.innerHTML = `
            <td>${user.Usuario_Id}</td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${user.Usuario_Nome.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="user-name">${escapeHtml(user.Usuario_Nome)}</div>
                        <div class="user-email">${escapeHtml(user.Usuario_Email)}</div>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(user.Usuario_Email)}</td>
            <td>${formatDate(user.Usuario_Registro || new Date())}</td>
            <td>N/A</td>
            <td><span class="status-badge status-active">Ativo</span></td>
            <td>
                <button class="action-btn view view-user-btn"
                    data-id="${user.Usuario_Id}"
                    data-name="${escapeHtml(user.Usuario_Nome)}"
                    data-email="${escapeHtml(user.Usuario_Email)}"
                    data-phone="${escapeHtml(user.Usuario_Telefone || '')}"
                    data-role="${escapeHtml(user.Usuario_Cargo || '')}"
                    data-join-date="${formatDate(user.Usuario_Registro || '')}"
                    data-last-login="${escapeHtml(user.Usuario_UltimoLogin || '')}"
                    aria-label="Visualizar usuário ${escapeHtml(user.Usuario_Nome)}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit edit-user-btn" data-id="${user.Usuario_Id}"
                    data-name="${escapeHtml(user.Usuario_Nome)}"
                    data-email="${escapeHtml(user.Usuario_Email)}"
                    data-phone="${escapeHtml(user.Usuario_Telefone || '')}"
                    data-role="${escapeHtml(user.Usuario_Cargo || '')}"
                    data-status="Ativo"
                    data-join-date="${formatDate(user.Usuario_Registro || '')}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${user.Usuario_Id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function fetchUsers() {
    try {
        // Tenta buscar a lista completa; se falhar com 500, tenta o endpoint /recent
        let response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
            // se for erro 500, tenta retornar apenas os recentes
            if (response.status === 500) {
                response = await fetch(`${API_BASE_URL}/users/recent`);
            }
        }
        if (!response.ok) throw new Error('Falha ao buscar usuários');
        const users = await response.json();
        renderUsersTable(users);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        // Exibir erro na interface
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Falha ao deletar usuário');

        // Remover a linha da tabela usando o atributo data-user-id
        const row = document.querySelector(`tr[data-user-id="${userId}"]`);
        if (row) {
            row.style.opacity = '0.5';
            row.style.pointerEvents = 'none';
            setTimeout(() => {
                row.remove();
            }, 500);
        } else {
            // Se não encontrar a linha, recarrega a lista para manter a interface sincronizada
            fetchUsers();
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('Erro ao deletar usuário. Verifique o console.');
    }
}

// Adicione esta função para atualizar o contador de usuários
async function updateUserCount() {
    try {
        // Usa o endpoint de contagem para menor carga
        const response = await fetch(`${API_BASE_URL}/users/count`);
        if (!response.ok) throw new Error('Falha ao buscar contagem de usuários');
        const data = await response.json();

        // Atualiza os contadores
        document.getElementById('totalUsers').textContent = data.total ?? '0';
        document.getElementById('newUsers').textContent = data.new7days ?? '0';
    } catch (error) {
        console.error('Erro ao atualizar contagem de usuários:', error);
    }
}

async function updateGoalsCount() {
    try {
        const res = await fetch(`${API_BASE_URL}/goals/count`);
        if (!res.ok) throw new Error('Falha ao buscar contagem de metas');
        const data = await res.json();
        // total = total metas, completed = concluidas
        const total = data.total ?? 0;
        const completed = data.completed ?? 0;
        const active = Math.max(total - completed, 0);
        document.getElementById('activeGoals').textContent = active;
        document.getElementById('completedGoals').textContent = completed;
    } catch (err) {
        console.error('Erro ao atualizar contagem de metas:', err);
    }
}

function formatCurrency(value) {
    if (value == null) return 'R$ 0,00';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderGoalsTable(goals) {
    const tbody = document.getElementById('goalsTbody');
    tbody.innerHTML = '';

    goals.forEach(goal => {
        const progress = (goal.ValorAlvo_Meta && goal.ValorAlvo_Meta > 0)
            ? Math.round((goal.ValorAtual_Meta || 0) / goal.ValorAlvo_Meta * 100)
            : 'N/A';

        const userName = goal.Usuario_Nome || '—';
        const userEmail = goal.Usuario_Email || '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${goal.id}</td>
            <td>${goal.Nome_Meta}</td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${(userName[0] || 'U').toUpperCase()}</div>
                    <div>
                        <div class="user-name">${userName}</div>
                        <div class="user-email">${userEmail}</div>
                    </div>
                </div>
            </td>
            <td>${formatCurrency(goal.ValorAlvo_Meta)}</td>
            <td>${progress === 'N/A' ? 'N/A' : progress + '%'}</td>
            <td><span class="status-badge ${goal.Status_Meta && goal.Status_Meta.toLowerCase().includes('conclu') ? 'status-active' : 'status-pending'}">${goal.Status_Meta}</span></td>
            <td>
                <button class="action-btn view" data-id="${goal.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" data-id="${goal.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderDashboardRecentGoals(goals) {
    const tbody = document.getElementById('dashboardGoalsTbody');
    tbody.innerHTML = '';

    // mostra até 5 recentes
    goals.slice(0, 5).forEach(goal => {
        const progress = (goal.ValorAlvo_Meta && goal.ValorAlvo_Meta > 0)
            ? Math.round((goal.ValorAtual_Meta || 0) / goal.ValorAlvo_Meta * 100)
            : 'N/A';

        const userName = goal.Usuario_Nome || '—';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${goal.Nome_Meta}</td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${(userName[0] || 'U').toUpperCase()}</div>
                    <div>
                        <div class="user-name">${userName}</div>
                        <div class="user-email">${goal.Usuario_Email || ''}</div>
                    </div>
                </div>
            </td>
            <td>${goal.DataFim_Meta ? formatDate(goal.DataFim_Meta) : '—'}</td>
            <td>${formatCurrency(goal.ValorAlvo_Meta)}</td>
            <td>${progress === 'N/A' ? 'N/A' : progress + '%'}</td>
            <td>
                <button class="action-btn view" data-id="${goal.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" data-id="${goal.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function fetchGoals() {
    try {
        const res = await fetch(`${API_BASE_URL}/goals`);
        if (!res.ok) throw new Error('Falha ao buscar metas');
        const goals = await res.json();
        renderGoalsTable(goals);
        renderDashboardRecentGoals(goals);
    } catch (err) {
        console.error('Erro ao carregar metas:', err);
    }
}

/**
 * Preenche o perfil do admin com os dados retornados
 * admin = { name, username, email, role, createdAt, lastLogin }
 */
function populateAdminProfile(admin) {
    if (!admin) return;
    const name = admin.name || admin.username || 'Admin';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileFullName').textContent = admin.name || name;
    document.getElementById('profileEmail').textContent = admin.email || 'admin@prospera.com';
    document.getElementById('profileRole').textContent = admin.role || 'Administrador';
    const joinDate = formatDate(admin.createdAt || admin.joinedAt);
    document.getElementById('profileJoinDate').textContent = joinDate || '—';
    const lastLoginText = formatLastLogin(admin.lastLogin || admin.last_login);
    document.getElementById('lastLoginTime').textContent = lastLoginText || '—';
    const initial = (name.charAt(0) || 'A').toUpperCase();
    const profileAvatar = document.getElementById('profileAvatar');
    const sideAvatar = document.getElementById('adminAvatar'); // sidebar avatar
    if (profileAvatar) profileAvatar.textContent = initial;
    if (sideAvatar) sideAvatar.textContent = initial;
}

function formatDate(dateInput) {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d)) return dateInput; // fallback se não for ISO
    return d.toLocaleDateString('pt-BR');
}

function formatLastLogin(dateInput) {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d)) return dateInput;
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Hoje às ${time}` : `${d.toLocaleDateString('pt-BR')} às ${time}`;
}

async function fetchAdminProfile() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const endpoints = [
        `${API_BASE_URL}/admins/me`,
        `${API_BASE_URL}/auth/me`,
        `${API_BASE_URL}/admins/profile`
    ];
    let adminData = null;

    if (token) {
        for (const ep of endpoints) {
            try {
                const res = await fetch(ep, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Normalizar campos recebidos
                    adminData = {
                        name: data.Admin_Nome || data.name || data.username || data.userName,
                        email: data.Admin_Email || data.email,
                        role: data.role || 'Administrador',
                        createdAt: data.Admin_Registro || data.createdAt || data.created_at,
                        lastLogin: data.lastLogin || data.last_login || data.LastLogin
                    };
                    break;
                }
            } catch (err) {
                console.warn('Erro ao buscar perfil em', ep, err);
            }
        }
    }

    if (!adminData) {
        const stored = localStorage.getItem('adminData');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                adminData = {
                    name: parsed.Admin_Nome || parsed.name || parsed.username,
                    email: parsed.Admin_Email || parsed.email,
                    role: parsed.role || 'Administrador',
                    createdAt: parsed.Admin_Registro || parsed.createdAt,
                    lastLogin: parsed.lastLogin || parsed.LastLogin
                };
            } catch (e) { /* ignore */ }
        }
    }

    if (adminData) {
        currentAdmin = adminData;
        populateAdminProfile(adminData);
    }
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = adminUsername.value;
    const password = adminPassword.value;

    try {
        const response = await fetch(`${API_BASE_URL}/admins/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Normaliza o objeto currentAdmin
            currentAdmin = {
                name: data.Admin_Nome || data.name || username,
                email: data.Admin_Email || data.email || '',
                id: data.Admin_Id || data.id
            };

            // Salva token e dados no localStorage (se vierem)
            if (data.token) localStorage.setItem('token', data.token);
            if (data.Admin_Token) localStorage.setItem('adminToken', data.Admin_Token);
            localStorage.setItem('adminData', JSON.stringify(data));

            loginContainer.style.display = 'none';
            adminContainer.style.display = 'flex';

            // Atualizar informações do admin na UI
            document.getElementById('adminAvatar').textContent = (currentAdmin.name || 'A').charAt(0).toUpperCase();
            document.getElementById('adminUsernameDisplay').textContent = currentAdmin.name;

            // Atualizar último login
            lastLoginTime.textContent = formatDateTime(new Date());

            // Preenche a seção de perfil
            populateAdminProfile(currentAdmin);

            // Atualizar contadores após login bem-sucedido
            updateUserCount();
            updateGoalsCount();
            showSection('dashboard');
            loginError.style.display = 'none';
        } else {
            loginError.textContent = data.message || 'Credenciais inválidas. Tente novamente.';
            loginError.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        loginError.textContent = 'Erro de conexão com o servidor.';
        loginError.style.display = 'block';
    }
});

// Menu items
menuItems.forEach(item => {
    if (item.dataset.section) {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            showSection(item.dataset.section);

            // Se for a seção de usuários, carrega os dados
            if (item.dataset.section === 'users') {
                fetchUsers();
            }

            // Fechar menu mobile se estiver aberto
            if (window.innerWidth <= 992) {
                adminSidebar.classList.remove('open');
            }
        });
    }
});

// Botão de menu mobile
mobileMenuBtn.addEventListener('click', () => {
    adminSidebar.classList.toggle('open');
});

// Fechar e abrir o sidebar
adminSidebar.addEventListener('click', (e) => {
    if (e.target === adminSidebar) {
        adminSidebar.classList.remove('open');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    showConfirmModal('Confirmar Logout', 'Tem certeza que deseja sair do painel de administração?', () => {
        currentAdmin = null;
        adminContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
        adminUsername.value = '';
        adminPassword.value = '';
        loginError.style.display = 'none';
    });
});

// Botão cancelar no modal de confirmação
cancelConfirmBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

// Fechar modal ao clicar fora
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.style.display = 'none';
    }
});

// Botões de ação nas tabelas
document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.action-btn.delete');
    if (deleteBtn) {
        const userId = deleteBtn.dataset.id;
        showConfirmModal('Confirmar Exclusão', `Tem certeza que deseja excluir o usuário ID ${userId}?`, () => {
            deleteUser(userId);
        });
        return;
    }

    // Se for edit e for *um* botão de edição que NÃO seja o edit-user-btn (usuário),
    // então trata como edição de outros itens (metas/relatórios)
    const editAction = e.target.closest('.action-btn.edit');
    if (editAction && !editAction.classList.contains('edit-user-btn')) {
        const id = editAction.dataset.id;
        console.log('Editar item (não usuário):', id);
        // implementação para metas/reports (abrir modal específico) — placeholder:
        // openModal('editGoalModal') // se existir o modal
        return;
    }

    // Igual para visualizar item — ignora view-user-btn (usuário)
    const viewAction = e.target.closest('.action-btn.view');
    if (viewAction && !viewAction.classList.contains('view-user-btn')) {
        const id = viewAction.dataset.id;
        console.log('Visualizar item (não usuário):', id);
        // openModal('viewGoalModal') // se existir um modal de visualização de metas
        return;
    }
});

// Botões de adicionar
document.getElementById('addUserBtn').addEventListener('click', () => {
    alert('Abrir formulário para adicionar novo usuário (A ser implementado com a API de POST)');
});

// Fechar menu ao clicar fora (em telas pequenas)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 &&
        !adminSidebar.contains(e.target) &&
        e.target !== mobileMenuBtn &&
        adminSidebar.classList.contains('open')) {
        adminSidebar.classList.remove('open');
    }
});

// Ajustar o layout ao redimensionar a janela
window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
        adminSidebar.classList.remove('open');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carrega perfil do admin caso exista token/adminData
    fetchAdminProfile().catch(console.error);
    loadFinancesReport();
});

async function loadFinancesReport() {
    const tbody = document.getElementById('financesTbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE_URL}/reports/finances`);
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         const data = await res.json(); // espera um array de objetos
         renderFinances(data || []);
     } catch (err) {
         tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar relatórios: ${err.message}</td></tr>`;
         console.error('loadFinancesReport:', err);
     }
}

function renderFinances(reports) {
    const tbody = document.getElementById('financesTbody');
    if (!tbody) return;
    if (!reports.length) {
        tbody.innerHTML = `<tr><td colspan="6">Nenhum relatório disponível.</td></tr>`;
        return;
    }
    tbody.innerHTML = reports.map(r => {
        const totalSaved = formatCurrency(r.totalSaved || 0);
        return `
            <tr>
                <td>${escapeHtml(r.period)}</td>
                <td>${r.newUsers ?? 0}</td>
                <td>${r.goalsCreated ?? 0}</td>
                <td>${r.goalsCompleted ?? 0}</td>
                <td>${totalSaved}</td>
                <td>
                    <button class="action-btn view" data-period="${escapeHtml(r.period)}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn download" data-period="${escapeHtml(r.period)}"><i class="fas fa-download"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function formatCurrency(value) {
    // Formata para BRL. value em centavos ou reais — adapte conforme sua API.
    const number = Number(value) || 0;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/*
 * Funções globais de modal (definidas cedo para evitar "is not defined")
 */
function openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) {
        console.warn(`openModal: overlay "${modalId}" not found`);
        return;
    }
    // forçar visibilidade do overlay
    overlay.style.display = 'flex';
    // pequeno timeout para permitir transições CSS
    setTimeout(() => overlay.classList.add('open'), 10);
    const dialog = overlay.querySelector('.modal');
    if (dialog) dialog.classList.add('open');
    document.body.classList.add('modal-open');

    // focar o primeiro elemento de entrada
    setTimeout(() => {
        const focusable = overlay.querySelector('input:not([type="hidden"]), textarea, select, button');
        if (focusable) focusable.focus();
    }, 100);

    console.log('Abrindo modal:', modalId);
}

function closeModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) {
        console.warn(`closeModal: overlay "${modalId}" not found`);
        return;
    }
    overlay.classList.remove('open');
    const dialog = overlay.querySelector('.modal');
    if (dialog) dialog.classList.remove('open');

    setTimeout(() => {
        overlay.style.display = 'none';
        const anyOpen = Array.from(document.querySelectorAll('.modal-overlay.open')).length > 0;
        if (!anyOpen) document.body.classList.remove('modal-open');
    }, 160);

    console.log('Fechando modal:', modalId);
}

// Garante que as funções estejam disponíveis no escopo global (opcional)
window.openModal = openModal;
window.closeModal = closeModal;

// Handler genérico para abrir modais com data-modal-target (mantém padrão DRY)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-modal-target]');
    if (btn) {
        e.preventDefault();
        const target = btn.dataset.modalTarget;
        if (target) {
            openModal(target);
        }
    }
});

// Fechar menu ao clicar fora (em telas pequenas)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 &&
        !adminSidebar.contains(e.target) &&
        e.target !== mobileMenuBtn &&
        adminSidebar.classList.contains('open')) {
        adminSidebar.classList.remove('open');
    }
});

// Ajustar o layout ao redimensionar a janela
window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
        adminSidebar.classList.remove('open');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carrega perfil do admin caso exista token/adminData
    fetchAdminProfile().catch(console.error);
    loadFinancesReport();
});

async function loadFinancesReport() {
    const tbody = document.getElementById('financesTbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE_URL}/reports/finances`);
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         const data = await res.json(); // espera um array de objetos
         renderFinances(data || []);
     } catch (err) {
         tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar relatórios: ${err.message}</td></tr>`;
         console.error('loadFinancesReport:', err);
     }
}

function renderFinances(reports) {
    const tbody = document.getElementById('financesTbody');
    if (!tbody) return;
    if (!reports.length) {
        tbody.innerHTML = `<tr><td colspan="6">Nenhum relatório disponível.</td></tr>`;
        return;
    }
    tbody.innerHTML = reports.map(r => {
        const totalSaved = formatCurrency(r.totalSaved || 0);
        return `
            <tr>
                <td>${escapeHtml(r.period)}</td>
                <td>${r.newUsers ?? 0}</td>
                <td>${r.goalsCreated ?? 0}</td>
                <td>${r.goalsCompleted ?? 0}</td>
                <td>${totalSaved}</td>
                <td>
                    <button class="action-btn view" data-period="${escapeHtml(r.period)}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn download" data-period="${escapeHtml(r.period)}"><i class="fas fa-download"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function formatCurrency(value) {
    // Formata para BRL. value em centavos ou reais — adapte conforme sua API.
    const number = Number(value) || 0;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Adicionar data e hora atual para último login
const now = new Date();
lastLoginTime.textContent = formatDate(now);

// Simulação de dados para o relatório financeiro (remover em produção)
const newUsers = 10;
const goalsCreated = 5;
const goalsCompleted = 3;
const totalSaved = 200.75;

// Enviar dados simulados para o backend (remover em produção)
fetch(`${API_BASE_URL}/reports/finances`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([{
    period: 'last_30_days',
    newUsers,
    goalsCreated,
    goalsCompleted,
    totalSaved
  }])
})
.then(res => {
    if (!res.ok) {
        // tenta ler texto para log, evita parse JSON de HTML e SyntaxError
        return res.text().then(text => {
            console.warn(`Relatórios POST retornou HTTP ${res.status}:`, text);
            throw new Error(`HTTP ${res.status}`);
        });
    }
    return res.json();
})
.then(data => console.log('Dados enviados com sucesso:', data))
.catch(err => console.error('Erro ao enviar dados:', err));

// Modal helper utilities and basic modal behavior
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    function openModal(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.style.display = 'flex';
        // small delay to allow CSS transitions if present
        setTimeout(() => {
            overlay.classList.add('open');
            const dialog = overlay.querySelector('.modal');
            if (dialog) dialog.classList.add('open');
        }, 10);

        document.body.classList.add('modal-open');

        // focus first focusable element inside dialog
        setTimeout(() => {
            const focusable = overlay.querySelector('input, textarea, button, select, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }, 200);
    }

    function closeModal(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.classList.remove('open');
        const dialog = overlay.querySelector('.modal');
        if (dialog) dialog.classList.remove('open');

        setTimeout(() => {
            overlay.style.display = 'none';
            const anyOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(o => o.classList.contains('open'));
            if (!anyOpen) document.body.classList.remove('modal-open');
        }, 170);
    }

    function closeAllModals() {
        modalOverlays.forEach(o => {
            o.classList.remove('open');
            o.style.display = 'none';
        });
        body.classList.remove('modal-open');
    }

    // Open modal by data-modal-target attribute
    document.querySelectorAll('[data-modal-target]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Abrindo modal:', btn.dataset.modalTarget);
            const target = btn.dataset.modalTarget;
            if (!target) return;
            if (target === 'editProfileModal') {
                fillProfileFormFromProfile?.();
            }
            openModal(target);
        });
    });

    // open search modal buttons (class)
    document.querySelectorAll('.open-search-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('searchModal');
        });
    });

    // overlay click closes when clicking outside modal
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
                overlay.style.display = 'none';
                body.classList.remove('modal-open');
            }
        });
    });

    // close buttons (×) and cancel actions
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.modal-close') || target.closest('.modal-close') || target.matches('.confirm-btn.cancel')) {
            const overlay = target.closest('.modal-overlay');
            if (overlay) {
                closeModal(overlay.id);
            }
        }
    });

    // ESC closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // --------------------------
    // Form handling: Edit Profile
    const editProfileForm = document.getElementById('editProfileForm');
    const editProfileError = document.getElementById('editProfileError');

    function fillProfileFormFromProfile() {
        const name = document.getElementById('profileName')?.textContent || '';
        const profileFullName = document.getElementById('profileFullName')?.textContent || '';
        const email = document.getElementById('profileEmail')?.textContent || '';
        const role = document.getElementById('profileRole')?.textContent || '';
        const joinDate = document.getElementById('profileJoinDate')?.textContent || '';

        document.getElementById('editFullName').value = profileFullName || name;
        document.getElementById('editEmail').value = email;
        document.getElementById('editRole').value = role;
        document.getElementById('editJoinDate').value = joinDate;
        if (editProfileError) editProfileError.style.display = 'none';
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            // Simple validation
            if (!form.checkValidity()) {
                editProfileError.textContent = 'Preencha corretamente os campos.';
                editProfileError.style.display = 'block';
                return;
            }
            // Apply edits to profile UI
            const fullName = document.getElementById('editFullName').value;
            const email = document.getElementById('editEmail').value;

            const profileNameEl = document.getElementById('profileName');
            const profileFullNameEl = document.getElementById('profileFullName');
            const profileEmailEl = document.getElementById('profileEmail');

            if (fullName) {
                if (profileNameEl) profileNameEl.textContent = fullName.split(' ')[0];
                if (profileFullNameEl) profileFullNameEl.textContent = fullName;
            }
            if (email && profileEmailEl) profileEmailEl.textContent = email;

            // Close and show success (console)
            console.log('Perfil atualizado (simulado).', { fullName, email });
            closeModal('editProfileModal');
        });
    }

    // --------------------------
    // Add User Form (basic)
    const addUserForm = document.getElementById('addUserForm');
    const addUserError = document.getElementById('addUserError');
    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('addUserPassword').value;
            const passConfirm = document.getElementById('addUserPasswordConfirm').value;

            if (pass !== passConfirm) {
                addUserError.textContent = 'Senhas não conferem.';
                addUserError.style.display = 'block';
                return;
            }
            addUserError.style.display = 'none';

            // Simulação de criação de usuário: aqui deveria chamar API
            console.log('Criar usuário (simulado):', {
                fullName: document.getElementById('addUserFullName').value,
                email: document.getElementById('addUserEmail').value,
            });
            closeModal('addUserModal');
            addUserForm.reset();
        });
    }

    // --------------------------
    // Edit User Form (basic)
    const editUserForm = document.getElementById('editUserForm');
    const editUserError = document.getElementById('editUserError');
    if (editUserForm) {
        editUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic validation
            if (!editUserForm.checkValidity()) {
                editUserError.textContent = 'Preencha corretamente os campos.';
                editUserError.style.display = 'block';
                return;
            }
            editUserError.style.display = 'none';
            console.log('Editar usuário (simulado).');
            closeModal('editUserModal');
        });
    }

    // --------------------------
    // Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    const changePasswordError = document.getElementById('changePasswordError');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('currentPassword').value.trim();
            const newPass = document.getElementById('newPassword').value.trim();
            const confirm = document.getElementById('confirmNewPassword').value.trim();

            if (newPass.length < 8) {
                changePasswordError.textContent = 'A nova senha deve ter pelo menos 8 caracteres.';
                changePasswordError.style.display = 'block';
                return;
            }
            if (newPass !== confirm) {
                changePasswordError.textContent = 'As senhas não coincidem.';
                changePasswordError.style.display = 'block';
                return;
            }

            changePasswordError.style.display = 'none';

            try {
                // Tente enviar para a API — ajuste endpoint conforme backend
                const adminId = currentAdmin?.Usuario_Id || currentAdmin?.id || null;
                // favor ajustar endpoint se necessário; aqui usamos /auth/change-password
                const endpoint = `${API_BASE_URL}/auth/change-password${adminId ? '?id=' + adminId : ''}`;

                const headers = { 'Content-Type': 'application/json' };
                const token = localStorage.getItem('adminToken');
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const resp = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        currentPassword: currentPass,
                        newPassword: newPass
                    })
                });

                if (!resp.ok) {
                    // tenta obter mensagem do servidor
                    let payload;
                    try {
                        payload = await resp.json();
                    } catch {
                        payload = await resp.text();
                    }
                    throw new Error((payload && payload.message) || payload || `HTTP ${resp.status}`);
                }

                // opcionalmente ler retorno
                try { await resp.json(); } catch {}

                // feedback de sucesso — atualize conforme queira (toast, elemento DOM)
                console.log('Senha alterada com sucesso (simulado).');

                closeModal('changePasswordModal');
                changePasswordForm.reset();
            } catch (err) {
                console.error('Erro ao alterar senha:', err);
                changePasswordError.textContent = String(err.message || err || 'Erro ao alterar senha.');
                changePasswordError.style.display = 'block';
            }
        });
    }

    // --------------------------
    // View/Edit user via event delegation (works if rows/buttons include dataset attributes)
    document.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-user-btn');
        if (viewBtn) {
            const ds = viewBtn.dataset;
            console.log('view-user-btn clicked', ds); // <-- novo log para depuração
            document.getElementById('viewUserName').textContent = ds.name || 'Nome do Usuário';
            document.getElementById('viewUserRole').textContent = ds.role || 'Cargo';
            document.getElementById('viewUserEmail').textContent = ds.email || '';
            document.getElementById('viewUserPhone').textContent = ds.phone || '';
            document.getElementById('viewUserJoinDate').textContent = ds.joinDate || '';
            document.getElementById('viewUserLastLogin').textContent = ds.lastLogin || '';
            openModal('viewUserModal');
            return;
        }
        const editBtn = e.target.closest('.edit-user-btn');
        if (editBtn) {
            const ds = editBtn.dataset;
            // atribui id para o overlay para ser usado no submit
            const overlay = document.getElementById('editUserModal');
            if (overlay) overlay.dataset.userId = ds.id || editBtn.dataset.id || '';

            document.getElementById('editUserFullName').value = ds.name || '';
            document.getElementById('editUserEmail').value = ds.email || '';
            document.getElementById('editUserPhone').value = ds.phone || '';
            document.getElementById('editUserRole').value = ds.role || '';
            document.getElementById('editUserStatus').value = ds.status || 'Ativo';
            document.getElementById('editUserJoinDate').value = ds.joinDate || '';
            if (editUserError) editUserError.style.display = 'none';
            openModal('editUserModal');
            return;
        }
    });

    // Close view user modal with either close button ID (there are two close buttons)
    const closeViewButtons = [document.getElementById('closeViewUserBtn'), document.getElementById('closeViewUserBtn2')];
    closeViewButtons.forEach(btn => {
        if (btn) btn.addEventListener('click', () => closeModal('viewUserModal'));
    });

    // You can add additional initialization for the Search form behavior
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = document.getElementById('searchQuery').value.trim();
            const scope = document.getElementById('searchScope').value;
            if (!q) {
                document.getElementById('searchError').textContent = 'Digite algo para buscar.';
                document.getElementById('searchError').style.display = 'block';
                return;
            }
            document.getElementById('searchError').style.display = 'none';
            // Simulated search results
            searchResults.innerHTML = `<div style="padding: 0.6rem;">Resultados simulados para "${q}" em "${scope}"</div>`;
        });
    }
});

(function () {
    // Minimal modal helpers for edit profile
    function openModalById(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('open');
            const modal = overlay.querySelector('.modal');
            if (modal) modal.classList.add('open');
        });
        document.body.classList.add('modal-open');
    }

    function closeModalById(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.classList.remove('open');
        const modal = overlay.querySelector('.modal');
        if (modal) modal.classList.remove('open');
        setTimeout(() => {
            overlay.style.display = 'none';
            // If no other modal open, remove modal-open
            const anyOpen = document.querySelectorAll('.modal-overlay.open').length > 0;
            if (!anyOpen) document.body.classList.remove('modal-open');
        }, 170);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const editBtn = document.getElementById('editAdminProfileBtn');
        const editModalOverlay = document.getElementById('editProfileModal');
        const editForm = document.getElementById('editProfileForm');
        const cancelBtn = document.getElementById('cancelEditProfileBtn');
        const closeBtn = document.getElementById('closeEditProfileBtn');
        const errorEl = document.getElementById('editProfileError');

        function fillEditProfileForm() {
            const name = document.getElementById('profileName')?.textContent || '';
            const fullName = document.getElementById('profileFullName')?.textContent || name;
            const email = document.getElementById('profileEmail')?.textContent || '';
            const role = document.getElementById('profileRole')?.textContent || '';
            const joinDate = document.getElementById('profileJoinDate')?.textContent || '';

            const elFullName = document.getElementById('editFullName');
            const elEmail = document.getElementById('editEmail');
            const elRole = document.getElementById('editRole');
            const elJoinDate = document.getElementById('editJoinDate');

            if (elFullName) elFullName.value = fullName;
            if (elEmail) elEmail.value = email;
            if (elRole) elRole.value = role;
            if (elJoinDate) elJoinDate.value = joinDate;
            if (errorEl) errorEl.style.display = 'none';
        }

        // open
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fillEditProfileForm();
                openModalById('editProfileModal');
            });
        }

        // close handlers
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModalById('editProfileModal');
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModalById('editProfileModal'));
        }
        if (editModalOverlay) {
            editModalOverlay.addEventListener('click', (e) => {
                if (e.target === editModalOverlay) closeModalById('editProfileModal');
            });
        }

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (editModalOverlay && editModalOverlay.style.display === 'flex') {
                    closeModalById('editProfileModal');
                }
            }
        });

        // Submit (simulated)
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!editForm.checkValidity()) {
                    if (errorEl) {
                        errorEl.textContent = 'Preencha corretamente os campos.';
                        errorEl.style.display = 'block';
                    }
                    return;
                }
                const newFullName = document.getElementById('editFullName').value.trim();
                const newEmail = document.getElementById('editEmail').value.trim();

                if (!newFullName || !newEmail) {
                    if (errorEl) {
                        errorEl.textContent = 'Nome e email são obrigatórios.';
                        errorEl.style.display = 'block';
                    }
                    return;
                }

                // Atualiza UI (simulando persistência)
                const profileNameEl = document.getElementById('profileName');
                const profileFullNameEl = document.getElementById('profileFullName');
                const profileEmailEl = document.getElementById('profileEmail');
                const adminAvatar = document.getElementById('adminAvatar');

                if (profileFullNameEl) profileFullNameEl.textContent = newFullName;
                if (profileEmailEl) profileEmailEl.textContent = newEmail;
                if (profileNameEl) profileNameEl.textContent = newFullName.split(' ')[0] || newFullName;
                if (adminAvatar) adminAvatar.textContent = (newFullName[0] || 'A').toUpperCase();

                // Aqui: fazer fetch para atualizar no backend, se desejar.

                closeModalById('editProfileModal');
            });
        }
    });
})();

// Dentro do bloco DOMContentLoaded já existente, o handler para editar usuário já preenche campos.
// Aperfeiçoe o preenchimento (salva o userId no overlay) e implemente PUT no submit:

document.addEventListener('DOMContentLoaded', () => {
    // Este bloco já existe, mas garanta que ao abrir o modal seja definido o userId no overlay
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-user-btn');
        if (editBtn) {
            const ds = editBtn.dataset;
            // atribui id para o overlay para ser usado no submit
            const overlay = document.getElementById('editUserModal');
            if (overlay) overlay.dataset.userId = ds.id || editBtn.dataset.id || '';

            document.getElementById('editUserFullName').value = ds.name || '';
            document.getElementById('editUserEmail').value = ds.email || '';
            document.getElementById('editUserPhone').value = ds.phone || '';
            document.getElementById('editUserRole').value = ds.role || '';
            document.getElementById('editUserStatus').value = ds.status || 'Ativo';
            document.getElementById('editUserJoinDate').value = ds.joinDate || '';
            if (editUserError) editUserError.style.display = 'none';
            openModal('editUserModal');
            return;
        }
    });

    // Hook para salvar edição de usuário via API (PUT)
    const editUserForm = document.getElementById('editUserForm');
    const editUserError = document.getElementById('editUserError');

    if (editUserForm) {
        editUserForm.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            if (!editUserForm.checkValidity()) {
                editUserError.textContent = 'Preencha corretamente os campos.';
                editUserError.style.display = 'block';
                return;
            }

            const overlay = document.getElementById('editUserModal');
            const userId = overlay?.dataset?.userId || document.getElementById('editUserId')?.value;
            if (!userId) {
                editUserError.textContent = 'Usuário não identificado.';
                editUserError.style.display = 'block';
                return;
            }

            const payload = {
                Usuario_Nome: document.getElementById('editUserFullName').value.trim(),
                Usuario_Email: document.getElementById('editUserEmail').value.trim(),
                Usuario_Telefone: document.getElementById('editUserPhone').value.trim(),
                Usuario_Cargo: document.getElementById('editUserRole').value.trim(),
                Usuario_Status: document.getElementById('editUserStatus').value
            };

            try {
                // PUT para atualizar usuário (ajuste body de acordo com seu backend)
                const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        // Authorization: `Bearer ${localStorage.getItem('adminToken')}` // se necessário
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const text = await res.text().catch(() => null);
                    throw new Error(text || `HTTP ${res.status}`);
                }

                const updated = await res.json().catch(() => null);

                // Atualiza a linha da tabela ou recarrega lista
                const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                if (row) {
                    // Atualiza elementos da linha (nome, email, avatar)
                    const nameEl = row.querySelector('.user-name');
                    const emailEl = row.querySelector('.user-email');
                    const avatarEl = row.querySelector('.user-avatar');
                    if (nameEl) nameEl.textContent = payload.Usuario_Nome;
                    if (emailEl) emailEl.textContent = payload.Usuario_Email;
                    if (avatarEl) avatarEl.textContent = (payload.Usuario_Nome[0] || 'U').toUpperCase();
                } else {
                    // fallback: recarrega a lista
                    fetchUsers();
                }

                closeModal('editUserModal');
            } catch (err) {
                console.error('Erro ao atualizar usuário:', err);
                editUserError.textContent = 'Erro ao salvar. Veja console para detalhes.';
                editUserError.style.display = 'block';
            }
        });
    }

    // Cancel / close for edit user modal (IDs from HTML)
    const cancelEditUserBtn = document.getElementById('cancelEditUserBtn');
    const closeEditUserModalBtn = document.getElementById('closeEditUserModalBtn');
    if (cancelEditUserBtn) cancelEditUserBtn.addEventListener('click', () => closeModal('editUserModal'));
    if (closeEditUserModalBtn) closeEditUserModalBtn.addEventListener('click', () => closeModal('editUserModal'));

    // close on overlay click added in modal helper utility — already present
});

document.addEventListener('DOMContentLoaded', () => {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordModal = document.getElementById('changePasswordModal');
    // Debug: garante que elementos existam
    console.log('Btns/overlays presentes:', !!changePasswordBtn, !!changePasswordModal);

    if (!changePasswordBtn) {
        console.warn('changePasswordBtn não encontrado no DOM.');
        return;
    }
    changePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('click changePasswordBtn');
        if (!changePasswordModal) {
            console.warn('changePasswordModal overlay não encontrado.');
            alert('Modal não configurado no HTML.');
            return;
        }
        openModal('changePasswordModal');
    });

    // já existe lógica para fechar (botões e overlay) no resto do arquivo
});

