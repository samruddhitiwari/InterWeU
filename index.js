import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let supabase = null;

const track = (eventName, payload = {}) => {
  console.log(`[Analytics] ${eventName}`, payload);
};

const initSupabase = () => {
  const url = document.body.getAttribute('data-supabase-url');
  const key = document.body.getAttribute('data-supabase-key');
  
  if (url && key && url !== 'YOUR_SUPABASE_URL' && key !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
      supabase = createClient(url, key);
      console.log('Supabase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
    }
  } else {
    console.warn('Supabase credentials not configured. Lead capture will not work.');
  }
};

const showToast = (message, type = 'success') => {
  const container = document.getElementById('toastContainer');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type]}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  track('toast_shown', { message, type });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
};

const setupNavbar = () => {
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  const updateNavbar = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  };
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });
  
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          track('nav_link_clicked', { href });
        }
      }
    });
  });
};

const mockJobs = [
  {
    company: 'Google',
    role: 'Software Engineer Intern',
    ctc: '₹8 LPA',
    tags: ['Backend', 'Cloud', 'Go', 'Kubernetes']
  },
  {
    company: 'Microsoft',
    role: 'Product Manager Intern',
    ctc: '₹7.5 LPA',
    tags: ['Product', 'Azure', 'Analytics', 'Agile']
  },
  {
    company: 'Amazon',
    role: 'Full Stack Developer',
    ctc: '₹12 LPA',
    tags: ['React', 'Node.js', 'AWS', 'Microservices']
  },
  {
    company: 'Flipkart',
    role: 'Data Scientist',
    ctc: '₹10 LPA',
    tags: ['Python', 'ML', 'TensorFlow', 'Analytics']
  },
  {
    company: 'Atlassian',
    role: 'DevOps Engineer',
    ctc: '₹9 LPA',
    tags: ['CI/CD', 'Docker', 'Jenkins', 'Monitoring']
  }
];

let currentJobIndex = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;
let currentCard = null;

const createJobCard = (job) => {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.innerHTML = `
    <div class="company">${job.company}</div>
    <div class="role">${job.role}</div>
    <div class="ctc">${job.ctc}</div>
    <div class="tags">
      ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
    <div class="swipe-stamp like">APPLY</div>
    <div class="swipe-stamp nope">PASS</div>
  `;
  return card;
};

