/* ============================================================
   COTERIE — interactions

   Telegram contact
   ------------------------------------------------------------
   Replace TELEGRAM_HANDLE below with the real Telegram username
   (without the @). Every contact button on the page reads from
   this single value.
   ============================================================ */

(() => {
  'use strict';

  const TELEGRAM_HANDLE = 'your_telegram_username';
  const TELEGRAM_BASE = `https://t.me/${TELEGRAM_HANDLE}`;
  const DEFAULT_TG_MESSAGE = 'Hello Coterie — I’d like to speak with the membership desk.';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const telegramUrl = (text = DEFAULT_TG_MESSAGE) =>
    `${TELEGRAM_BASE}?text=${encodeURIComponent(text)}`;

  function openTelegram(text) {
    const url = telegramUrl(text);
    const win = window.open(url, '_blank');
    if (win) {
      try { win.opener = null; } catch (error) { /* no-op */ }
    } else {
      window.location.href = url;
    }
    return url;
  }

  /* ------------------------------------------------------------
     Wire every contact link to Telegram
     ------------------------------------------------------------ */
  document.querySelectorAll('[data-tg]').forEach((link) => {
    const message = link.getAttribute('data-tg-text') || DEFAULT_TG_MESSAGE;
    link.setAttribute('href', telegramUrl(message));
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  /* ------------------------------------------------------------
     Header + mobile menu
     ------------------------------------------------------------ */
  const header = document.getElementById('siteHeader');
  const menuBtn = document.getElementById('menuBtn');
  const mobilePanel = document.getElementById('mobilePanel');
  let menuOpen = false;

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 28);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const focusableInPanel = () =>
    Array.from(mobilePanel.querySelectorAll('a, button')).filter((el) => !el.disabled);

  function setMenu(open, returnFocus = false) {
    if (!menuBtn || !mobilePanel) return;
    menuOpen = open;
    header.classList.toggle('is-menu', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobilePanel.setAttribute('aria-hidden', String(!open));

    if (open) {
      mobilePanel.removeAttribute('inert');
      window.setTimeout(() => {
        const first = mobilePanel.querySelector('a');
        if (first) first.focus();
      }, 320);
    } else {
      mobilePanel.setAttribute('inert', '');
      if (returnFocus) menuBtn.focus();
    }
  }

  if (mobilePanel) mobilePanel.setAttribute('inert', '');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  }

  if (mobilePanel) {
    mobilePanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!menuOpen) return;

    if (event.key === 'Escape') {
      setMenu(false, true);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = [menuBtn, ...focusableInPanel()].filter(Boolean);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && menuOpen) setMenu(false);
  });

  /* ------------------------------------------------------------
     Toast
     ------------------------------------------------------------ */
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimer;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4200);
  }

  /* ------------------------------------------------------------
     Reveal-on-scroll
     ------------------------------------------------------------ */
  const revealGroups = document.querySelectorAll('.member-grid, .stories, .feature-grid, .steps');
  revealGroups.forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${Math.min(index * 0.06, 0.3)}s`);
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------
     Metric counters
     ------------------------------------------------------------ */
  function animateCounter(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      el.textContent = target.toLocaleString('en-US') + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.45 });

      counters.forEach((counter) => counterObserver.observe(counter));
    }
  }

  /* ------------------------------------------------------------
     Member directory
     ------------------------------------------------------------ */
  const memberGrid = document.getElementById('memberGrid');
  const memberSearch = document.getElementById('memberSearch');
  const memberClear = document.getElementById('memberClear');
  const memberCount = document.getElementById('memberCount');
  const memberEmpty = document.getElementById('memberEmpty');
  const memberReset = document.getElementById('memberReset');
  const memberFilterButtons = document.querySelectorAll('[data-member-filter]');
  const memberCards = memberGrid ? Array.from(memberGrid.querySelectorAll('.member')) : [];
  let memberFilter = 'all';

  const normalize = (value = '') =>
    value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  function filterMembers() {
    if (!memberGrid) return;
    const query = normalize(memberSearch ? memberSearch.value : '');
    let visible = 0;

    memberCards.forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/);
      const matchesCategory = memberFilter === 'all' || categories.includes(memberFilter);
      const haystack = normalize(card.dataset.search || '');
      const matchesQuery = !query || haystack.includes(query);
      const show = matchesCategory && matchesQuery;

      card.hidden = !show;
      if (show) visible += 1;
    });

    if (memberCount) {
      memberCount.textContent = `${visible} member${visible === 1 ? '' : 's'}`;
    }

    if (memberEmpty) memberEmpty.hidden = visible !== 0;
    if (memberClear) memberClear.hidden = !query;
  }

  memberFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      memberFilter = button.dataset.memberFilter || 'all';
      memberFilterButtons.forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      filterMembers();
    });
  });

  if (memberSearch) {
    memberSearch.addEventListener('input', filterMembers);
  }

  if (memberClear) {
    memberClear.addEventListener('click', () => {
      if (memberSearch) memberSearch.value = '';
      filterMembers();
      if (memberSearch) memberSearch.focus();
    });
  }

  if (memberReset) {
    memberReset.addEventListener('click', () => {
      if (memberSearch) memberSearch.value = '';
      memberFilter = 'all';
      memberFilterButtons.forEach((chip) => {
        const active = chip.dataset.memberFilter === 'all';
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      filterMembers();
      if (memberSearch) memberSearch.focus();
    });
  }

  document.querySelectorAll('[data-intro]').forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-intro') || 'a member';
      openTelegram(
        `Hello Coterie — I’d like to request an introduction to ${name}. A little context on why we should meet: `
      );
      showToast(`Opening a private chat — send the note to request an introduction to ${name}.`);
    });
  });

  /* ------------------------------------------------------------
     Opportunities: filters + saved roles
     ------------------------------------------------------------ */
  const jobsList = document.getElementById('jobsList');
  const jobCount = document.getElementById('jobCount');
  const jobFilterButtons = document.querySelectorAll('[data-job-filter]');
  const jobCards = jobsList ? Array.from(jobsList.querySelectorAll('.job')) : [];
  let jobFilter = 'all';

  function filterJobs() {
    if (!jobsList) return;
    let visible = 0;

    jobCards.forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/);
      const show = jobFilter === 'all' || categories.includes(jobFilter);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (jobCount) {
      jobCount.textContent = `${visible} role${visible === 1 ? '' : 's'}`;
    }
  }

  jobFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      jobFilter = button.dataset.jobFilter || 'all';
      jobFilterButtons.forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      filterJobs();
    });
  });

  document.querySelectorAll('.job__save').forEach((button) => {
    button.addEventListener('click', () => {
      const saved = button.getAttribute('aria-pressed') === 'true';
      const nextState = !saved;
      const label = (button.getAttribute('aria-label') || 'role').replace(/^(Save|Remove)\s/, '');

      button.setAttribute('aria-pressed', String(nextState));
      button.setAttribute('aria-label', `${nextState ? 'Remove' : 'Save'} ${label}`);
      showToast(nextState ? 'Saved to your private list.' : 'Removed from your private list.');
    });
  });

  /* ------------------------------------------------------------
     Role briefs
     ------------------------------------------------------------ */
  const JOBS = {
    'chief-of-staff': {
      mark: 'H',
      markClass: 'mark--forest',
      flag: 'New · Private brief 07',
      title: 'Chief of Staff to the CEO',
      companyLabel: 'Halcyon · Climate infrastructure',
      companyName: 'Halcyon',
      meta: ['London · Hybrid', '£180–220k + equity', 'Executive / Founder-led'],
      summary: 'Halcyon is scaling grid-scale storage across three markets. The founding CEO needs a translator, an operator and an occasional contrarian — someone who can hold the whole system in view.',
      detail: 'You will own the operating rhythm of the company: board preparation, executive offsites, cross-functional priorities, and the decisions that fall between functions. The role is deliberately broad. The right person will narrow it through action, not negotiation.',
      points: [
        'Eight or more years across strategy, operations or founder-adjacent roles',
        'Evidence of running a complex, multi-stakeholder programme',
        'Comfort with ambiguity and a high bar for written clarity',
        'Board or investor exposure is helpful, not essential'
      ]
    },
    'head-of-product': {
      mark: 'F',
      markClass: 'mark--clay',
      flag: 'Closing soon · Private brief 11',
      title: 'Head of Product',
      companyLabel: 'Fieldnote · AI research tools',
      companyName: 'Fieldnote',
      meta: ['New York · Remote-first', '$240–300k + equity', 'Product / AI'],
      summary: 'Fieldnote builds research tools for teams that cannot afford to lose the thread. The product is used daily by analysts, journalists and strategy groups; the next chapter is about depth, not breadth.',
      detail: 'Lead a product organisation of twelve across research, design and data. Own the roadmap with the founders, make the hard calls about what not to build, and turn a much-loved tool into a durable platform.',
      points: [
        'A track record shipping knowledge, research or collaboration products',
        'Strong first-principles product judgment',
        'Able to lead senior designers and engineers with clarity',
        'Experience with AI-native product surfaces preferred'
      ]
    },
    'managing-partner': {
      mark: 'O',
      markClass: 'mark--slate',
      flag: 'Confidential · Private brief 14',
      title: 'Managing Partner, Asia',
      companyLabel: 'Obelisk · Private markets',
      companyName: 'Obelisk',
      meta: ['Singapore', 'Compensation on brief', 'Confidential search'],
      summary: 'A private-markets investment firm is opening its Asia platform. The mandate is to build the franchise, not inherit one.',
      detail: 'Lead origination and relationships across Southeast Asia, with a remit that includes strategy, team building and the firm’s first regional close. The client is known to the desk; the role is not public.',
      points: [
        'Substantial private-markets leadership in Asia',
        'A genuine network across founders, LPs and intermediaries',
        'Comfort building a business with a long horizon',
        'Mandarin or Bahasa capability is an advantage'
      ]
    },
    'creative-director': {
      mark: 'A9',
      markClass: 'mark--brass',
      flag: 'Private brief 16',
      title: 'Creative Director',
      companyLabel: 'Atelier 9 · Luxury',
      companyName: 'Atelier 9',
      meta: ['Paris', '€150–180k', 'Creative / Brand'],
      summary: 'Atelier 9 is a maison at the intersection of craft and modern luxury. The next creative chapter needs a point of view, not a moodboard.',
      detail: 'Own the visual and editorial language across campaigns, retail and digital. Work directly with the artistic director and the house CEO; lead a studio of designers, art directors and image-makers.',
      points: [
        'A distinct body of luxury or cultural work',
        'Experience leading a studio and cultivating talent',
        'Fluency in image, typography, film and digital',
        'French is not required; taste is'
      ]
    },
    'vp-engineering': {
      mark: 'N',
      markClass: 'mark--rose',
      flag: 'New · Private brief 18',
      title: 'VP of Engineering',
      companyLabel: 'Northwind · Defense tech',
      companyName: 'Northwind',
      meta: ['Washington, D.C. · On-site', '$280–340k + equity', 'Engineering / Defense'],
      summary: 'Northwind builds software for the people who operate the hardest systems in government. The engineering base is strong; the next step is scale without losing rigor.',
      detail: 'Lead engineering across three product lines, with responsibility for architecture, hiring and delivery. The role partners closely with the CTO and works on-site with customers who can never afford a casual bug.',
      points: [
        'Experience leading engineering teams at Series B or later',
        'Comfort operating in a regulated or security-conscious environment',
        'Strong systems thinking and an eye for engineering economics',
        'US citizenship and clearance eligibility required'
      ]
    },
    'board-director': {
      mark: 'P',
      markClass: 'mark--sand',
      flag: 'Board · Private brief 21',
      title: 'Non-Executive Director',
      companyLabel: 'Portico · Health',
      companyName: 'Portico',
      meta: ['Remote', '£45k board fee', 'Board / Governance'],
      summary: 'Portico is a health platform moving from growth-stage to institution. The board is adding an independent non-executive with operating judgment and a working fluency in governance.',
      detail: 'Sit on the audit and risk committee, challenge the operating plan constructively, and help the founder build the cadence of a public-ready board. Two days a month, with an initial three-year term.',
      points: [
        'Previous non-executive or committee experience',
        'Operating leadership in health, insurance or regulated services',
        'Comfort with financial reporting and risk frameworks',
        'Independence and the willingness to ask the plain question'
      ]
    }
  };

  const jobDialog = document.getElementById('jobDialog');
  const jobTitle = document.getElementById('jobTitle');
  const jobCompany = document.getElementById('jobCompany');
  const jobMeta = document.getElementById('jobMeta');
  const jobMark = document.getElementById('jobMark');
  const jobFlag = document.getElementById('jobFlag');
  const jobSummary = document.getElementById('jobSummary');
  const jobDetail = document.getElementById('jobDetail');
  const jobPoints = document.getElementById('jobPoints');
  const jobRequest = document.getElementById('jobRequest');
  let activeJobId = null;

  function openDialog(dialog) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function openJob(id) {
    const job = JOBS[id];
    if (!job || !jobDialog) return;

    activeJobId = id;

    if (jobMark) {
      jobMark.textContent = job.mark;
      jobMark.className = `job__mark ${job.markClass}`;
    }
    if (jobFlag) jobFlag.textContent = job.flag;
    if (jobTitle) jobTitle.textContent = job.title;
    if (jobCompany) jobCompany.textContent = job.companyLabel;
    if (jobSummary) jobSummary.textContent = job.summary;
    if (jobDetail) jobDetail.textContent = job.detail;

    if (jobMeta) {
      jobMeta.replaceChildren();
      job.meta.forEach((entry) => {
        const span = document.createElement('span');
        span.textContent = entry;
        jobMeta.appendChild(span);
      });
    }

    if (jobPoints) {
      jobPoints.replaceChildren();
      job.points.forEach((entry) => {
        const li = document.createElement('li');
        li.textContent = entry;
        jobPoints.appendChild(li);
      });
    }

    openDialog(jobDialog);
  }

  document.querySelectorAll('[data-job-open]').forEach((button) => {
    button.addEventListener('click', () => openJob(button.getAttribute('data-job-open')));
  });

  if (jobRequest) {
    jobRequest.addEventListener('click', () => {
      const job = JOBS[activeJobId];
      closeDialog(jobDialog);
      if (!job) return;
      openTelegram(
        `Hello Coterie — I’d like the full brief for ${job.title} at ${job.companyName}. A little on my background: `
      );
      showToast(`Opening a private chat — send the note to request the ${job.title} brief.`);
    });
  }

  /* ------------------------------------------------------------
     The Briefing
     ------------------------------------------------------------ */
  const ARTICLES = {
    fractional: {
      kicker: 'The Briefing · Leadership',
      title: 'The quiet rise of the fractional C-suite',
      dek: 'Why the most senior people in the room now hold three jobs — and what that means for the rest of us.',
      meta: 'No. 048 · Leadership · 6 min read · November 2026',
      body: `
        <p>Somewhere between a full-time executive and an independent consultant sits a role the market has not quite named. The fractional chief operating officer. The part-time chief financial officer with a two-year mandate. The operating partner who spends nine days a month inside a portfolio company and the rest of the month advising two others.</p>
        <p>It is not freelancing. The people doing it are usually coming off a decade of operating at scale, and they are being brought in for judgment rather than throughput. What changed is the supply side: experienced leaders discovered they could trade a single, all-consuming title for a portfolio of defined problems — and keep the part of their life that does not fit on a résumé.</p>
        <h3>The work is more specific now.</h3>
        <p>Companies rarely need “a COO” in the abstract. They need someone to rebuild a go-to-market motion before a Series C, or to sit beside a first-time founder through a difficult board cycle. That specificity is what makes fractional work possible: a clear scope, a finite problem, a measurable outcome.</p>
        <blockquote>The question stopped being “What do you do?” and became “What can you own?”</blockquote>
        <p>The best fractional executives behave like a small firm. They have a point of view, a set of references, and a clear line between what they will and will not take on. They are not selling hours; they are renting judgment.</p>
        <h3>The cost of optionality.</h3>
        <p>None of this is frictionless. Three commitments can mean three diluted attention spans, and governance gets murky when authority is shared. The people who do it well are ruthless about sequencing and honest about capacity. The ones who do not find that a portfolio can become an expensive way to be busy.</p>
        <p>For everyone else, the lesson is simpler: the career ladder is becoming a career lattice. The next title may not exist yet. The brief might.</p>
      `
    },
    boards: {
      kicker: 'The Briefing · Governance',
      title: 'What boards are really asking in 2027',
      dek: 'AI fluency is table stakes now. The harder questions are about judgment, succession and the shape of the room.',
      meta: 'No. 049 · Governance · 8 min read · November 2026',
      body: `
        <p>Boardrooms have spent two years adding AI fluency to the agenda. In 2027, the conversation is moving from vocabulary to consequences. Directors are being asked less about which models a company uses and more about what happens when those models fail, who owns the risk, and whether the board can tell the difference between a demo and a durable advantage.</p>
        <h3>The questions behind the questions.</h3>
        <p>The first is defensibility. If a competitor can rent the same intelligence, what remains proprietary? The second is succession. A generation of founder-CEOs is entering the phase where the board must plan for a transition without insulting the person in the chair. The third is composition: does the room contain enough people who have actually operated through a crisis, or only people who have advised on one?</p>
        <blockquote>A board is not a panel of experts. It is a group of people who have to make one decision together.</blockquote>
        <p>That is why the strongest new directors are rarely the most decorated. They are the ones who can hold a complex fact pattern, say the uncomfortable thing plainly, and still leave the room intact. Governance is a social discipline before it is a technical one.</p>
        <h3>What candidates should prepare.</h3>
        <p>If you are being considered for a board seat, expect questions about a decision you got wrong. Not the sanitised version — the actual decision, what you missed, and what you changed afterwards. Expect questions about how you would handle a founder who is right about the product and wrong about the people. Expect at least one question designed to see whether you can disagree without performing.</p>
        <p>The final test is simpler than it sounds: would the chair want you in the room when there is no good news to share? Board readiness is a product of pattern recognition, not a title. The people who have it tend to answer with fewer adjectives.</p>
      `
    },
    compensation: {
      kicker: 'The Briefing · Compensation',
      title: 'The compensation reset nobody advertised',
      dek: 'The number on the offer is only half the story. A field guide to equity, liquidity and the terms that matter.',
      meta: 'No. 050 · Compensation · 5 min read · November 2026',
      body: `
        <p>The headline number is the least interesting part of a senior offer. Base salary is an anchor, not a ceiling — and in private companies the part of the package that actually changes your life is usually the part no one puts on the first slide.</p>
        <h3>Base is the anchor, not the ceiling.</h3>
        <p>A good offer makes the total shape legible: cash today, equity later, and the conditions that sit between the two. Ask for the cap table, the strike price, the vesting schedule and the liquidation preference. If the company cannot explain those in plain language, that is information too.</p>
        <blockquote>Equity is not compensation until you understand when, and at what price, it becomes cash.</blockquote>
        <p>In private markets, the most consequential term is often liquidity: who can sell, when, and at what preference. A generous grant behind a 2x participating preference is a different instrument from a smaller grant in a clean cap table. The same headline can mean very different things at the end.</p>
        <h3>Ask about the reset.</h3>
        <p>The market has quietly moved toward more transparent bands and wider equity participation. More companies are publishing ranges before the first conversation, partly because candidates have learned to ask and partly because secrecy no longer survives a good network. That is a healthy correction.</p>
        <p>But transparency is not the same as generosity. A disclosed band can still hide an aggressive vesting cliff or a refresh policy that never refreshes. The questions to ask are unglamorous and specific: What happens on a down round? What happens if I am acquired? What did the last three people in this role actually take home?</p>
        <p>The compensation conversation is not a negotiation about worth. It is a diligence exercise about alignment. Treat it that way and the number becomes easier to read.</p>
      `
    }
  };

  const articleDialog = document.getElementById('articleDialog');
  const articleKicker = document.getElementById('articleKicker');
  const articleTitle = document.getElementById('articleTitle');
  const articleDek = document.getElementById('articleDek');
  const articleMeta = document.getElementById('articleMeta');
  const articleBody = document.getElementById('articleBody');

  function openArticle(id) {
    const article = ARTICLES[id];
    if (!article || !articleDialog) return;

    if (articleKicker) articleKicker.textContent = article.kicker;
    if (articleTitle) articleTitle.textContent = article.title;
    if (articleDek) articleDek.textContent = article.dek;
    if (articleMeta) articleMeta.textContent = article.meta;
    if (articleBody) articleBody.innerHTML = article.body;

    openDialog(articleDialog);
    articleDialog.scrollTop = 0;
  }

  document.querySelectorAll('[data-article]').forEach((button) => {
    button.addEventListener('click', () => openArticle(button.getAttribute('data-article')));
  });

  /* ------------------------------------------------------------
     Legal + editorial standards
     ------------------------------------------------------------ */
  const LEGAL = {
    privacy: {
      title: 'Privacy, in plain English.',
      body: `
        <p>Coterie is a private network, which means privacy is not a setting we add at the end. It is the product.</p>
        <h3>This website</h3>
        <p>This preview site does not run analytics, advertising pixels or third-party tracking. Search terms, filters and saved roles stay in your browser for the current session only.</p>
        <h3>Your contact</h3>
        <p>Contact, applications and introductions are handled through Telegram. When you choose a Telegram button, this site prepares a message and opens Telegram; nothing is submitted until you send it there. Telegram’s own privacy terms then apply to that conversation.</p>
        <h3>What we never do</h3>
        <p>We never publish your profile, sell your data, or share your search with a company without your explicit consent. <strong>Your details are not a lead.</strong></p>
      `
    },
    terms: {
      title: 'Terms of the house.',
      body: `
        <p>Access to Coterie is by invitation and review. An application does not guarantee admission, and membership may be declined without a reason. We keep the room small on purpose.</p>
        <h3>Using this site</h3>
        <p>This site is a concept presentation for Coterie. The people, mandates and client names shown are illustrative. Rates and timelines are indicative, not offers. Any engagement is governed by a separate written agreement.</p>
        <h3>Contact through Telegram</h3>
        <p>Choosing a Telegram button opens a third-party service. You are responsible for the messages you send and for reviewing Telegram’s terms. Do not send confidential material until we have agreed how to handle it.</p>
        <h3>Intellectual property</h3>
        <p>The Coterie name, mark and editorial material on this page are presented for this concept. No licence is granted by viewing the page.</p>
      `
    },
    cookies: {
      title: 'What this site remembers.',
      body: `
        <p>This site does not set advertising or analytics cookies. There is no consent banner because there is nothing to consent to.</p>
        <h3>Local to your browser</h3>
        <p>Filters and saved roles work in memory while the page is open. Refreshing the page clears them. We do not use local storage to build a profile of you.</p>
        <h3>Third parties</h3>
        <p>The page loads typefaces from Google Fonts, which may record your IP address as part of serving the font files. Telegram only receives data when you choose to open a Telegram link.</p>
      `
    },
    standards: {
      title: 'How we edit.',
      body: `
        <p>The Briefing is written by the Coterie editorial desk and is independent of client work. We do not accept payment for coverage, and we do not publish a client’s story without their consent.</p>
        <h3>What we publish</h3>
        <p>We favour reported observation over prediction. If a claim cannot be checked, it is attributed, qualified or left out. Compensation data is described in ranges and sourced from member-shared offers and client briefs.</p>
        <h3>Corrections</h3>
        <p>If we get something wrong, we correct it in the note itself. Corrections are marked and dated. Members can write to the editorial desk through the same Telegram channel.</p>
        <h3>The line we keep</h3>
        <p>No editorial piece is used to generate search mandates. The desk and the newsroom share a roof, not a brief.</p>
      `
    }
  };

  const legalDialog = document.getElementById('legalDialog');
  const legalTitle = document.getElementById('legalTitle');
  const legalBody = document.getElementById('legalBody');

  function openLegal(id) {
    const page = LEGAL[id] || LEGAL.privacy;
    if (!legalDialog) return;
    if (legalTitle) legalTitle.textContent = page.title;
    if (legalBody) legalBody.innerHTML = page.body;
    openDialog(legalDialog);
    legalDialog.scrollTop = 0;
  }

  document.querySelectorAll('[data-legal]').forEach((button) => {
    button.addEventListener('click', () => openLegal(button.getAttribute('data-legal')));
  });

  /* ------------------------------------------------------------
     Dialog plumbing
     ------------------------------------------------------------ */
  const dialogs = Array.from(document.querySelectorAll('dialog'));

  dialogs.forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const anyOpen = dialogs.some((item) => item.open);
      if (!anyOpen) document.body.classList.remove('dialog-open');
    });
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      if (dialog) closeDialog(dialog);
    });
  });

  /* ------------------------------------------------------------
     Application: prepare a Telegram message
     ------------------------------------------------------------ */
  const applyForm = document.getElementById('applyForm');
  const applyName = document.getElementById('applyName');
  const applyEmail = document.getElementById('applyEmail');
  const applyIntent = document.getElementById('applyIntent');
  const applyCompany = document.getElementById('applyCompany');
  const applyNote = document.getElementById('applyNote');
  const applyStatus = document.getElementById('applyStatus');
  const applyBtn = document.getElementById('applyBtn');
  const applySuccess = document.getElementById('applySuccess');
  const applyAgain = document.getElementById('applyAgain');
  const tgFallback = document.getElementById('tgFallback');

  function setFieldInvalid(field, invalid) {
    if (!field) return;
    const wrapper = field.closest('.field');
    if (wrapper) wrapper.classList.toggle('is-invalid', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function setApplyStatus(message, type = '') {
    if (!applyStatus) return;
    applyStatus.textContent = message;
    applyStatus.className = `form-status${type ? ` is-${type}` : ''}`;
  }

  if (applyForm) {
    applyForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = applyName ? applyName.value.trim() : '';
      const email = applyEmail ? applyEmail.value.trim() : '';
      const intent = applyIntent ? applyIntent.value : 'Find my next role';
      const company = applyCompany ? applyCompany.value.trim() : '';
      const note = applyNote ? applyNote.value.trim() : '';
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      const nameValid = name.length >= 2;

      setFieldInvalid(applyName, !nameValid);
      setFieldInvalid(applyEmail, !emailValid);
      setApplyStatus('');

      if (!nameValid || !emailValid) {
        setApplyStatus('Please add your name and a valid email address.', 'error');
        const firstInvalid = !nameValid ? applyName : applyEmail;
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const lines = [
        'Hello Coterie — I’d like to request an invitation.',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `I’m here to: ${intent}`
      ];

      if (company) lines.push(`Currently at: ${company}`);
      if (note) lines.push(`What I’m known for: ${note}`);
      lines.push('', 'Sent from the Coterie page.');

      const url = openTelegram(lines.join('\n'));

      if (tgFallback) tgFallback.setAttribute('href', url);
      if (applyForm) applyForm.hidden = true;
      if (applySuccess) applySuccess.hidden = false;
      if (applyBtn) applyBtn.disabled = false;
      if (applySuccess) {
        const heading = applySuccess.querySelector('h3');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: false });
        }
      }
      showToast('Opening a private chat — send the prepared note to reach the desk.');
    });

    [applyName, applyEmail].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        setFieldInvalid(field, false);
        setApplyStatus('');
      });
    });
  }

  if (applyAgain) {
    applyAgain.addEventListener('click', () => {
      if (applySuccess) applySuccess.hidden = true;
      if (applyForm) applyForm.hidden = false;
      if (applyName) applyName.focus();
      setApplyStatus('');
    });
  }

  /* ------------------------------------------------------------
     Escape to close any open native dialog is handled by the
     browser. This adds a small polish: return focus to the page
     after the article/job modal closes.
     ------------------------------------------------------------ */
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (document.activeElement === document.body) {
        const main = document.getElementById('main');
        if (main) {
          main.setAttribute('tabindex', '-1');
          main.focus({ preventScroll: true });
          main.removeAttribute('tabindex');
        }
      }
    });
  });
})();
