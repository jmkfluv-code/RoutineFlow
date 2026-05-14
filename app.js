// --- Supabase Configuration ---
const SUPABASE_URL = 'https://jzwvgdhyxssuthssiezl.supabase.co';
const SUPABASE_KEY = '여기에_여러분의_ANON_PUBLIC_KEY를_입력하세요'; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- State Management ---
let state = {
    user: null,
    currentView: 'home',
    routines: [],
    posts: []
};

// --- Selectors ---
const viewTitle = document.getElementById('view-title');
const viewContainer = document.getElementById('view-container');
const navItems = document.querySelectorAll('.nav-links li, .mobile-nav-item');
const authModal = document.getElementById('auth-modal');
const loginModal = document.getElementById('login-modal');
const uploadBox = document.getElementById('upload-box');
const fileInput = document.getElementById('auth-file-input');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    checkSession();
    setupEventListeners();
});

// --- Auth Functions ---
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        state.user = session.user;
        loginModal.classList.add('hidden');
        loadAppData();
    } else {
        loginModal.classList.remove('hidden');
    }
}

async function handleSignUp() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');

    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) alert('회원가입 실패: ' + error.message);
    else {
        alert('회원가입 성공! 이메일을 확인하거나 로그인해 주세요.');
        await supabase.from('profiles').insert([{ 
            id: data.user.id, 
            username: email.split('@')[0], 
            full_name: '사용자',
            bio: '안녕하세요! RoutineFlow입니다.'
        }]);
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert('로그인 실패: ' + error.message);
    else {
        state.user = data.user;
        loginModal.classList.add('hidden');
        loadAppData();
    }
}

// --- Data Loading ---
async function loadAppData() {
    await Promise.all([fetchRoutines(), fetchPosts()]);
    renderView('home');
}

async function fetchRoutines() {
    const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', state.user.id)
        .order('time', { ascending: true });
    
    if (!error) state.routines = data;
}

async function fetchPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (username, avatar_url)
        `)
        .order('created_at', { ascending: false });
    
    if (!error) state.posts = data;
}

// --- View Rendering ---
function renderView(view) {
    state.currentView = view;
    viewContainer.innerHTML = '';
    
    navItems.forEach(item => {
        if (item.dataset.view === view) item.classList.add('active');
        else item.classList.remove('active');
    });

    switch(view) {
        case 'home':
            viewTitle.innerText = '홈 피드';
            renderHome();
            break;
        case 'routines':
            viewTitle.innerText = '내 루틴';
            renderRoutines();
            break;
        case 'profile':
            viewTitle.innerText = '프로필';
            renderProfile();
            break;
    }
}

function renderHome() {
    const grid = document.createElement('div');
    grid.className = 'feed-grid';
    
    if (state.posts.length === 0) {
        grid.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-dim);">아직 게시글이 없습니다. 첫 인증샷을 올려보세요!</p>';
    }

    state.posts.forEach(post => {
        const card = `
            <div class="feed-card">
                <div class="card-header">
                    <div class="avatar-small" style="background: #eee; display: flex; align-items: center; justify-content: center; font-size: 1rem; color:black;">
                        ${post.profiles?.avatar_url || '👤'}
                    </div>
                    <span style="font-weight: 600;">${post.profiles?.username || '알 수 없는 사용자'}</span>
                </div>
                <img src="${post.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'}" class="card-img" alt="Post proof">
                <div class="card-content">
                    <span class="card-routine-tag"># ${post.routine_name}</span>
                    <p style="margin-bottom: 0.5rem;">${post.caption}</p>
                    <div class="card-actions">
                        <span>❤️ ${post.likes_count}</span>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
    
    viewContainer.appendChild(grid);
}

function renderRoutines() {
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '1rem';
    
    if (state.routines.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:3rem; background:var(--bg-card); border-radius:20px;">
                <p style="margin-bottom:1.5rem; color:var(--text-dim);">설정된 루틴이 없습니다.</p>
                <button class="btn btn-primary" onclick="addNewRoutine()">새 루틴 만들기</button>
            </div>
        `;
    }

    state.routines.forEach(routine => {
        const item = document.createElement('div');
        item.className = 'feed-card';
        item.style.padding = '1.5rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
            <div>
                <span style="color: var(--text-dim); font-size: 0.9rem;">${routine.time}</span>
                <h3 style="margin: 0.2rem 0;">${routine.name}</h3>
                <span class="card-routine-tag">${routine.category}</span>
            </div>
            <div>
                ${routine.is_completed 
                    ? '<span style="color: var(--secondary); font-weight: 800;">✅ 완료</span>' 
                    : `<button class="btn btn-primary auth-btn" data-id="${routine.id}">인증하기</button>`
                }
            </div>
        `;
        list.appendChild(item);
    });
    
    viewContainer.appendChild(list);

    document.querySelectorAll('.auth-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const routineId = e.target.dataset.id;
            const routine = state.routines.find(r => r.id == routineId);
            openAuthModal(routine);
        });
    });
}

async function addNewRoutine() {
    const name = prompt('루틴 이름을 입력하세요 (예: 아침 조깅)');
    const time = prompt('시간을 입력하세요 (예: 07:00)');
    if (!name || !time) return;

    const { error } = await supabase.from('routines').insert([{
        user_id: state.user.id,
        name,
        time,
        category: '일반'
    }]);

    if (error) alert('저장 실패: ' + error.message);
    else loadAppData();
}

async function renderProfile() {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', state.user.id).single();
    
    const profile = document.createElement('div');
    profile.innerHTML = `
        <div class="profile-header">
            <div class="success-gauge">
                <div class="gauge-value">85%</div>
            </div>
            <div class="profile-info">
                <h2>${profileData?.username || '사용자'}</h2>
                <p style="color: var(--text-dim); margin-bottom: 1rem;">${profileData?.bio || ''}</p>
                <div class="profile-stats">
                    <button class="btn btn-secondary" onclick="supabase.auth.signOut().then(() => location.reload())">로그아웃</button>
                </div>
            </div>
        </div>
        <h3 style="margin-bottom: 1.5rem;">내 인증 히스토리</h3>
        <div class="feed-grid" id="profile-posts"></div>
    `;
    
    viewContainer.appendChild(profile);
}

// --- Event Listeners ---
function setupEventListeners() {
    document.getElementById('btn-login').onclick = handleLogin;
    document.getElementById('btn-signup').onclick = handleSignUp;

    navItems.forEach(item => {
        item.addEventListener('click', () => renderView(item.dataset.view));
    });

    document.querySelector('.close-modal').onclick = () => authModal.classList.add('hidden');
    
    uploadBox.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        if(e.target.files.length > 0) uploadBox.innerText = '📸 파일 선택됨: ' + e.target.files[0].name;
    };

    document.getElementById('submit-auth').onclick = handleAuthSubmit;
}

function openAuthModal(routine) {
    document.getElementById('auth-routine-name').innerText = routine.name;
    authModal.dataset.activeRoutineId = routine.id;
    authModal.classList.remove('hidden');
}

async function handleAuthSubmit() {
    const routineId = authModal.dataset.activeRoutineId;
    const routine = state.routines.find(r => r.id == routineId);
    
    await supabase.from('routines').update({ is_completed: true }).eq('id', routineId);
    
    await supabase.from('posts').insert([{
        user_id: state.user.id,
        routine_name: routine.name,
        caption: `${routine.name} 미션 완료!`,
        image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    }]);

    authModal.classList.add('hidden');
    loadAppData();
    alert('인증이 완료되었습니다!');
}
