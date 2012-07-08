(function() {
    var  snake_playground=document.getElementById('snake_playground');
    if(snake_playground) {
        return;
    } 
    
    var script_type = "text/javascript",
        script_id = "snake_script",
        script_src = "http://php-hariombalhara.rhcloud.com/js/snake.js",
        style_href = "http://php-hariombalhara.rhcloud.com/css/snake.css",
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
})();