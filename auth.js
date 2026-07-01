// Secure Supabase Authentication & Session Management
async function handleAuth(type) {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!email || !password) {
        alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
        return;
    }

    if (window.supabase) {
        try {
            let result;
            if (type === 'signup') {
                result = await window.supabase.auth.signUp({ email, password });
                if (result.error) throw result.error;
                alert('تم إنشاء الحساب الملكي بنجاح! يرجى تأكيد بريدك الإلكتروني إذا تطلب الأمر.');
            } else {
                result = await window.supabase.auth.signInWithPassword({ email, password });
                if (result.error) throw result.error;
            }

            currentUser = {
                id: result.data.user.id,
                email: result.data.user.email,
                display_name: email.split('@')[0],
                tier: 'Royal'
            };

            // Upsert profile
            await window.supabase.from('profiles').upsert({
                id: currentUser.id,
                display_name: currentUser.display_name,
                luxury_tier: 'Royal'
            });

        } catch (err) {
            alert(`خطأ في المصادقة: ${err.message}`);
            return;
        }
    } else {
        // Fallback Local Auth
        currentUser = {
            id: 'mock-user-id',
            email: email,
            display_name: email.split('@')[0],
            tier: 'Royal'
        };
    }

    localStorage.setItem('tvai_luxe_user', JSON.stringify(currentUser));
    setupUserUI();
    document.getElementById('auth-modal').classList.add('hidden');
    loadThreads();
}

function bypassAuth() {
    currentUser = {
        id: 'royal-guest',
        email: 'guest@royal-salon.com',
        display_name: 'الضيف الملكي',
        tier: 'Royal'
    };
    localStorage.setItem('tvai_luxe_user', JSON.stringify(currentUser));
    setupUserUI();
    document.getElementById('auth-modal').classList.add('hidden');
    loadThreads();
}

function handleLogout() {
    if (window.supabase) {
        window.supabase.auth.signOut();
    }
    localStorage.removeItem('tvai_luxe_user');
    currentUser = null;
    location.reload();
}