const API_BASE_URL = 'https://edu-api.havirkesht.ir';
const CLIENT_ID = 'web-client';
const CLIENT_SECRET = 'secret-key';

// مدیریت دارک مود
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // تنظیم تم اولیه
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // تغییر تم
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// مدیریت مودال توسعه
function initDevModal() {
    const devBtn = document.getElementById('devInfoBtn');
    const modal = document.getElementById('devModal');
    const closeBtn = document.getElementById('modalClose');
    
    if (!devBtn || !modal || !closeBtn) return;
    
    devBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// وقتی DOM لود شد
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initDevModal();
    initLoginPage();
    checkApiStatus();
    
    // بررسی اگر قبلاً لاگین کرده
    checkExistingAuth();
});

// مقداردهی اولیه صفحه لاگین
function initLoginPage() {
    // نمایش/مخفی کردن رمز عبور
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }
    
    // ارسال فرم لاگین
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // فراموشی رمز عبور
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('لینک بازیابی رمز عبور برای شما ارسال شد.', 'info');
        });
    }
    
    // پشتیبانی
    const contactSupport = document.getElementById('contactSupport');
    if (contactSupport) {
        contactSupport.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('پشتیبانی: ۰۹۱۲-۱۲۳۴۵۶۷ (ساعت ۹ الی ۱۷)', 'info');
        });
    }
}

// بررسی وضعیت API
async function checkApiStatus() {
    const statusElement = document.getElementById('apiStatus');
    if (!statusElement) return;
    
    const statusIcon = statusElement.querySelector('i');
    
    statusIcon.style.color = '#f59e0b';
    statusElement.innerHTML = '<i class="fas fa-circle"></i> در حال اتصال...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            statusIcon.style.color = '#10b981';
            statusElement.innerHTML = '<i class="fas fa-circle"></i> متصل ✓';
        } else {
            statusIcon.style.color = '#ef4444';
            statusElement.innerHTML = '<i class="fas fa-circle"></i> خطا در اتصال';
        }
    } catch (error) {
        statusIcon.style.color = '#ef4444';
        statusElement.innerHTML = '<i class="fas fa-circle"></i> خطای شبکه';
        console.warn('خطا در بررسی وضعیت API:', error);
    }
}

// هندل کردن لاگین - نسخه اصلاح شده
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const rememberMe = document.getElementById('rememberMe');
    
    if (!username || !password || !loginButton) {
        showMessage('خطا در پیدا کردن عناصر فرم', 'error');
        return;
    }
    
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const rememberMeChecked = rememberMe ? rememberMe.checked : false;
    
    // اعتبارسنجی اولیه
    if (!usernameValue || !passwordValue) {
        showMessage('لطفاً نام کاربری و رمز عبور را وارد کنید.', 'error');
        return;
    }
    
    // تنظیم حالت لودینگ
    setButtonLoading(loginButton, true);
    
    try {
        
        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('username', usernameValue);
        formData.append('password', passwordValue);
        formData.append('scope', '');
        formData.append('client_id', CLIENT_ID);
        formData.append('client_secret', CLIENT_SECRET);
        
        console.log('در حال ارسال درخواست لاگین...');
        
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: formData
        });
        
        console.log('پاسخ دریافتی:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        // بررسی پاسخ
        if (!response.ok) {
            let errorMessage = 'خطا در ورود به سیستم';
            
            if (response.status === 401 || response.status === 403) {
                errorMessage = 'نام کاربری یا رمز عبور اشتباه است';
            } else if (response.status === 422) {
                errorMessage = 'اطلاعات وارد شده معتبر نیست';
            } else if (response.status >= 500) {
                errorMessage = 'خطای سرور. لطفاً بعداً تلاش کنید';
            }
            
            // تلاش برای خواندن پیام خطای دقیق‌تر
            try {
                const errorData = await response.json();
                console.log('خطای API:', errorData);
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(err => err.msg).join(', ');
                    } else {
                        errorMessage = errorData.detail;
                    }
                }
            } catch (parseError) {
                console.warn('خطا در خواندن پاسخ خطا:', parseError);
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('لاگین موفق، داده توکن:', data);
        
        // بررسی وجود توکن
        if (!data.access_token) {
            throw new Error('توکن احراز هویت دریافت نشد');
        }
        
        // ذخیره اطلاعات کاربر
        saveUserData(usernameValue, data, rememberMeChecked);
        
        // نمایش موفقیت
        showMessage('ورود موفق! در حال انتقال به پنل مدیریت...', 'success');
        
        // تاخیر برای نمایش پیام و هدایت
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
        
    } catch (error) {
        console.error('خطا در ورود:', error);
        showMessage(error.message, 'error');
    } finally {
        setButtonLoading(loginButton, false);
    }
}

