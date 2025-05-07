// Define placeholders for configuration - **WARNING: EXPOSING TOKEN CLIENT-SIDE IS INSECURE**
// For a production application, this logic MUST be handled by a secure backend server.
const BOT_TOKEN = '7841076304:AAHgc-4spP6cfl40sBQBEFNZWf0Lb4teMi8'; // <-- REPLACE WITH YOUR ACTUAL TELEGRAM BOT TOKEN
// Find your own Telegram Chat ID using a bot like @userinfobot if needed for testing specific chat_id
// const YOUR_CHAT_ID = 'YOUR_CHAT_ID_FOR_TESTING';
const ADMIN_CHAT_ID = '6699202743'; // <-- REPLACE WITH THE TELEGRAM CHAT ID OF THE ADMIN/SUPPORT RECIPIENT

let currentVerificationCode = null; // Variable to store the code generated for the current login attempt
let targetTelegramId = null; // Variable to store the Telegram ID entered by the user during login
let isLoggedIn = false; // Flag to track login status

document.addEventListener('DOMContentLoaded', () => {
    // Check if the current page is index.html
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        // Only schedule the fade-out and redirect if on index.html
        setTimeout(() => {
            document.body.classList.add('fade-out');

            // Redirect to main.html after fade-out animation
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 500); // Match this with CSS transition duration
        }, 3000); // Wait for 3 seconds before starting fade-out
    }

    // --- Login functionality for main.html ---
    const loginButton = document.getElementById('loginButton');
    const profileDetails = document.getElementById('profileDetails');
    const userNameElement = document.getElementById('userName');

    // Initial check for login status (can be expanded later to check local storage)
    // Check if targetTelegramId is already stored (e.g., in localStorage in a real app)
    // For this example, we'll just assume not logged in initially unless we had a storage mechanism.
    if (profileDetails && profileDetails.style.display !== 'none') {
         // This check from previous code is potentially misleading without localStorage.
         // Resetting isLoggedIn and visibility based on stored state is better.
         // For now, let's ensure the login button is visible if targetTelegramId is not set.
         // A proper state management would be needed for persistent login.
         isLoggedIn = false; // Assume not logged in unless loaded from storage
         profileDetails.style.display = 'none';
         loginButton.style.display = 'block';

    } else if (loginButton) {
        loginButton.style.display = 'block'; // Ensure login button is visible by default
        isLoggedIn = false;
    }


    if (loginButton) {
        loginButton.addEventListener('click', async () => { // Use async for fetch

            if (BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') {
                alert("Ошибка: Пожалуйста, замените 'YOUR_TELEGRAM_BOT_TOKEN' на актуальный токен вашего Telegram бота в файле script.js.");
                return; // Stop the process if token is not set
            }

            targetTelegramId = prompt("Введите ваш Telegram ID или юзернейм (например, 123456789 или @myusername):");

            if (!targetTelegramId) {
                alert("Авторизация отменена или Telegram ID не введен.");
                return; // Exit if prompt is cancelled or empty
            }

            // Generate a random 4-digit code
            currentVerificationCode = Math.floor(1000 + Math.random() * 9000).toString();

            // Attempt to send the code via Telegram Bot API
            // **WARNING: Sending requests directly from client-side exposes your bot token!**
            // Anyone viewing your page source can find your token.
            // This is for demonstration based on user request. A secure implementation requires a backend server
            // to handle the Telegram API communication.
            const messageText = `Ваш код авторизации: ${currentVerificationCode}\n\n(Этот код действителен непродолжительное время)`;
            const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${encodeURIComponent(targetTelegramId)}&text=${encodeURIComponent(messageText)}`;

            try {
                // Make the API request
                const response = await fetch(telegramApiUrl);
                const data = await response.json();

                if (data.ok) {
                    // Message sent successfully (from API perspective)
                    // Note: This doesn't guarantee the user received it (e.g., blocked bot, wrong ID)
                    alert(`Код отправлен в Telegram на ID/юзернейм "${targetTelegramId}". Пожалуйста, проверьте свои сообщения.`);

                    // Now prompt user for the code they received
                    const enteredCode = prompt("Введите код, полученный в Telegram:");

                    // Client-side verification (still insecure as the code is known client-side)
                    if (enteredCode === currentVerificationCode) {
                        alert("Авторизация успешна!");
                        // Simulate successful login
                        loginButton.style.display = 'none'; // Hide the login button
                        profileDetails.style.display = 'block'; // Show profile details area
                         // Display Telegram ID/username, default to ID if username not provided/found
                        userNameElement.textContent = targetTelegramId.startsWith('@') ? targetTelegramId : `ID: ${targetTelegramId}`;

                        isLoggedIn = true; // Set login status to true

                        // Clean up temporary variables
                        currentVerificationCode = null;
                        // targetTelegramId is kept as it's needed for support requests etc.
                        // In a real app, this would be stored securely server-side after verification.

                    } else {
                        alert("Неверный код. Попробуйте еще раз.");
                        // Clean up temporary variables on failure
                        currentVerificationCode = null;
                        targetTelegramId = null; // Clear target ID on failed login attempt
                    }

                } else {
                    // Telegram API returned an error (e.g., chat_id not found, bot blocked)
                    console.error('Telegram API Error:', data);
                    alert(`Не удалось отправить код в Telegram. Проверьте правильность Telegram ID/юзернейма ("${targetTelegramId}") и статус вашего бота. Возможно, пользователь не взаимодействовал с ботом ранее, или бот заблокирован. Ошибка: ${data.description || 'Неизвестно'}`);
                    // Clean up temporary variables on failure
                    currentVerificationCode = null;
                    targetTelegramId = null; // Clear target ID on API failure
                }

            } catch (error) {
                // Network or other fetch error
                console.error('Fetch Error:', error);
                alert("Произошла ошибка при попытке связаться с серверами Telegram. Проверьте ваше интернет-соединение и правильность URL.");
                 // Clean up temporary variables on failure
                currentVerificationCode = null;
                 targetTelegramId = null; // Clear target ID on fetch error
            }
        });

        // Optional: Check for saved login state... (keep commented out as before)
    }

    // --- Navigation functionality for main.html ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentViews = document.querySelectorAll('main > div'); // Get all direct children divs of main

    function showView(viewId) {
        // Hide all views
        contentViews.forEach(view => {
            view.style.display = 'none';
        });

        // Show the selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.style.display = 'block'; // Or 'flex', 'grid' depending on view content needs
        }

        // Update active class on buttons
        navButtons.forEach(button => {
            if (button.getAttribute('data-view') === viewId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Add event listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewId = button.getAttribute('data-view');

            // Check login status before navigating to restricted views
            if (!isLoggedIn && (viewId === 'cards-view' || viewId === 'more-view')) {
                alert("Пожалуйста, войдите через Telegram для доступа к этому разделу.");
                // Optionally, highlight the login button or switch back to account view
                showView('account-view'); // Stay on or switch back to the account view
                return; // Stop navigation
            }

            showView(viewId);
        });
    });

    // Show the default view (Accounts) on page load
    // This needs to happen after the welcome page fade-out logic if the user is coming from index.html,
    // but also work if main.html is loaded directly.
    // Since the index.html redirect uses window.location.href, main.html script runs fresh.
    // The fade-in animation on .bank-app is CSS-driven.
    // We can safely show the default view once the DOM is ready.
    showView('account-view');

    // Add specific listeners for new buttons in the 'Cards' and 'More' views
    const requestCardBtn = document.querySelector('.request-card-btn');
    if (requestCardBtn) {
        requestCardBtn.addEventListener('click', () => {
            alert("Запрос на приватную карту отправлен!"); // Placeholder action
        });
    }

     const techSupportBtn = document.querySelector('.more-option-btn:first-of-type');
     if (techSupportBtn) {
         techSupportBtn.addEventListener('click', async () => { // Make it async
             if (!isLoggedIn) {
                 alert("Пожалуйста, войдите через Telegram для отправки обращения в техподдержку.");
                 return;
             }

             if (ADMIN_CHAT_ID === 'YOUR_ADMIN_CHAT_ID') {
                  alert("Ошибка: Пожалуйста, замените 'YOUR_ADMIN_CHAT_ID' на актуальный Telegram ID админа в файле script.js для работы техподдержки.");
                  return;
             }

             if (!targetTelegramId) {
                  alert("Ошибка: Не удалось получить ваш Telegram ID для отправки обращения.");
                  return;
             }

             // Ask the user for the support request details
             const userRequest = prompt("Опишите вашу проблему или вопрос:");

             if (!userRequest) {
                 alert("Обращение отменено.");
                 return;
             }

             // Indicate that the request is being sent
             alert("Отправка обращения в техподдержку...");

             // Send message to the user
             const userMessageText = `Ваше обращение в техподдержку отправлено. Мы свяжемся с вами в ближайшее время.`;
             const userApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${encodeURIComponent(targetTelegramId)}&text=${encodeURIComponent(userMessageText)}`;

             // Send message to the admin
             const adminMessageText = `НОВОЕ ОБРАЩЕНИЕ В ТЕХПОДДЕРЖКУ\n\nОт пользователя: ${targetTelegramId}\nТекст обращения: ${userRequest}`;
             const adminApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${encodeURIComponent(ADMIN_CHAT_ID)}&text=${encodeURIComponent(adminMessageText)}`;

             try {
                 // Send message to the user first
                 const userResponse = await fetch(userApiUrl);
                 const userData = await userResponse.json();

                 if (userData.ok) {
                     console.log("Confirmation message sent to user:", userData);
                 } else {
                     console.error('Telegram API Error sending user confirmation:', userData);
                     alert(`Ошибка при отправке подтверждения вам (${targetTelegramId}). Ошибка: ${userData.description || 'Неизвестно'}`);
                 }

                 // Send message to the admin
                 const adminResponse = await fetch(adminApiUrl);
                 const adminData = await adminResponse.json();

                 if (adminData.ok) {
                      alert("Ваше обращение успешно отправлено в техподдержку.");
                      console.log("Support request sent to admin:", adminData);
                 } else {
                     console.error('Telegram API Error sending admin notification:', adminData);
                     alert(`Ошибка при отправке обращения админу (${ADMIN_CHAT_ID}). Ошибка: ${adminData.description || 'Неизвестно'}\nПожалуйста, свяжитесь с администрацией другим способом.`);
                 }


             } catch (error) {
                 console.error('Fetch Error sending support request:', error);
                 alert("Произошла ошибка при попытке отправить обращение. Проверьте ваше интернет-соединение.");
             }
         });
     }

     const settingsBtn = document.querySelector('.more-option-btn:last-of-type');
      if (settingsBtn) {
          settingsBtn.addEventListener('click', () => {
              alert("Открытие настроек..."); // Placeholder action
              // In a real app, this would navigate to a settings page
          });
      }
});