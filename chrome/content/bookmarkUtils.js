bookmark_recyclerChrome.openFileAppend=function ()
{
 var file = Components.classes["@mozilla.org/file/directory_service;1"].  
                     getService(Components.interfaces.nsIProperties).  
                     get("ProfD", Components.interfaces.nsIFile);  
file.append(bookmark_recyclerChrome.TRASHFOLDER);
file.append(bookmark_recyclerChrome.TRASHFILE);
var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                         createInstance(Components.interfaces.nsIFileOutputStream);    
foStream.init(file, 0x02 | 0x10, 0666, 0);   
var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
                          createInstance(Components.interfaces.nsIConverterOutputStream);  
converter.init(foStream, "UTF-8", 0, 0);  
   return converter; 
}
bookmark_recyclerChrome.fileClose=function(converter)
{
 converter.close();
}
bookmark_recyclerChrome.getActualObjectToChange=function(obj)
{
 //alert('actual');
 return(obj.childNodes[0]);
}

bookmark_recyclerChrome.initId=function(idString,count)
{
 return('bookmark-reycler'+"-"+idString+"-"+count);
}
bookmark_recyclerChrome.getIdNumber=function(str)
{
 var tokenArray=new Array();
 tokenArray=str.split('-');
 var idNumber=Number(tokenArray[(tokenArray.length)-1]);
 return idNumber;
}
bookmark_recyclerChrome.removeXulNode=function(objtochange,obj)
{
 //alert("remove xul node");
 var idString=obj.getAttribute('id');
 var idNumber=bookmark_recyclerChrome.getIdNumber(idString);

 var HboxId=bookmark_recyclerChrome.initId('menu-hbox',idNumber);
 var HboxNode=document.getElementById(HboxId);
 objtochange.removeChild(HboxNode.nextSibling);
 objtochange.removeChild(HboxNode);

 return objtochange;
}
/*bookmark_recyclerChrome.makeStringShort =function(mystring)
{
 if(mystring.length > 25)
 mystring = mystring.substring(0,24)+"...";
	return mystring;
}*/
bookmark_recyclerChrome.appendBookmarkToXMLFile=function (xmlDoc,data)
{
  var writeData='';
  var i=0;
  var obj;
  while(obj=xmlDoc.bookmark[i]) //Scanning whole XML to ensure non duplicacy.It is costly for large XML file
 {
  if(obj.@bookmarkId==data.bookmarkId && obj.@folderId==data.folderId && obj.@link==data.link)
  {
  return false;
  //alert("skipped");
  } 
 i++;
 }
 xmlDoc.bookmark+=<bookmark link={data.link} folderId={data.folderId} bookmarkId={data.bookmarkId}>{data.title}</bookmark>;
 var converter =bookmark_recyclerChrome.openFileWrite();
 converter.writeString(xmlDoc);
 bookmark_recyclerChrome.fileClose(converter);
 return true;
}
bookmark_recyclerChrome.openFileWrite=function ()
{
   var file = Components.classes["@mozilla.org/file/directory_service;1"].  
                     getService(Components.interfaces.nsIProperties).  
                     get("ProfD", Components.interfaces.nsIFile);  
   file.append(bookmark_recyclerChrome.TRASHFOLDER);
   if( !file.exists() || !file.isDirectory() ) 
   {   // if it doesn't exist, create  
    file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
   }  
   
   file.append(bookmark_recyclerChrome.TRASHFILE);

   var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                         createInstance(Components.interfaces.nsIFileOutputStream);
   // use 0x02 | 0x10 to open file for appending.
   foStream.init(file,0x02 | 0x08 | 0x20, 0666, 0); 

   var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                          createInstance(Components.interfaces.nsIConverterOutputStream);
   converter.init(foStream, "UTF-8", 0, 0);


   return converter;
}

 bookmark_recyclerChrome.openFileRead=function()
{
   var fileread = Components.classes["@mozilla.org/file/directory_service;1"].  
                     getService(Components.interfaces.nsIProperties).  
                     get("ProfD", Components.interfaces.nsIFile);  
   fileread.append(bookmark_recyclerChrome.TRASHFOLDER);
   fileread.append(bookmark_recyclerChrome.TRASHFILE);
   var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
                        createInstance(Components.interfaces.nsIFileInputStream);  
   istream.init(fileread, 0x01, 0444, 0);  
   istream.QueryInterface(Components.interfaces.nsILineInputStream); 
   return istream;
}
bookmark_recyclerChrome.emptyTrashIcon=function ()
{  
 //alert('empty');
   var objtochange=document.getElementById('mainPopupSet');
   var obj= document.getElementById('bookmark-recycler-search-panel');
   objtochange.removeChild(obj);
   //Restoring bookmark-recycler-search-panel node   
   objtochange.appendChild(bookmark_recyclerChrome.appendSearchPanelToXUL());
}

 
 bookmark_recyclerChrome.createBookmarkNodeinXUL=function(arr_res)
{
  //Get favicon for bookamrk
  var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
  var uri = ios.newURI(arr_res[1], null, null);
  var faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"]
                     .getService(Components.interfaces.nsIFaviconService);
  var count;
  var nodeArray=new Array();
  var newelChild=false,newel=false,parent=false ,propFileObj=false;
  uri=faviconService.getFaviconImageForPage(uri);
  
  if(bookmark_recyclerChrome.nextInsert)
  count=bookmark_recyclerChrome.nextInsert;
  else
  count=bookmark_recyclerChrome.counter;
  //alert('next insert'+count);
  propFileObj=document.getElementById('bookmark-recycler-strings');
  {
  //Create Tooltip
  newel=document.createElement('tooltip');
  newel.setAttribute('id',bookmark_recyclerChrome.initId('tooltip',count));
 
  //Create & append First Label for title to tooltip
  newelChild=document.createElement('label');
  newelChild.setAttribute('value',arr_res[0]);
  newel.appendChild(newelChild);
  
  //Create & append Second Label for URL to tooltip
  newelChild=document.createElement('label');
  newelChild.setAttribute('value',arr_res[1]);
  newel.appendChild(newelChild);
  nodeArray[0]=newel;
  document.getElementById('bookmark-recycler-search-panel').appendChild(nodeArray[0]);
  }
  
  {
  //Create MenuItem
  newel=document.createElement('menuitem');
  newel.setAttribute('tooltip',bookmark_recyclerChrome.initId('tooltip',count));	   
  //TODO : improve id attribute
  newel.setAttribute('id',bookmark_recyclerChrome.initId('menuitem',count));
  newel.setAttribute('label',arr_res[0]);
  newel.setAttribute('crop','end');
  newel.setAttribute('context','bookmark-recycler-menu-context');
  newel.setAttribute('class','menuitem-iconic bookmark-recycler-item');
  newel.setAttribute('scheme','chrome');//TODO: Why use it ?
  newel.addEventListener('mouseup',function(e){var obj=this;bookmark_recyclerChrome.trashEventHandle(obj,e)});
  newel.setAttribute('image',uri.prePath+uri.path);
  //These attributes Stores information
  newel.setAttribute('bookmark-recycler-bookid',arr_res[3]);
  newel.setAttribute('bookmark-recycler-restoreid',arr_res[2]);
  nodeArray[1]=newel;
  }
 {
  //Create toolbarbuttons for delete and restore
  newel=document.createElement('toolbarbutton');
  newel.setAttribute('id',bookmark_recyclerChrome.initId('deleteButton',count));
  newel.setAttribute('class','bookmark-recycler-deleteButton');
  //newel.setAttribute('oncommand','bookmark_recyclerChrome.trashDelete(this)');
  newel.addEventListener('click',function(){var obj=this;bookmark_recyclerChrome.trashDelete(obj)},false);
  newel.setAttribute('tooltiptext',propFileObj.getString("DELETE"));
  nodeArray[2]=newel;
  //Restore button
  newel=document.createElement('toolbarbutton');
  newel.setAttribute('id',bookmark_recyclerChrome.initId('restoreButton',count));
  newel.setAttribute('class','bookmark-recycler-restoreButton');
  newel.addEventListener('click',function(){var obj=this;bookmark_recyclerChrome.trashRestore(obj)},false);
  //newel.setAttribute('oncommand','bookmark_recyclerChrome.trashRestore(this)');
  newel.setAttribute('tooltiptext',propFileObj.getString("RESTORE"));
  nodeArray[3]=newel;
  }  

  {
  //Create hbox and append tooltip ,menuitem ,toolbarbuttons and menuseparator
  parent=document.createElement('hbox');
  parent.setAttribute('id',bookmark_recyclerChrome.initId('menu-hbox',count));
  parent.appendChild(nodeArray[1]);
  parent.appendChild(nodeArray[2]);
  parent.appendChild(nodeArray[3]);
  }
  nodeArray.length=2;
  nodeArray[0]=parent;
  nodeArray[1]=document.createElement('menuseparator');
  //alert('create');
  return (nodeArray);
}

 bookmark_recyclerChrome.initializeTrashXUL=function (xmlDoc)
{ 
   //alert('trashxul')
  var objArr=xmlDoc.bookmark;//TODO selection by namespace only
  var i=0;
  if(objArr[0])
  document.getElementById(bookmark_recyclerChrome.trashElementId).setAttribute('class','full');
  while(objArr[i])
  {
  var arr_res= new Array();
  arr_res[0]=unescape(objArr[i]);
  arr_res[1]=unescape(objArr[i].@link);
  arr_res[2]=objArr[i].@folderId;
  arr_res[3]=objArr[i].@bookmarkId;
  
  var nodeArray=new Array();
  //alert('before crete');
  nodeArray=bookmark_recyclerChrome.createBookmarkNodeinXUL(arr_res); 
  ////alert("aan"+nodeArray[0]);
  var objtochange=document.getElementById('bookmark-recycler-search-panel');
  objtochange=bookmark_recyclerChrome.getActualObjectToChange(objtochange);
  bookmark_recyclerChrome.appendNodeArrayChildstoNode(objtochange,nodeArray);
  if(bookmark_recyclerChrome.counter)
  bookmark_recyclerChrome.counter++;
  i++;
  }
}

 bookmark_recyclerChrome.appendBookmarktoXUL=function (arr_res)
{
  var objtochange=document.getElementById('bookmark-recycler-search-panel');
  objtochange=bookmark_recyclerChrome.getActualObjectToChange(objtochange);
  //Getting Appropriate Unique idNumber
  {
  var arr=objtochange.childNodes;
  var pos=0;
  if(arr.length-2 >=0)
  {
   pos=arr.length-2;
   var str=arr[pos].getAttribute('id'); //last one is menuseparator
  //alert('Last Node number Id='+str);
   var count=Number(bookmark_recyclerChrome.getIdNumber(str));
   bookmark_recyclerChrome.nextInsert=count+1;
  }
  else //No element is present
  bookmark_recyclerChrome.nextInsert=1; 
  
  }
  
  var nodeArray=new Array();
  nodeArray=bookmark_recyclerChrome.createBookmarkNodeinXUL(arr_res);
  bookmark_recyclerChrome.appendNodeArrayChildstoNode(objtochange,nodeArray);
  if(bookmark_recyclerChrome.counter)
  bookmark_recyclerChrome.counter++;
}

