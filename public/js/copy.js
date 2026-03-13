// Event delegation for code block copy buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.code-copy-btn');
  if (!btn) return;

  const codeBlock = btn.closest('.code-block');
  if (!codeBlock) return;

  const codeElement = codeBlock.querySelector('pre code');
  if (!codeElement) return;

  // Clone the code element and remove line numbers before copying
  const clone = codeElement.cloneNode(true);
  clone.querySelectorAll('.line-number').forEach((ln) => ln.remove());
  const text = clone.innerText;

  navigator.clipboard.writeText(text).then(() => {
    const copyIcon = btn.querySelector('.copy-icon');
    const checkIcon = btn.querySelector('.check-icon');
    if (copyIcon) copyIcon.style.display = 'none';
    if (checkIcon) checkIcon.style.display = 'block';

    setTimeout(() => {
      if (copyIcon) copyIcon.style.display = 'block';
      if (checkIcon) checkIcon.style.display = 'none';
    }, 2000);
  });
});
