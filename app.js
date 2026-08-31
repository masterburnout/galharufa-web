const app = document.getElementById('app');

const defaultProfile = {
  name: 'Ana Costa',
  username: '@anacosta',
  city: 'São Paulo, SP',
  bio: 'Atuo em teatro contemporâneo, performance e produção cultural. Tenho interesse em dramaturgia, circo e coletivos emergentes.',
  savedEvents: 26,
  followedCompanies: 12,
  favoriteGenres: ['Drama', 'Performance', 'Teatro de rua'],
  organization: 'Coletivo Acuenda',
  role: 'Diretora e atriz',
  verified: true,
  tags: ['ator', 'dramaturgia', 'coletivo', 'teatro contemporâneo'],
  email: 'ana@galharufa.com',
  isAdmin: false
};

const demoUsers = [
  {
    email: 'ana@galharufa.com',
    password: '123456',
    profile: { ...defaultProfile }
  },
  {
    email: 'admin@galharufa.com',
    password: 'admin123',
    profile: {
      ...defaultProfile,
      name: 'Admin Galharufa',
      username: '@galharufa',
      bio: 'Administrativo do portal, revisão de companhias, perfis e eventos.',
      organization: 'Galharufa',
      role: 'Administrador da plataforma',
      verified: true,
      tags: ['admin', 'revisão', 'plataforma'],
      email: 'admin@galharufa.com',
      isAdmin: true,
      favoriteGenres: ['Administração', 'Validação', 'Operação'],
      savedEvents: 9,
      followedCompanies: 4
    }
  }
];

const state = {
  currentView: 'feed',
  darkMode: false,
  filters: {
    genre: 'Todos',
    region: 'Todos',
    age: 'Todas'
  },
  search: '',
  loggedUser: null,
  profileDraft: null,
  authMode: 'login',
  authError: '',
  isEditing: false,
  mapRegion: 'Centro'
};

const events = [
  {
    id: 1,
    name: 'O Rei e a Máscara',
    company: 'Teatro Coletivo Aurora',
    region: 'Oeste',
    date: '18 ago',
    time: '20h',
    genre: 'Drama',
    description: 'Uma peça de intensa tensão emocional e repertório urbano.',
    saved: true,
    venue: 'Espaço Aurora',
    city: 'São Paulo'
  },
  {
    id: 2,
    name: 'Noite de Sonhos',
    company: 'Grupo Roda Viva',
    region: 'Sul',
    date: '20 ago',
    time: '19h30',
    genre: 'Comédia',
    description: 'Uma comédia de humor e improviso com forte presença coletiva.',
    saved: false,
    venue: 'Sarau do Bairro',
    city: 'São Paulo'
  },
  {
    id: 3,
    name: 'Entre Paredes',
    company: 'Ato Teatral',
    region: 'Leste',
    date: '22 ago',
    time: '21h',
    genre: 'Musical',
    description: 'Um musical de repertório contemporâneo com cenário íntimo.',
    saved: true,
    venue: 'Sala Eco',
    city: 'São Paulo'
  },
  {
    id: 4,
    name: 'Sinais do Corpo',
    company: 'Cia. Palavra Viva',
    region: 'Centro',
    date: '25 ago',
    time: '18h',
    genre: 'De rua',
    description: 'Performance coletiva com foco em encenação corporal e ritual.',
    saved: false,
    venue: 'Praça do Sol',
    city: 'São Paulo'
  }
];

const savedEvents = events.filter((item) => item.saved);

function getCurrentProfile() {
  return state.loggedUser || defaultProfile;
}

function render() {
  app.innerHTML = `
    <div class="shell ${state.darkMode ? 'dark' : ''}">
      <header class="topbar">
        <div class="brand">Galharufa</div>
        <button class="ghost-btn" data-action="toggle-theme">${state.darkMode ? 'Claro' : 'Escuro'}</button>
      </header>

      <main class="content">
        ${renderCurrentView()}
      </main>

      <nav class="bottom-nav">
        <button class="nav-item ${state.currentView === 'feed' ? 'active' : ''}" data-view="feed">Feed</button>
        <button class="nav-item ${state.currentView === 'map' ? 'active' : ''}" data-view="map">Mapa</button>
        <button class="nav-item ${state.currentView === 'saved' ? 'active' : ''}" data-view="saved">Salvos</button>
        <button class="nav-item ${state.currentView === 'profile' ? 'active' : ''}" data-view="profile">Perfil</button>
      </nav>
    </div>
  `;

  bindHandlers();
}

