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
    
    // Author: Sanket - Synchronization with Shared Components
    if (window.tawktooUI) {
        window.tawktooUI.render();
    }
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
    if (BRAND.logo_config?.width) {
        const width = BRAND.logo_config.width;
        // Target all logo images that match common patterns
        const images = document.querySelectorAll(
            'header img[src*="logo"], .sidebar-logo, img[alt*="logo" i], .navbar-brand img'
        );
        images.forEach((img) => {
            img.style.width = width;
            img.style.height = 'auto';

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
    const footerEl = document.getElementById('site-footer');
    if (footerEl && BRAND.footer_config) {
        const { brandName, copyright, links, contactEmail } = BRAND.footer_config;
        const contactInfo = BRAND.contact_info || {};

        let linksHtml = '';
        if (links && Array.isArray(links)) {
            linksHtml = links
                .map((l) => {
                    const url = l.type === 'cms' ? `/p/${l.url}` : l.url;
                    return `<a href="${url}" class="text-sm text-gray-400 hover:text-blue-500 transition-colors">${l.label}</a>`;
                })
                .join('');
        }

        let contactHtml = '';
        if (contactEmail) {
            contactHtml += `<a href="mailto:${contactEmail}" class="hover:text-blue-500 transition-colors"><i class="fas fa-envelope mr-1"></i> ${contactEmail}</a>`;
        }
        if (contactInfo.phone) {
            contactHtml += `<span><i class="fas fa-phone mr-1"></i> ${contactInfo.phone}</span>`;
        }
        if (contactInfo.address) {
            contactHtml += `<span><i class="fas fa-map-marker-alt mr-1"></i> ${contactInfo.address}</span>`;
        }

        footerEl.innerHTML = `
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div class="flex flex-col items-center md:items-start gap-4">
                    <div class="flex items-center gap-3">
                        <img src="../images/logo.svg" alt="${brandName || 'tawktoo'}" class="h-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <span class="text-lg font-bold tracking-tight text-gray-400">${brandName || 'tawktoo'}</span>
                    </div>
                    <div class="text-sm font-medium text-gray-500">
                        ${copyright || `&copy; ${new Date().getFullYear()} tawktoo SFU. All rights reserved.`}
                    </div>
                </div>
                <div class="flex flex-col items-center md:items-end gap-4">
                    <div class="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-bold">
                        ${linksHtml}
                    </div>
                    <div class="flex flex-wrap justify-center md:justify-end gap-6 text-xs font-medium text-gray-500">
                        ${contactHtml}
                    </div>
                </div>
            </div>
        `;
    }
}

initialize();
