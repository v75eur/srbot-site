// ============================================================
// SR Bot - app.js - v5.0
// ============================================================

const WHATSAPP_NUMBER = '22960315458';
const COOLDOWN_MS = 15 * 60 * 1000;
const MIN_FILL_TIME_MS = 10 * 1000;
const DELAY_MIN_MS = 2000;
const DELAY_MAX_MS = 8000;
const DUP_WINDOW_MS = 24 * 60 * 60 * 1000;

var formStartTime = Date.now();

// SCROLL PROGRESS
window.addEventListener('scroll', function() {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('scrollProgress').style.width = scrolled + '%';
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
});

// REVEAL
const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

// ACTIVE NAV
function updateActiveNav() {
    const sections = ['accueil', 'strategie', 'offres', 'formation', 'exemples', 'avis', 'commander'];
    let current = 'accueil';
    sections.forEach(function(id) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    document.querySelectorAll('.nav-item').forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
}

// MOBILE MENU
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle && menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    menuToggle.innerHTML = navLinks.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});
document.addEventListener('click', function(e) {
    if (navLinks && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// SMOOTH SCROLL
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

// STAT COUNTER
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
document.querySelectorAll('.stat-number[data-target]').forEach(function(el) { statObserver.observe(el); });

// LIGHTBOX
var lightbox = null;
document.querySelectorAll('.screenshot-item').forEach(function(item) {
    item.addEventListener('click', function() {
        var img = item.querySelector('img');
        if (!img) return;
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = '<button class="lightbox-close" aria-label="Fermer">&times;</button><img alt="Screenshot">';
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
function closeLightbox() { lightbox && lightbox.classList.remove('show'); document.body.style.overflow = ''; }

// POPUP
var popup = document.getElementById('popup');
var popupMessage = document.getElementById('popup-message');
function showPopup(msg, type) {
    type = type || 'success';
    var icons = { success: '✅', error: '❌', info: '⏳' };
    var titles = { success: 'Demande envoyée', error: 'Erreur', info: 'Merci de patienter' };
    popupMessage.innerHTML = '<div class="popup-icon">' + icons[type] + '</div><h3>' + titles[type] + '</h3><p>' + msg + '</p><button class="popup-btn" onclick="closePopup()">Fermer</button>';
    popup.classList.add('show');
}
function closePopup() { popup && popup.classList.remove('show'); }
document.querySelector('.popup-close') && document.querySelector('.popup-close').addEventListener('click', closePopup);
popup && popup.addEventListener('click', function(e) { if (e.target === this) closePopup(); });

// ========== FORMULAIRE INTELLIGENT ==========
var versionSelect = document.getElementById('version');
var strategyGroup = document.getElementById('strategyGroup');
var descriptionField = document.getElementById('description');

versionSelect && versionSelect.addEventListener('change', function() {
    if (this.value === 'perso') {
        strategyGroup.style.display = 'flex';
        descriptionField.required = true;
    } else {
        strategyGroup.style.display = 'none';
        descriptionField.required = false;
        descriptionField.classList.remove('error');
    }
});

// UTILITAIRES
function getRecentDemands() {
    try { return JSON.parse(localStorage.getItem('srbot_demands') || '[]'); } catch (e) { return []; }
}
function saveDemand(demand) {
    var list = getRecentDemands();
    list.push(demand);
    var cutoff = Date.now() - DUP_WINDOW_MS;
    list = list.filter(function(d) { return d.date > cutoff; });
    try { localStorage.setItem('srbot_demands', JSON.stringify(list)); } catch (e) {}
}
function getLastSubmit() { try { return parseInt(localStorage.getItem('srbot_last_submit') || '0'); } catch (e) { return 0; } }
function setLastSubmit() { try { localStorage.setItem('srbot_last_submit', Date.now().toString()); } catch (e) {} }
function getRecentCountLastHour() {
    var list = getRecentDemands();
    var cutoff = Date.now() - 60 * 60 * 1000;
    return list.filter(function(d) { return d.date > cutoff; }).length;
}

// SUBMIT
document.getElementById('registerForm') && document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Honeypot
    var honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') { console.warn('Bot'); return; }

    // Temps de remplissage
    if (Date.now() - formStartTime < MIN_FILL_TIME_MS) {
        showPopup('Merci de prendre le temps de vérifier vos informations.', 'info');
        return;
    }

    // Cooldown
    var lastSubmit = getLastSubmit();
    var now = Date.now();
    if (lastSubmit && (now - lastSubmit) < COOLDOWN_MS) {
        var remaining = Math.ceil((COOLDOWN_MS - (now - lastSubmit)) / 1000);
        var min = Math.floor(remaining / 60);
        var sec = remaining % 60;
        var timeStr = (min > 0 ? min + ' min ' : '') + sec + ' sec';
        showPopup('Vous avez déjà envoyé une demande récemment.<br><br>Prochaine demande dans <strong>' + timeStr + '</strong>.', 'info');
        return;
    }

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
        actifs: document.getElementById('actifs').value.trim(),
        consent: document.getElementById('consent').checked
    };

    // Validation
    var required = ['prenom', 'nom', 'telephone', 'nationalite', 'pays', 'ville', 'email', 'version'];
    if (data.version === 'perso') required.push('description');
    var hasError = false;
    required.forEach(function(k) {
        var el = document.getElementById(k);
        el.classList.toggle('error', !data[k]);
        if (!data[k]) hasError = true;
    });
    if (hasError) { showPopup('Veuillez remplir tous les champs obligatoires.', 'error'); return; }
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        document.getElementById('email').classList.add('error');
        showPopup('Adresse email invalide.', 'error'); return;
    }
    if (!data.consent) {
        showPopup('Veuillez accepter la transmission de vos informations.', 'error');
        return;
    }

    // Anti-doublon
    var recent = getRecentDemands();
    var isDuplicate = recent.some(function(d) {
        return d.email.toLowerCase() === data.email.toLowerCase() || d.telephone.replace(/\s/g,'') === data.telephone.replace(/\s/g,'');
    });
    if (isDuplicate) {
        popupMessage.innerHTML = '<div class="popup-icon">⚠️</div><h3>Demande déjà envoyée</h3><p>Vous avez déjà envoyé une demande avec cet email ou ce numéro dans les dernières 24h.<br><br>Voulez-vous vraiment en envoyer une nouvelle ?</p><button class="popup-btn" id="confirmDup">Oui, envoyer quand même</button><button class="popup-btn" style="background:rgba(255,255,255,.08);margin-left:8px" onclick="closePopup()">Non, annuler</button>';
        popup.classList.add('show');
        document.getElementById('confirmDup').addEventListener('click', function() { closePopup(); proceedToSend(data); });
        return;
    }

    proceedToSend(data);
});

// ENVOI
function proceedToSend(data) {
    var btn = document.getElementById('submitBtn');
    var btnText = document.getElementById('btnText');
    var btnLoader = document.getElementById('btnLoader');
    btn.disabled = true;
    btnText.style.display = 'none';

    var recentCount = getRecentCountLastHour();
    var dynamicExtra = recentCount * 1000;
    var baseDelay = DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
    var totalDelay = Math.min(baseDelay + dynamicExtra, 15000);

    var remainingSec = Math.ceil(totalDelay / 1000);
    btnLoader.style.display = 'flex';
    btnLoader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparation... (' + remainingSec + ' sec)';
    var countdownInterval = setInterval(function() {
        remainingSec--;
        if (remainingSec > 0) btnLoader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparation... (' + remainingSec + ' sec)';
    }, 1000);

    setTimeout(function() {
        clearInterval(countdownInterval);
        btn.disabled = false;
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';

        var versions = {
            site: 'Version Web (5$/mois)',
            debug: 'Application Android (15$ + 5$/mois)',
            perso: 'Bot sur mesure (150$)',
            formation: 'Formation Trading (100$ / 1 mois)'
        };
        var versionLabel = versions[data.version] || data.version;

        var now = new Date();
        var dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        var heureStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        var ref = 'SRB-' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '-' + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + String(now.getSeconds()).padStart(2,'0');
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
            (data.description ? '━━━━━━━━━━━━━━━━━━━━━━\n📝 *STRATÉGIE*\n' + data.description + '\n' : '') +
            '━━━━━━━━━━━━━━━━━━━━━━\n' +
            '✅ Demande envoyée depuis le site SR Bot';

        var waLink = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

        setLastSubmit();
        saveDemand({ email: data.email, telephone: data.telephone, date: Date.now(), ref: ref });

        window.open(waLink, '_blank');

        // ═══════════════════════════════════════════════
        // NOUVEAU MESSAGE : poli, rassurant, clair
        // ═══════════════════════════════════════════════
        var msgFinal = '✅ <strong>Merci pour votre confiance !</strong><br><br>' +
            'Vos informations ont bien été transmises et restent <strong>strictement confidentielles</strong>.<br><br>' +
            '🔒 Nous les utilisons <strong>uniquement</strong> pour :<br>' +
            '• Vous contacter sur WhatsApp<br>' +
            '• Créer votre profil personnel<br><br>' +
            '📱 <strong>Prochaine étape :</strong><br><br>' +
            'WhatsApp va s\\'ouvrir avec vos informations déjà remplies.<br><br>' +
            '👉 <strong>Cliquez sur le bouton d\\'envoi dans WhatsApp</strong> pour valider votre demande.<br><br>' +
            '📬 <strong>Vous recevrez ensuite :</strong><br>' +
            '• Votre identifiant personnel<br>' +
            '• Votre lien ntfy sécurisé<br>' +
            '• Un guide simple et clair pour recevoir vos alertes<br><br>' +
            '⏱️ Réponse sous <strong>5 jours</strong>.<br><br>' +
            '🙏 Merci de votre patience.';

        showPopup(msgFinal, 'success');

        document.getElementById('registerForm').reset();
        strategyGroup.style.display = 'none';
        formStartTime = Date.now();
    }, totalDelay);
}

// ========== QUIZ DE CONFIANCE ==========
function submitReview(type) {
    var message = type === 'satisfied'
        ? '😊 *AVIS CLIENT - SATISFAIT*\n\nJe suis satisfait de SR Bot !'
        : '😞 *AVIS CLIENT - INSATISFAIT*\n\nJe ne suis pas satisfait de SR Bot.';
    var waLink = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.open(waLink, '_blank');
    showPopup(type === 'satisfied' ? 'Merci pour votre retour positif !' : 'Merci pour votre retour. Nous allons nous améliorer.', 'success');
}

// Effacer erreur au focus
document.querySelectorAll('input, select, textarea').forEach(function(el) {
    el.addEventListener('focus', function() { this.classList.remove('error'); });
});

// ========== POPUP D'ACCUEIL ==========
(function welcomePopup() {
    var lastSeen = localStorage.getItem('srbot_welcome_seen');
    var now = Date.now();
    var oneDay = 24 * 60 * 60 * 1000;

    if (!lastSeen || (now - parseInt(lastSeen)) > oneDay) {
        setTimeout(function() {
            popupMessage.innerHTML =
                '<div class="popup-icon">🎁</div>' +
                '<h3>OFFRE SPÉCIALE !</h3>' +
                '<p>🎁 <strong>1er mois GRATUIT</strong> sur la Version Web<br>' +
                '⚡ <strong>5 jours GRATUITS</strong> sur le Bot sur mesure<br>' +
                '🎓 <strong>Formation</strong> pour débutant — 100$<br><br>' +
                '<em>Commencez GRATUITEMENT aujourd\\'hui !</em></p>' +
                '<button class="popup-btn" onclick="closePopup(); document.getElementById(\\'commander\\').scrollIntoView({behavior:\\'smooth\\'})">🎁 J\\'en profite</button>' +
                '<button class="popup-btn" style="background:rgba(255,255,255,.08);margin-top:.5rem" onclick="closePopup()">Plus tard</button>';
            popup.classList.add('show');
            localStorage.setItem('srbot_welcome_seen', now.toString());
        }, 5000);
    }
})();

console.log('%c SR Bot v5.0 chargé ✅', 'color:#00d4ff;font-weight:bold;font-size:14px');
