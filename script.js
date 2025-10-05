// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const articleForm = document.getElementById('articleForm');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const closeModal = document.querySelector('#previewModal .close');
// Signup modal elements
const signupLink = document.getElementById('signupLink');
const signupModal = document.getElementById('signupModal');
const signupClose = document.getElementById('signupClose');
const signupForm = document.getElementById('signupForm');
const logoutLink = document.getElementById('logoutLink');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(102, 126, 234, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        navbar.style.backdropFilter = 'none';
    }
});

// Auth helpers
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; }
}

function filterArticlesByCategory(category) {
    const articles = (JSON.parse(localStorage.getItem('articles') || '[]')).filter(a => a.status === 'approved' && (a.category || '').toLowerCase() === category.toLowerCase());
    const articlesGrid = document.querySelector('.articles-grid');
    if (!articlesGrid) return;
    const existing = articlesGrid.querySelectorAll('.article-card');
    existing.forEach((el) => { if (!el.classList.contains('featured')) el.remove(); });
    articles.slice(0, 6).forEach(a => articlesGrid.appendChild(createArticleCard(a)));
}

// Signup modal logic
if (signupLink) {
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (signupModal) {
            signupModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    });
}
if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        showNotification('Çıkış yapıldı.', 'info');
        logoutLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'inline';
    });
}
if (signupClose) {
    signupClose.addEventListener('click', () => {
        signupModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}
if (signupModal) {
    window.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = {
            username: document.getElementById('su_username').value.trim(),
            password: document.getElementById('su_password').value,
            age: parseInt(document.getElementById('su_age').value, 10),
            gender: document.getElementById('su_gender').value
        };
        if (!user.username || !user.password || !user.age || !user.gender) {
            showNotification('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.username === user.username)) {
            showNotification('Bu kullanıcı adı zaten alınmış.', 'error');
            return;
        }
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify({ username: user.username }));
        showNotification('Kayıt başarılı! Hoş geldiniz, ' + user.username, 'success');
        signupModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (logoutLink) logoutLink.style.display = 'inline';
        if (signupLink) signupLink.style.display = 'none';
    });
}

// Rich Text Editor Functions
const editorButtons = document.querySelectorAll('.toolbar-btn');
const contentEditor = document.getElementById('content');

editorButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const command = button.getAttribute('data-command');
        document.execCommand(command, false, null);
        contentEditor.focus();
    });
});

// Form Validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.title.trim()) {
        errors.push('Başlık alanı zorunludur.');
    }
    
    if (!formData.category) {
        errors.push('Kategori seçimi zorunludur.');
    }
    
    if (!formData.author.trim()) {
        errors.push('Yazar adı zorunludur.');
    }
    
    if (!formData.excerpt.trim()) {
        errors.push('Özet alanı zorunludur.');
    }
    
    if (!contentEditor.textContent.trim()) {
        errors.push('İçerik alanı zorunludur.');
    }
    
    return errors;
}

// Preview Function
if (previewBtn) previewBtn.addEventListener('click', () => {
    const formData = new FormData(articleForm);
    const imageFileInput = document.getElementById('imageFile');
    let imageDataUrl = '';
    if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
        const file = imageFileInput.files[0];
        // Convert to Data URL synchronously via FileReader in a blocking way using Promise
        const toDataUrl = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        // Note: we cannot await inside event without async; switching to async handler would be bigger change.
        // Instead, we handle below by setTimeout after read completes.
    }
    const title = formData.get('title');
    const category = formData.get('category');
    const author = formData.get('author');
    const excerpt = formData.get('excerpt');
    const content = contentEditor.innerHTML;
    let imageUrl = formData.get('image');
    const fileElPrev = document.getElementById('imageFile');
    if (fileElPrev && fileElPrev.files && fileElPrev.files[0]) {
        const file = fileElPrev.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            imageUrl = reader.result;
            renderPreview();
        };
        reader.onerror = renderPreview;
        reader.readAsDataURL(file);
        return;
    }

    function renderPreview() {
    
    const errors = validateForm({
        title, category, author, excerpt, content
    });
    
    if (errors.length > 0) {
        alert('Lütfen aşağıdaki alanları doldurun:\n' + errors.join('\n'));
        return;
    }
    
    // Create preview content
    const previewHTML = `
        <div class="preview-article">
            ${imageUrl ? `<div class="preview-image">
                <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px;">
            </div>` : ''}
            <div class="preview-header">
                <span class="preview-category" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                    ${category}
                </span>
                <h1 style="font-size: 2rem; color: #2d3748; margin: 1rem 0;">${title}</h1>
                <div class="preview-meta" style="display: flex; gap: 1rem; margin-bottom: 1rem; color: #718096; font-size: 0.9rem;">
                    <span><i class="fas fa-user"></i> ${author}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('tr-TR')}</span>
                </div>
            </div>
            <div class="preview-excerpt" style="background: #f7fafc; padding: 1rem; border-radius: 10px; margin-bottom: 2rem; border-left: 4px solid #667eea;">
                <h3 style="color: #2d3748; margin-bottom: 0.5rem;">Özet</h3>
                <p style="color: #718096; line-height: 1.6;">${excerpt}</p>
            </div>
            <div class="preview-content" style="line-height: 1.8; color: #2d3748;">
                ${content}
            </div>
        </div>
    `;
    
    if (previewContent) previewContent.innerHTML = previewHTML;
    if (previewModal) previewModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    }
});

