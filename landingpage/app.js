// Zyvo CRM Landing Page Interactivity
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    // Close drawer when clicking any link
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

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
  });

  // Re-run lucide icons if loaded
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
