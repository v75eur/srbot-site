// ============================================================
// SR Bot - app.js - v3.6
// Formulaire → WhatsApp + protections invisibles
// ============================================================

// --- CONFIG ---
const WHATSAPP_NUMBER = '22960315458';
const CONTACT_EMAIL = 'bottrade7425@gmail.com';

// --- PROTECTIONS ---
const COOLDOWN_MS = 15 * 60 * 1000;        // 15 minutes par client
const MIN_FILL_TIME_MS = 10 * 1000;        // 10 secondes minimum de remplissage
const DELAY_MIN_MS = 2000;                 // Délai minimum avant WhatsApp
const DELAY_MAX_MS = 8000;                 // Délai maximum avant WhatsApp
const DUP_WINDOW_MS = 24 * 60 * 60 * 1000; // Fenêtre anti-doublon : 24h

// --- ÉTAT GLOBAL ---
var formStartTime = Date.now();

// --- SCROLL PROGRESS ---
window.addEventListener('scroll', function() {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('scrollProgress').style.width = scrolled + '%';
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
});

// --- REVEAL ON SCROLL ---
const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

// --- ACTIVE NAV LINK ---
function updateActiveNav() {
    const sections = ['accueil', 'strategie', 'offres', 'exemples', 'commander'];
    let current = 'accueil';
    sections.forEach(function(id) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) { current = id; }
    });
    document.querySelectorAll('.nav-item').forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
}

// --- MOBILE MENU ---
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle && menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    menuToggle.innerHTML = navLinks.classList.contains('open')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
});
document.addEventListener('click', function(e) {
    if (navLinks && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// --- SMOOTH SCROLL ---
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        var t = document.querySelector(this.getAttribute('href'));
        if (t) {
            e.preventDefault();
            t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            navLinks && navLinks.classList.remove('open');
            menuToggle && (menuToggle.innerHTML = '<i class="fas fa-bars"></i>');
        }
    });
});

// --- STAT COUNTER ---
const statObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.target || 0);
        var suffix = el.dataset.suffix || '';
        var count = 0;
        var inc = Math.max(1, Math.ceil(target / 50));
        var timer = setInterval(function() {
            count = Math.min(count + inc, target);
            el.textContent = count + suffix;
            if (count >= target) clearInterval(timer);
        }, 28);
        statObserver.unobserve(el);
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-target]').forEach(function(el) {
    statObserver.observe(el);
});

// --- LIGHTBOX ---
var lightbox = null;
document.querySelectorAll('.screenshot-item').forEach(function(item) {
    item.addEventListener('click', function() {
        var img = item.querySelector('img');
        if (!img) return;
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = '<button class="lightbox-close" aria-label="Fermer">&times;</button><img alt="Screenshot SR Bot">';
            document.body.appendChild(lightbox);
            lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });
            document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });
        }
        lightbox.querySelector('img').src = img.src;
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
});
function closeLightbox() {
    lightbox && lightbox.classList.remove('show');
    document.body.style.overflow = '';
}