// Close Modal
if (closeModal && previewModal) {
    closeModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (previewModal && e.target === previewModal) {
        previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Form Submission
if (articleForm) articleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(articleForm);
    function buildAndSaveArticle(imageOverride) {
        const articleData = {
            title: formData.get('title'),
            category: formData.get('category'),
            author: formData.get('author'),
            excerpt: formData.get('excerpt'),
            content: contentEditor.innerHTML,
            image: imageOverride || formData.get('image'),
            date: new Date().toISOString(),
            id: Date.now(),
            status: 'pending'
        };
        const errors = validateForm(articleData);
        if (errors.length > 0) {
            alert('Lütfen aşağıdaki alanları doldurun:\n' + errors.join('\n'));
            return;
        }
        saveArticle(articleData);
        showNotification('Yazınız moderatör onayına gönderildi!', 'success');
        articleForm.reset();
        contentEditor.innerHTML = '';
        document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
    }
    
    // If a file is selected, read it and then save. Otherwise, save directly
    const fileEl = document.getElementById('imageFile');
    if (fileEl && fileEl.files && fileEl.files[0]) {
        const reader = new FileReader();
        reader.onload = () => buildAndSaveArticle(reader.result);
        reader.onerror = () => buildAndSaveArticle('');
        reader.readAsDataURL(fileEl.files[0]);
    } else {
        buildAndSaveArticle('');
    }
});

// Save Article Function (simulated)
function saveArticle(articleData) {
    // Moderation: store as pending; homepage shows only approved
    let articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles.unshift(articleData); // Add to beginning
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Do not refresh list here
}

// Load Articles from localStorage
function loadArticles() {
    const articles = (JSON.parse(localStorage.getItem('articles') || '[]')).filter(a => a.status === 'approved');
    const articlesGrid = document.querySelector('.articles-grid');
    const showMoreBtn = document.getElementById('showMoreBtn');
    
    if (articlesGrid && articles.length > 0) {
        // Clear existing articles (except the first 3 which are static)
        const existingArticles = articlesGrid.querySelectorAll('.article-card:not(.featured)');
        existingArticles.forEach(article => article.remove());
        
        // Add new articles with pagination (3 by 3)
        const initial = 3;
        let nextIndex = 0;
        const appendBatch = (count) => {
            const batch = articles.slice(nextIndex, nextIndex + count);
            batch.forEach((article) => {
                const articleCard = createArticleCard(article);
                articlesGrid.appendChild(articleCard);
            });
            nextIndex += batch.length;
        };
        appendBatch(initial);

        if (showMoreBtn) {
            showMoreBtn.style.display = nextIndex < articles.length ? 'inline-flex' : 'none';
            showMoreBtn.onclick = () => {
                appendBatch(3);
                if (nextIndex >= articles.length) showMoreBtn.style.display = 'none';
            };
        }
    }
}

