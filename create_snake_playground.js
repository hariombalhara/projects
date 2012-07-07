<<<<<<< HEAD
(function()
{
var  snake_playground=document.getElementById('snake_playground');
if(snake_playground)
{
 if(snake_playground.confirmation_pending)
 return;
 snake_playground.confirmation_pending=true;
 var response=confirm('Game is already running.Restart the game?');
 snake_playground.confirmation_pending=false;
 if(response)
 {
  document.body.removeChild(snake_playground);    
 }
 else
 return;
}
 
 var sscript=document.createElement('script');
 sscript.type="text/javascript";
 sscript.id="snake_script";
 sscript.src="https://raw.github.com/hariombalhara/snake/master/snake.js";
  document.getElementsByTagName('head')[0].appendChild(sscript);
 
 var sstyle=document.createElement('link');
 sstyle.href="https://raw.github.com/hariombalhara/snake/master/snake.css";
 sstyle.type="text/css";
 sstyle.rel="stylesheet";
 if(!document.querySelector('[src="'+sstyle.href+'"]'))
 document.getElementsByTagName('head')[0].appendChild(sstyle);

=======
(function() {
    var  snake_playground=document.getElementById('snake_playground');
    if(snake_playground) {
        return;
    }
    
    var script_type = "text/javascript",
        script_id = "snake_script",
        script_src = "http://c9.io/hariombalhara_1/snake/workspace/snake.js",
        style_href = "http://c9.io/hariombalhara_1/snake/workspace/snake.css",
        style_type = "text/css",
        style_rel = "stylesheet";
    if(!document.querySelector('[src="'+script_src+'"]')) {
        var sscript = document.createElement('script');
        sscript.src = script_src;
        sscript.id = script_id;
        sscript.type = script_type; 
        document.getElementsByTagName('head')[0].appendChild(sscript);
    }
    if(!document.querySelector('[src="'+style_href+'"]')) {
        var sstyle=document.createElement('link');
        sstyle.rel = style_rel;
        sstyle.type = style_type;
        sstyle.href = style_href;
        document.getElementsByTagName('head')[0].appendChild(sstyle);
    }
>>>>>>> bb93d68f286f53420b09f0ecaf81b7419f4357ff
})();