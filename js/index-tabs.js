document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('button.tool-tab-btn');
  const panels = document.querySelectorAll('[data-tab-panel]');
  if (!tabButtons.length || !panels.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const target = btn.dataset.tab;

      tabButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      panels.forEach((panel) => {
        panel.classList.toggle('hidden', panel.dataset.tabPanel !== target);
      });
    });
  });
});
