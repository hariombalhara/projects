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
 sscript.src="https://raw.github.com/hariombalhara/snake/latest/snake.js";
  document.getElementsByTagName('head')[0].appendChild(sscript);
 
 var sstyle=document.createElement('link');
 sstyle.href="https://raw.github.com/hariombalhara/snake/latest/snake.css";
 sstyle.type="text/css";
 sstyle.rel="stylesheet";
 if(!document.querySelector('[src="'+sstyle.href+'"]'))
 document.getElementsByTagName('head')[0].appendChild(sstyle);

})();