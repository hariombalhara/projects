(function()
{
    "use strict";
    var LEFT_KEY_CODE=37;
    var UP_KEY_CODE=38;
    var RIGHT_KEY_CODE=39;
    var DOWN_KEY_CODE=40;
    var ESCAPE_KEY_CODE=27;
    var SPACE_KEY_CODE=32;//TO PAUSE THE GAME

    var NO_OF_INITIAL_BODY_PARTS=20;
    var POSITIVE_90_ROTATION="rotate(90deg)";
    var NEGATIVE_90_ROTATION="rotate(-90deg)";
    var NEGATIVE_180_ROTATION="rotate(-180deg)";
    var ZERO_ROTATION="";
    var BODY_PART_SIZE=20;
    var SPEED=70;
    var INCREASE_SIZE_BY=4;
    var snake=window.snake={};
    snake.point={};
    snake.key_queue=[];
    var body=document.body;
    body.style.overflow="hidden";
    snake.snake_figure='<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><rect width="'+BODY_PART_SIZE+'" height="'+BODY_PART_SIZE+'" style="fill:rgb(0,0,255);stroke-width:1;stroke:rgb(255, 255, 255)"/></svg>';
    snake.isDestroyed=false;
    var height_of_snake_figure=-1;
    
    var window_availWidth=/*Math.max(document.body.clientWidth,*/document.documentElement.clientWidth/*)*/;
    var window_availHeight=/*Math.max(document.body.clientHeight,*/document.documentElement.clientHeight/*)*/;
    
    var snake_playground=document.createElement('div');
    snake_playground.setAttribute('id','snake_playground');
    snake_playground.setAttribute('class','snake_playground');
    var div=document.createElement('div');
    div.setAttribute('class','snake');
    div.setAttribute('id','snake');
    
    snake_playground.appendChild(div);
    snake_playground.style.left=0;
    snake_playground.style.top=0;
    snake_playground.style.width=Math.floor(window_availWidth-(window_availWidth%BODY_PART_SIZE))+"px"
    snake_playground.style.height=Math.floor(window_availHeight-(window_availHeight%BODY_PART_SIZE))+"px";
    
    body.appendChild(snake_playground);
    var gulp_count_div=document.createElement('div');
    gulp_count_div.setAttribute('class','counter');
    gulp_count_div.setAttribute('id','snake_gulp_counter');
    gulp_count_div.innerHTML=0;
    
    snake_playground.appendChild(gulp_count_div);
    
    var last_body_part_selector='#snake span:nth-last-child(1)';
    function restart_game()
    {
        if(document.getElementById('snake_playground'))
        {
            document.body.removeChild(document.getElementById('snake_playground'))
            kill_game();
        }
        var sscript=document.createElement('script');
        sscript.src="http://c9.io/hariombalhara/test-project/workspace/snakes/snake.js";
        sscript.type="text/javascript";
         if(!document.getElementById('snake_script'))
        document.getElementsByTagName('head')[0].appendChild(sscript);

        var sstyle=document.createElement('link');
        sstyle.href="http://c9.io/hariombalhara/test-project/workspace/snakes/snake.css";
        sstyle.type="text/css";
        sstyle.rel="stylesheet";
        if(!document.querySelector('[src="'+sstyle.href+'"]'))
        document.getElementsByTagName('head')[0].appendChild(sstyle);
    }
    function mark_point()
    {
         var x=(Math.random())*(parseInt(snake_playground.style.width));
         var y=(Math.random())*(parseInt(snake_playground.style.height));
         x=Math.ceil(x);
         y=Math.ceil(y);
         
         //Hnandle the case when random no is 1
         x-=BODY_PART_SIZE;
         y-=BODY_PART_SIZE;
         
         x=x-(x%BODY_PART_SIZE);
         y=y-(y%BODY_PART_SIZE);
         var point=document.createElement('div');
         point.setAttribute('id','snake_point')
         point.setAttribute('class','snake_point');
         
         point.innerHTML=snake.snake_figure;
         
         snake.point.x=x;
         snake.point.y=y;
         point.style.left=x+"px";
         point.style.top=y+"px";
         //console.log(point.style.left,x);
         snake_playground.appendChild(point);
    }
    
    function add_to_queue(keyCode)
    {
        var queue=snake.key_queue;
        //FOR NOW ONLY THE LAST ELEMENT of QUEUE IS CONSIDERED
        if(queue.length==1)
        {
         queue.shift();
        }
        
        queue.push(keyCode);
    }
    function keypress_listener(e)
    {
        if(e.keyCode==LEFT_KEY_CODE ||e.keyCode==DOWN_KEY_CODE ||e.keyCode==UP_KEY_CODE ||e.keyCode==RIGHT_KEY_CODE )
        {
         e.preventDefault();
         e.stopPropagation();
         if(!snake.isDestroyed)
         {
          //process_keypress(e);
          add_to_queue(e.keyCode);
          check_for_overlap();
         }
        }
        else 
        {
         if(e.keyCode==ESCAPE_KEY_CODE)
         {
            e.preventDefault();
            e.stopPropagation();
            kill_game();
         }
         else if(e.keyCode==SPACE_KEY_CODE)
         {
             e.preventDefault();
                      e.stopPropagation();

             if(typeof snake.paused == "undefined")
              snake.paused=false;
              
              if(snake.paused===true)
              resume();
              else
              pause();
              
              snake.paused=toggle(snake.paused);
         }
        }
        
    }
    function toggle(boolvar)
    {
     if(typeof boolvar !='boolean')
     {
         throw new Error('boolvar is not a bool');
     }
     if(boolvar===true)
     boolvar=false;
     else
     boolvar=true;
     return boolvar;
    }
function kill_game()
{
    stop();
    body.removeChild(snake_playground);
    body.style.overflow="scroll";
}
function check_for_overlap()
    {
        //TODO:copy childnodes to an array cause domenodes processing is costly
      var last=body.querySelector(last_body_part_selector);
      var last_style=last.style;
      var last_style_top=last_style.top;
      var last_style_left=last_style.left;
      var len=div.childNodes.length;
      for(var i=0;i<len-1;i++)
      {
       var child=div.childNodes[i];
       var child_style=child.style;
       var top=child_style.top;
       var left=child_style.left;
       if((top==last_style_top) && (left==last_style_left))
       snake_crashed_into_wall();
      }
        
    }
    function check_for_up_crash(last_style)
    {
                    if((parseInt(last_style.top))<0)
                snake_crashed_into_wall();
    }
    function check_for_left_crash(last_style)
    {
                if((parseInt(last_style.left))<0)
                snake_crashed_into_wall();
    }
    function process_keypress(keyCode)
    {
        var no_of_child_nodes=div.childNodes.length;
        var rotation={};
        rotation.value=div.childNodes[(no_of_child_nodes-1)].rotation;
        div.childNodes[no_of_child_nodes-1].rotation=rotation.value=(typeof rotation.value=="undefined")?ZERO_ROTATION:rotation.value;
        rotation.isNeg90=(rotation.value==NEGATIVE_90_ROTATION );
        rotation.isPos90=(rotation.value==POSITIVE_90_ROTATION );
        rotation.isNeg180=(rotation.value==NEGATIVE_180_ROTATION );
        rotation.isZero=(rotation.value==ZERO_ROTATION );
        
        var move_distance=BODY_PART_SIZE;
        var last=document.body.querySelector(last_body_part_selector);
        var last_style=last.style;
        var offset=BODY_PART_SIZE;
        height_of_snake_figure=BODY_PART_SIZE;
        
        var isItTheExpectedKey=false;
        switch(keyCode)
        
        {
        case LEFT_KEY_CODE:
            isItTheExpectedKey=true;
            if(rotation.isNeg90 || rotation.isPos90 || rotation.isNeg180)
            {
                process_left_key(div,move_distance);
                check_for_left_crash(last_style);
            }
            
            
            break;
            
        case UP_KEY_CODE:
            isItTheExpectedKey=true;
            if(rotation.isNeg90 ||rotation.isZero || rotation.isNeg180)
            {
                process_up_key(div,move_distance);
                check_for_up_crash(last_style);            
            }
            
            break;
            
        case RIGHT_KEY_CODE:
        isItTheExpectedKey=true;
            if(rotation.isPos90 || rotation.isZero || rotation.isNeg90)
            {
                
                process_right_key(div,move_distance);
          check_for_right_crash(last_style,offset);      
                
            }
            
            
            break;

        case DOWN_KEY_CODE:
            isItTheExpectedKey=true;
            if(rotation.isPos90 || rotation.isZero || rotation.isNeg180)
            {
                
                process_down_key(div,move_distance)
                
              check_for_down_crash(last_style,offset);
            }
            
            break;
       }
       if(isItTheExpectedKey)
       {
           try_to_gulp();
       }
   }
   function check_for_right_crash(last_style,offset)
   {
       if((parseInt(last_style.left)+offset)>window_availWidth)
                snake_crashed_into_wall();
            
   }
   function check_for_down_crash(last_style,offset)
   {
          if((parseInt(last_style.top)+offset)>window_availHeight)
            snake_crashed_into_wall();    
   }

    function try_to_gulp()
    {
      var last=body.querySelector(last_body_part_selector);
      var last_style=last.style;
      var last_style_top=last_style.top;
      var last_style_left=last_style.left;
      //console.log(snake.point.x,last_style_left,snake.point.y,last_style_top);
      if(((snake.point.x+"px")==last_style_left) && ((snake.point.y+"px")==last_style_top))
      {
          snake_playground.removeChild(document.body.querySelector('.snake_playground div:last-child'));
          gulp(div,true);
          mark_point();
      }
      
    }
    function gulp(div,consume)
    {
        if((typeof gulp.id) == "undefined")
        gulp.id=0;
        if((typeof gulp.count) == "undefined")
        gulp.count=0;
        if(consume===true)
        {
         
         for(var i=0;i<INCREASE_SIZE_BY;i++)
         {         
          gulp.id+=1;
          var span=document.createElement('span');
          span.setAttribute('class','snake_body_part');
          span.setAttribute('id','snake_body_part'+gulp.id);
          span.innerHTML=snake.snake_figure;
          var span_style=span.style;
          var offsetx=0;
          var offsety=0;
          var firstChild=div.childNodes[0];
          var firstChild_style=firstChild.style;
          var left=parseInt(firstChild_style.left);
          var top=parseInt(firstChild_style.top);
          var rotation=firstChild.rotation;
          span.rotation=rotation;
          
          
          //The insertion philosophy is opposite to usual
          if(rotation==NEGATIVE_180_ROTATION)
          offsetx=BODY_PART_SIZE;
          else if(rotation==ZERO_ROTATION)
          offsetx=-BODY_PART_SIZE;
          else if(rotation==POSITIVE_90_ROTATION)
          offsety=-BODY_PART_SIZE;
          else if(rotation==NEGATIVE_90_ROTATION)
          offsety=BODY_PART_SIZE;
         
          if((offsetx===0) && (offsety===0))
          console.log("RAISE EXCEPTION HERE");
         
          span_style.left=left+offsetx+"px";
          span_style.top=top+offsety+"px";     
          
         // alert("id="+gulp.id+",left="+span_style.left+",top="+span_style.top+","+span.rotation+","+firstChild.getAttribute('id')+","+firstChild_style.top)
          div.insertBefore(span,div.childNodes[0]);
         }
         gulp.count+=1;
         document.getElementById('snake_gulp_counter').innerHTML=gulp.count;
        }
        else
        {
            gulp.id+=1;
            var span=document.createElement('span');
            span.setAttribute('class','snake_body_part');
            span.setAttribute('id','snake_body_part'+gulp.id);
            span.style.color="red";
            span.innerHTML=snake.snake_figure;
            var span_style=span.style;
            span_style.left=0;
            span_style.top=0;
            div.appendChild(span);
        }
        
    }
    
    function destroy_body_part()
    {
     div.removeChild(div.childNodes[0]);
    }
    function snake_crashed_into_wall()
    {
          if(snake.isDestroyed)
          return;
          snake.isDestroyed=true;
          pause();
          var response=confirm("Game Over.\nRestart the Game ?");
          
          if(response)
          restart_game();
          else
          kill_game();
          
    }
    
function process_general(element,distance,leave_last)
{
    
    //TODO: make a copy of node list as traversing it is costly.
        var len=element.childNodes.length;
        var up_to=len;
    
        if(leave_last)
        up_to=len-1;
        
        for(var i=0;i<up_to;i++)
        {
         var child=element.childNodes[i];
         var child_style=child.style;
         
         child.rotation=((typeof child.rotation)=="undefined")?ZERO_ROTATION:child.rotation;
         var rotation=child.rotation;
         
         var rotation_flag=false;
         if(child.rotation==POSITIVE_90_ROTATION || child.rotation==NEGATIVE_90_ROTATION)
         rotation_flag=true;
         var lookahead_rotation_flag=-1;
         var left_coordinate=parseInt(child_style.left);
         var top_coordinate=parseInt(child_style.top);
       //  if(document.getElementById('snake_gulp_counter').innerHTML=="1")   
    //     alert(child.getAttribute('id')+","+rotation+","+left_coordinate+":"+top_coordinate)
         if(i+1<len)
         {
              if(element.childNodes[i+1].rotation==POSITIVE_90_ROTATION || element.childNodes[i+1].rotation==NEGATIVE_90_ROTATION)
              lookahead_rotation_flag=true;
              if(element.childNodes[i+1].rotation==ZERO_ROTATION || element.childNodes[i+1].rotation==NEGATIVE_180_ROTATION)
              lookahead_rotation_flag=false;
         }
         
         
         if(((typeof rotation_flag)==="undefined") ||  (rotation_flag===false))
         {
             child.isRotated=false;
          
            if(((typeof lookahead_rotation_flag)!=="undefined") && (lookahead_rotation_flag===true))
            {
             child.isRotated=true; 
             child.rotation=element.childNodes[i+1].rotation;
             //Simulate rotation
             if(child.rotation == NEGATIVE_90_ROTATION)
             child_style.top=(top_coordinate-(distance))+"px";
             if(child.rotation == POSITIVE_90_ROTATION)
             child_style.top=(top_coordinate+(distance))+"px";
            }
            else
            {
                   if(rotation==ZERO_ROTATION)
                child_style.left=(left_coordinate+(distance))+"px";
             else if(rotation==NEGATIVE_180_ROTATION)
                child_style.left=(left_coordinate-(distance))+"px";
            }
            
         }
         else //rotation flag is true
         {
            if(((typeof lookahead_rotation_flag)==="undefined") || (lookahead_rotation_flag===false))
            {
             child.isRotated=false; 
             child.rotation=element.childNodes[i+1].rotation;
              //Simulate rotation
              if(child.rotation == ZERO_ROTATION)
             child_style.left=(left_coordinate+(distance))+"px";
             if(child.rotation == NEGATIVE_180_ROTATION)
             child_style.left=(left_coordinate-(distance))+"px";
             
            }
            else
            {
                 if(rotation==NEGATIVE_90_ROTATION)
                child_style.top=(top_coordinate-(distance))+'px';
                else if(rotation==POSITIVE_90_ROTATION)
                child_style.top=(top_coordinate+(distance))+'px';
                
            }
         }
         
        }
}

    function process_down_key(element,distance)
    {
         var children=element.childNodes;
         var key=children.length-1;
         var rotation=children[key].rotation;
         var child_style=children[key].style;
         var top_coordinate=parseInt(child_style.top);
         var leave_last=false;
         if((rotation==ZERO_ROTATION) || (rotation==NEGATIVE_180_ROTATION))
         {
            leave_last=true;
            process_general(element,distance,leave_last);
            child_style.top=(top_coordinate+(distance))+"px";
            element.childNodes[key].rotation=POSITIVE_90_ROTATION;
         }       
    }
    
    function process_up_key(element,distance){
         
         var children=element.childNodes;
         var key=children.length-1;
         var rotation=children[key].rotation;
         var child_style=children[key].style;
         var top_coordinate=parseInt(child_style.top);
         var leave_last=false;
         
         if((rotation==ZERO_ROTATION) || (rotation==NEGATIVE_180_ROTATION))
         {
          leave_last=true;
          process_general(element,distance,leave_last);
          child_style.top=(top_coordinate-(distance))+"px";
          element.childNodes[key].rotation=NEGATIVE_90_ROTATION;
         }
    }
    
        
        function process_right_key(element,distance){
         var children=element.childNodes;
         var key=children.length-1;
         var rotation=children[key].rotation;
         var child_style=children[key].style;
         var left_coordinate=parseInt(child_style.left);
         var leave_last=false;
         
         if((rotation==POSITIVE_90_ROTATION) || (rotation==NEGATIVE_90_ROTATION))
         {
          leave_last=true;
          process_general(element,distance,leave_last);
          child_style.left=(left_coordinate+(distance))+"px";
          element.childNodes[key].rotation=ZERO_ROTATION;
         }
      
    }
        function process_left_key(element,distance){
        var children=element.childNodes;
        var key=children.length-1;
        var rotation=children[key].rotation;
        var child_style=children[key].style;
        var left_coordinate=parseInt(child_style.left);
        var leave_last=false;
         
        if((rotation==POSITIVE_90_ROTATION) || (rotation==NEGATIVE_90_ROTATION))
        {
          leave_last=true;
          process_general(element,distance,leave_last);
          child_style.left=(left_coordinate-(distance))+"px";
          element.childNodes[key].rotation=NEGATIVE_180_ROTATION;
         }
      
    }
    function simulate_snake()
    {
      var queue=snake.key_queue;
      var len=queue.length;
      
      if(len===0)
      {
        process_general(div,BODY_PART_SIZE);
        
        //Not pressing any key means snake is moving in direction of last body_part
        var last=body.querySelector(last_body_part_selector);
        var rotation=last.rotation;
        var last_style=last.style;
       // console.log("STYLE",last_style)
        var offset=BODY_PART_SIZE;//Need to adjust it
        if(rotation==NEGATIVE_180_ROTATION)
         {
             check_for_left_crash(last_style);
         }
         else if(rotation==ZERO_ROTATION)
         {
          check_for_right_crash(last_style,offset);
         }
         else if(rotation==POSITIVE_90_ROTATION)
         {
             check_for_down_crash(last_style,offset);
         }
         else if(rotation==NEGATIVE_90_ROTATION)
         {
             check_for_up_crash(last_style);
         }
         if(snake.isDestroyed)
         return;
         check_for_overlap();
         try_to_gulp();
      }
      else
      {
       process_keypress(queue.pop());
      }
    }
    for(var i=0;i<NO_OF_INITIAL_BODY_PARTS;i++)
    {
        gulp(div);
        if(i>=1 && (i< NO_OF_INITIAL_BODY_PARTS))
        {
         div.childNodes[i].style.left=(parseInt(div.childNodes[i].style.left)+(i*BODY_PART_SIZE))+"px";
        }
        
    }
    function start()
    {
     snake.interval=setInterval(simulate_snake,SPEED);    
     addKeyListener();
    }
    function stop()
    {
     clearInterval(snake.interval);    
     removeKeyListener();
    }
    function pause()
    {
     clearInterval(snake.interval);   
    }
    function resume()
    {
        snake.interval=setInterval(simulate_snake,SPEED)
    }
    mark_point();    
    function addKeyListener()
    {
     document.addEventListener("keydown",keypress_listener,true);
    }
    function removeKeyListener()
    {
     document.removeEventListener("keydown",keypress_listener);
    }
    start();
    
})();
