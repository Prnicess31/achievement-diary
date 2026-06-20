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
        // Сначала получаем ссылку на скачивание
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
        
        // Используем прокси для обхода CORS
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const fileResponse = await fetch(proxyUrl + downloadData.href);
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
//  БЛОК АВТОРИЗАЦИИ (без изменений)
// ============================================================
(function() {
    const loginContainer = document.getElementById('login-container');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('login-error');

    const storedHash = localStorage.getItem('app_password_hash');
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
//  ОСНОВНОЙ КОД ПРИЛОЖЕНИЯ
// ============================================================
async function initializeApp() {
    const addBtn = document.getElementById('add');

    // ===== Установка сезонной цветовой темы =====
    function setSeasonColors() {
        const now = new Date();
        const month = now.getMonth();
        let primary, hover;
        if (month >= 11 || month <= 1) {
            primary = '#3498db';
            hover = '#2980b9';
        } else if (month >= 2 && month <= 4) {
            primary = '#e84393';
            hover = '#d63384';
        } else if (month >= 5 && month <= 7) {
            primary = '#2ecc71';
            hover = '#27ae60';
        } else {
            primary = '#f1c40f';
            hover = '#f39c12';
        }
        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--primary-hover', hover);
    }
    setSeasonColors();

    // ===== Функция применения фильтра =====
    function applyFilter(table, category) {
        const rows = table.querySelectorAll('tr');
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const activityCell = cells[2];
                const cellValue = activityCell.textContent.trim();
                if (category === 'all' || cellValue === category) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        }
        const note = table.closest('.note');
        if (!note) return;
        note.classList.remove('show-project-column', 'show-sport-column');
        if (category === 'проект') {
            note.classList.add('show-project-column');
        } else if (category === 'спорт') {
            note.classList.add('show-sport-column');
        }
    }

    // ===== 1. Инициализация ячеек с датой =====
    function initDateCells(table) {
        if (!table._dateHandler) {
            table.addEventListener('click', function(e) {
                const cell = e.target.closest('[data-date="true"]');
                if (!cell) return;
                if (cell.querySelector('input[type="date"]')) return;
                const currentText = cell.textContent.trim();
                const input = document.createElement('input');
                input.type = 'date';
                let dateValue = '';
                if (currentText) {
                    const parts = currentText.split(/[.\-\/]/);
                    if (parts.length === 3) {
                        let day = parseInt(parts[0]);
                        let month = parseInt(parts[1]) - 1;
                        let year = parseInt(parts[2]);
                        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                            const d = new Date(year, month, day);
                            if (!isNaN(d)) {
                                dateValue = d.toISOString().split('T')[0];
                            }
                        }
                    }
                }
                input.value = dateValue;
                cell.innerHTML = '';
                cell.appendChild(input);
                input.focus();
                if (input.showPicker) input.showPicker();
                input.addEventListener('change', function() {
                    const val = this.value;
                    if (val) {
                        const d = new Date(val + 'T00:00:00');
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        cell.textContent = `${day}.${month}.${year}`;
                    } else {
                        cell.textContent = '';
                    }
                    updateLS();
                });
                input.addEventListener('blur', function() {
                    const val = this.value;
                    if (val) {
                        const d = new Date(val + 'T00:00:00');
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        cell.textContent = `${day}.${month}.${year}`;
                    } else {
                        cell.textContent = '';
                    }
                    updateLS();
                });
            });
            table._dateHandler = true;
        }
    }

    // ===== 2. Инициализация ячеек с видом деятельности =====
    function initActivityCells(table) {
        if (!table._activityHandler) {
            table.addEventListener('click', function(e) {
                const cell = e.target.closest('[data-activity="true"]');
                if (!cell) return;
                if (cell.querySelector('select')) return;
                const currentText = cell.textContent.trim();
                const select = document.createElement('select');
                const options = ['', 'проект', 'спорт', 'бытовые дела', 'документы'];
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt || '(выберите)';
                    if (opt === currentText) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                cell.innerHTML = '';
                cell.appendChild(select);
                select.focus();
                function saveActivity() {
                    const val = select.value;
                    cell.textContent = val;
                    const table = cell.closest('table');
                    const filterSelect = table.closest('.note').querySelector('.activity-filter');
                    if (filterSelect) {
                        applyFilter(table, filterSelect.value);
                    }
                    updateLS();
                }
                select.addEventListener('change', saveActivity);
                select.addEventListener('blur', function() {
                    if (!select.value) {
                        cell.textContent = '';
                        const table = cell.closest('table');
                        const filterSelect = table.closest('.note').querySelector('.activity-filter');
                        if (filterSelect) {
                            applyFilter(table, filterSelect.value);
                        }
                        updateLS();
                    } else {
                        saveActivity();
                    }
                });
            });
            table._activityHandler = true;
        }
    }

    // ===== Подготовка существующих таблиц =====
    function prepareExistingTables() {
        document.querySelectorAll('.note .main table').forEach(table => {
            const rows = table.querySelectorAll('tr');
            if (rows.length === 0) return;
            const headerRow = rows[0];
            const ths = headerRow.querySelectorAll('th');
            const neededCols = 7;
            if (ths.length < neededCols) {
                const insertIndex = 4;
                const newTh = document.createElement('th');
                newTh.contentEditable = true;
                newTh.textContent = 'Вид спорта';
                newTh.className = 'sport-extra';
                headerRow.insertBefore(newTh, headerRow.children[insertIndex] || null);
                for (let i = 1; i < rows.length; i++) {
                    const td = document.createElement('td');
                    td.contentEditable = true;
                    td.className = 'sport-extra';
                    rows[i].insertBefore(td, rows[i].children[insertIndex] || null);
                }
            } else {
                if (ths.length > 3) ths[3].classList.add('project-extra');
                if (ths.length > 4) ths[4].classList.add('sport-extra');
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll('td');
                    if (cells.length > 3) cells[3].classList.add('project-extra');
                    if (cells.length > 4) cells[4].classList.add('sport-extra');
                }
            }
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (row === headerRow) {
                    cells.forEach(cell => {
                        cell.contentEditable = true;
                        const oldBtn = cell.querySelector('button');
                        if (oldBtn) oldBtn.remove();
                    });
                } else {
                    const tds = row.querySelectorAll('td');
                    if (tds.length >= 3) {
                        const dateCell = tds[0];
                        dateCell.setAttribute('data-date', 'true');
                        dateCell.removeAttribute('contenteditable');
                        const timeCell = tds[1];
                        timeCell.setAttribute('contenteditable', 'true');
                        timeCell.removeAttribute('data-time');
                        const activityCell = tds[2];
                        activityCell.setAttribute('data-activity', 'true');
                        activityCell.removeAttribute('contenteditable');
                        if (tds.length > 3) tds[3].setAttribute('contenteditable', 'true');
                        if (tds.length > 4) tds[4].setAttribute('contenteditable', 'true');
                        for (let i = 5; i < tds.length; i++) {
                            tds[i].setAttribute('contenteditable', 'true');
                        }
                    }
                }
            });
            initDateCells(table);
            initActivityCells(table);
            const filterSelect = table.closest('.note').querySelector('.activity-filter');
            if (filterSelect) {
                applyFilter(table, filterSelect.value);
            } else {
                applyFilter(table, 'all');
            }
        });
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
        }
    }

    prepareExistingTables();
    addBtn.addEventListener('click', () => addNewNote());

    // ===== Добавление новой записи =====
    function addNewNote(tableHtml = '') {
        const note = document.createElement('div');
        note.classList.add('note');

        const filterHtml = `
            <div class="filter-container" style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 0.7rem; font-weight: 600; color: #555;">Фильтр:</label>
                <select class="activity-filter" style="font-size: 0.7rem; padding: 2px 6px; border: 1px solid #ccc; border-radius: 3px; background: #fff;">
                    <option value="all">Все</option>
                    <option value="проект">проект</option>
                    <option value="спорт">спорт</option>
                    <option value="бытовые дела">бытовые дела</option>
                    <option value="документы">документы</option>
                </select>
            </div>
        `;

        if (!tableHtml) {
            tableHtml = `
                <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%; font-size: 0.8rem;">
                    <tr>
                        <th contenteditable="true">Дата</th>
                        <th contenteditable="true">Время</th>
                        <th contenteditable="true">Вид</th>
                        <th contenteditable="true" class="project-extra">Наименование проекта</th>
                        <th contenteditable="true" class="sport-extra">Вид спорта</th>
                        <th contenteditable="true">Результат</th>
                        <th contenteditable="true">Оценка</th>
                    </tr>
                    <tr>
                        <td data-date="true"></td>
                        <td contenteditable="true"></td>
                        <td data-activity="true"></td>
                        <td contenteditable="true" class="project-extra"></td>
                        <td contenteditable="true" class="sport-extra"></td>
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                    </tr>
                </table>
            `;
        }

        note.innerHTML = `
            <div class="tools">
                <button class="delete"><i class="fas fa-trash-can"></i></button>
            </div>
            <div class="main">
                ${filterHtml}
                ${tableHtml}
                <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                    <button class="row-action-btn add-row"><i class="fas fa-plus"></i> Добавить строку</button>
                    <button class="row-action-btn delete-row"><i class="fas fa-minus"></i> Удалить строку</button>
                    <button class="row-action-btn clear-row"><i class="fas fa-eraser"></i> Очистить строку</button>
                </div>
            </div>
        `;

        const main = note.querySelector('.main');
        const deleteBtn = note.querySelector('.delete');
        const addRowBtn = note.querySelector('.add-row');
        const deleteRowBtn = note.querySelector('.delete-row');
        const clearRowBtn = note.querySelector('.clear-row');
        const table = main.querySelector('table');
        const filterSelect = note.querySelector('.activity-filter');

        if (table) {
            const headerRow = table.querySelector('tr');
            if (headerRow) {
                const ths = headerRow.querySelectorAll('th');
                if (ths.length > 3) ths[3].classList.add('project-extra');
                if (ths.length > 4) ths[4].classList.add('sport-extra');
                ths.forEach(th => {
                    th.contentEditable = true;
                    const oldBtn = th.querySelector('button');
                    if (oldBtn) oldBtn.remove();
                });
            }
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const dateCell = cells[0];
                    dateCell.setAttribute('data-date', 'true');
                    dateCell.removeAttribute('contenteditable');
                    const timeCell = cells[1];
                    timeCell.setAttribute('contenteditable', 'true');
                    timeCell.removeAttribute('data-time');
                    const activityCell = cells[2];
                    activityCell.setAttribute('data-activity', 'true');
                    activityCell.removeAttribute('contenteditable');
                    if (cells.length > 3) {
                        cells[3].setAttribute('contenteditable', 'true');
                        cells[3].classList.add('project-extra');
                    }
                    if (cells.length > 4) {
                        cells[4].setAttribute('contenteditable', 'true');
                        cells[4].classList.add('sport-extra');
                    }
                    for (let i = 5; i < cells.length; i++) {
                        cells[i].setAttribute('contenteditable', 'true');
                    }
                }
            });
            initDateCells(table);
            initActivityCells(table);
            applyFilter(table, 'all');
            filterSelect.addEventListener('change', function() {
                applyFilter(table, this.value);
            });
        }

        addRowBtn.addEventListener('click', function() {
            const table = main.querySelector('table');
            if (!table) return;
            const headerRow = table.querySelector('tr');
            if (!headerRow) return;
            const colCount = headerRow.cells.length;
            const tr = document.createElement('tr');
            for (let i = 0; i < colCount; i++) {
                const td = document.createElement('td');
                if (i === 0) {
                    td.setAttribute('data-date', 'true');
                } else if (i === 2) {
                    td.setAttribute('data-activity', 'true');
                } else if (i === 3) {
                    td.setAttribute('contenteditable', 'true');
                    td.classList.add('project-extra');
                } else if (i === 4) {
                    td.setAttribute('contenteditable', 'true');
                    td.classList.add('sport-extra');
                } else {
                    td.setAttribute('contenteditable', 'true');
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
            applyFilter(table, filterSelect.value);
            updateLS();
            tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        deleteRowBtn.addEventListener('click', function() {
            const table = main.querySelector('table');
            if (!table) return;
            const rows = table.querySelectorAll('tr');
            if (rows.length <= 1) return;
            const lastRow = rows[rows.length - 1];
            lastRow.remove();
            applyFilter(table, filterSelect.value);
            updateLS();
        });

        clearRowBtn.addEventListener('click', function() {
            const table = main.querySelector('table');
            if (!table) return;
            const rows = table.querySelectorAll('tr');
            if (rows.length <= 1) return;
            const lastRow = rows[rows.length - 1];
            const cells = lastRow.querySelectorAll('td');
            cells.forEach(cell => {
                cell.textContent = '';
            });
            updateLS();
        });

        deleteBtn.addEventListener('click', () => {
            note.remove();
            updateLS();
        });

        if (table) {
            table.addEventListener('input', function(e) {
                if (e.target.tagName === 'TH' || e.target.tagName === 'TD') {
                    updateLS();
                }
            });
            table.addEventListener('blur', function() {
                updateLS();
            }, true);
        }
        document.body.appendChild(note);
    }

    // ===== Функция обновления данных =====
    async function updateLS() {
        const notes = [];
        document.querySelectorAll('.note .main table').forEach(table => {
            notes.push(table.outerHTML);
        });
        localStorage.setItem('notes', JSON.stringify(notes));
        // Автоматически сохраняем на Диск, если есть данные
        if (notes.length > 0) {
            await saveToDisk(notes);
        }
    }

    // ===== Обработчики кнопок синхронизации =====
    document.getElementById('save-disk-btn').addEventListener('click', async function() {
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

    document.getElementById('load-disk-btn').addEventListener('click', async function() {
        const data = await loadFromDisk();
        if (data) {
            document.querySelectorAll('.note').forEach(el => el.remove());
            data.forEach(note => addNewNote(note));
            localStorage.setItem('notes', JSON.stringify(data));
            alert('✅ Данные загружены с Диска!');
        }
    });
}
