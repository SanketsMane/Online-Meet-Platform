/* 
  tawktoo Shared Components 
  Single Source of Truth for Header & Footer 
  Author: Sanket
*/

class TawktooComponents {
    constructor() {
        this.brandName = 'tawktoo';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderHeader();
            this.renderFooter();
        });
    }

    renderHeader() {
        const headerContainer = document.querySelector('header.site-header-shared');
        if (!headerContainer) return;

        // Author: Sanket - isDark tracks current theme state for icon updates
        const isDark = () => document.documentElement.classList.contains('dark');

        headerContainer.innerHTML = `
            <div style="height:56px; display:flex; align-items:center; justify-content:space-between; padding:0 48px; position:sticky; top:0; z-index:50; backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.9); transition:background 0.3s;" id="siteNavbar">
                <a href="/" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                    <img src="../images/logo.svg" alt="tawktoo" style="height:32px;">
                </a>
                <div style="display:flex; align-items:center; gap:24px;">
                    <nav style="display:flex; align-items:center; gap:28px;">
                        <a href="/login" style="font-size:13px; font-weight:600; color:#64748b; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#64748b'">Host Portal</a>
                        <a href="/views/developer.html" style="font-size:13px; font-weight:600; color:#64748b; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#64748b'">Developers</a>
                    </nav>
                    <div style="width:1px; height:20px; background:#e2e8f0;"></div>
                    <!-- Author: Sanket - Theme toggle uses JS-driven styles to guarantee icon visibility in both modes -->
                    <button id="themeToggle" style="width:36px; height:36px; border-radius:50%; border:1.5px solid #cbd5e1; background:#f8fafc; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; transition:transform 0.2s; outline:none;" title="Toggle theme">
                        🌙
                    </button>
                    <button id="header_join_btn" style="padding:8px 20px; background:#355de0; color:#fff; font-size:13px; font-weight:700; border:none; border-radius:10px; cursor:pointer; transition:opacity 0.2s; box-shadow:0 4px 12px rgba(53,93,224,0.3);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        Join Meeting
                    </button>
                </div>
            </div>
        `;

        // Author: Sanket - Updates navbar bg + toggle icon based on current dark/light state
        const applyTheme = () => {
            const dark = isDark();
            const navbar = document.getElementById('siteNavbar');
            const btn = document.getElementById('themeToggle');
            if (!navbar || !btn) return;

            if (dark) {
                navbar.style.background = 'rgba(9,9,11,0.95)';
                navbar.style.borderBottomColor = 'rgba(255,255,255,0.06)';
                btn.style.background = '#1e1e1e';
                btn.style.borderColor = '#3f3f46';
                btn.textContent = '☀️';
            } else {
                navbar.style.background = 'rgba(255,255,255,0.9)';
                navbar.style.borderBottomColor = 'rgba(0,0,0,0.08)';
                btn.style.background = '#f8fafc';
                btn.style.borderColor = '#cbd5e1';
                btn.textContent = '🌙';
            }
        };

        // Apply on load, then on every toggle click
        applyTheme();

        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark() ? 'dark' : 'light');
                applyTheme();
            });
        }
    }

    renderFooter() {
        const footerContainer = document.querySelector('footer.site-footer-shared');
        if (!footerContainer) return;

        footerContainer.innerHTML = `
            <div class="p-8 md:p-16 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#15181d]">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div class="flex flex-col items-center md:items-start gap-4">
                        <img src="../images/logo.svg" alt="tawktoo" class="h-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div class="text-sm font-medium text-gray-400">
                            &copy; ${new Date().getFullYear()} tawktoo SFU. All rights reserved.
                        </div>
                    </div>
                    <div class="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400">
                        <a href="/about" class="hover:text-google-blue transition-colors">About</a>
                        <a href="/privacy" class="hover:text-google-blue transition-colors">Privacy Policy</a>
                        <a href="/terms" class="hover:text-google-blue transition-colors">Terms of Service</a>
                        <a href="mailto:support@tawktoo.com" class="hover:text-google-blue transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        `;
    }
}

new TawktooComponents();
