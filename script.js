// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const articleForm = document.getElementById('articleForm');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const closeModal = document.querySelector('.close');

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
previewBtn.addEventListener('click', () => {
    const formData = new FormData(articleForm);
    const title = formData.get('title');
    const category = formData.get('category');
    const author = formData.get('author');
    const excerpt = formData.get('excerpt');
    const content = contentEditor.innerHTML;
    const imageUrl = formData.get('image');
    
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
    
    previewContent.innerHTML = previewHTML;
    previewModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

// Close Modal
closeModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Form Submission
articleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(articleForm);
    const articleData = {
        title: formData.get('title'),
        category: formData.get('category'),
        author: formData.get('author'),
        excerpt: formData.get('excerpt'),
        content: contentEditor.innerHTML,
        image: formData.get('image'),
        date: new Date().toISOString(),
        id: Date.now()
    };
    
    const errors = validateForm(articleData);
    
    if (errors.length > 0) {
        alert('Lütfen aşağıdaki alanları doldurun:\n' + errors.join('\n'));
        return;
    }
    
    // Simulate saving article (in real app, this would save to database)
    saveArticle(articleData);
    
    // Show success message
    showNotification('Yazınız başarıyla kaydedildi!', 'success');
    
    // Reset form
    articleForm.reset();
    contentEditor.innerHTML = '';
    
    // Scroll to articles section
    document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
});

// Save Article Function (simulated)
function saveArticle(articleData) {
    // In a real application, this would save to a database
    // For now, we'll just store it in localStorage for demonstration
    let articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles.unshift(articleData); // Add to beginning
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Refresh articles display
    loadArticles();
}

// Load Articles from localStorage
function loadArticles() {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const articlesGrid = document.querySelector('.articles-grid');
    
    if (articles.length > 0) {
        // Clear existing articles (except the first 3 which are static)
        const existingArticles = articlesGrid.querySelectorAll('.article-card:not(.featured)');
        existingArticles.forEach(article => article.remove());
        
        // Add new articles
        articles.slice(0, 3).forEach((article, index) => {
            const articleCard = createArticleCard(article);
            articlesGrid.appendChild(articleCard);
        });
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
                <span class="author">
                    <i class="fas fa-user"></i>
                    ${article.author}
                </span>
                <span class="date">
                    <i class="fas fa-calendar"></i>
                    ${new Date(article.date).toLocaleDateString('tr-TR')}
                </span>
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
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
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
                        <i class="fas fa-user"></i> ${article.author} | 
                        <i class="fas fa-calendar"></i> ${new Date(article.date).toLocaleDateString('tr-TR')}
                    </div>
                    <div style="line-height: 1.8; color: #2d3748;">
                        ${article.content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
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
});

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