bookmark_recyclerChrome.appendNodeArrayChildstoNode=function(obj,arr)
{
 ////alert('appendNodes'+arr.length);
 var i;
 for(i=0;i<arr.length;i++)
 obj.appendChild(arr[i]);
}

 bookmark_recyclerChrome.appendSearchPanelToXUL=function()
{ 
  var newel=document.createElement('menupopup');
  newel.setAttribute('id','bookmark-recycler-search-panel');
  var propFileObj=document.getElementById('bookmark-recycler-strings');
  newel.setAttribute('tooltiptext',propFileObj.getString("RECY_TOOLTIPTEXT"));
  newel.appendChild(document.createElement('vbox'));
  return newel;
}
 bookmark_recyclerChrome.trashEmpty=function ()
{
 var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
 var propFileObj=document.getElementById('bookmark-recycler-strings');
 var chkprmpt=prompts.confirm(null,propFileObj.getString("TRASH_EMPTY_TITLE"),propFileObj.getString("PROMPT_TEXT"));
 if(chkprmpt==1)
 {
   bookmark_recyclerChrome.emptyTrashIcon();
   bookmark_recyclerChrome.counter=1; 
   document.getElementById(bookmark_recyclerChrome.trashElementId).setAttribute('class','empty');
   var data='<bookmarkTrash><dummyNode dummy="dummy">dummy</dummyNode></bookmarkTrash>';
   var converter = bookmark_recyclerChrome.openFileWrite();
   converter.writeString(data);
   bookmark_recyclerChrome.fileClose(converter); 
 }
}

