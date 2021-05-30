bookmark_recyclerChrome.trashit=function()
{  
 var bmId=bookmark_recyclerChrome.popupnode.getBookmarkIdForTrash();
 var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService);
 var bmTitle =bmsvc.getItemTitle(bmId);
 var folderId = bmsvc.getFolderIdForItem(bmId);//id of folder to which the bookmark will be restored
 var uri=bmsvc.getBookmarkURI(bmId);
 bmsvc.removeItem(bmId); 
 var url=uri.prePath+uri.path;

 var data={
"title":bmTitle,
"link" :url,
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
	document.getElementById(bookmark_recyclerChrome.trashElementId).setAttribute('class','full');
	var bmData=new Array();
	bmData[0]=bmTitle;
	bmData[1]=url;
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
}
 bookmark_recyclerChrome.setViewForTrashitMenuitem=function()
 {
  var str=document.popupNode.getAttribute("class");
  if(str!="")
  {
  var arr=str.split(" ");
  for(var i=0;i<arr.length;i++)
  {
   if(arr[i]=='bookmark-item');
   {
   document.getElementById('placesContext_moveToBookmarkRecycler').disabled='false';
   break;
   }
  }
  }
 }
