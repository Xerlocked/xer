function animate() {
  const animateElements = document.querySelectorAll('.animate:not(.show)')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    animateElements.forEach((element) => element.classList.add('show'))
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('show')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' })
  animateElements.forEach((element) => observer.observe(element))
}

document.addEventListener("DOMContentLoaded", animate)
document.addEventListener("astro:after-swap", animate)
