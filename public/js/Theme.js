'use strict';

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.toggleBtn = document.getElementById('themeToggle');
        this.html = document.documentElement;
        this.init();
    }

    init() {
        // Apply saved theme on load
        this.applyTheme(this.theme);

        // Event listener for toggle button
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.applyTheme(this.theme);
    }

    applyTheme(theme) {
        if (theme === 'light') {
            this.html.setAttribute('data-theme', 'light');
            if (this.toggleBtn) {
                this.toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
                this.toggleBtn.title = 'Switch to Dark Mode';
            }
        } else {
            this.html.removeAttribute('data-theme');
            if (this.toggleBtn) {
                this.toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
                this.toggleBtn.title = 'Switch to Light Mode';
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