// Create Article Card Element
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    
    card.innerHTML = `
        <div class="article-image">
            ${article.image ? `<img src="${article.image}" alt="${article.title}">` : 
              `<div style="background: linear-gradient(135deg, #667eea, #764ba2); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;"><i class="fas fa-newspaper"></i></div>`}
            <div class="article-category">${article.category}</div>
        </div>
        <div class="article-content">
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <div class="article-meta">
                <span class="author" style="display:none;"></span>
                <span class="date">
                    <i class="fas fa-calendar"></i>
                    ${new Date(article.date).toLocaleDateString('tr-TR')}
                </span>
                <span class="views"><i class="fas fa-eye"></i> ${parseInt(article.views || 0, 10)}</span>
            </div>
            <a href="#" class="read-more" onclick="showFullArticle(${article.id})">Devamını Oku <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
    
    return card;
}

// Show Full Article
function showFullArticle(articleId) {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const article = articles.find(a => a.id === articleId);
    
    if (article) {
        // increment views
        article.views = parseInt(article.views || 0, 10) + 1;
        localStorage.setItem('articles', JSON.stringify(articles));

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        let comments = JSON.parse(localStorage.getItem('comments_'+article.id) || '[]');
        comments.sort((a,b) => new Date(b.date) - new Date(a.date));
        const user = getCurrentUser();
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${article.title}</h3>
                    <span class="close" onclick="this.closest('.modal').remove(); document.body.style.overflow = 'auto';">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1rem;">
                        <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                            ${article.category}
                        </span>
                    </div>
                    <div style="margin-bottom: 1rem; color: #718096;">
                        
                        <i class="fas fa-calendar"></i> ${new Date(article.date).toLocaleDateString('tr-TR')}
                    </div>
                    <div style="line-height: 1.8; color: #2d3748;">
                        ${article.content}
                    </div>
                    <hr style="margin: 1.5rem 0;"/>
                    <h4 style="margin-bottom: 0.75rem; color:#2d3748;">Yorumlar</h4>
                    <div id="comments_list_${article.id}" style="display:flex; flex-direction:column; gap:10px; margin-bottom:1rem;">
                        ${comments.map((c, idx) => `
                            <div data-idx=\"${idx}\" style=\"background:#f7fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;\">
                                <div style=\"display:flex;align-items:center;gap:6px;justify-content:space-between;\">
                                    <div style=\"font-weight:600;color:#4a5568;\"><i class=\"fas fa-user\"></i> ${c.username} <span style=\"color:#a0aec0;font-weight:400;\">${new Date(c.date).toLocaleString('tr-TR')}</span></div>
                                    <div>
                                        <button class=\"btn-like\" style=\"border:none;background:#e2e8f0;padding:4px 8px;border-radius:6px;cursor:pointer;\"><i class=\"fas fa-thumbs-up\"></i> <span>${parseInt(c.likes||0,10)}</span></button>
                                        <button class=\"btn-del\" style=\"border:none;background:#fecaca;padding:4px 8px;border-radius:6px;cursor:pointer;\"><i class=\"fas fa-trash\"></i></button>
                                    </div>
                                </div>
                                <div style=\"color:#2d3748;line-height:1.6;margin-top:6px;\">${c.text}</div>
                            </div>
                        `).join('')}
                    </div>
                    ${user ? `
                    <form id=\"comment_form_${article.id}\" class=\"contact-form\" style=\"margin-top:0.5rem;\">
                        <div class=\"form-group\"><textarea id=\"comment_text_${article.id}\" placeholder=\"Yorum yazın...\" rows=\"3\" required></textarea></div>
                        <button type=\"submit\" class=\"btn btn-primary\">Gönder</button>
                    </form>` : `
                    <div style=\"background:#fff3cd;color:#856404;border:1px solid #ffeeba;border-radius:8px;padding:10px;\">Yorum yazmak için lütfen <a href=\"#\" id=\"open_signup_from_comments\">üye olun</a>.</div>`}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Hook signup link in comment notice
        const openSignup = modal.querySelector('#open_signup_from_comments');
        if (openSignup) {
            openSignup.addEventListener('click', (e) => {
                e.preventDefault();
                modal.remove();
                if (signupLink) signupLink.click();
            });
        }

        // Like/Delete handlers
        const listWrap = modal.querySelector(`#comments_list_${article.id}`);
        if (listWrap) {
            listWrap.addEventListener('click', (e) => {
                const item = e.target.closest('[data-idx]');
                if (!item) return;
                const idx = parseInt(item.getAttribute('data-idx'), 10);
                if (e.target.closest('.btn-like')) {
                    comments[idx].likes = parseInt(comments[idx].likes || 0, 10) + 1;
                    localStorage.setItem('comments_'+article.id, JSON.stringify(comments));
                    item.querySelector('.btn-like span').textContent = String(comments[idx].likes);
                }
                if (e.target.closest('.btn-del')) {
                    const currentUser = getCurrentUser();
                    if (!currentUser) { showNotification('Silmek için giriş yapın.', 'error'); return; }
                    if (currentUser.username !== comments[idx].username && localStorage.getItem('isAdmin') !== 'true') {
                        showNotification('Yalnızca yorum sahibi veya admin silebilir.', 'error');
                        return;
                    }
                    comments.splice(idx,1);
                    localStorage.setItem('comments_'+article.id, JSON.stringify(comments));
                    item.remove();
                }
            });
        }

        // Comment submission
        const form = modal.querySelector(`#comment_form_${article.id}`);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = modal.querySelector(`#comment_text_${article.id}`).value.trim();
                if (!text) return;
                const currentUser = getCurrentUser();
                if (!currentUser) { showNotification('Lütfen üye olun.', 'error'); return; }
                const key = 'comments_'+article.id;
                const existing = JSON.parse(localStorage.getItem(key) || '[]');
                existing.push({ username: currentUser.username, text, date: new Date().toISOString(), likes: 0 });
                existing.sort((a,b) => new Date(b.date) - new Date(a.date));
                localStorage.setItem(key, JSON.stringify(existing));
                const list = modal.querySelector(`#comments_list_${article.id}`);
                const item = document.createElement('div');
                item.style.cssText = 'background:#f7fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px;';
                item.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;"><div style="font-weight:600;color:#4a5568;"><i class="fas fa-user"></i> ${currentUser.username} <span style="color:#a0aec0;font-weight:400;">${new Date().toLocaleString('tr-TR')}</span></div><div><button class=\"btn-like\" style=\"border:none;background:#e2e8f0;padding:4px 8px;border-radius:6px;cursor:pointer;\"><i class=\"fas fa-thumbs-up\"></i> <span>0</span></button> <button class=\"btn-del\" style=\"border:none;background:#fecaca;padding:4px 8px;border-radius:6px;cursor:pointer;\"><i class=\"fas fa-trash\"></i></button></div></div><div style="color:#2d3748;line-height:1.6;margin-top:6px;">${text}</div>`;
                list.prepend(item);
                form.reset();
                showNotification('Yorum gönderildi', 'success');
            });
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Contact Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
        contactForm.reset();
    });
}

