// ============================================================
//  КОНФИГУРАЦИЯ ДЛЯ ЯНДЕКС.ДИСКА
// ============================================================
const ACCESS_TOKEN = 'y0__wgBEKjZz9gCGNuWAyDgp8v_FxzgX0mDhk7zgQp9sqhOzkIMXjBz'; // ВСТАВЬТЕ СВОЙ ТОКЕН
const FILE_PATH = 'diary-data.json';

// ============================================================
//  ФУНКЦИИ ДЛЯ РАБОТЫ С ЯНДЕКС.ДИСКОМ
// ============================================================
async function saveToDisk(data) {
    try {
        const response = await fetch(`https://cloud-api.yandex.net/v1/disk/resources/upload?path=${FILE_PATH}&overwrite=true`, {
            method: 'GET',
            headers: { 'Authorization': `OAuth ${ACCESS_TOKEN}` }
        });
        const uploadData = await response.json();
        if (!uploadData.href) {
            console.error('Ответ API:', uploadData);
            throw new Error('Не удалось получить ссылку для загрузки: ' + JSON.stringify(uploadData));
        }
        const uploadResponse = await fetch(uploadData.href, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!uploadResponse.ok) throw new Error('Ошибка загрузки на Диск: ' + uploadResponse.status);
        console.log('✅ Данные сохранены на Яндекс.Диск');
        alert('✅ Данные успешно сохранены на Яндекс.Диск!');
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        alert('❌ Ошибка сохранения: ' + error.message);
    }
}

async function loadFromDisk() {
    try {
        const response = await fetch(`https://cloud-api.yandex.net/v1/disk/resources/download?path=${FILE_PATH}`, {
            method: 'GET',
            headers: { 'Authorization': `OAuth ${ACCESS_TOKEN}` }
        });
        if (response.status === 404) {
            console.log('ℹ️ Данных на Диске пока нет.');
            alert('ℹ️ Файл на Диске не найден.');
            return null;
        }
        if (!response.ok) throw new Error('Ошибка получения ссылки на загрузку: ' + response.status);
        const downloadData = await response.json();
        const fileResponse = await fetch(downloadData.href);
        if (!fileResponse.ok) throw new Error('Ошибка загрузки файла: ' + fileResponse.status);
        const data = await fileResponse.json();
        console.log('✅ Данные загружены с Яндекс.Диска');
        return data;
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        alert('❌ Ошибка загрузки: ' + error.message);
        return null;
    }
}

// ============================================================
//  БЛОК АВТОРИЗАЦИИ (без изменений, оставлен как был)
// ============================================================
(function() {
    // ... (ваш существующий код авторизации, он остаётся без изменений)
    // Я не буду дублировать его здесь, чтобы не перегружать ответ,
    // но вы должны скопировать его из вашего текущего файла.
})();

// ============================================================
//  ОСНОВНОЙ КОД ПРИЛОЖЕНИЯ
// ============================================================
async function initializeApp() {
    const addBtn = document.getElementById('add');

    // ===== Установка сезонной цветовой темы =====
    function setSeasonColors() {
        // ... (ваш существующий код, без изменений)
    }
    setSeasonColors();

    // ===== Функция применения фильтра =====
    function applyFilter(table, category) {
        // ... (ваш существующий код, без изменений)
    }

    // ===== 1. Инициализация ячеек с датой =====
    function initDateCells(table) {
        // ... (ваш существующий код, без изменений)
    }

    // ===== 2. Инициализация ячеек с видом деятельности =====
    function initActivityCells(table) {
        // ... (ваш существующий код, без изменений)
    }

    // ===== Подготовка существующих таблиц =====
    function prepareExistingTables() {
        // ... (ваш существующий код, без изменений)
    }

    // ===== Загрузка сохранённых записей =====
    // Сначала пробуем загрузить с Яндекс.Диска
    const diskData = await loadFromDisk();
    let notes = [];

    if (diskData) {
        notes = diskData;
        notes.forEach(note => addNewNote(note));
        localStorage.setItem('notes', JSON.stringify(notes));
    } else {
        const localNotes = JSON.parse(localStorage.getItem('notes'));
        if (localNotes) {
            notes = localNotes;
            notes.forEach(note => addNewNote(note));
            // Не сохраняем автоматически на Диск, чтобы пользователь сам решил
        }
    }

    prepareExistingTables();
    addBtn.addEventListener('click', () => addNewNote());

    // ===== Добавление новой записи =====
    function addNewNote(tableHtml = '') {
        // ... (ваш существующий код, без изменений)
    }

    // ===== Функция обновления данных =====
    async function updateLS() {
        const notes = [];
        document.querySelectorAll('.note .main table').forEach(table => {
            notes.push(table.outerHTML);
        });
        localStorage.setItem('notes', JSON.stringify(notes));
        // Сохраняем на Диск только если есть данные
        if (notes.length > 0) {
            await saveToDisk(notes);
        } else {
            console.log('⚠️ Нет данных для сохранения на Диск.');
        }
    }

    // ===== Добавляем кнопки ручного управления синхронизацией =====
    function addSyncButtons() {
        const container = document.createElement('div');
        container.style.cssText = 'position: fixed; bottom: 70px; right: 20px; display: flex; gap: 10px; z-index: 100; flex-wrap: wrap; justify-content: flex-end;';

        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾 Сохранить на Диск';
        saveBtn.className = 'row-action-btn';
        saveBtn.style.cssText = 'padding: 8px 16px; font-size: 0.8rem;';
        saveBtn.addEventListener('click', async function() {
            const notes = [];
            document.querySelectorAll('.note .main table').forEach(table => {
                notes.push(table.outerHTML);
            });
            if (notes.length === 0) {
                alert('Нет данных для сохранения.');
                return;
            }
            await saveToDisk(notes);
        });

        const loadBtn = document.createElement('button');
        loadBtn.innerHTML = '📥 Загрузить с Диска';
        loadBtn.className = 'row-action-btn';
        loadBtn.style.cssText = 'padding: 8px 16px; font-size: 0.8rem;';
        loadBtn.addEventListener('click', async function() {
            const data = await loadFromDisk();
            if (data) {
                // Очищаем существующие записи
                document.querySelectorAll('.note').forEach(el => el.remove());
                data.forEach(note => addNewNote(note));
                localStorage.setItem('notes', JSON.stringify(data));
                alert('✅ Данные загружены с Диска!');
            }
        });

        container.appendChild(saveBtn);
        container.appendChild(loadBtn);
        document.body.appendChild(container);
    }

    addSyncButtons();
}
