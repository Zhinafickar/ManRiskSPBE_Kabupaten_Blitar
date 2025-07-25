document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;

    // Function to apply the saved theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.remove('light');
            body.classList.add('dark');
            themeSwitcher.checked = true;
        } else {
            body.classList.remove('dark');
            body.classList.add('light');
            themeSwitcher.checked = false;
        }
    };

    // Check for a saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to light theme if no theme is saved
        applyTheme('light');
    }

    // Add event listener to the switcher
    themeSwitcher.addEventListener('change', () => {
        if (themeSwitcher.checked) {
            applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            applyTheme('light');
            localStorage.setItem('theme', 'light');
        }
    });
});
