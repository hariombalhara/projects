(function()
{
if(document.getElementById('snake_playground'))
{
 document.body.removeChild(document.getElementById('snake_playground'))
}
 var sscript=document.createElement('script');
 sscript.src="http://c9.io/hariombalhara/test-project/workspace/snakes/snake.js";
 sscript.type="text/javascript";
 document.getElementsByTagName('head')[0].appendChild(sscript);

 var sstyle=document.createElement('link');
 sstyle.href="http://c9.io/hariombalhara/test-project/workspace/snakes/snake.css";
 sstyle.type="text/css";
 sstyle.rel="stylesheet";
 document.getElementsByTagName('head')[0].appendChild(sstyle);

})();