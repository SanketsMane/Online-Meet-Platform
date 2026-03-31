'use strict';

const brandDataKey = 'brandData_v2';
const brandData = window.sessionStorage.getItem(brandDataKey);

const title = document.getElementById('title');
const icon = document.getElementById('icon');
const appleTouchIcon = document.getElementById('appleTouchIcon');
const newRoomTitle = document.getElementById('newRoomTitle');
const newRoomDescription = document.getElementById('newRoomDescription');

const description = document.getElementById('description');
const keywords = document.getElementById('keywords');

const appTitle = document.getElementById('appTitle');
const appDescription = document.getElementById('appDescription');
const joinDescription = document.getElementById('joinDescription');
const joinRoomBtn = document.getElementById('joinRoomButton');
const customizeRoomBtn = document.getElementById('customizeRoomButton');
const joinLastLabel = document.getElementById('joinLastLabel');

const topSponsors = document.getElementById('topSponsors');
const features = document.getElementById('features');
const teams = document.getElementById('teams');
const tryEasier = document.getElementById('tryEasier');
const poweredBy = document.getElementById('poweredBy');
const sponsors = document.getElementById('sponsors');
const advertisers = document.getElementById('advertisers');
const supportUs = document.getElementById('supportUs');
const footer = document.getElementById('footer');

const whoAreYouTitle = document.getElementById('whoAreYouTitle');
const whoAreYouDescription = document.getElementById('whoAreYouDescription');
const presenterLoginButton = document.getElementById('presenterLoginButton');
const guestJoinRoomButton = document.getElementById('guestJoinRoomButton');
//...

// app/src/config.js - ui.brand
let BRAND = {
    app: {
        language: 'en',
        name: 'tawktoo SFU',
        title: 'Premium video meetings. <br />Now free for everyone.',
        description:
            'We re-engineered the service we built for secure business meetings to make it free and available for all.',
        joinDescription: 'Pick a room name.<br />How about this one?',
        joinButtonLabel: 'JOIN ROOM',
        customizeButtonLabel: 'CUSTOMIZE ROOM',
        joinLastLabel: 'Your recent room:',
    },
    site: {
        title: 'tawktoo SFU - Free Video Calls, Messaging and Screen Sharing',
        icon: '../images/logo.svg',
        appleTouchIcon: '../images/logo.svg',
        newRoomTitle: 'Pick name. <br />Share URL. <br />Start conference.',
        newRoomDescription:
            "Each room has its disposable URL. Just pick a room name and share your custom URL. It's that easy.",
    },
    meta: {
        description:
            'tawktoo SFU powered by WebRTC and mediasoup, Real-time Simple Secure Fast video calls, messaging and screen sharing capabilities in the browser.',
        keywords:
            'webrtc, miro, mediasoup, mediasoup-client, self hosted, voip, sip, real-time communications, chat, messaging, meet, webrtc stun, webrtc turn, webrtc p2p, webrtc sfu, video meeting, video chat, video conference, multi video chat, multi video conference, peer to peer, p2p, sfu, rtc, alternative to, zoom, microsoft teams, jitsi, meeting',
    },
    html: {
        topSponsors: true,
        features: true,
        teams: true,
        tryEasier: true,
        poweredBy: true,
        sponsors: true,
        advertisers: true,
        supportUs: true,
        footer: true,
    },
    whoAreYou: {
        title: 'Who are you?',
        description:
            "If you\'re the presenter, please log in now.<br />Otherwise, kindly wait for the presenter to join.",
        buttonLoginLabel: 'LOGIN',
        buttonJoinLabel: 'JOIN ROOM',
    },
    about: {
        imageUrl: '../images/logo.svg',
        title: '<strong>WebRTC SFU v2.1.06</strong>',
        html: `
            <button 
                id="support-button" 
                data-umami-event="Support button" 
                onclick="window.open('mailto:sanketmane7170@gmail.com', '_blank')">
                <i class="fas fa-heart"></i> Support
            </button>
            <br /><br /><br />
            Author: 
            <a 
                id="linkedin-button" 
                data-umami-event="Linkedin button" 
                href="https://github.com/SanketsMane" 
                target="_blank"> 
                Sanket Mane
            </a>
            <br /><br />
            Email: 
            <a 
                id="email-button" 
                data-umami-event="Email button" 
                href="mailto:sanketmane7170@gmail.com?subject=tawktoo SFU info"> 
                sanketmane7170@gmail.com
            </a>
            <br /><br />
            <hr />
            <span>&copy; 2026 tawktoo SFU, all rights reserved</span>
            <hr />
        `,
    },
    widget: {
        enabled: false,
        roomId: 'support-room',
        theme: 'dark',
        widgetState: 'minimized',
        widgetType: 'support',
        supportWidget: {
            position: 'top-right',
            expertImages: [
                'https://photo.cloudron.pocketsolution.net/uploads/original/95/7d/a5f7f7a2c89a5fee7affda5f013c.jpeg',
            ],
            buttons: {
                audio: true,
                video: true,
                screen: true,
                chat: true,
                join: true,
            },
            checkOnlineStatus: false,
            isOnline: true,
            customMessages: {
                heading: 'Need Help?',
                subheading: 'Get instant support from our expert team!',
                connectText: 'connect in < 5 seconds',
                onlineText: 'We are online',
                offlineText: 'We are offline',
                poweredBy: 'Powered by tawktoo SFU',
            },
            alert: {
                enabled: false,
                type: 'email',
            },
        },
    },
    //...
};