// Newsletter Form Submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        // Simulate newsletter subscription
        let subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
            showNotification('Başarıyla abone oldunuz!', 'success');
        } else {
            showNotification('Bu e-posta adresi zaten abone.', 'info');
        }
        
        newsletterForm.reset();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Load saved articles
    loadArticles();
    
    // Observe elements for scroll animations
    document.querySelectorAll('.article-card, .about-content, .contact-content').forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });
    
    // Add loading animation to sections
    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);

    // Init auth UI state
    const user = getCurrentUser();
    if (user) {
        if (logoutLink) logoutLink.style.display = 'inline';
        if (signupLink) signupLink.style.display = 'none';
    }

    // Category filtering by URL param
    const params = new URLSearchParams(window.location.search);
    const kategori = params.get('kategori');
    if (kategori) {
        filterArticlesByCategory(kategori);
    }

    // Site visit counter
    const visits = parseInt(localStorage.getItem('siteVisitCount') || '0', 10) + 1;
    localStorage.setItem('siteVisitCount', String(visits));
    const visitEl = document.getElementById('siteVisitCount');
    if (visitEl) visitEl.textContent = String(visits);

    // Admin login handling
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPanel = document.getElementById('adminPanel');
    const adminLogin = document.getElementById('adminLogin');
    if (localStorage.getItem('isAdmin') === 'true') {
        if (adminPanel) adminPanel.style.display = 'block';
        if (adminLogin) adminLogin.style.display = 'none';
        renderPending();
    }
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('adminUser').value.trim();
            const p = document.getElementById('adminPass').value;
            if (u === 'SelimokuR' && p === 'Beşiktaş1903+') {
                localStorage.setItem('isAdmin', 'true');
                if (adminPanel) adminPanel.style.display = 'block';
                if (adminLogin) adminLogin.style.display = 'none';
                renderPending();
                showNotification('Admin girişi başarılı', 'success');
            } else {
                showNotification('Hatalı admin bilgileriniz.', 'error');
            }
        });
    }
});

