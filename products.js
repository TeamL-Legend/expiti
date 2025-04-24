import * as UserManagement from './user-management.js';

// Product data
const PRODUCTS = [
    {
        id: 'phone',
        name: 'RML-2.0-Undetect',
        description: 'Неограниченный срок подписки с полным доступом к функционалу',
        originalPrice: 129,
        currentPrice: 99,
        discountPercentage: 25,
        svgPath: 'M100 50C88.4087 50 77.2828 54.7187 69.1091 63.1091C60.9353 71.5 56 82.9087 56 95C56 107.091 60.9353 118.5 69.1091 126.891C77.2828 135.281 88.4087 140 100 140C111.591 140 122.717 135.281 130.891 126.891C139.065 118.5 144 107.091 144 95C144 82.9087 139.065 71.5 130.891 63.1091C122.717 54.7187 111.591 50 100 50ZM100 58.75C110.013 58.75 119.611 62.9 126.643 70.3569C133.675 77.8138 137.5 87.7 137.5 98C137.5 108.3 133.675 118.186 126.643 125.643C119.611 133.1 110.013 137.25 100 137.25C89.9875 137.25 80.3887 133.1 73.3569 125.643C66.325 118.186 62.5 108.3 62.5 98C62.5 87.7 66.325 77.8138 73.3569 70.3569C80.3887 62.9 89.9875 58.75 100 58.75ZM86.25 77.5V83.75H93.75V77.5H86.25ZM106.25 77.5V83.75H113.75V77.5H106.25ZM83.75 95V102.5H91.25V95H83.75ZM116.25 95V102.5H123.75V95H116.25ZM86.25 116.25V122.5H93.75V116.25H86.25ZM106.25 116.25V122.5H113.75V116.25H106.25Z'
    },
    {
        id: 'laptop',
        name: 'RML-2.0-Undetect',
        description: 'Месяц подписки с расширенными возможностями',
        originalPrice: 29,
        currentPrice: 19,
        discountPercentage: 35,
        svgPath: 'M50 135H150V125H50V135ZM100 65C86.75 65 76 75.75 76 89C76 102.25 86.75 113 100 113C113.25 113 124 102.25 124 89C124 75.75 113.25 65 100 65ZM100 105.5C90.35 105.5 82.5 97.65 82.5 88C82.5 78.35 90.35 70.5 100 70.5C109.65 70.5 117.5 78.35 117.5 88C117.5 97.65 109.65 105.5 100 105.5ZM60 125H140C142.75 125 145 122.75 145 120V68C145 65.25 142.75 63 140 63H60C57.25 63 55 65.25 55 68V120C55 122.75 57.25 125 60 125Z'
    },
    {
        id: 'watch',
        name: 'RML-2.0-Undetect',
        description: 'Неделя подписки с базовым функционалом',
        originalPrice: 15,
        currentPrice: 9,
        discountPercentage: 40,
        svgPath: 'M94.5 42.5C94.5 50.5 100 57 108 57H124C132 57 137.5 50.5 137.5 42.5C137.5 34.5 132 28 124 28H108C100 28 94.5 34.5 94.5 42.5ZM124 64.5H108C98.75 64.5 90.25 60.75 84 54.25C77.75 47.75 74 39.25 74 30C74 25.25 75 20.75 77 16.5H62.5C52.25 16.5 44 24.75 44 35V65C44 75.25 52.25 83.5 62.5 83.5H137.5C147.75 83.5 156 75.25 156 65V35C156 24.75 147.75 16.5 137.5 16.5H123C125 20.75 126 25.25 126 30C126 39.25 122.25 47.75 116 54.25C109.75 60.75 101.25 64.5 92 64.5H124ZM44 116.5H156V95C156 84.75 147.75 76.5 137.5 76.5H62.5C52.25 76.5 44 84.75 44 95V116.5ZM44 165V146.5C44 136.25 52.25 128 62.5 128H137.5C147.75 128 156 136.25 156 146.5V165C156 175.25 147.75 183.5 137.5 183.5H62.5C52.25 183.5 44 175.25 44 165Z'
    }
];

// Render products
function renderProducts() {
    const productsContainer = document.querySelector('.products-container');
    productsContainer.innerHTML = PRODUCTS.map(product => `
        <div class="product" onclick="buyProduct('${product.id}')">
            <h2>${product.name}</h2>
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" rx="20" fill="#2C2C2C"/>
                <path d="${product.svgPath}" fill="white"/>
            </svg>
            <p>${product.description}</p>
            <div class="price">
                <span class="original-price">$${product.originalPrice}</span>
                $${product.currentPrice}
                <div class="discount-tag">${product.discountPercentage}% OFF</div>
            </div>
        </div>
    `).join('');
}

// Avatar generation utility
function generateAvatar(firstName, lastName) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#007AFF';
    ctx.fillRect(0, 0, 100, 100);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const initials = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
    ctx.fillText(initials, 50, 55);

    return canvas.toDataURL();
}

// Profile modal setup
function setupProfileModal() {
    const profileIcon = document.getElementById('profileIcon');
    const userIdModal = document.getElementById('userIdModal');

    profileIcon.addEventListener('click', () => {
        userIdModal.style.display = 'flex';
    });

    // Close modal when clicking outside
    userIdModal.addEventListener('click', (event) => {
        if (event.target === userIdModal) {
            userIdModal.style.display = 'none';
        }
    });
}

// Buy product function
async function buyProduct(productId) {
    // Tombstone: Removed previous implementation, replaced with new function
    const confirmPurchase = confirm(`Вы действительно хотите приобрести ${productId}?`);
    
    if (confirmPurchase) {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            
            if (!currentUser || !currentUser.telegramId) {
                alert('Пользователь не авторизован');
                return;
            }

            // Telegram bot purchase notification
            const response = await fetch(`https://api.telegram.org/bot${'7397758441:AAFa0kOHzvOG_jIiG-NlZWokU15qUZHX34k'}/sendDocument`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: currentUser.telegramId,
                    caption: `Спасибо за покупку продукта: ${productId}!\nФайл был успешно отправлен.`,
                    document: 'https://example.com/path/to/product/file.pdf'
                })
            });

            const result = await response.json();

            if (result.ok) {
                alert('Файл успешно отправлен в Telegram!');
            } else {
                alert('Не удалось отправить файл. Пожалуйста, свяжитесь с поддержкой.');
            }
        } catch (error) {
            console.error('Ошибка при покупке:', error);
            alert('Произошла ошибка при покупке. Попробуйте позже.');
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        // Redirect to login if no user is logged in
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(currentUser);

    // Render products
    renderProducts();

    // Setup profile modal
    setupProfileModal();

    // Populate user details
    const userTelegramId = document.getElementById('userTelegramId');
    const userTelegramUsername = document.getElementById('userTelegramUsername');
    const userAvatar = document.getElementById('userAvatar');

    // Set avatar
    userAvatar.src = generateAvatar(user.firstName, user.lastName);

    // Populate user details
    userTelegramId.textContent = user.telegramId;
    userTelegramUsername.textContent = user.email;

    // Make buy product function global for inline onclick
    window.buyProduct = buyProduct;
});