function renderCurrentView() {
  if (state.currentView === 'feed') return renderFeed();
  if (state.currentView === 'map') return renderMap();
  if (state.currentView === 'saved') return renderSaved();
  if (state.currentView === 'profile') return renderProfile();
  return renderFeed();
}

function renderFeed() {
  const filtered = events.filter((event) => {
    const search = state.search.toLowerCase();
    const matchesText = !search || [event.name, event.company, event.genre].some((value) => value.toLowerCase().includes(search));
    const matchesGenre = state.filters.genre === 'Todos' || event.genre === state.filters.genre;
    const matchesRegion = state.filters.region === 'Todos' || event.region === state.filters.region;
    const matchesAge = state.filters.age === 'Todas' || (state.filters.age === 'Livre' ? event.genre !== 'Drama' : true);
    return matchesText && matchesGenre && matchesRegion && matchesAge;
  });

  return `
    <section class="screen">
      <div class="search-box">
        <input id="searchInput" type="text" placeholder="Buscar peça, companhia ou gênero" value="${state.search}" />
      </div>

      <div class="filters">
        <button class="chip ${state.filters.genre === 'Todos' ? 'selected' : ''}" data-filter="genre" data-value="Todos">Todos</button>
        <button class="chip ${state.filters.genre === 'Drama' ? 'selected' : ''}" data-filter="genre" data-value="Drama">Drama</button>
        <button class="chip ${state.filters.genre === 'Comédia' ? 'selected' : ''}" data-filter="genre" data-value="Comédia">Comédia</button>
        <button class="chip ${state.filters.genre === 'Musical' ? 'selected' : ''}" data-filter="genre" data-value="Musical">Musical</button>
      </div>

      <div class="subfilters">
        <select data-filter="region">
          <option value="Todos" ${state.filters.region === 'Todos' ? 'selected' : ''}>Região: todas</option>
          <option value="Centro" ${state.filters.region === 'Centro' ? 'selected' : ''}>Centro</option>
          <option value="Sul" ${state.filters.region === 'Sul' ? 'selected' : ''}>Sul</option>
          <option value="Leste" ${state.filters.region === 'Leste' ? 'selected' : ''}>Leste</option>
          <option value="Oeste" ${state.filters.region === 'Oeste' ? 'selected' : ''}>Oeste</option>
        </select>

        <select data-filter="age">
          <option value="Todas" ${state.filters.age === 'Todas' ? 'selected' : ''}>Faixa: todas</option>
          <option value="Livre" ${state.filters.age === 'Livre' ? 'selected' : ''}>Livre</option>
          <option value="12+" ${state.filters.age === '12+' ? 'selected' : ''}>12+</option>
          <option value="14+" ${state.filters.age === '14+' ? 'selected' : ''}>14+</option>
        </select>
      </div>

      <div class="section-header">
        <h2>Descubra peças e coletivos</h2>
        <span>${filtered.length} eventos</span>
      </div>

      <div class="event-list">
        ${filtered.map((item) => `
          <article class="event-card">
            <div class="event-visual"></div>
            <div class="event-body">
              <div class="event-topline">
                <span class="genre-tag">${item.genre}</span>
                <button class="save-btn ${item.saved ? 'saved' : ''}" data-toggle-save="${item.id}">${item.saved ? 'Salvo' : 'Salvar'}</button>
              </div>
              <h3>${item.name}</h3>
              <p class="company">${item.company}</p>
              <p class="meta">${item.date} • ${item.time} • ${item.region}</p>
              <p class="description">${item.description}</p>
              <div class="event-footer">
                <span>${item.venue}</span>
                <button class="text-link" data-view="profile">Ver perfil</button>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderMap() {
  const regionEvents = events.filter((event) => state.mapRegion === 'Todos' || event.region === state.mapRegion);

  return `
    <section class="screen">
      <div class="map-panel">
        <div class="map-header">
          <h2>Mapa cultural</h2>
          <span>São Paulo</span>
        </div>
        <div class="map-surface">
          <button class="map-pin pin-center ${state.mapRegion === 'Centro' ? 'active' : ''}" data-map-region="Centro">Centro</button>
          <button class="map-pin pin-south ${state.mapRegion === 'Sul' ? 'active' : ''}" data-map-region="Sul">Sul</button>
          <button class="map-pin pin-east ${state.mapRegion === 'Leste' ? 'active' : ''}" data-map-region="Leste">Leste</button>
          <button class="map-pin pin-west ${state.mapRegion === 'Oeste' ? 'active' : ''}" data-map-region="Oeste">Oeste</button>
        </div>
      </div>

      <div class="mini-list">
        ${regionEvents.map((event) => `
          <div class="mini-item">
            <div>
              <strong>${event.name}</strong>
              <p>${event.company}</p>
            </div>
            <span>${event.region}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderSaved() {
  return `
    <section class="screen">
      <div class="section-header">
        <h2>Itens salvos</h2>
        <span>${savedEvents.length} itens</span>
      </div>

      <div class="saved-grid">
        ${savedEvents.map((item) => `
          <article class="saved-card">
            <div class="saved-cover"></div>
            <h3>${item.name}</h3>
            <p>${item.company}</p>
            <small>${item.date} • ${item.region}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderProfileAuth() {
  return `
    <section class="screen">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Perfil do usuário</h2>
          <p>Entre para acessar seu perfil, salvar eventos e editar os dados.</p>
        </div>

        <div class="auth-toggle">
          <button class="toggle-option ${state.authMode === 'login' ? 'selected' : ''}" data-auth-mode="login">Entrar</button>
          <button class="toggle-option ${state.authMode === 'register' ? 'selected' : ''}" data-auth-mode="register">Cadastrar</button>
        </div>

        <form class="auth-form" data-auth-form>
          ${state.authMode === 'register' ? `
            <label>
              <span>Nome</span>
              <input type="text" name="name" placeholder="Seu nome completo" required />
            </label>
          ` : ''}

          <label>
            <span>E-mail</span>
            <input type="email" name="email" placeholder="seu@email.com" required />
          </label>

          <label>
            <span>Senha</span>
            <input type="password" name="password" placeholder="Sua senha" required />
          </label>

          ${state.authError ? `<div class="auth-message">${state.authError}</div>` : ''}

          <button class="primary-btn" type="submit">${state.authMode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        </form>
      </div>
    </section>
  `;
}

function renderProfileEdit(profile) {
  const draft = state.profileDraft || profile;

  return `
    <section class="screen">
      <div class="profile-header profile-edit-header">
        <div class="avatar">${profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
        <div>
          <h2>Editar perfil</h2>
          <p>${profile.email}</p>
        </div>
      </div>

      <form class="profile-form" data-profile-form>
        <div class="field-grid">
          <label>
            <span>Nome</span>
            <input type="text" name="name" value="${draft.name || profile.name}" required />
          </label>
          <label>
            <span>Usuário</span>
            <input type="text" name="username" value="${draft.username || profile.username}" required />
          </label>
        </div>

        <label>
          <span>Bio</span>
          <textarea name="bio" rows="4">${draft.bio || profile.bio}</textarea>
        </label>

        <div class="field-grid">
          <label>
            <span>Cidade</span>
            <input type="text" name="city" value="${draft.city || profile.city}" />
          </label>
          <label>
            <span>Função</span>
            <input type="text" name="role" value="${draft.role || profile.role}" />
          </label>
        </div>

        <div class="field-grid">
          <label>
            <span>Organização</span>
            <input type="text" name="organization" value="${draft.organization || profile.organization}" />
          </label>
          <label>
            <span>Gêneros</span>
            <input type="text" name="favoriteGenres" value="${(draft.favoriteGenres || profile.favoriteGenres).join(', ')}" />
          </label>
        </div>

        <div class="action-row">
          <button class="secondary-btn" type="button" data-action="cancel-edit">Cancelar</button>
          <button class="primary-btn" type="submit">Salvar alterações</button>
        </div>
      </form>
    </section>
  `;
}

function renderProfile() {
  if (!state.loggedUser) return renderProfileAuth();

  const profile = getCurrentProfile();

  if (state.isEditing) return renderProfileEdit(profile);

  return `
    <section class="screen">
      <div class="profile-header">
        <div class="avatar">${profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
        <div>
          <h2>${profile.name}</h2>
          <p>${profile.username}</p>
          ${profile.verified ? '<span class="verified">Verificado</span>' : ''}
        </div>
      </div>

      <div class="profile-actions">
        <button class="primary-btn" data-action="edit-profile">Editar perfil</button>
        ${profile.isAdmin ? '<button class="secondary-btn" data-action="open-admin">Painel Admin</button>' : ''}
        <button class="danger-btn" data-action="logout">Sair</button>
      </div>

      <div class="profile-bio">${profile.bio}</div>

      <div class="stats-row">
        <div class="stat-box"><strong>${profile.savedEvents}</strong><span>Salvos</span></div>
        <div class="stat-box"><strong>${profile.followedCompanies}</strong><span>Companhias</span></div>
        <div class="stat-box"><strong>${profile.favoriteGenres.length}</strong><span>Gêneros</span></div>
      </div>

      <div class="info-panel">
        <h3>Dados do perfil</h3>
        <div class="info-row"><span>Tipo</span><strong>${profile.role}</strong></div>
        <div class="info-row"><span>Local</span><strong>${profile.city}</strong></div>
        <div class="info-row"><span>Organização</span><strong>${profile.organization}</strong></div>
      </div>

      <div class="tags-wrap">
        ${(profile.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </section>
  `;
}

function bindHandlers() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view) {
        state.currentView = view;
        render();
      }
    });
  });

  document.querySelectorAll('[data-filter]').forEach((element) => {
    if (element.tagName === 'SELECT') {
      element.addEventListener('change', (event) => {
        state.filters[element.dataset.filter] = event.target.value;
        render();
      });
    }
  });

  document.querySelectorAll('[data-filter="genre"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.filters.genre = button.dataset.value;
      render();
    });
  });

  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', (event) => {
    state.search = event.target.value;
    render();
  });

  document.querySelectorAll('[data-toggle-save]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.toggleSave);
      events.forEach((event) => {
        if (event.id === id) {
          event.saved = !event.saved;
        }
      });
      render();
    });
  });

  document.querySelectorAll('[data-map-region]').forEach((button) => {
    button.addEventListener('click', () => {
      state.mapRegion = button.dataset.mapRegion;
      render();
    });
  });

  const themeButton = document.querySelector('[data-action="toggle-theme"]');
  themeButton?.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    render();
  });

  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.authMode = button.dataset.authMode;
      state.authError = '';
      render();
    });
  });

  const authForm = document.querySelector('[data-auth-form]');
  authForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(authForm);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    if (state.authMode === 'register') {
      const name = String(formData.get('name') || '').trim();
      if (!name) {
        state.authError = 'Preencha seu nome para continuar.';
        render();
        return;
      }

      const newProfile = {
        name,
        username: `@${name.toLowerCase().replace(/\s+/g, '')}`,
        city: 'São Paulo, SP',
        bio: 'Novo perfil no Galharufa. Em breve vou completar minhas informações.',
        savedEvents: 0,
        followedCompanies: 0,
        favoriteGenres: ['Teatro contemporâneo'],
        organization: 'Ainda não informada',
        role: 'Público geral',
        verified: false,
        tags: ['iniciante'],
        email,
        isAdmin: false
      };

      state.loggedUser = newProfile;
      state.profileDraft = { ...newProfile };
      state.authError = '';
      state.isEditing = false;
      render();
      return;
    }

    const match = demoUsers.find((user) => user.email === email && user.password === password);

    if (!match) {
      state.authError = 'Credenciais incorretas';
      render();
      return;
    }

    state.loggedUser = { ...match.profile };
    state.profileDraft = { ...match.profile };
    state.authError = '';
    state.isEditing = false;
    render();
  });

  const logoutButton = document.querySelector('[data-action="logout"]');
  logoutButton?.addEventListener('click', () => {
    state.loggedUser = null;
    state.profileDraft = null;
    state.authMode = 'login';
    state.authError = '';
    state.isEditing = false;
    render();
  });

  const editButton = document.querySelector('[data-action="edit-profile"]');
  editButton?.addEventListener('click', () => {
    state.profileDraft = { ...(state.loggedUser || getCurrentProfile()) };
    state.isEditing = true;
    render();
  });

  const cancelEditButton = document.querySelector('[data-action="cancel-edit"]');
  cancelEditButton?.addEventListener('click', () => {
    state.isEditing = false;
    render();
  });

  const profileForm = document.querySelector('[data-profile-form]');
  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(profileForm);
    const favoriteGenres = String(formData.get('favoriteGenres') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const updatedProfile = {
      ...(state.loggedUser || getCurrentProfile()),
      name: String(formData.get('name') || '').trim() || 'Usuário',
      username: String(formData.get('username') || '').trim() || '@usuario',
      city: String(formData.get('city') || '').trim() || 'São Paulo, SP',
      bio: String(formData.get('bio') || '').trim() || 'Sem bio informada.',
      role: String(formData.get('role') || '').trim() || 'Público geral',
      organization: String(formData.get('organization') || '').trim() || 'Sem organização',
      favoriteGenres: favoriteGenres.length ? favoriteGenres : ['Teatro contemporâneo'],
      tags: favoriteGenres.length ? favoriteGenres : ['Teatro contemporâneo']
    };

    state.loggedUser = updatedProfile;
    state.profileDraft = { ...updatedProfile };
    state.isEditing = false;
    render();
  });

  const openAdminButton = document.querySelector('[data-action="open-admin"]');
  openAdminButton?.addEventListener('click', () => {
    window.open('http://localhost:3000/', '_blank');
  });
}

render();
