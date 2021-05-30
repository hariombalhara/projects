(function() {
  const _browser = chrome;
  const _menus = _browser.contextMenus;
  _menus.create({
    id: "copy-link-with-source",
    title: _browser.i18n.getMessage("menuItemCopyLinkWithSourceText"),
    contexts: ["link"]
  });
  _menus.onClicked.addListener((info, tab) => {
    const id = tab?.id;
    if (!id) {
      return;
    }
    _browser.tabs.sendMessage(id, "", {frameId: info.frameId});
  });
  _browser.runtime.onMessage.addListener((linkData) => {
    const dummyTextArea = document.createElement("textarea");
    document.body.appendChild(dummyTextArea);
    dummyTextArea.value = `${linkData.link} taken from ${linkData.source}#:~:text=${encodeURIComponent(linkData.text)}`;
    dummyTextArea.select();
    document.execCommand("copy");
    dummyTextArea.remove();
  });
})();
