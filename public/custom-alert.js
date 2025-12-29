// Custom Alert Modal Function
function showCustomAlert(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="url(#gradient)"/>
                    <defs>
                        <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22">
                            <stop offset="0%" stop-color="#1F9352"/>
                            <stop offset="100%" stop-color="#056E9D"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h3 class="modal-title">admin.propertymeasure.ai says</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-buttons">
                ${onConfirm ? '<button class="modal-btn modal-btn-back">Back</button>' : ''}
                <button class="modal-btn modal-btn-ok">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Handle Back button click (if exists)
    if (onConfirm) {
        const backBtn = modal.querySelector('.modal-btn-back');
        if (backBtn) {
            backBtn.onclick = () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            };
        }
    }
    
    // Handle OK button click
    const okBtn = modal.querySelector('.modal-btn-ok');
    okBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (onConfirm) onConfirm();
        }, 300);
    };
}

// Custom Error Alert Modal Function
function showErrorAlert(message, onClose) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal error-modal';
    modal.innerHTML = `
        <div class="modal-content error-content">
            <div class="modal-icon error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="url(#errorGradient)"/>
                    <path d="M15 9L9 15M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <defs>
                        <linearGradient id="errorGradient" x1="2" y1="2" x2="22" y2="22">
                            <stop offset="0%" stop-color="#DC2626"/>
                            <stop offset="100%" stop-color="#991B1B"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h3 class="modal-title error-title">Access Denied</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-ok error-btn">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Handle OK button click
    const okBtn = modal.querySelector('.modal-btn-ok');
    okBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (onClose) onClose();
        }, 300);
    };
}

// Override native alert
window.alert = showCustomAlert;
