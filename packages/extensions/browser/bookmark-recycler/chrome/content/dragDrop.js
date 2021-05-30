bookmark_recyclerChrome.doDrop=function (event)
{
 if(!document.getElementById('bookmark-recycler-search-panel'))
 {
  var objtochange=document.getElementById('mainPopupSet');
  objtochange.appendChild(bookmark_recyclerChrome.appendSearchPanelToXUL());
 }
 var link=event.dataTransfer.getData('text/plain');

 /***For deleting bookmark***/
 var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
 var uri = ios.newURI(link, null, null);
 var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService);

 var bookmarksArray = bmsvc.getBookmarkIdsForURI(uri, {});//its an array 
 if(bookmarksArray.length>1)//Multiple bookmarks may occur for same link
 {
  var bmTitle,folderId,bmId=bookmarksArray[0];
  bmTitle =bmsvc.getItemTitle(bmId);
  folderId = bmsvc.getFolderIdForItem(bmId);//id of folder to which the bookmark will be restored
  bmsvc.removeItem(bmId);
 }
 else
 {
  var bmId=bookmarksArray;
  var bmTitle = bmsvc.getItemTitle(bmId);
  var folderId=bmsvc.getFolderIdForItem(bmId);//id of folder to which the bookmark will be restored
  bmsvc.removeItem(bmId);
 }
 /***********/

  /**********SAVING THE LINK to TRASH File**********/
  var data={
  "title":bmTitle,
  "link" :link,
  "folderId":folderId,
  "bookmarkId":bmId
  };  
  bookmark_recyclerChrome.getTrashXMLObj();
(function()
   {   
     var calleeFun=arguments.callee;
    if(bookmark_recyclerChrome.getTrashXMLObj.xmlDoc != -1)
	{
      var response=bookmark_recyclerChrome.appendBookmarkToXMLFile(bookmark_recyclerChrome.getTrashXMLObj.xmlDoc,data);
      event.target.setAttribute('class','full');
	  var bmData=new Array();
	  bmData[0]=bmTitle;
	  bmData[1]=link;
      bmData[2]=folderId;
      bmData[3]=bmId;
     if(response)
     bookmark_recyclerChrome.appendBookmarktoXUL(bmData);
	}
	else
    {
     window.setTimeout(function(){calleeFun()},500);
	}
   })();
  return false;
}