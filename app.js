// --- State Management ---
const state = {
    currentView: 'home',
    user: {
        name: '피리소년',
        bio: '꿈을 향해 한 걸음씩 🚶‍♂️ | 루틴으로 만드는 매일의 변화',
        successRate: 85,
        postsCount: 42,
        followers: '1.2k',
        following: 384
    },
    routines: [
        { id: 1, name: '아침 조깅', time: '07:00', completed: true, category: '건강' },
        { id: 2, name: '경제 뉴스 읽기', time: '08:30', completed: true, category: '자기개발' },
        { id: 3, name: '코딩 공부', time: '20:00', completed: false, category: '커리어' },
        { id: 4, name: '명상하기', time: '22:00', completed: false, category: '마음챙김' }
    ],
    posts: [
        {
            id: 1,
            author: '지우',
            avatar: '🐶',
            image: 'morning_run.png',
            routine: '아침 조깅',
            likes: 24,
            caption: '오늘 공기 너무 맑네요! 루틴 성공 🏃‍♀️',
            comments: 3
        },
        {
            id: 2,
            author: '민수',
            avatar: '🎮',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
            routine: '코딩 공부',
            likes: 18,
            caption: 'React 마스터 가즈아..!! 🔥',
            comments: 5
        },
        {
            id: 3,
            author: '소연',
            avatar: '🌸',
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
            routine: '명상하기',
            likes: 31,
            caption: '하루의 끝은 항상 차분하게 🧘‍♀️',
            comments: 2
        }
    ]
};

// --- Selectors ---
const viewTitle = document.getElementById('view-title');
const viewContainer = document.getElementById('view-container');
const navItems = document.querySelectorAll('.nav-links li, .mobile-nav-item');
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.querySelector('.close-modal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderView('home');
    setupEventListeners();
});

// --- View Rendering ---
function renderView(view) {
    state.currentView = view;
    viewContainer.innerHTML = '';
    
    // Update active state in nav
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
    
    state.posts.forEach(post => {
        const card = `
            <div class="feed-card">
                <div class="card-header">
                    <div class="avatar-small" style="background: #eee; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">${post.avatar}</div>
                    <span style="font-weight: 600;">${post.author}</span>
                </div>
                <img src="${post.image}" class="card-img" alt="Post proof">
                <div class="card-content">
                    <span class="card-routine-tag"># ${post.routine}</span>
                    <p style="margin-bottom: 0.5rem;">${post.caption}</p>
                    <div class="card-actions">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
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
    
    state.routines.forEach(routine => {
        const item = document.createElement('div');
        item.className = 'feed-card'; // Reuse card style for consistency
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
                ${routine.completed 
                    ? '<span style="color: var(--secondary); font-weight: 800;">✅ 완료</span>' 
                    : `<button class="btn btn-primary auth-btn" data-id="${routine.id}">인증하기</button>`
                }
            </div>
        `;
        list.appendChild(item);
    });
    
    viewContainer.appendChild(list);

    // Re-attach listeners for dynamically created buttons
    document.querySelectorAll('.auth-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const routineId = e.target.dataset.id;
            const routine = state.routines.find(r => r.id == routineId);
            openAuthModal(routine);
        });
    });
}

function renderProfile() {
    const profile = document.createElement('div');
    
    // Circular gauge calculation
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (state.user.successRate / 100) * circumference;

    profile.innerHTML = `
        <div class="profile-header">
            <div class="success-gauge">
                <svg class="progress-ring" width="120" height="120">
                    <circle class="progress-ring__circle-bg" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="transparent" r="${radius}" cx="60" cy="60"/>
                    <circle class="progress-ring__circle" stroke="var(--primary)" stroke-width="8" stroke-dasharray="${circumference} ${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" fill="transparent" r="${radius}" cx="60" cy="60"/>
                </svg>
                <div class="gauge-value">${state.user.successRate}%</div>
            </div>
            <div class="profile-info">
                <h2>${state.user.name}</h2>
                <p style="color: var(--text-dim); margin-bottom: 1rem;">${state.user.bio}</p>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-value">${state.user.postsCount}</span>
                        <span class="stat-label">인증 게시글</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${state.user.followers}</span>
                        <span class="stat-label">팔로워</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${state.user.following}</span>
                        <span class="stat-label">팔로잉</span>
                    </div>
                </div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1.5rem;">내 인증 히스토리</h3>
        <div class="feed-grid" id="profile-posts"></div>
    `;
    
    viewContainer.appendChild(profile);
    
    // Add some mock history to profile
    const profilePosts = document.getElementById('profile-posts');
    state.posts.slice(0, 2).forEach(post => {
        const card = `
            <div class="feed-card">
                <img src="${post.image}" class="card-img" alt="Post proof">
                <div class="card-content">
                    <span class="card-routine-tag"># ${post.routine}</span>
                </div>
            </div>
        `;
        profilePosts.innerHTML += card;
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            renderView(item.dataset.view);
        });
    });

    closeModalBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });

    document.getElementById('submit-auth').addEventListener('click', () => {
        handleAuthSubmit();
    });
}

// --- Modal Logic ---
function openAuthModal(routine) {
    document.getElementById('auth-routine-name').innerText = routine.name;
    authModal.dataset.activeRoutineId = routine.id;
    authModal.classList.remove('hidden');
}

function handleAuthSubmit() {
    const routineId = authModal.dataset.activeRoutineId;
    const routine = state.routines.find(r => r.id == routineId);
    
    if (routine) {
        routine.completed = true;
        
        // Add new post to state
        state.posts.unshift({
            id: Date.now(),
            author: state.user.name,
            avatar: '🤴',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
            routine: routine.name,
            likes: 0,
            caption: `${routine.name} 미션 완료! 오늘의 성공을 공유합니다.`,
            comments: 0
        });

        authModal.classList.add('hidden');
        renderView('routines'); // Go back to routine list to see update
        
        // Success Toast simulation
        alert('🎉 인증이 성공적으로 완료되었습니다! 피드에 공유되었습니다.');
    }
}
