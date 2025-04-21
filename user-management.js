import * as TelegramUtils from './telegram-utils.js';
import * as Validation from './validation.js';

let currentVerificationCode = '';
let currentUserData = null;

export function saveRegisteredUser(userData) {
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const existingUserIndex = registeredUsers.findIndex(user => user.telegramId === userData.telegramId);
    
    if (existingUserIndex !== -1) {
        registeredUsers[existingUserIndex] = userData;
    } else {
        registeredUsers.push(userData);
    }
    
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}

export function checkRegisteredUser(telegramId) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return registeredUsers.find(user => user.telegramId === telegramId);
}

export function handleSignupStart() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    if (!Validation.validateUsername(email)) {
        alert('Username must start with "@" and contain at least 5 English letters');
        return;
    }

    if (email && password && firstName && lastName) {
        document.getElementById('telegramModal').style.display = 'flex';
    }
}

export async function handleTelegramSubmit() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const telegramId = document.getElementById('telegramId').value;

    const existingUser = checkRegisteredUser(telegramId);
    if (existingUser) {
        document.getElementById('telegramModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }

    if (telegramId) {
        try {
            const isValidTelegramId = await TelegramUtils.verifyTelegramId(telegramId);

            if (!isValidTelegramId) {
                alert('Введенный Telegram ID не существует');
                return;
            }

            currentVerificationCode = TelegramUtils.generateVerificationCode();
            
            const codeSent = await TelegramUtils.sendVerificationCode(telegramId, currentVerificationCode);

            if (codeSent) {
                currentUserData = {
                    email,
                    password,
                    firstName,
                    lastName,
                    telegramId
                };

                document.getElementById('telegramModal').style.display = 'none';
                document.getElementById('verificationModal').style.display = 'flex';
            } else {
                alert('Не удалось отправить код подтверждения');
            }

        } catch (error) {
            console.error('Error during Telegram verification:', error);
            alert('Произошла ошибка при проверке Telegram ID');
        }
    }
}

export async function handleVerificationSubmit() {
    const enteredCode = document.getElementById('verificationCode').value;

    if (enteredCode === currentVerificationCode) {
        try {
            const sent = await TelegramUtils.sendToTelegramBot(currentUserData);
            if (sent) {
                saveRegisteredUser(currentUserData);
                
                alert('Данные успешно отправлены!');
                document.getElementById('verificationModal').style.display = 'none';
                
                currentVerificationCode = '';
                currentUserData = null;
            } else {
                alert('Ошибка при отправке данных');
            }
        } catch (error) {
            alert('Произошла ошибка при отправке данных');
        }
    } else {
        alert('Неверный код подтверждения. Попробуйте снова.');
    }
}

export function handleLogin() {
    const loginTelegramId = document.getElementById('loginTelegramId').value;
    const loginPassword = document.getElementById('loginPassword').value;
    const errorMessageEl = document.getElementById('loginErrorMessage');

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => 
        u.telegramId === loginTelegramId && u.password === loginPassword
    );

    if (user) {
        alert('Login successful! Welcome, ' + user.firstName);
        
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        document.getElementById('loginModal').style.display = 'none';
    } else {
        errorMessageEl.textContent = 'Invalid Telegram ID or Password';
    }
}