// Admin: render and approve/reject pending posts
function renderPending() {
    const listEl = document.getElementById('pendingList');
    if (!listEl) return;
    const all = JSON.parse(localStorage.getItem('articles') || '[]');
    const pending = all.filter(a => a.status !== 'approved');
    if (pending.length === 0) {
        listEl.innerHTML = '<p>Bekleyen yazı yok.</p>';
        return;
    }
    listEl.innerHTML = pending.map(a => `
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${a.title}</strong>
                <span style="color:#718096;">${new Date(a.date).toLocaleString('tr-TR')}</span>
            </div>
            <div style="color:#4a5568;margin:6px 0;">${a.excerpt}</div>
            <div style="display:flex;gap:8px;">
                <button class="btn-approve" data-id="${a.id}" style="border:none;background:#bbf7d0;padding:6px 10px;border-radius:6px;cursor:pointer;">Onayla</button>
                <button class="btn-edit" data-id="${a.id}" style="border:none;background:#dbeafe;padding:6px 10px;border-radius:6px;cursor:pointer;">Düzenle</button>
                <button class="btn-reject" data-id="${a.id}" style="border:none;background:#fecaca;padding:6px 10px;border-radius:6px;cursor:pointer;">Sil</button>
            </div>
        </div>
    `).join('');
    listEl.onclick = (e) => {
        const approve = e.target.closest('.btn-approve');
        const edit = e.target.closest('.btn-edit');
        const reject = e.target.closest('.btn-reject');
        if (!approve && !reject && !edit) return;
        let all = JSON.parse(localStorage.getItem('articles') || '[]');
        const id = parseInt((approve || reject || edit).getAttribute('data-id'), 10);
        if (approve) {
            all = all.map(a => a.id === id ? { ...a, status: 'approved' } : a);
            localStorage.setItem('articles', JSON.stringify(all));
            showNotification('Yazı onaylandı.', 'success');
        }
        if (edit) {
            const a = all.find(x => x.id === id);
            if (!a) return;
            const newTitle = prompt('Başlık', a.title);
            const newExcerpt = prompt('Özet', a.excerpt);
            const newCategory = prompt('Kategori', a.category);
            a.title = newTitle ?? a.title;
            a.excerpt = newExcerpt ?? a.excerpt;
            a.category = newCategory ?? a.category;
            localStorage.setItem('articles', JSON.stringify(all));
            showNotification('Yazı güncellendi.', 'success');
        }
        if (reject) {
            all = all.filter(a => a.id !== id);
            localStorage.setItem('articles', JSON.stringify(all));
            showNotification('Yazı silindi.', 'info');
        }
        renderPending();
        loadArticles();
    };
}

// Search functionality (if needed in future)
function searchArticles(query) {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    return articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase())
    );
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save draft
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const formData = new FormData(articleForm);
        const draft = {
            title: formData.get('title'),
            category: formData.get('category'),
            author: formData.get('author'),
            excerpt: formData.get('excerpt'),
            content: contentEditor.innerHTML,
            image: formData.get('image'),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('articleDraft', JSON.stringify(draft));
        showNotification('Taslak kaydedildi!', 'success');
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (articleForm.contains(document.activeElement)) {
            e.preventDefault();
            articleForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-save draft every 30 seconds
setInterval(() => {
    if (articleForm && document.querySelector('#title').value) {
        const formData = new FormData(articleForm);
        const draft = {
            title: formData.get('title'),
            category: formData.get('category'),
            author: formData.get('author'),
            excerpt: formData.get('excerpt'),
            content: contentEditor.innerHTML,
            image: formData.get('image'),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('articleDraft', JSON.stringify(draft));
    }
}, 30000);

// Load draft on page load
document.addEventListener('DOMContentLoaded', () => {
    const draft = JSON.parse(localStorage.getItem('articleDraft') || 'null');
    if (draft && draft.title) {
        if (confirm('Kaydedilmemiş bir taslağınız var. Yüklemek ister misiniz?')) {
            document.querySelector('#title').value = draft.title || '';
            document.querySelector('#category').value = draft.category || '';
            document.querySelector('#author').value = draft.author || '';
            document.querySelector('#excerpt').value = draft.excerpt || '';
            contentEditor.innerHTML = draft.content || '';
            document.querySelector('#image').value = draft.image || '';
        }
    }
});
