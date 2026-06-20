// ===== ПОДКЛЮЧЕНИЕ К YANDEX CLOUD =====
// ВСТАВЬТЕ ВАШИ ДАННЫЕ (полученные в консоли)
const YC_CONFIG = {
    // Имя вашего бакета (который создали в Object Storage)
    bucketName: 'diary-app-sa', // ЗАМЕНИТЕ на имя вашего бакета
    // Ваш статический ключ доступа (Access Key ID)
    accessKeyId: 'YCAJEyIfKAZF4xU2uQZzDXgUp',   // ВСТАВЬТЕ СВОЙ ID
    // Ваш секретный ключ (Secret Access Key)
    secretAccessKey: 'YCOTCEhCZlNnss75bXdGHnYUJKCN9UNIyP-z2KN3', // ВСТАВЬТЕ СВОЙ СЕКРЕТ
    // Эндпоинт для Yandex Object Storage (не меняйте)
    endpoint: 'https://storage.yandexcloud.net'
};