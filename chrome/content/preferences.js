var bookmark_recyclerPref=
{
 doCancel:function()
 {
  return true;
 },
 doOK:function()
 {
 return true;
 },
 doDisclosure:function()
 {
  window.opener.gBrowser.selectedTab = window.opener.gBrowser.addTab("http://hbalhara.blogspot.com/p/firefox-addon.html");
  window.close();
 }
};
