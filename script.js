// ============================================================
//  РАБОТА С КЛЮЧАМИ (сохранение в localStorage)
// ============================================================
function getYCConfig() {
    const bucket = localStorage.getItem('yc_bucket');
    const accessKey = localStorage.getItem('yc_access_key');
    const secretKey = localStorage.getItem('yc_secret_key');
    if (bucket && accessKey && secretKey) {
        return {
            bucketName: bucket,
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            endpoint: 'https://storage.yandexcloud.net'
        };
    }
    return null;
}

function saveYCConfig(bucket, accessKey, secretKey) {
    localStorage.setItem('yc_bucket', bucket);
    localStorage.setItem('yc_access_key', accessKey);
    localStorage.setItem('yc_secret_key', secretKey);
}

// ===== Проверка наличия ключей =====
const keyForm = document.getElementById('key-form-container');
const loginContainer = document.getElementById('login-container');
const appContent = document.getElementById('app-content');
const saveKeysBtn = document.getElementById('save-keys-btn');
const keyError = document.getElementById('key-error');

if (getYCConfig()) {
    // Ключи уже есть → показываем форму входа
    keyForm.style.display = 'none';
    loginContainer.style.display = 'flex';
} else {
    // Ключей нет → показываем форму ввода ключей
    keyForm.style.display = 'flex';
    loginContainer.style.display = 'none';
    appContent.style.display = 'none';
}

saveKeysBtn.addEventListener('click', function() {
    const bucket = document.getElementById('bucket-input').value.trim();
    const accessKey = document.getElementById('access-key-input').value.trim();
    const secretKey = document.getElementById('secret-key-input').value.trim();
    if (!bucket || !accessKey || !secretKey) {
        keyError.style.display = 'block';
        return;
    }
    keyError.style.display = 'none';
    saveYCConfig(bucket, accessKey, secretKey);
    // Перезагружаем страницу, чтобы применить ключи
    location.reload();
});

// ============================================================
//  БЛОК АВТОРИЗАЦИИ (после ввода ключей)
// ============================================================
(function() {
    const storedHash = localStorage.getItem('app_password_hash');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('login-error');

    if (!storedHash) {
        passwordInput.placeholder = 'Придумайте пароль';
        loginBtn.textContent = 'Установить пароль';
    } else {
        passwordInput.placeholder = 'Введите пароль';
        loginBtn.textContent = 'Войти';
    }

    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    function login() {
        const inputPassword = passwordInput.value.trim();
        if (!inputPassword) {
            errorMsg.textContent = 'Введите пароль';
            errorMsg.style.display = 'block';
            return;
        }
        const hashed = hashPassword(inputPassword);
        if (!storedHash) {
            localStorage.setItem('app_password_hash', hashed);
            alert('Пароль установлен! Запомните его: ' + inputPassword);
            loginContainer.style.display = 'none';
            appContent.style.display = 'block';
            if (typeof initializeApp === 'function') initializeApp();
            return;
        }
        if (hashed === storedHash) {
            loginContainer.style.display = 'none';
            appContent.style.display = 'block';
            errorMsg.style.display = 'none';
            if (typeof initializeApp === 'function') initializeApp();
        } else {
            errorMsg.textContent = 'Неверный пароль!';
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    loginBtn.addEventListener('click', login);
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') login();
    });
})();

// ============================================================
//  ОСНОВНОЙ КОД ПРИЛОЖЕНИЯ (использует getYCConfig())
// ============================================================
async function initializeApp() {
    const config = getYCConfig();
    if (!config) {
        alert('Ошибка: ключи не найдены. Перезагрузите страницу и введите ключи.');
        return;
    }

    // ===== Функции для работы с облаком =====
    async function saveToCloud(data) {
        try {
            const response = await fetch(`${config.endpoint}/${config.bucketName}/diary-data.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `AWS ${config.accessKeyId}:${config.secretAccessKey}`,
                    'Content-Type': 'application/json',
                    'Host': `${config.bucketName}.storage.yandexcloud.net`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`Ошибка сохранения: ${response.status}`);
            console.log('✅ Данные сохранены в облако');
        } catch (error) {
            console.error('❌ Ошибка:', error);
            alert('Не удалось сохранить данные в облако.');
        }
    }

    async function loadFromCloud() {
        try {
            const response = await fetch(`${config.endpoint}/${config.bucketName}/diary-data.json`, {
                method: 'GET',
                headers: {
                    'Authorization': `AWS ${config.accessKeyId}:${config.secretAccessKey}`,
                    'Host': `${config.bucketName}.storage.yandexcloud.net`
                }
            });
            if (response.status === 404) {
                console.log('ℹ️ Данных в облаке пока нет.');
                return null;
            }
            if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
            const data = await response.json();
            console.log('✅ Данные загружены из облака');
            return data;
        } catch (error) {
            console.error('❌ Ошибка:', error);
            alert('Не удалось загрузить данные из облака.');
            return null;
        }
    }

    // ===== Остальная логика (ваш существующий код) =====
    // Здесь вставьте весь ваш код приложения (функции initDateCells, initActivityCells, addNewNote и т.д.)
    // Чтобы не перегружать ответ, я оставлю ссылку на полную версию, но вы можете скопировать её из предыдущего сообщения (там был полный script.js с функциями).
    // Однако чтобы не усложнять, я сейчас дам полную версию, которую вы просто скопируете.

    // (Продолжение следует...)
}