bookmark_recyclerChrome.popupnode.trashDelete=function () 
{
 var obj=document.popupNode;
 bookmark_recyclerChrome.updateTrashFile(obj);
}
bookmark_recyclerChrome.generateObj=function(obj)
{
 var idString=obj.getAttribute('id');
  //alert(idString);
var idNumber=bookmark_recyclerChrome.getIdNumber(idString);
 var menuitemId=bookmark_recyclerChrome.initId('menuitem',idNumber);
 //alert(menuitemId);
 var menuitemNode=document.getElementById(menuitemId);
 return menuitemNode;
}
bookmark_recyclerChrome.trashDelete=function(obj)
{

obj=bookmark_recyclerChrome.generateObj(obj);
//alert(obj);
(function(){
var calleeFun=arguments.callee;
if(bookmark_recyclerChrome.fileOpened==false)
bookmark_recyclerChrome.updateTrashFile(obj);
else{
//alert('dsa');
window.setTimeout(function(){calleeFun()},500);
}
})();
}
bookmark_recyclerChrome.restoreBookmark=function(obj)
{
 var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService);
 var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
 var tooltipId=obj.getAttribute('tooltip');
 ////alert(document.getElementById(tooltipId).childNodes[0].getAttribute("value"));
 var uri = ios.newURI(document.getElementById(tooltipId).childNodes[1].getAttribute("value"), null, null);
 var newBkmkId = bmsvc.insertBookmark(obj.getAttribute('bookmark-recycler-restoreid'), uri, bmsvc.DEFAULT_INDEX, "");
 bmsvc.setItemTitle(newBkmkId,document.getElementById(tooltipId).childNodes[0].getAttribute("value"));
}
bookmark_recyclerChrome.popupnode.trashRestore=function ()
{
 var obj=document.popupNode;
 bookmark_recyclerChrome.restoreBookmark(obj);
 bookmark_recyclerChrome.updateTrashFile(obj);
}

