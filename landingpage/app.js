// Zyvo CRM Landing Page Interactivity
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer & Backdrop
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');

  const openDrawer = () => {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.add('open');
      mobileDrawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    }
  };

  const closeDrawer = () => {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.remove('open');
      mobileDrawerBackdrop.classList.remove('open');
      document.body.style.overflow = '';
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer?.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeDrawer);
  }

  if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', closeDrawer);
  }

  // Close drawer when clicking any link inside it
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });
  }

  // Close drawer on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 2. Billing Cadence Toggle (Monthly / Annual with 20% discount)
  const cadenceToggle = document.getElementById('cadenceToggle');
  const amountElements = document.querySelectorAll('.amount');
  const annualNotes = document.querySelectorAll('.annual-note');

  let isAnnual = false;

  if (cadenceToggle) {
    cadenceToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      cadenceToggle.classList.toggle('active', isAnnual);

      amountElements.forEach((el) => {
        const monthly = el.getAttribute('data-monthly');
        const annual = el.getAttribute('data-annual');
        el.textContent = isAnnual ? annual : monthly;
      });

      annualNotes.forEach((el) => {
        const annualText = el.getAttribute('data-annual-note');
        el.textContent = isAnnual ? annualText : 'Billed monthly';
      });
    });
  }

  // 3. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close other open accordions
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const otherAnswer = other.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle current
        if (isOpen) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 32 + 'px';
        }
      });
    }
  });

  // 4. Smooth Anchor Scroll with Fixed Header Offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 64;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Re-run lucide icons if loaded
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