async function initialize() {
    await getBrand();

    customizeSite();

    customizeMetaTags();

    customizeApp();

    customizeWidget();

    customizeWhoAreYou();

    customizeLogo();
    customizeFooter();

    checkBrand();
}

async function getBrand() {
    if (brandData) {
        setBrand(JSON.parse(brandData));
    } else {
        try {
            const response = await fetch('/brand', { timeout: 5000 });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const serverBrand = data.message;
            if (serverBrand) {
                setBrand(serverBrand);
                console.log('FETCH BRAND SETTINGS', {
                    serverBrand: serverBrand,
                    clientBrand: BRAND,
                });
                window.sessionStorage.setItem(brandDataKey, JSON.stringify(serverBrand));
            } else {
                console.warn('FETCH BRAND SETTINGS - DISABLED');
            }
        } catch (error) {
            console.error('FETCH GET BRAND ERROR', error.message);
        }
    }
}

// BRAND configurations
function setBrand(data) {
    BRAND = mergeBrand(BRAND, data);
    console.log('Set Brand done');
}

function mergeBrand(current, updated) {
    for (const key of Object.keys(updated)) {
        if (!current.hasOwnProperty(key) || typeof updated[key] !== 'object') {
            current[key] = updated[key];
        } else {
            mergeBrand(current[key], updated[key]);
        }
    }
    return current;
}

// BRAND check
function checkBrand() {
    !BRAND.html.topSponsors && elementDisplay(topSponsors, false);
    !BRAND.html.features && elementDisplay(features, false);
    !BRAND.html.teams && elementDisplay(teams, false);
    !BRAND.html.tryEasier && elementDisplay(tryEasier, false);
    !BRAND.html.poweredBy && elementDisplay(poweredBy, false);
    !BRAND.html.sponsors && elementDisplay(sponsors, false);
    !BRAND.html.advertisers && elementDisplay(advertisers, false);
    !BRAND.html.supportUs && elementDisplay(supportUs, false);
    !BRAND.html.footer && elementDisplay(footer, false);
}

// ELEMENT display mode
function elementDisplay(element, display, mode = 'block') {
    if (!element) return;
    element.style.display = display ? mode : 'none';
}

// APP customize
function customizeApp() {
    if (appTitle && BRAND.app?.title) {
        appTitle.innerHTML = BRAND.app?.title;
    }
    if (appDescription && BRAND.app?.description) {
        appDescription.textContent = BRAND.app.description;
    }
    if (joinDescription && BRAND.app?.joinDescription) {
        joinDescription.innerHTML = BRAND.app.joinDescription;
    }
    if (joinRoomBtn && BRAND.app?.joinButtonLabel) {
        joinRoomBtn.innerText = BRAND.app.joinButtonLabel;
    }
    if (customizeRoomBtn && BRAND.app?.customizeButtonLabel) {
        customizeRoomBtn.innerText = BRAND.app.customizeButtonLabel;
    }
    if (joinLastLabel && BRAND.app?.joinLastLabel) {
        joinLastLabel.innerText = BRAND.app.joinLastLabel;
    }
}

