;(function () {
  const storageKey = 'bittora-theme'

  function applyTheme(mode) {
    const html = document.documentElement
    if (mode === 'dark') {
      document.body.classList.add('dark-mode')
      html.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
      html.classList.remove('dark-mode')
    }

    const button = document.getElementById('themeToggle')
    if (button) {
      button.textContent = mode === 'dark' ? 'Light Mode' : 'Dark Mode'
    }
  }

  const initialMode = localStorage.getItem(storageKey) || 'light'
  applyTheme(initialMode)

  document.addEventListener('click', function (event) {
    const themeToggle = event.target.closest('#themeToggle')
    if (!themeToggle) return

    const nextMode = document.body.classList.contains('dark-mode') ? 'light' : 'dark'
    localStorage.setItem(storageKey, nextMode)
    applyTheme(nextMode)
  })
})()
