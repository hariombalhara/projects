(function () {

  let target: Element | null;
  const _browser = chrome;

  document.addEventListener(
    "contextmenu",
    (e) => {
      target = e.target as Element;
    },
    false
  );

  function getAncestorAnchor(el: typeof target) {
    let maxTraversibleNodes = 5;
    while (el && maxTraversibleNodes) {
      const tagName = el.tagName && el.tagName.toLowerCase();
      if (tagName === 'a') {
        break;
      }
      el = el.parentElement;
      maxTraversibleNodes--;
    }
    return el;
  }

  // A message would be sent by background script on which we would read the content.
  _browser.runtime.onMessage.addListener(() => {
    const el = getAncestorAnchor(target) as HTMLAnchorElement;
    if (!el) {
      return;
    }
    const linkData = {
      link: el.href,
      source: document.URL,
      text: el.innerText
    }
    _browser.runtime.sendMessage('', linkData)
  });
})();