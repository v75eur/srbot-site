// ============================================================
// SR Bot - app.js - v3.2
// Formulaire → WhatsApp structuré (gratuit, sans backend)
// ============================================================

// --- CONFIG ---
const WHATSAPP_NUMBER = '22960315458'; // Ton numéro Bénin (sans le +)

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
    var icons = { success: '✅', error: '❌', info: 'ℹ️' };
    var titles = { success: 'Demande envoyée', error: 'Erreur', info: 'Information' };
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

// --- FORM SUBMIT → WHATSAPP ---
document.getElementById('registerForm') && document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Collecte
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
        actifs: document.getElementById('actifs').value.trim()
    };

    // Validation
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

    // Bouton en chargement
    var btn = document.getElementById('submitBtn');
    var btnText = document.getElementById('btnText');
    var btnLoader = document.getElementById('btnLoader');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    // ============================================================
    // CONSTRUCTION DU MESSAGE STRUCTURÉ
    // ============================================================
    var versions = {
        site: 'Version Web (5$/mois)',
        debug: 'Application Android (15$ + 5$/mois)',
        perso: 'Bot sur mesure (150$)'
    };
    var versionLabel = versions[data.version] || data.version;

    // Date et heure au format lisible (fuseau local du visiteur)
    var now = new Date();
    var dateStr = now.toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    var heureStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    // Numéro de référence unique (basé sur le timestamp)
    var ref = 'SRB-' + now.getFullYear() +
              String(now.getMonth() + 1).padStart(2, '0') +
              String(now.getDate()).padStart(2, '0') + '-' +
              String(now.getHours()).padStart(2, '0') +
              String(now.getMinutes()).padStart(2, '0') +
              String(now.getSeconds()).padStart(2, '0');

    // Message WhatsApp bien structuré
    var message =
        '🤖 *NOUVELLE DEMANDE SR BOT*\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '🆔 *Réf:* ' + ref + '\n' +
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

    // Petite pause pour montrer le loader, puis redirection WhatsApp
    setTimeout(function() {
        btn.disabled = false;
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';

        // Ouvre WhatsApp avec le message pré-rempli
        window.open(waLink, '_blank');

        // Message de confirmation
        var msgs = {
            site: 'Votre demande <strong>Version Web</strong> est prête.<br>Cliquez sur <strong>Envoyer</strong> dans WhatsApp pour finaliser.<br><em>1 mois gratuit, ensuite 5$/mois.</em>',
            debug: 'Votre demande <strong>Application Android</strong> est prête.<br>Cliquez sur <strong>Envoyer</strong> dans WhatsApp pour finaliser.<br><em>Prix: 15$ + 5$/mois.</em>',
            perso: 'Votre demande <strong>Bot sur mesure</strong> est prête.<br>Cliquez sur <strong>Envoyer</strong> dans WhatsApp pour finaliser.<br><em>Prix: 150$ — 5 jours d\'essai gratuit.</em>'
        };
        showPopup(msgs[data.version] || 'Votre demande est prête. Cliquez sur Envoyer dans WhatsApp.', 'success');

        // Réinitialise le formulaire
        document.getElementById('registerForm').reset();
    }, 600);
});

// Effacer erreur au focus
document.querySelectorAll('input, select, textarea').forEach(function(el) {
    el.addEventListener('focus', function() { this.classList.remove('error'); });
});

console.log('%c SR Bot v3.2 chargé ✅ — WhatsApp: +' + WHATSAPP_NUMBER, 'color:#00d4ff;font-weight:bold;font-size:14px');
