// Main Application Controller & Real-time DB Sync
const CURRENT_YEAR = 2026;
let currentUser = null;
let activeThread = null;
let threads = [];
let messages = [];

const mockThreads = [
    { id: '1', subject: 'شراكة استراتيجية لتطوير الذكاء الاصطناعي', last_message_at: new Date().toISOString(), recipient: 'tamer@topvon.com' },
    { id: '2', subject: 'دعوة لحضور مؤتمر القمة الرقمي 2026', last_message_at: new Date(Date.now() - 3600000).toISOString(), recipient: 'vip@royal-club.org' }
];

const mockMessages = [
    { id: 'm1', conversation_id: '1', sender_id: 'me', body: 'تحياتي الطيبة، نود مناقشة سبل التعاون في دمج نماذج TVAI الفاخرة ضمن منظومتكم.', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm2', conversation_id: '1', sender_id: 'them', body: 'أهلاً بك يا فندم. يسعدنا جداً هذا التعاون الفاخر. ننتظر منكم المسودة المقترحة لبدء العمل فوراً.', created_at: new Date(Date.now() - 3600000).toISOString() }
];

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initLuxuryCanvas();
    checkDatabaseStatus();
    loadInitialSession();
});

function checkDatabaseStatus() {
    const dbStatus = document.getElementById('db-status-badge');
    const localStatus = document.getElementById('local-status-badge');
    if (window.supabase) {
        dbStatus.classList.remove('hidden');
        localStatus.classList.add('hidden');
    } else {
        dbStatus.classList.add('hidden');
        localStatus.classList.remove('hidden');
    }
}

function loadInitialSession() {
    const cachedUser = localStorage.getItem('tvai_luxe_user');
    if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
        setupUserUI();
        loadThreads();
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
    }
}

function setupUserUI() {
    document.getElementById('user-display-name').innerText = currentUser.display_name || currentUser.email;
    document.getElementById('user-avatar-placeholder').innerText = (currentUser.display_name || currentUser.email).substring(0, 1).toUpperCase();
    document.getElementById('user-tier-badge').innerText = `${currentUser.tier || 'Royal'} Member`;
}

async function loadThreads() {
    const container = document.getElementById('threads-container');
    container.innerHTML = '';

    if (window.supabase) {
        try {
            const { data, error } = await window.supabase
                .from('conversations')
                .select('*')
                .order('last_message_at', { ascending: false });
            if (error) throw error;
            threads = data || [];
        } catch (err) {
            threads = mockThreads;
        }
    } else {
        threads = JSON.parse(localStorage.getItem('tvai_threads')) || mockThreads;
    }

    threads.forEach(thread => {
        const isActive = activeThread && activeThread.id === thread.id;
        const activeClasses = isActive ? 'border-gold bg-gold/10 gold-glow' : 'border-luxury-border hover:border-gold/30 hover:bg-gold/5';

        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border ${activeClasses} transition-all duration-300 cursor-pointer relative group`;
        card.onclick = () => selectThread(thread);
        card.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-serif text-sm font-bold text-gold-100 truncate max-w-[180px]">${thread.subject}</h4>
                <span class="text-[9px] text-gold/50">${formatTime(thread.last_message_at)}</span>
            </div>
            <p class="text-[11px] text-gray-400 truncate">${thread.recipient}</p>
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

async function selectThread(thread) {
    activeThread = thread;
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('active-thread-subject').innerText = thread.subject;
    document.getElementById('active-thread-participants').innerHTML = `
        <i data-lucide="users" class="w-3.5 h-3.5"></i>
        <span>محادثة مع: ${thread.recipient}</span>
    `;
    
    // On mobile, close sidebar automatically on thread selection
    if (window.innerWidth < 768) {
        toggleSidebar();
    }

    loadThreads();
    await loadMessages(thread.id);
}

async function loadMessages(threadId) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    if (window.supabase) {
        try {
            const { data, error } = await window.supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', threadId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            messages = data || [];
        } catch (err) {
            messages = mockMessages.filter(m => m.conversation_id === threadId);
        }
    } else {
        const allMessages = JSON.parse(localStorage.getItem('tvai_messages')) || mockMessages;
        messages = allMessages.filter(m => m.conversation_id === threadId);
    }

    messages.forEach(msg => {
        const isMe = msg.sender_id === 'me' || msg.sender_id === currentUser.id;
        const bubbleClass = isMe 
            ? 'mr-auto bg-gradient-to-br from-gold-900/40 to-gold-950/20 border border-gold/30' 
            : 'ml-auto bg-luxury-panel/80 border border-luxury-border';

        const msgCard = document.createElement('div');
        msgCard.className = `max-w-xl p-4 rounded-2xl ${bubbleClass} space-y-2 relative group animate-in fade-in-50 duration-300`;
        msgCard.innerHTML = `
            <div class="flex justify-between items-center gap-4">
                <span class="text-[10px] font-semibold text-gold/70">${isMe ? 'أنت (الديوان)' : 'الطرف الآخر'}</span>
                <span class="text-[9px] text-gray-500">${formatTime(msg.created_at)}</span>
            </div>
            <p class="text-xs md:text-sm text-gray-200 leading-relaxed whitespace-pre-line">${msg.body}</p>
        `;
        container.appendChild(msgCard);
    });

    container.scrollTop = container.scrollHeight;
    lucide.createIcons();
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const body = input.value.trim();
    if (!body || !activeThread) return;

    const newMessage = {
        conversation_id: activeThread.id,
        sender_id: currentUser.id,
        body: body,
        created_at: new Date().toISOString()
    };

    if (window.supabase) {
        try {
            const { error } = await window.supabase.from('messages').insert(newMessage);
            if (error) throw error;
        } catch (err) {
            alert(`فشل الإرسال: ${err.message}`);
            return;
        }
    } else {
        const allMessages = JSON.parse(localStorage.getItem('tvai_messages')) || mockMessages;
        allMessages.push(newMessage);
        localStorage.setItem('tvai_messages', JSON.stringify(allMessages));
    }

    input.value = '';
    await loadMessages(activeThread.id);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-panel');
    sidebar.classList.toggle('-translate-x-full');
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}