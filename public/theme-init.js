// Parser-blocking in index.html: apply the saved theme before styles and Angular.
(function () {
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('timegrid-theme');
    if (saved === 'dark' || saved === 'light' || saved === 'violet') theme = saved;
  } catch (_) {
    // Storage can be unavailable in restricted browser contexts.
  }
  var root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  var background = theme === 'light' ? '#f8fafc' : theme === 'violet' ? '#0d0714' : '#080b10';
  root.style.backgroundColor = 'var(--tg-background, ' + background + ')';
})();
