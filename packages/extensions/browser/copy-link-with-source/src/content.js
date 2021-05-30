(function() {
  let target;
  const _browser = chrome;
  document.addEventListener("contextmenu", (e) => {
    target = e.target;
  }, false);
  function getAncestorAnchor(el) {
    let maxTraversibleNodes = 5;
    while (el && maxTraversibleNodes) {
      const tagName = el.tagName && el.tagName.toLowerCase();
      if (tagName === "a") {
        break;
      }
      el = el.parentElement;
      maxTraversibleNodes--;
    }
    return el;
  }
  _browser.runtime.onMessage.addListener(() => {
    const el = getAncestorAnchor(target);
    if (!el) {
      return;
    }
    const linkData = {
      link: el.href,
      source: document.URL,
      text: el.innerText
    };
    _browser.runtime.sendMessage("", linkData);
  });
})();