const setupSwipeDemo = () => {
  const cardStack = document.getElementById('cardStack');
  const passBtn = document.querySelector('.swipe-btn[data-action="pass"]');
  const applyBtn = document.querySelector('.swipe-btn[data-action="apply"]');
  
  if (!cardStack) return;
  
  const loadNextCard = () => {
    if (currentJobIndex >= mockJobs.length) {
      cardStack.innerHTML = '<div class="swipe-explainer" style="padding: 4rem 2rem; text-align: center;"><h3>No more jobs!</h3><p>Check back later for more opportunities.</p></div>';
      passBtn.disabled = true;
      applyBtn.disabled = true;
      return;
    }
    
    const job = mockJobs[currentJobIndex];
    const card = createJobCard(job);
    cardStack.innerHTML = '';
    cardStack.appendChild(card);
    currentCard = card;
    
    setupCardDrag(card);
    currentJobIndex++;
  };
  
  const setupCardDrag = (card) => {
    const handleDragStart = (e) => {
      isDragging = true;
      card.classList.add('swiping');
      startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      currentX = startX;
    };
    
    const handleDragMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const deltaX = x - startX;
      currentX = x;
      
      const rotation = deltaX * 0.1;
      card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      
      const likeStamp = card.querySelector('.swipe-stamp.like');
      const nopeStamp = card.querySelector('.swipe-stamp.nope');
      
      if (deltaX > 50) {
        likeStamp.classList.add('visible');
        nopeStamp.classList.remove('visible');
      } else if (deltaX < -50) {
        nopeStamp.classList.add('visible');
        likeStamp.classList.remove('visible');
      } else {
        likeStamp.classList.remove('visible');
        nopeStamp.classList.remove('visible');
      }
    };
    
    const handleDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('swiping');
      
      const deltaX = currentX - startX;
      const threshold = 100;
      
      if (Math.abs(deltaX) > threshold) {
        const direction = deltaX > 0 ? 'apply' : 'pass';
        animateCardExit(card, direction);
      } else {
        card.style.transform = '';
        card.querySelector('.swipe-stamp.like').classList.remove('visible');
        card.querySelector('.swipe-stamp.nope').classList.remove('visible');
      }
    };
    
    card.addEventListener('mousedown', handleDragStart);
    card.addEventListener('mousemove', handleDragMove);
    card.addEventListener('mouseup', handleDragEnd);
    card.addEventListener('mouseleave', handleDragEnd);
    
    card.addEventListener('touchstart', handleDragStart);
    card.addEventListener('touchmove', handleDragMove);
    card.addEventListener('touchend', handleDragEnd);
  };
  
  const animateCardExit = (card, direction) => {
    card.classList.add('removed');
    const distance = direction === 'apply' ? 1000 : -1000;
    card.style.transform = `translateX(${distance}px) rotate(${distance * 0.1}deg)`;
    
    track('job_swiped', { direction, jobIndex: currentJobIndex - 1 });
    
    if (direction === 'apply') {
      showToast('Application submitted! 🎉', 'success');
    }
    
    setTimeout(() => {
      loadNextCard();
    }, 500);
  };
  
  passBtn.addEventListener('click', () => {
    if (currentCard) {
      animateCardExit(currentCard, 'pass');
    }
  });
  
  applyBtn.addEventListener('click', () => {
    if (currentCard) {
      animateCardExit(currentCard, 'apply');
    }
  });
  
  loadNextCard();
};

const setupFAQ = () => {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      
      faqQuestions.forEach(q => {
        q.setAttribute('aria-expanded', 'false');
      });
      
      if (!isExpanded) {
        question.setAttribute('aria-expanded', 'true');
        track('faq_opened', { question: question.querySelector('span').textContent });
      }
    });
    
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
};

const setupPricingToggle = () => {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const monthlyPrices = document.querySelectorAll('.monthly-price');
  const annualPrices = document.querySelectorAll('.annual-price');
  
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const period = btn.getAttribute('data-period');
      
      if (period === 'monthly') {
        monthlyPrices.forEach(p => p.classList.remove('hidden'));
        annualPrices.forEach(p => p.classList.add('hidden'));
      } else {
        monthlyPrices.forEach(p => p.classList.add('hidden'));
        annualPrices.forEach(p => p.classList.remove('hidden'));
      }
      
      track('pricing_toggle', { period });
    });
  });
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const setupLeadForm = () => {
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('leadSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const org = document.getElementById('org').value.trim();
    
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    
    if (!role) {
      showToast('Please select your role.', 'error');
      return;
    }
    
    if (!supabase) {
      showToast('Lead capture is not configured. Please contact support.', 'warning');
      console.error('Supabase not initialized');
      return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.classList.remove('hidden');
    
    track('lead_form_submitted', { role });
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            email: email,
            role: role,
            org: org || null
          }
        ])
        .select();
      
      if (error) {
        if (error.code === '23505') {
          showToast("You're already on the list! We'll be in touch soon.", 'warning');
        } else {
          console.error('Supabase error:', error);
          showToast('Something went wrong. Please try again later.', 'error');
        }
      } else {
        showToast("Thanks! We'll be in touch soon. 🚀", 'success');
        form.reset();
        track('lead_captured', { role });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.classList.add('hidden');
    }
  });
};

window.scrollToLeadForm = () => {
  const leadForm = document.getElementById('lead-capture');
  if (leadForm) {
    const offset = 80;
    const elementPosition = leadForm.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    track('cta_clicked', { target: 'lead_form' });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  setupNavbar();
  setupSwipeDemo();
  setupFAQ();
  setupPricingToggle();
  setupLeadForm();
  
  track('page_loaded');
});
