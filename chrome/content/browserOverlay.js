(function(){
//Namespace bookmark_recyclerChrome
if("undefined" == typeof(bookmark_recyclerChrome))
{ 
 bookmark_recyclerChrome ={
 TRASHFOLDER : "bookmark-recycler-extension",
 TRASHFILE : "trash.xml",
 nextInsert:false,
 counter:false,
 fileOpened:false,
 NAMESPACE : {uri:"http://hbalhara.blogspot.com" , name : "bookmark_recyclerChrome"},
 prefs: null,
 top: "",
 bottom:"",
 trashElementId:"",
 firstrun:true,
     insertTrashXulByPreference: function()
    {
	 //TODO:Improve this such that there is no need to event append the (NOT NEEDED) XUL element
     if(this.top==false){
	 this.trashElementId='bookmark-recycler-bottom';
     document.getElementById('PersonalToolbar').removeChild(document.getElementById('bookmark-recycler-item-top'));
	 }
	 else if(this.top ==true)
	 {
	 this.trashElementId='bookmark-recycler-top';
     document.getElementById('addon-bar').removeChild(document.getElementById('bookmark-recycler-bottom'));
	 document.getElementById('PersonalToolbar').setAttribute('collapsed','false');
	 }
    },
 // Initialize the extension
   startup: function()
   {
     // Register to receive notifications of preference changes
     
     this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.bookmark-recycler.");
     this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    //this.prefs.addObserver("", this, false);

	 this.top = this.prefs.getBoolPref("position.top");	 

	 this.insertTrashXulByPreference();
	 try{
     this.firstrun=this.prefs.getBoolPref("firstrun");
	 }
	 finally
	 {
	 if(this.firstrun)
	 {
	   this.prefs.setBoolPref("firstrun",false);
       this.createEnvironment();
	   window.setTimeout(function(){
		gBrowser.selectedTab=gBrowser.addTab('http://hbalhara.blogspot.com/p/firefox-addon#first-install');
		},1000);
     }
	 }
     this.createEnvironment();//Even if its not first run..check if folder has been deleted manually
	 
	 if(gBrowser)
	 gBrowser.addEventListener("DOMContentLoaded", this.initializeTrash(), false);
     this.onTrashLoad();
   },
   createEnvironment:function()
   {
    if(document.getElementById(this.trashElementId))
    {
     /*******************Create Required files and folder if not exist already******/ 
     var file =Components.classes["@mozilla.org/file/directory_service;1"].  
                     getService(Components.interfaces.nsIProperties).  
                     get("ProfD", Components.interfaces.nsIFile);  
     file.append(bookmark_recyclerChrome.TRASHFOLDER);
     if( !file.exists() || !file.isDirectory() )
     { // if it doesn't exist, create 
      file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
     } 
     file.append(bookmark_recyclerChrome.TRASHFILE);
     if( !file.exists())
     file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
    }
   }
	/*observe: function(subject, topic, data)
	{
	
		if (topic != "nsPref:changed")
		{
			return;
		}
	}*/
};
bookmark_recyclerChrome.popupnode={}; //Those functions which use document.popUpNode
bookmark_recyclerChrome.preferences={};
}
window.addEventListener("load",function() { bookmark_recyclerChrome.startup(); },false);
}
)();