// ذخیره اطلاعات کاربر
function saveUserData(username, tokenData, rememberMe) {
    try {
        localStorage.setItem('havirkesht_username', username);
        
        // ذخیره توکن در storage مناسب
        if (rememberMe) {
            localStorage.setItem('havirkesht_token', tokenData.access_token);
        } else {
            sessionStorage.setItem('havirkesht_token', tokenData.access_token);
        }
        
        if (tokenData.refresh_token) {
            localStorage.setItem('havirkesht_refresh_token', tokenData.refresh_token);
        }
        
        // ذخیره زمان انقضای توکن
        const expiresIn = tokenData.expires_in || 3600;
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('havirkesht_token_expiry', expiryTime.toString());
        
        console.log('اطلاعات کاربر ذخیره شد');
        
    } catch (error) {
        console.error('خطا در ذخیره اطلاعات کاربر:', error);
    }
}

// نمایش پیام
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;
    
    const messageIcon = messageElement.querySelector('.message-icon i');
    const messageText = messageElement.querySelector('.message-content p');
    
    if (!messageIcon || !messageText) return;
    
    // تنظیم متن
    messageText.textContent = message;
    
    // تنظیم آیکون و رنگ
    switch(type) {
        case 'success':
            messageIcon.className = 'fas fa-check-circle';
            messageElement.className = 'message success';
            break;
        case 'error':
            messageIcon.className = 'fas fa-exclamation-circle';
            messageElement.className = 'message error';
            break;
        case 'warning':
            messageIcon.className = 'fas fa-exclamation-triangle';
            messageElement.className = 'message warning';
            break;
        default:
            messageIcon.className = 'fas fa-info-circle';
            messageElement.className = 'message';
    }
    
    // پنهان کردن خودکار پیام‌های موفقیت و خطا
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.style.opacity = '1';
                messageElement.className = 'message';
                messageIcon.className = 'fas fa-info-circle';
                messageText.textContent = 'لطفاً اطلاعات حساب کاربری خود را وارد کنید';
            }, 500);
        }, 3000);
    }
}

// تنظیم حالت لودینگ برای دکمه
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <i class="fas fa-spinner loading"></i>
            <span>در حال ورود...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = `
            <span>ورود به پنل</span>
            <i class="fas fa-arrow-left"></i>
        `;
    }
}

// بررسی احراز هویت موجود
function checkExistingAuth() {
    try {
        const token = localStorage.getItem('havirkesht_token') || 
                      sessionStorage.getItem('havirkesht_token');
        
        if (token && isTokenValid()) {
            console.log('کاربر قبلاً وارد شده است، هدایت به داشبورد...');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);
        }
    } catch (error) {
        console.error('خطا در بررسی احراز هویت موجود:', error);
    }
}

// بررسی اعتبار توکن
function isTokenValid() {
    try {
        const expiryTime = localStorage.getItem('havirkesht_token_expiry');
        if (!expiryTime) return true; // اگر زمان انقضا ذخیره نشده
        
        const now = Date.now();
        const expiry = parseInt(expiryTime);
        
        // 5 دقیقه قبل از انقضا هشدار می‌دهیم
        return now < (expiry - 300000);
    } catch (error) {
        console.error('خطا در بررسی اعتبار توکن:', error);
        return false;
    }
}

// تمدید توکن
async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('havirkesht_refresh_token');
        
        if (!refreshToken) {
            throw new Error('توکن رفرش موجود نیست');
        }
        
        const response = await fetch(`${API_BASE_URL}/refresh-token?refresh_token=${refreshToken}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('خطا در تمدید توکن');
        }
        
        const data = await response.json();
        
        // ذخیره توکن جدید
        const storage = localStorage.getItem('havirkesht_token') ? localStorage : sessionStorage;
        storage.setItem('havirkesht_token', data.access_token);
        
        if (data.refresh_token) {
            localStorage.setItem('havirkesht_refresh_token', data.refresh_token);
        }
        
        // به‌روزرسانی زمان انقضا
        const expiresIn = data.expires_in || 3600;
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('havirkesht_token_expiry', expiryTime.toString());
        
        console.log('توکن با موفقیت تمدید شد');
        return data.access_token;
    } catch (error) {
        console.error('خطا در تمدید توکن:', error);
        throw error;
    }
}

// هندلینگ خطاهای شبکه
window.addEventListener('offline', function() {
    showMessage('اتصال اینترنت خود را بررسی کنید', 'error');
});

window.addEventListener('online', function() {
    showMessage('اتصال اینترنت برقرار شد', 'success');
    checkApiStatus();
});

// جلوگیری از ارسال فرم با Enter در فیلدهای نامربوط
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'text' && e.target.type !== 'password') {
        e.preventDefault();
    }
});

// بهبود تجربه کاربری در موبایل
function setupMobileUX() {
    // جلوگیری از زوم در فیلدهای ورودی در iOS
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.body.style.zoom = "100%";
        }
    });
    
    // بهبود اسکرول در iOS
    document.addEventListener('touchmove', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            e.stopPropagation();
        }
    }, { passive: false });
}

// اجرای تنظیمات UX موبایل
if ('ontouchstart' in window || navigator.maxTouchPoints) {
    setupMobileUX();
}