// WIDGET customize
function customizeWidget() {
    if (BRAND.widget?.enabled) {
        const domain = window.location.host;
        const roomId = BRAND.widget?.roomId || 'support-room';
        const userName = 'guest-' + Math.floor(Math.random() * 10000);
        if (typeof tawktooWidget !== 'undefined') {
            new tawktooWidget(domain, roomId, userName, BRAND.widget);
        } else {
            console.warn('tawktooWidget is not defined in the current context. Please check Widget.js loading.', {
                domain,
                roomId,
                userName,
                widget: BRAND.widget,
            });
        }
    }
}

// SITE metadata
function customizeSite() {
    if (title && BRAND.site?.title) {
        title.textContent = BRAND.site?.title;
    }
    if (icon && (BRAND.site?.icon || BRAND.favicon_url)) {
        icon.href = BRAND.favicon_url || BRAND.site.icon;
    }
    if (appleTouchIcon && (BRAND.site?.appleTouchIcon || BRAND.favicon_url)) {
        appleTouchIcon.href = BRAND.favicon_url || BRAND.site.appleTouchIcon;
    }
    if (newRoomTitle && BRAND.site?.newRoomTitle) {
        newRoomTitle.innerHTML = BRAND.site?.newRoomTitle;
    }
    if (newRoomDescription && BRAND.site?.newRoomDescription) {
        newRoomDescription.textContent = BRAND.site.newRoomDescription;
    }
    if (BRAND.brand_color) {
        document.documentElement.style.setProperty('--link-color', BRAND.brand_color);
        document.documentElement.style.setProperty('--primary-color', BRAND.brand_color);
        document.documentElement.style.setProperty('--google-blue', BRAND.brand_color);
    }
}

// SEO metadata
function customizeMetaTags() {
    if (description && BRAND.meta?.description) {
        description.content = BRAND.meta.description;
    }
    if (keywords && BRAND.meta?.keywords) {
        keywords.content = BRAND.meta.keywords;
    }
}

function customizeWhoAreYou() {
    if (whoAreYouTitle && BRAND.whoAreYou?.title) {
        whoAreYouTitle.textContent = BRAND.whoAreYou.title;
    }
    if (whoAreYouDescription && BRAND.whoAreYou?.description) {
        whoAreYouDescription.innerHTML = BRAND.whoAreYou.description;
    }
    if (presenterLoginButton && BRAND.whoAreYou?.buttonLoginLabel) {
        presenterLoginButton.textContent = BRAND.whoAreYou.buttonLoginLabel;
    }
    if (guestJoinRoomButton && BRAND.whoAreYou?.buttonJoinLabel) {
        guestJoinRoomButton.textContent = BRAND.whoAreYou.buttonJoinLabel;
    }
}

function customizeLogo() {
    //Sanket v2.0 - Swap logo src on all img elements: explicit IDs first, then broad selector fallback
    if (BRAND.logo_url) {
        const applyLogoSrc = () => {
            const logoImgs = document.querySelectorAll(
                '#site-nav-logo, #site-footer-logo, img[src*="logo"], .sidebar-logo, img[alt*="logo" i], .navbar-brand img, .header-logo-image, .footer-brand img'
            );
            logoImgs.forEach((img) => {
                img.src = BRAND.logo_url;
            });
        };

        // Apply immediately to any already-rendered logo images
        applyLogoSrc();

        //Sanket v2.0 - Always register a MutationObserver to catch logos injected AFTER this runs.
        // components.js renders the shared header on DOMContentLoaded which may fire AFTER Brand.js
        // completes on the cached-brand path — the observer ensures the nav/footer logos are
        // always updated regardless of script execution order.
        const observer = new MutationObserver(() => {
            const navLogo = document.getElementById('site-nav-logo');
            const footerLogo = document.getElementById('site-footer-logo');
            if (navLogo) { navLogo.src = BRAND.logo_url; }
            if (footerLogo) { footerLogo.src = BRAND.logo_url; }
            // Keep observing until both logos are found and updated
            if (navLogo && footerLogo) observer.disconnect();
        });
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { childList: true, subtree: true });
            });
        }
    }

    if (BRAND.logo_config?.width) {
        const width = BRAND.logo_config.width;
        //Sanket v2.0 - Apply both width and height (height defaults to 'auto') to all logo images including named IDs
        const logoH = BRAND.logo_config.height || 'auto';
        const images = document.querySelectorAll(
            '#site-nav-logo, #site-footer-logo, header img[src*="logo"], .sidebar-logo, img[alt*="logo" i], .navbar-brand img'
        );
        images.forEach((img) => {
            img.style.width = width;
            img.style.height = logoH;

            // Author: Sanket - If there's a redirect URL, wrap the image in a link or update existing link
            if (BRAND.logo_redirect_url) {
                const parentA = img.closest('a');
                if (parentA) {
                    parentA.href = BRAND.logo_redirect_url;
                }
            }
        });
    }
}

