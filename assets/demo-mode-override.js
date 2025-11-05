// Theme Activation Notification Override Script
// This script permanently disables theme activation notifications

(function() {
    'use strict';
    
    console.log('Disabling theme activation notifications...');
    
    // Override the notification functions to prevent popups
    window.shopInfoIs = function() { return true; }; // Always return true to indicate "verified"
    window.bs_popupInfo = function() { return false; }; // Disable popup display
    window.readyServer = function() { return false; }; // Disable server ready check
    window.showActivePopup = function() { return false; }; // Disable active popup display
    
    // Clear any existing localStorage entries that might trigger notifications
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('theme_id') || key.includes('uuid') || key.includes('popup'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Set verification flags
    window.verified_secret_tag = true;
    if (typeof window.dataServer === 'undefined') {
        window.dataServer = {};
    }
    window.dataServer.verified = true;
    
    // Hide any existing notification modals
    document.addEventListener('DOMContentLoaded', function() {
        const modals = document.querySelectorAll('.bs-modal-anchor, [class*="modal"], [class*="popup"]');
        modals.forEach(modal => {
            if (modal.style) {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
            }
        });
    });
    
    console.log('Theme activation notifications have been permanently disabled');
})();
