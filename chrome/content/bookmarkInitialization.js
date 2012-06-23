bookmark_recyclerChrome.initializeTrash=function()
{ 
   if(!bookmark_recyclerChrome.counter)//keep track of whether trash is full or empty
   bookmark_recyclerChrome.counter=1;
   
   bookmark_recyclerChrome.getTrashXMLObj();

   var i=0;
 (function()
   {
    var calleeFun=arguments.callee;
    if(bookmark_recyclerChrome.getTrashXMLObj.xmlDoc != -1)
	{
	//alert('init');
	bookmark_recyclerChrome.initializeTrashXUL(bookmark_recyclerChrome.getTrashXMLObj.xmlDoc);
   
    if(bookmark_recyclerChrome.counter>1)
    {
      document.getElementById(bookmark_recyclerChrome.trashElementId).setAttribute('class','full');
    }
    else
    {
     document.getElementById(bookmark_recyclerChrome.trashElementId).setAttribute('class','empty');
     bookmark_recyclerChrome.emptyTrashIcon();
    }  
   }
   else{
    window.setTimeout(function(){calleeFun()},500);
	}
   })();
}
bookmark_recyclerChrome.onTrashLoad = function()
{
 //Attach events
 var obj=document.getElementById(bookmark_recyclerChrome.trashElementId);
 obj.addEventListener("dragenter",function(event){event.preventDefault()},false);
 obj.addEventListener("dragover",function(event){event.preventDefault()},false);
 obj.addEventListener("drop",function(event){bookmark_recyclerChrome.doDrop(event);},false);
}