function customizeFooter() {
    //Sanket v2.0 - Target both #site-footer (full render) and #site-footer-links (components.js partial)
    const footerLinksEl = document.getElementById('site-footer-links');
    const footerLogoEl = document.getElementById('site-footer-logo');

    //Sanket v2.0 - Race condition fix: on the sessionStorage-cached path Brand.js runs customizeFooter()
    //BEFORE components.js DOMContentLoaded fires and renders the footer. If elements don't exist yet,
    //listen for the 'siteFooterRendered' event that components.js dispatches after render, then retry.
    if (!footerLinksEl && !footerLogoEl) {
        document.addEventListener('siteFooterRendered', () => customizeFooter(), { once: true });
        return;
    }

    if (BRAND.footer_config) {
        const { copyright, links, contactEmail } = BRAND.footer_config;

        // Update footer links container rendered by components.js
        if (footerLinksEl && links && Array.isArray(links) && links.length > 0) {
            footerLinksEl.innerHTML = links
                .map(l => `<a href="${l.url}" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s;" onmouseover="this.style.color='#355de0'" onmouseout="this.style.color='#94a3b8'">${l.label}</a>`)
                .join('');
        }

        // Update copyright span rendered by components.js
        const copyrightEl = document.querySelector('#site-footer span');
        if (copyrightEl && copyright) copyrightEl.innerHTML = copyright;
    }

    // Update footer logo if components.js already injected it
    if (footerLogoEl && BRAND.logo_url) {
        footerLogoEl.src = BRAND.logo_url;
        if (BRAND.logo_config?.width) {
            footerLogoEl.style.width = BRAND.logo_config.width;
            footerLogoEl.style.height = BRAND.logo_config.height || 'auto';
        }
    }

    // Legacy: full footer re-render for pages that have #site-footer but not via components.js
    const footerEl = document.getElementById('site-footer');
    if (footerEl && !footerLinksEl && BRAND.footer_config) {
        const { copyright, links, contactEmail } = BRAND.footer_config;
        const contactInfo = BRAND.contact_info || {};

        let linksHtml = '';
        if (links && Array.isArray(links)) {
            linksHtml = links
                .map(
                    (l) =>
                        `<a href="${l.url}" class="text-sm text-gray-500 hover:text-blue-600 transition-colors">${l.label}</a>`
                )
                .join('');
        }

        let contactHtml = '';
        if (contactEmail) {
            contactHtml += `<a href="mailto:${contactEmail}" class="text-sm text-gray-500 hover:text-blue-600 transition-colors"><i class="fas fa-envelope mr-1"></i> ${contactEmail}</a>`;
        }
        if (contactInfo.phone) {
            contactHtml += `<span class="text-sm text-gray-500"><i class="fas fa-phone mr-1"></i> ${contactInfo.phone}</span>`;
        }
        if (contactInfo.address) {
            contactHtml += `<span class="text-sm text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i> ${contactInfo.address}</span>`;
        }

        footerEl.innerHTML = `
            <div class="container mx-auto px-5 md:px-10 flex flex-col items-center justify-between py-10 border-t border-gray-100 dark:border-gray-800 mt-10 space-y-6 md:space-y-0 md:flex-row">
                <div class="flex flex-col items-center md:items-start space-y-2">
                    <div class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                        ${BRAND.app?.name || 'tawktoo'}
                    </div>
                    <div class="text-xs text-gray-500 max-w-xs text-center md:text-left">
                        ${copyright || '&copy; 2026 tawktoo SFU'}
                    </div>
                </div>
                
                <div class="flex flex-col items-center md:items-end space-y-4">
                    <div class="flex flex-wrap justify-center md:justify-end items-center gap-6">
                        ${linksHtml}
                    </div>
                    <div class="flex flex-wrap justify-center md:justify-end items-center gap-4 text-xs">
                        ${contactHtml}
                    </div>
                </div>
            </div>
        `;
    }
}

initialize();
