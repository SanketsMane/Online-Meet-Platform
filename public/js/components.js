/* 
  tawktoo Shared Components 
  Single Source of Truth for Header & Footer 
  Author: Sanket
*/

class TawktooComponents {
    constructor() {
        this.brandName = 'tawktoo';
        // The type can be set via a data attribute on the header element: <header class="site-header-shared" data-type="dashboard"></header>
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    render() {
        const headerContainer = document.querySelector('header.site-header-shared');
        const footerContainer = document.querySelector('footer.site-footer-shared');
        
        if (headerContainer) {
            const type = headerContainer.getAttribute('data-type') || 'landing';
            this.renderHeader(headerContainer, type);
        }
        
        if (footerContainer) {
            this.renderFooter(footerContainer);
        }
    }

    renderHeader(container, type) {
        const isDark = () => document.documentElement.classList.contains('dark');
        
        const brand = window.BRAND || {};
        const logoUrl = brand.logo_url || '../images/logo.svg';
        const logoWidth = (brand.logo_config && brand.logo_config.width) ? brand.logo_config.width : 'auto';
        const logoRedirect = brand.LOGO_REDIRECT_URL || '/';
        const brandName = (brand.footer_config && brand.footer_config.brandName) ? brand.footer_config.brandName : 'tawktoo';

        let navContent = '';
        let leftContent = `
            <a href="${logoRedirect}" class="flex items-center gap-3 group">
                <img src="${logoUrl}" alt="${brandName}" class="h-8 group-hover:scale-105 transition-transform" style="width: ${logoWidth}; height: auto;">
                <span class="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase hidden xs:block">${brandName}</span>
            </a>
        `;

        if (type === 'landing') {
            navContent = `
                <nav class="hidden md:flex items-center gap-8">
                    <a href="/login" class="text-sm font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-white transition-colors">Host Portal</a>
                    <a href="/views/developer.html" class="text-sm font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-white transition-colors">Developers</a>
                </nav>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                <button id="header_join_btn" class="hidden sm:block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    Join Meeting
                </button>
            `;
        } else if (type === 'dashboard') {
            const pageTitle = document.title.split(' - ')[1] || 'Dashboard';
            leftContent = `
                <div class="flex items-center gap-4">
                    <button id="sidebarToggle" class="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">System /</span>
                        <h2 class="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">${pageTitle}</h2>
                    </div>
                </div>
            `;
            navContent = `
                <div class="flex items-center gap-4 pl-4 border-l border-slate-100 dark:border-slate-800">
                    <div class="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-lg shadow-brand-500/20">
                        <span id="header_user_initial">U</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="h-16 w-full flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-900 transition-all duration-300">
                ${leftContent}
                
                <div class="flex items-center gap-6">
                    ${navContent}
                    
                    <button id="themeToggle" class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm" title="Toggle theme">
                        <i class="fas fa-moon dark:hidden"></i>
                        <i class="fas fa-sun hidden dark:block text-amber-400"></i>
                    </button>
                </div>
            </div>
        `;

        // Theme Toggle Logic
        const btn = container.querySelector('#themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark() ? 'dark' : 'light');
            });
        }

        // Update User Initial if in dashboard mode
        if (type === 'dashboard') {
            const updateInitial = () => {
                const name = localStorage.getItem('dev_name') || localStorage.getItem('userName') || 'User';
                const initialEl = document.getElementById('header_user_initial');
                if (initialEl) initialEl.textContent = name[0].toUpperCase();
            };
            updateInitial();
            window.addEventListener('storage', updateInitial);
        }
    }

    renderFooter(container) {
        const brand = window.BRAND || {};
        const fc = brand.footer_config || {};
        const logoUrl = brand.logo_url || '../images/logo.svg';
        const logoWidth = brand.logo_config?.width || 'auto';
        const logoRedirect = brand.LOGO_REDIRECT_URL || brand.logo_redirect_url || '/';
        const brandName = fc.brandName || 'tawktoo';
        const copyright = fc.copyright || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;
        const tagline = fc.tagline || '';
        const contactEmail = fc.contactEmail || '';
        const socialLinks = fc.socialLinks || {};
        const links = fc.links || [
            { label: 'About', url: '/about', group: 'Company' },
            { label: 'Privacy Policy', url: '/privacy', group: 'Legal' },
            { label: 'Terms of Service', url: '/terms', group: 'Legal' },
            { label: 'Contact', url: contactEmail ? 'mailto:' + contactEmail : '#', group: 'Company' },
        ];

        // Group links by section
        const groups = {};
        links.forEach(l => {
            const g = l.group || 'Links';
            if (!groups[g]) groups[g] = [];
            groups[g].push(l);
        });

        const groupCols = Object.entries(groups).map(([g, items]) => `
            <div>
                <h4 class="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">${g}</h4>
                <ul class="space-y-2.5">
                    ${items.map(item => `
                        <li><a href="${item.url}" class="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors">${item.label}</a></li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        const socialIconMap = { twitter: 'fa-twitter', linkedin: 'fa-linkedin-in', github: 'fa-github', instagram: 'fa-instagram', youtube: 'fa-youtube', facebook: 'fa-facebook-f' };
        const socialHtml = Object.entries(socialLinks).map(([key, url]) => {
            if (!url) return '';
            const icon = socialIconMap[key] || 'fa-globe';
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all text-sm" title="${key}"><i class="fab ${icon}"></i></a>`;
        }).join('');

        container.innerHTML = `
            <footer id="site-footer" class="border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 transition-colors duration-300">
                <div class="max-w-7xl mx-auto px-6 md:px-12 py-14">
                    <div class="flex flex-col lg:flex-row justify-between gap-12">
                        <!-- Brand -->
                        <div class="flex flex-col gap-4 max-w-xs">
                            <a href="${logoRedirect}" class="flex items-center gap-3 group w-fit">
                                <img src="${logoUrl}" alt="${brandName}" class="h-8 opacity-80 group-hover:opacity-100 transition-opacity" style="width:${logoWidth};max-width:140px;height:auto;" />
                                <span class="text-lg font-black tracking-tight text-slate-800 dark:text-slate-200 uppercase">${brandName}</span>
                            </a>
                            ${tagline ? `<p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">${tagline}</p>` : ''}
                            ${contactEmail ? `<a href="mailto:${contactEmail}" class="text-sm text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-2"><i class="fas fa-envelope text-xs"></i>${contactEmail}</a>` : ''}
                            ${socialHtml ? `<div class="flex items-center gap-2 mt-1">${socialHtml}</div>` : ''}
                        </div>

                        <!-- Link Groups -->
                        <div class="flex flex-wrap gap-10 lg:gap-16">
                            ${groupCols || links.map(l => `<a href="${l.url}" class="text-sm text-slate-500 hover:text-brand-600 transition-colors">${l.label}</a>`).join('')}
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="mt-12 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p class="text-xs text-slate-400 dark:text-slate-600">${copyright}</p>
                        <div class="flex items-center gap-1 text-xs text-slate-300 dark:text-slate-700">
                            <i class="fas fa-shield-alt"></i>
                            <span>Powered by <strong class="text-slate-400">${brandName}</strong></span>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Global instance to allow manual re-renders if needed
window.tawktooUI = new TawktooComponents();