// --- POPUP ---
var popup = document.getElementById('popup');
var popupMessage = document.getElementById('popup-message');
function showPopup(msg, type) {
    type = type || 'success';
    var icons = { success: '✅', error: '❌', info: '⏳' };
    var titles = { success: 'Demande envoyée', error: 'Erreur', info: 'Merci de patienter' };
    popupMessage.innerHTML =
        '<div class="popup-icon">' + icons[type] + '</div>' +
        '<h3>' + titles[type] + '</h3>' +
        '<p>' + msg + '</p>' +
        '<button class="popup-btn" onclick="closePopup()">Fermer</button>';
    popup.classList.add('show');
}
function closePopup() { popup && popup.classList.remove('show'); }
document.querySelector('.popup-close') && document.querySelector('.popup-close').addEventListener('click', closePopup);
popup && popup.addEventListener('click', function(e) { if (e.target === this) closePopup(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closePopup(); });

// --- MESSAGE D'INFORMATION EN HAUT DU FORMULAIRE ---
(function addFormNotice() {
    var form = document.getElementById('registerForm');
    if (!form) return;
    var notice = document.createElement('div');
    notice.className = 'form-notice';
    notice.innerHTML =
        '<div class="notice-line"><span>✅</span> Une seule demande suffit — réponse sous 24h.</div>' +
        '<div class="notice-line"><span>⏳</span> Renvoi possible après 15 minutes.</div>' +
        '<div class="notice-line"><span>📱</span> Votre demande part directement sur notre WhatsApp.</div>' +
        '<div class="notice-line"><span>🔒</span> Vos informations restent confidentielles.</div>';
    form.insertBefore(notice, form.firstChild);
})();

// --- UTILITAIRES DE PROTECTION ---
function getRecentDemands() {
    try {
        return JSON.parse(localStorage.getItem('srbot_demands') || '[]');
    } catch (e) { return []; }
}
function saveDemand(demand) {
    var list = getRecentDemands();
    list.push(demand);
    // Garde seulement les 24 dernières heures
    var cutoff = Date.now() - DUP_WINDOW_MS;
    list = list.filter(function(d) { return d.date > cutoff; });
    try {
        localStorage.setItem('srbot_demands', JSON.stringify(list));
    } catch (e) { /* ignore */ }
}
function getLastSubmit() {
    try {
        return parseInt(localStorage.getItem('srbot_last_submit') || '0');
    } catch (e) { return 0; }
}
function setLastSubmit() {
    try {
        localStorage.setItem('srbot_last_submit', Date.now().toString());
    } catch (e) { /* ignore */ }
}
function getRecentCountLastHour() {
    var list = getRecentDemands();
    var cutoff = Date.now() - 60 * 60 * 1000;
    return list.filter(function(d) { return d.date > cutoff; }).length;
}

// --- FORM SUBMIT → WHATSAPP ---
document.getElementById('registerForm') && document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // ========== PROTECTION 1 : HONEYPOT ==========
    var honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') {
        console.warn('🤖 Bot détecté (honeypot)');
        return; // silencieux
    }

    // ========== PROTECTION 2 : TEMPS DE REMPLISSAGE ==========
    if (Date.now() - formStartTime < MIN_FILL_TIME_MS) {
        console.warn('🤖 Formulaire rempli trop vite — bot suspecté');
        showPopup('Merci de prendre le temps de vérifier vos informations avant d\'envoyer.', 'info');
        return;
    }

    // ========== PROTECTION 3 : COOLDOWN 15 MINUTES ==========
    var lastSubmit = getLastSubmit();
    var now = Date.now();
    if (lastSubmit && (now - lastSubmit) < COOLDOWN_MS) {
        var remaining = Math.ceil((COOLDOWN_MS - (now - lastSubmit)) / 1000);
        var min = Math.floor(remaining / 60);
        var sec = remaining % 60;
        var timeStr = (min > 0 ? min + ' min ' : '') + sec + ' sec';
        showPopup('Vous avez déjà envoyé une demande récemment.<br><br>Prochaine demande possible dans <strong>' + timeStr + '</strong>.', 'info');
        return;
    }

    // --- COLLECTE ---
    var data = {
        prenom: document.getElementById('prenom').value.trim(),
        nom: document.getElementById('nom').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        nationalite: document.getElementById('nationalite').value.trim(),
        pays: document.getElementById('pays').value.trim(),
        ville: document.getElementById('ville').value.trim(),
        email: document.getElementById('email').value.trim(),
        version: document.getElementById('version').value,
        description: document.getElementById('description').value.trim(),
        actifs: document.getElementById('actifs').value.trim(),
        consent: document.getElementById('consent').checked
    };

    // --- VALIDATION ---
    var required = ['prenom', 'nom', 'telephone', 'nationalite', 'pays', 'ville', 'email', 'version', 'description'];
    var hasError = false;
    required.forEach(function(k) {
        var el = document.getElementById(k);
        el.classList.toggle('error', !data[k]);
        if (!data[k]) hasError = true;
    });
    if (hasError) { showPopup('Veuillez remplir tous les champs obligatoires (*).', 'error'); return; }
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        document.getElementById('email').classList.add('error');
        showPopup('Adresse email invalide.', 'error'); return;
    }
    if (!data.consent) {
        showPopup('Veuillez accepter la transmission de vos informations via WhatsApp.', 'error');
        return;
    }

    // ========== PROTECTION 4 : ANTI-DOUBLON 24H ==========
    var recent = getRecentDemands();
    var isDuplicate = recent.some(function(d) {
        return d.email.toLowerCase() === data.email.toLowerCase() ||
               d.telephone.replace(/\s/g,'') === data.telephone.replace(/\s/g,'');
    });
    if (isDuplicate) {
        // Popup de confirmation
        popupMessage.innerHTML =
            '<div class="popup-icon">⚠️</div>' +
            '<h3>Demande déjà envoyée</h3>' +
            '<p>Vous avez déjà envoyé une demande avec cet email ou ce numéro dans les dernières 24h.<br><br>Voulez-vous vraiment en envoyer une nouvelle ?</p>' +
            '<button class="popup-btn" id="confirmDup">Oui, envoyer quand même</button>' +
            '<button class="popup-btn" style="background:rgba(255,255,255,.08);margin-left:8px" onclick="closePopup()">Non, annuler</button>';
        popup.classList.add('show');
        document.getElementById('confirmDup').addEventListener('click', function() {
            closePopup();
            proceedToSend(data);
        });
        return;
    }

    proceedToSend(data);
});

