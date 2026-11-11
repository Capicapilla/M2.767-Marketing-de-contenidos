document.querySelectorAll(".carousel-section").forEach((section) => {
  const track = section.querySelector(".track");
  const controls = section.querySelector(".controls");

  if (!track || !controls) return;

  const cards = Array.from(track.querySelectorAll(".carousel-card"));
  const previousButton = controls.querySelector('[data-step="-1"]');
  const nextButton = controls.querySelector('[data-step="1"]');
  const status = controls.querySelector('[role="status"]');

  if (cards.length < 2 || !previousButton || !nextButton || !status) return;

  let activeIndex = 0;
  let scrollFrame = 0;

  const getCardPosition = (card) => card.offsetLeft - track.offsetLeft;

  const updateControls = (index) => {
    activeIndex = index;
    const maxScroll = track.scrollWidth - track.clientWidth;
    controls.hidden = maxScroll <= 1;
    status.textContent = `${index + 1} de ${cards.length}`;
    previousButton.disabled = track.scrollLeft <= 1;
    nextButton.disabled = track.scrollLeft >= maxScroll - 1;
  };

  const goToCard = (index) => {
    const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
    track.scrollTo({
      left: getCardPosition(cards[nextIndex]),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
    updateControls(nextIndex);
  };

  previousButton.addEventListener("click", () => goToCard(activeIndex - 1));
  nextButton.addEventListener("click", () => goToCard(activeIndex + 1));

  track.addEventListener("keydown", (event) => {
    if (track.scrollWidth <= track.clientWidth + 1) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToCard(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToCard(activeIndex + 1);
    }
  });

  track.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      const nearestIndex = cards.reduce((nearest, card, index) => {
        const currentDistance = Math.abs(getCardPosition(card) - track.scrollLeft);
        const nearestDistance = Math.abs(getCardPosition(cards[nearest]) - track.scrollLeft);
        return currentDistance < nearestDistance ? index : nearest;
      }, 0);
      updateControls(nearestIndex);
    });
  }, { passive: true });

  window.addEventListener("resize", () => updateControls(activeIndex));
  updateControls(0);
});