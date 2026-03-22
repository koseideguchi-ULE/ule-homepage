// Mobile Menu Toggle
function toggleMobileMenu() {
    const nav = document.getElementById('navMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (nav && toggle) {
        nav.classList.toggle('active');
        toggle.classList.toggle('active');
        // aria-label を開閉状態に合わせて更新
        const isOpen = nav.classList.contains('active');
        toggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    }
}

// Close mobile menu when clicking a link
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            const nav = document.getElementById('navMenu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (nav && toggle && nav.classList.contains('active')) {
                nav.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-label', 'メニューを開く');
            }
        });
    });
});

// Mobile Dropdown Toggle
document.addEventListener('DOMContentLoaded', function () {
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    dropdownToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                const dropdown = this.closest('.nav-dropdown');
                dropdown.classList.toggle('open');
                const isOpen = dropdown.classList.contains('open');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
                d.classList.remove('open');
                var toggle = d.querySelector('.nav-dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        }
    });
});

// Smooth Scrolling
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

// Header Scroll Effect
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (!header) return;

    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.background = '#ffffff';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
        header.style.background = '#ffffff';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
    }
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add fade-in animation to cards
const animatedCards = document.querySelectorAll('.service-card, .feature-card, .pricing-card');
if (animatedCards.length > 0) {
    animatedCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Parallax Effect for Glow Orbs
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const glowOrbs = document.querySelectorAll('.glow-orb');

    glowOrbs.forEach((orb, index) => {
        const speed = 0.5 + (index * 0.1);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// XSS対策: HTMLエンティティをエスケープする関数
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Contact Form Submission with Google Sheets Integration
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        let lastSubmitTime = 0;

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const feedbackEl = document.getElementById('formFeedback');
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;

            // レート制限: 60秒以内の再送信をブロック
            const now = Date.now();
            if (now - lastSubmitTime < 60000) {
                const remaining = Math.ceil((60000 - (now - lastSubmitTime)) / 1000);
                feedbackEl.textContent = `⚠️ 送信間隔が短すぎます。${remaining}秒後に再度お試しください。`;
                feedbackEl.className = 'error';
                feedbackEl.style.display = 'block';
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            // Get form data (入力値をサニタイズ)
            const formData = new FormData(contactForm);
            const data = {
                timestamp: new Date().toLocaleString('ja-JP'),
                company: escapeHtml(formData.get('company')),
                name: escapeHtml(formData.get('name')),
                email: escapeHtml(formData.get('email')),
                phone: escapeHtml(formData.get('phone') || '未入力'),
                inquiryType: escapeHtml(formData.get('inquiry-type')),
                message: escapeHtml(formData.get('message'))
            };

            // IMPORTANT: Replace this URL with your Google Apps Script deployment URL
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH8ACpsewgEp-LcJZUKwJc2-sSyknodGEUCT8iZP1LPmBmr0dtEU7KPOXn-g4V92-n/exec';

            if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                // Show error if script URL not configured
                feedbackEl.textContent = '⚠️ フォームの設定が完了していません。管理者にお問い合わせください。';
                feedbackEl.className = 'error';
                feedbackEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                return;
            }

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                // 送信成功時刻を記録
                lastSubmitTime = Date.now();

                // Show success message
                feedbackEl.textContent = '✓ お問い合わせを受け付けました。2営業日以内にご連絡いたします。';
                feedbackEl.className = 'success';
                feedbackEl.style.display = 'block';

                // Reset form
                contactForm.reset();

                // Scroll to feedback message
                feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error('Form submission error:', error);
                feedbackEl.textContent = '✗ 送信に失敗しました。お手数ですが、メール(kaori.deguchi@unlimitedenergy.co.jp)または電話(090-2013-3301)にて直接ご連絡ください。';
                feedbackEl.className = 'error';
                feedbackEl.style.display = 'block';
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

// Add cursor glow effect (desktop only, モーション設定を尊重)
const createCursorGlow = () => {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.style.cssText = `
        position: fixed;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 217, 255, 0.1), transparent);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9999;
        mix-blend-mode: screen;
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorGlow);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    const animateCursor = () => {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.1;
        cursorY += dy * 0.1;

        cursorGlow.style.left = cursorX + 'px';
        cursorGlow.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    };

    animateCursor();
};

// Initialize cursor glow on desktop only (prefers-reduced-motion を尊重)
if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    createCursorGlow();
}

// FAQ Accordion
document.addEventListener('DOMContentLoaded', function () {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(function (question) {
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.setAttribute('aria-expanded', 'false');

        question.addEventListener('click', function () {
            const item = this.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.faq-item.active').forEach(function (activeItem) {
                activeItem.classList.remove('active');
                activeItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });

        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
