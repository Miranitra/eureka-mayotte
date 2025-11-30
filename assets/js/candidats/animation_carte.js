document.addEventListener("DOMContentLoaded", () => {

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
        }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px"
    });

    // ✅ on observe tous les éléments reveal-soft de la page
    const elements = document.querySelectorAll(".reveal-soft");
    elements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 70}ms`;
        observer.observe(el);
    });

    });