bookmark_recyclerChrome.trashRestore=function (obj)
{
 obj=bookmark_recyclerChrome.generateObj(obj);
 bookmark_recyclerChrome.restoreBookmark(obj);
 bookmark_recyclerChrome.updateTrashFile(obj);
}
bookmark_recyclerChrome.popupnode.getBookmarkIdForTrash=function ()
{
  var popUpNode =PlacesUIUtils.getViewForNode(document.popupNode);
  var node = popUpNode.selectedNode;
  var itemType = PlacesUtils.nodeIsFolder(node) ||
                   PlacesUtils.nodeIsTagQuery(node) ? "folder" : "bookmark";
  var concreteId = PlacesUtils.getConcreteItemId(node);
  var isRootItem = PlacesUtils.isRootItem(concreteId);
  var itemId = node.itemId;
  if (isRootItem || PlacesUtils.nodeIsTagQuery(node)) {
      // If this is a root or the Tags query we use the concrete itemId to catch
      // the correct title for the node.
      itemId = concreteId;
 }
 return itemId;
}

bookmark_recyclerChrome.getTrashXMLObj=function ()
{
  bookmark_recyclerChrome.getTrashXMLObj.xmlDoc=-1;
  var file = Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get("ProfD", Components.interfaces.nsIFile);
  file.append(bookmark_recyclerChrome.TRASHFOLDER);
  var filestring="file:///"+file.path+"/"+bookmark_recyclerChrome.TRASHFILE;
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.onreadystatechange=function(evt)
  {
    if(xmlhttp.readyState ==4 && xmlhttp.status == 0) //TODO check status
	{
	 var xmlDoc=1 , ex =1;
	 xmlDoc=xmlhttp.responseXML;
	 if(xmlDoc.getElementsByTagName('bookmark').length!=0)
	 {
	 var serializer = new XMLSerializer();
     var xml = serializer.serializeToString(xmlDoc);
	 //E4X method
	 ex=new XML(xml);
     bookmark_recyclerChrome.getTrashXMLObj.xmlDoc=ex;
	 }
	 else
	 bookmark_recyclerChrome.getTrashXMLObj.xmlDoc=<bookmarkTrash><dummyNode dummy="dummy">dummy</dummyNode></bookmarkTrash>;
	 return ex;
	}
  }
   xmlhttp.open("GET",filestring,true);
   xmlhttp.send();
   
}

