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
function formatDate(date) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('pt-BR', options);
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
                        <div class="user-name">${user.Usuario_Nome}</div>
                        <div class="user-email">${user.Usuario_Email}</div>
                    </div>
                </div>
            </td>
            <td>${user.Usuario_Email}</td>
            <td>${formatDate(user.Usuario_Registro || new Date())}</td>
            <td>N/A</td>
            <td><span class="status-badge status-active">Ativo</span></td>
            <td>
                <button class="action-btn view" data-id="${user.Usuario_Id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" data-id="${user.Usuario_Id}">
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
            currentAdmin = {
                name: data.Admin_Nome,
                email: data.Admin_Email,
                id: data.Admin_Id
            };

            loginContainer.style.display = 'none';
            adminContainer.style.display = 'flex';

            // Atualizar informações do admin
            document.getElementById('adminAvatar').textContent = currentAdmin.name.charAt(0).toUpperCase();
            document.getElementById('adminUsernameDisplay').textContent = currentAdmin.name;

            // Atualizar último login
            lastLoginTime.textContent = formatDate(new Date());

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
    }

    if (e.target.closest('.action-btn.edit')) {
        // Lógica para editar o item (A ser implementada)
        alert('Abrir editor para este item (A ser implementado com a API de PUT)');
    }

    if (e.target.closest('.action-btn.view')) {
        // Lógica para visualizar o item (A ser implementada)
        alert('Abrir visualização para este item (A ser implementado com a API de GET por ID)');
    }
});

// Botões de adicionar
document.getElementById('addUserBtn').addEventListener('click', () => {
    alert('Abrir formulário para adicionar novo usuário (A ser implementado com a API de POST)');
});

// Botões do perfil
document.getElementById('editAdminProfileBtn').addEventListener('click', () => {
    alert('Abrir editor de perfil do administrador (A ser implementado com a API de PUT para admins)');
});

document.getElementById('changePasswordBtn').addEventListener('click', () => {
    alert('Abrir formulário para alterar senha (A ser implementado)');
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
    loadFinancesReport();
});

async function loadFinancesReport() {
    const tbody = document.getElementById('financesTbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;
    try {
        const res = await fetch('/api/reports/finances');
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

