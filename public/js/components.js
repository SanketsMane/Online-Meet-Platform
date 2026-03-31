/* 
  tawktoo Shared Components 
  Single Source of Truth for Header & Footer 
  Author: Sanket
*/

class TawktooComponents {
    constructor() {
        this.brandName = 'tawktoo';
        //Sanket v2.0 - Read cached brand data at construction time so logo/footer are correct on first render
        this.brand = this._loadBrandCache();
        this.init();
    }

    //Sanket v2.0 - Load brand settings from sessionStorage (populated by Brand.js after /brand fetch)
    _loadBrandCache() {
        try {
            const raw = window.sessionStorage.getItem('brandData_v2');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
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

        //Sanket v2.0 - Use uploaded logo_url from brand cache if available; root-relative path works at any URL depth
        const logoSrc = (this.brand && this.brand.logo_url) ? this.brand.logo_url : '/images/logo.svg';
        //Sanket v2.0 - Apply saved dimensions from logo_config, fall back to 32px height
        const logoCfg = (this.brand && this.brand.logo_config) ? this.brand.logo_config : {};
        const logoW   = logoCfg.width  || 'auto';
        const logoH   = logoCfg.height && logoCfg.height !== 'auto' ? logoCfg.height : '32px';
        const logoStyle = `width:${logoW}; height:${logoH}; max-height:48px; object-fit:contain;`;

        // Author: Sanket - isDark tracks current theme state for icon updates
        const isDark = () => document.documentElement.classList.contains('dark');

        headerContainer.innerHTML = `
            <div style="height:56px; display:flex; align-items:center; justify-content:space-between; padding:0 48px; position:sticky; top:0; z-index:50; backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.9); transition:background 0.3s;" id="siteNavbar">
                <a href="/" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                    <img id="site-nav-logo" src="${logoSrc}" alt="tawktoo" style="${logoStyle}">
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

        //Sanket v2.0 - Use uploaded logo_url and DB footer config (links/copyright) if cached, else defaults
        //Sanket v2.0 - Use root-relative /images path so the img src works regardless of page URL depth
        const logoSrc = (this.brand && this.brand.logo_url) ? this.brand.logo_url : '/images/logo.svg';
        //Sanket v2.0 - Apply saved logo dimensions; footer logo uses 'auto' height so it scales naturally
        const logoCfgF = (this.brand && this.brand.logo_config) ? this.brand.logo_config : {};
        const footerLogoW = logoCfgF.width || 'auto';
        const footerLogoH = logoCfgF.height && logoCfgF.height !== 'auto' ? logoCfgF.height : '36px';
        const footerLogoStyle = `width:${footerLogoW}; height:${footerLogoH}; max-height:60px; object-fit:contain;`;
        const footerCfg = (this.brand && this.brand.footer_config) ? this.brand.footer_config : null;

        //Sanket v2.0 - Use admin-saved app_name in copyright, remove hardcoded "tawktoo SFU"
        const appName = (this.brand && this.brand.app && this.brand.app.name) ? this.brand.app.name : 'tawktoo';
        const copyright = (footerCfg && footerCfg.copyright)
            ? footerCfg.copyright
            : `&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.`;

        //Sanket v2.0 - Build footer links from DB FOOTER_CONFIG or fall back to hardcoded defaults
        let linksHtml = '';
        if (footerCfg && Array.isArray(footerCfg.links) && footerCfg.links.length > 0) {
            linksHtml = footerCfg.links
                .map(l => `<a href="${l.url}" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#94a3b8'">${l.label}</a>`)
                .join('');
        } else {
            linksHtml = `
                <a href="/about" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#94a3b8'">About</a>
                <a href="/privacy" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#94a3b8'">Privacy Policy</a>
                <a href="/terms" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#94a3b8'">Terms of Service</a>
                <a href="mailto:support@tawktoo.com" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#94a3b8'">Contact</a>
            `;
        }

        footerContainer.innerHTML = `
            <div id="site-footer" style="padding:48px 64px; border-top:1px solid #f1f5f9; background:#fff;">
                <div style="max-width:1280px; margin:0 auto; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:32px;">
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <img id="site-footer-logo" src="${logoSrc}" alt="${appName}" style="${footerLogoStyle}">
                        <span style="font-size:13px; color:#94a3b8;">${copyright}</span>
                    </div>
                    <div id="site-footer-links" style="display:flex; flex-wrap:wrap; gap:32px; align-items:center;">
                        ${linksHtml}
                    </div>
                </div>
            </div>
        `;

        //Sanket v2.0 - Signal Brand.js that the footer is now in the DOM so it can apply fresh data
        //This fixes the race condition where Brand.js (cached path) ran customizeFooter() before renderFooter()
        document.dispatchEvent(new CustomEvent('siteFooterRendered'));
    }
}

new TawktooComponents();