// --- ENVOI EFFECTIF ---
function proceedToSend(data) {
    var btn = document.getElementById('submitBtn');
    var btnText = document.getElementById('btnText');
    var btnLoader = document.getElementById('btnLoader');
    btn.disabled = true;
    btnText.style.display = 'none';

    // ========== PROTECTION 5 : DÉLAI ALÉATOIRE + DYNAMIQUE ==========
    var recentCount = getRecentCountLastHour();
    var dynamicExtra = recentCount * 1000; // +1 sec par demande récente (ce navigateur)
    var baseDelay = DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
    var totalDelay = Math.min(baseDelay + dynamicExtra, 15000);

    // Compte à rebours visible dans le loader
    var remainingSec = Math.ceil(totalDelay / 1000);
    btnLoader.style.display = 'flex';
    var countdownInterval = setInterval(function() {
        remainingSec--;
        if (remainingSec > 0) {
            btnLoader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Préparation... (' + remainingSec + ' sec)';
        }
    }, 1000);
    btnLoader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Préparation... (' + remainingSec + ' sec)';

    setTimeout(function() {
        clearInterval(countdownInterval);
        btn.disabled = false;
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';
        btnLoader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ouverture de WhatsApp...';

        // --- CONSTRUCTION DU MESSAGE ---
        var versions = {
            site: 'Version Web (5$/mois)',
            debug: 'Application Android (15$ + 5$/mois)',
            perso: 'Bot sur mesure (150$)'
        };
        var versionLabel = versions[data.version] || data.version;

        var now = new Date();
        var dateStr = now.toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        var heureStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        var ref = 'SRB-' + now.getFullYear() +
                  String(now.getMonth() + 1).padStart(2, '0') +
                  String(now.getDate()).padStart(2, '0') + '-' +
                  String(now.getHours()).padStart(2, '0') +
                  String(now.getMinutes()).padStart(2, '0') +
                  String(now.getSeconds()).padStart(2, '0');

        var randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

        var message =
            '🤖 *NOUVELLE DEMANDE SR BOT*\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '🆔 *Réf:* ' + ref + '\n' +
            '🔢 *ID:* #' + randomId + '\n' +
            '📅 *Date:* ' + dateStr + '\n' +
            '🕐 *Heure:* ' + heureStr + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '👤 *CLIENT*\n' +
            '   Prénom: ' + data.prenom + '\n' +
            '   Nom: ' + data.nom + '\n' +
            '   Nationalité: ' + data.nationalite + '\n' +
            '   Pays: ' + data.pays + '\n' +
            '   Ville: ' + data.ville + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '📞 *CONTACT*\n' +
            '   WhatsApp: ' + data.telephone + '\n' +
            '   Email: ' + data.email + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '📦 *COMMANDE*\n' +
            '   Version: ' + versionLabel + '\n' +
            '   Actifs: ' + (data.actifs || 'Non précisé') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '📝 *STRATÉGIE*\n' +
            data.description + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '✅ Demande envoyée depuis le site SR Bot';

        var waLink = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

        // Enregistre la demande
        setLastSubmit();
        saveDemand({
            email: data.email,
            telephone: data.telephone,
            date: Date.now(),
            ref: ref
        });

        // Ouvre WhatsApp
        window.open(waLink, '_blank');

        // Message de confirmation
        var msgs = {
            site: 'Votre demande <strong>Version Web</strong> est prête.<br>Cliquez sur <strong>Envoyer</strong> dans WhatsApp pour finaliser.<br><em>1 mois gratuit, ensuite 5$/mois.</em>',
            debug: 'Votre demande <strong>Application Android</strong> est prête.<br>Cliquez sur <strong>Envoyer</strong> dans WhatsApp pour finaliser.<br><em>Prix: 15$ + 5$/mois.</em>',
            perso: 'Votre demande <strong>Bot sur mesure</strong> est prête.<br>Cliquez sur <strong>Envoyer</strong> dans WhatsApp pour finaliser.<br><em>Prix: 150$ — 5 jours d\'essai gratuit.</em>'
        };
        showPopup(msgs[data.version] || 'Votre demande est prête. Cliquez sur Envoyer dans WhatsApp.', 'success');

        document.getElementById('registerForm').reset();
        formStartTime = Date.now(); // reset pour la prochaine fois
    }, totalDelay);
}

// Effacer erreur au focus
document.querySelectorAll('input, select, textarea').forEach(function(el) {
    el.addEventListener('focus', function() { this.classList.remove('error'); });
});

// Reset du chrono au chargement de la page
formStartTime = Date.now();

console.log('%c SR Bot v3.6 chargé ✅ — Protections actives', 'color:#00d4ff;font-weight:bold;font-size:14px');
