'use strict';

(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-button');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let selectedTheme = null;
  try { selectedTheme = window.localStorage.getItem('jianming-zhou-site-theme'); } catch { /* Storage is optional. */ }
  if (selectedTheme !== 'dark' && selectedTheme !== 'light') selectedTheme = null;

  function setTheme(theme) {
    root.dataset.theme = theme;
    const next = theme === 'dark' ? 'light' : 'dark';
    themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
    themeButton.title = `Switch to ${next} theme`;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#171c21' : '#fafaf8';
  }
  setTheme(selectedTheme || (media.matches ? 'dark' : 'light'));
  themeButton.addEventListener('click', () => {
    selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(selectedTheme);
    try { window.localStorage.setItem('jianming-zhou-site-theme', selectedTheme); } catch { /* Continue without persistence. */ }
  });
  if (media.addEventListener) media.addEventListener('change', event => {
    if (!selectedTheme) setTheme(event.matches ? 'dark' : 'light');
  });

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.querySelectorAll('.shortcut-link').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.research-item')];
  const count = document.querySelector('#filter-count');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    projects.forEach(project => {
      project.hidden = filter !== 'all' && project.dataset.category !== filter;
      if (!project.hidden) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
  }));

  const links = [...document.querySelectorAll('.nav-link, .shortcut-link')];
  const linkedSections = new Set(links.map(link => link.hash.slice(1)));
  const sections = [...document.querySelectorAll('main section[id]')].filter(section => linkedSections.has(section.id));
  let scheduled = false;
  function updateNavigation() {
    let current = null;
    for (const section of sections) if (section.getBoundingClientRect().top <= 160) current = section;
    if (window.scrollY > 200 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 35) current = sections[sections.length - 1];
    links.forEach(link => {
      const active = current !== null && link.hash === `#${current.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
})();
