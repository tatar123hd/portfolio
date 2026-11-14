// Entry point. Task 6 mounts the interactive parts here.
document.querySelectorAll('[data-enter]').forEach((el) => requestAnimationFrame(() => el.classList.add('is-in')));