bookmark_recyclerChrome.reflectChangeToTrashFile=function (xmlDoc,obj)
{
 var id=obj.getAttribute('bookmark-recycler-bookid');
 var folderId=obj.getAttribute('bookmark-recycler-restoreid');
 var tooltipId=obj.getAttribute('tooltip');
 var idNumber=bookmark_recyclerChrome.getIdNumber(tooltipId);
 bookmark_recyclerChrome.nextInsert=idNumber;
 //alert("reflect"+tooltipId);
 var link=document.getElementById(tooltipId).childNodes[1].getAttribute("value");
 //alert(link);
 
 var writeData='';
 writeData+="\n"+xmlDoc.dummyNode.toXMLString()+"\n";
   ////alert("before 4");
   //Using E4X
  for each(nd in xmlDoc.bookmark)
  {
  ////alert("in 4");
    if(!(nd.@bookmarkId==id && nd.@folderId==folderId && unescape(nd.@link)==link) )
	{
	writeData+=nd.toXMLString()+"\n";
	////alert('exact match not found');
	}
  }
  //alert('reflect');

  //Write the data to Trash file

  //alert('file is NOT oponed');  

  var converter=bookmark_recyclerChrome.openFileWrite();
  //alert(writeData);
  writeData='<bookmarkTrash>'+writeData+'</bookmarkTrash>';
  converter.writeString(writeData);
  bookmark_recyclerChrome.fileClose(converter);
  
  //Now its safe to Remove tooltip Node
 var tooltipNode=document.getElementById(tooltipId);
 //alert("REMOVED TOOTLIP"+tooltipNode);
 document.getElementById('bookmark-recycler-search-panel').removeChild(tooltipNode);
 
  
}

bookmark_recyclerChrome.trashEventHandle=function (obj,e)
{
  var btnCode;
  if ('object' == typeof e)
  {
    btnCode = e.button;
  }
  var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService);
  var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
 
  var chk_confirm;
  if(btnCode==0)
  {
   var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
   var tooltipId=obj.getAttribute('tooltip');
   var link=document.getElementById(tooltipId).childNodes[1].getAttribute("value");
   var uri = ios.newURI(link, null, null);
   bookmark_recyclerChrome.goToUrl(uri);
  }
else if(btnCode==1)
  {
      bookmark_recyclerChrome.updateTrashFile(obj);
  }

}
 bookmark_recyclerChrome.goToUrl=function(uri)
{
 if(!uri){
 var obj=document.popupNode;
var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
var tooltipId=obj.getAttribute('tooltip');
var link=document.getElementById(tooltipId).childNodes[1].getAttribute("value"); 
uri = ios.newURI(link, null, null);
}
openUILinkIn(uri.prePath+uri.path, "current");
}
 bookmark_recyclerChrome.modifyIcon=function ()
{
  bookmark_recyclerChrome.counter--;
  if(bookmark_recyclerChrome.counter==1)
  {
   document.getElementById(bookmark_recyclerChrome.trashElementId).setAttribute('class','empty');
   bookmark_recyclerChrome.emptyTrashIcon();
  }
}
 bookmark_recyclerChrome.updateTrashFile=function(obj)
{
  bookmark_recyclerChrome.fileOpened=true;

   //Remove the bookmark
   var objtochange=document.getElementById('bookmark-recycler-search-panel');
   objtochange=bookmark_recyclerChrome.getActualObjectToChange(objtochange);
   var i=0;
   var obj1;

     //alert('updateTrashfile'+obj);

   objtochange=bookmark_recyclerChrome.removeXulNode(objtochange,obj);
  // //alert(objtochange.childNodes[i].nodeName);
   //objtochange.removeChild(objtochange.childNodes[i]); //Removes separator
   //Reflect the change to Trash file
   bookmark_recyclerChrome.getTrashXMLObj();    
   (function()
   {
    var calleeFun=arguments.callee;
    if(bookmark_recyclerChrome.getTrashXMLObj.xmlDoc != -1)
	{
     bookmark_recyclerChrome.reflectChangeToTrashFile(bookmark_recyclerChrome.getTrashXMLObj.xmlDoc,obj);
     //Modify the Icon accordingly
     bookmark_recyclerChrome.modifyIcon();
	 //bookmark_recyclerChrome.getTrashXMLObj.xmlDoc = -1;
	bookmark_recyclerChrome.fileOpened=false;
	}
	else
    {
    window.setTimeout(function(){calleeFun()},500);
	}
   })();
   
   //alert(bookmark_recyclerChrome.fileOpened);
}
bookmark_recyclerChrome.openPreferences=function()
{
var win=Services.wm.getMostRecentWindow('bookmark-recycler:preferences');
if(win)
win.focus();
else
window.openDialog("chrome://bookmark-recycler/content/preferences.xul","bookmark-recycler-preferences-targetwindow", "chrome,toolbar,centerscreen"); 
}

