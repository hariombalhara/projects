(function main()
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
    var GULP_COUNTER_DIV_ID='snake_gulp_counter';
    var GULP_COUNTER_DIV_CLASS='counter';
    var LAST_BODY_PART_SELECTOR='#snake span:nth-last-child(1)';
    var SNAKE_FIGURE='<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><rect width="'+BODY_PART_SIZE+'" height="'+BODY_PART_SIZE+'" style="fill:rgb(0,0,255);stroke-width:1;stroke:rgb(255, 255, 255)"/></svg>';
    var SNAKE_BODY_PART_CLASS='snake_body_part';
    var SNAKE_BODY_PART_ID='snake_body_part';
    var body=document.body;
    body.style.overflow="hidden";
    
    
    var snake=window.snake={};//Snake Namespace    
    var point=snake.point={};//Holds the position of the point.
    var key_queue=snake.key_queue=[];//Holds the keys to be processed
    var isDestroyed=snake.isDestroyed=false;
    
    var window_availWidth=/*Math.max(document.body.clientWidth,*/document.documentElement.clientWidth/*)*/;
    var window_availHeight=/*Math.max(document.body.clientHeight,*/document.documentElement.clientHeight/*)*/;
    
    //Adjust the size of snake playground according to the available size of page and integral multiple of the movement made by snake
    var width=snake.width=Math.floor(window_availWidth-(window_availWidth%BODY_PART_SIZE));
    var height=snake.height=Math.floor(window_availHeight-(window_availHeight%BODY_PART_SIZE));

    function getIntegerPartFromString(str)
    {
        return parseInt(str,10);
    }
    function createSnakeElement(props)
    {
        var el=document.createElement(props.tagName);
        
        if(props.className)
        el.setAttribute('class',props.className);
        
        if(props.id)
        el.setAttribute('id',props.id);
        
        if(props.innerHTML)
        el.innerHTML=props.innerHTML;        
        if(props.style)
        {
        if(props.style.left)
        el.style.left=props.style.left+"px";
        
        if(props.style.top)
        el.style.top=props.style.top+"px";
        
        if(props.style.height)
        el.style.height=props.style.height+"px";
        
        if(props.style.width)
        el.style.width=props.style.width+"px";
        }
        el.appendChildWithInformation=appendChildWithInformation;
                
        
        return el;
    }
    
    var snake_playground=createSnakeElement({
        tagName:'div',
        className:'snake_playground',
        id:'snake_playground',
        style:{}
        });//Its the root element for the snake game
    
    
    function appendChildWithInformation(child){
    var el=createSnakeElement(child);
    this.appendChild(el);
    console.log('this inside appendChildWithInformation',this);
    return el;
    }
    

    var snake_body=snake_playground.appendChildWithInformation({
        tagName:'div',
        className:'snake',
        id:'snake',
        style:{
                height:height,
                width:width
              }
        });

    
    
    var gulp_counter_el=snake_playground.appendChildWithInformation({tagName:'div',
              className:GULP_COUNTER_DIV_CLASS,
              id:GULP_COUNTER_DIV_ID,
              innerHTML:'0'
             });
    
    //Finally append the snake playground to the body.
    body.appendChild(snake_playground);

    
    function restart_game()
    {
        kill_game();
        main(); 
    }
    
    function mark_point()
    {
         var x=(Math.random())*(getIntegerPartFromString(snake_playground.style.width));
         var y=(Math.random())*(getIntegerPartFromString(snake_playground.style.height));
         x=Math.ceil(x);
         y=Math.ceil(y);
         
         //Hnandle the case when random no is 1
         x-=BODY_PART_SIZE;
         y-=BODY_PART_SIZE;
         
         x=x-(x%BODY_PART_SIZE);
         y=y-(y%BODY_PART_SIZE);
         point.el=snake_playground.appendChildWithInformation({
             tagName:'div',
             className:'snake_point',
             id:'snake_point',
             innerHTML:SNAKE_FIGURE,
             style:{
                    left:x,
                    top:y
                    }
             });
         
         //Store the position of the point in snake namespace for easy accessibilty
         point.x=x;
         point.y=y;
         
         console.log('Point created at',x,y);
    }
    
    function add_to_queue(keyCode)
    {
        //FOR NOW ONLY THE LAST ELEMENT of QUEUE IS CONSIDERED
        if(key_queue.length==1)
        {
         key_queue.shift();
        }
        
        key_queue.push(keyCode);
    }
    function keypress_listener(e)
    {
        if(e.keyCode==LEFT_KEY_CODE ||e.keyCode==DOWN_KEY_CODE ||e.keyCode==UP_KEY_CODE ||e.keyCode==RIGHT_KEY_CODE )
        {
         e.preventDefault();
         e.stopPropagation();
         if(!isDestroyed)
          add_to_queue(e.keyCode);
         else
         alert('Game has already ended')
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
    
        //body.style.overflow="scroll";
        delete body.style.overflow;
    }
    
    function check_for_overlap(el)
    {
      //TODO:copy childnodes to an array cause domenodes processing is costly
      var last=body.querySelector(LAST_BODY_PART_SELECTOR);
      var last_style=last.style;
      var last_style_top=last_style.top;
      var last_style_left=last_style.left;
      var len=el.childNodes.length;
      for(var i=0;i<len-1;i++)
      {
       var child=el.childNodes[i];
       var child_style=child.style;
       var top=child_style.top;
       var left=child_style.left;
       if((top==last_style_top) && (left==last_style_left))
       snake_crashed_into_wall();
      }        
    }
    
    function check_for_up_crash(last_style)
    {
        if((getIntegerPartFromString(last_style.top))<0)
        snake_crashed_into_wall();
    }
    function check_for_left_crash(last_style)
    {
        if((getIntegerPartFromString(last_style.left))<0)
        snake_crashed_into_wall();
    }
    function check_for_right_crash(last_style,offset)
    {
       if((getIntegerPartFromString(last_style.left)+offset)>window_availWidth)
                snake_crashed_into_wall();            
    }
   function check_for_down_crash(last_style,offset)
   {
          if((getIntegerPartFromString(last_style.top)+offset)>window_availHeight)
            snake_crashed_into_wall();    
   }

    function process_keypress(el,keyCode)
    {
        var no_of_child_nodes=el.childNodes.length;
        var rotation={};
        rotation.value=el.childNodes[(no_of_child_nodes-1)].rotation;
        el.childNodes[no_of_child_nodes-1].rotation=rotation.value=(typeof rotation.value=="undefined")?ZERO_ROTATION:rotation.value;
        rotation.isNeg90=(rotation.value==NEGATIVE_90_ROTATION );
        rotation.isPos90=(rotation.value==POSITIVE_90_ROTATION );
        rotation.isNeg180=(rotation.value==NEGATIVE_180_ROTATION );
        rotation.isZero=(rotation.value==ZERO_ROTATION );
        
        var move_distance=BODY_PART_SIZE;
        var last=document.body.querySelector(LAST_BODY_PART_SELECTOR);
        var last_style=last.style;
        var offset=BODY_PART_SIZE;        
        var isItTheExpectedKey=true;
        switch(keyCode)
        {
            case LEFT_KEY_CODE:
            if(rotation.isNeg90 || rotation.isPos90 || rotation.isNeg180)
            {
                process_left_key(el,move_distance);
                check_for_left_crash(last_style);
            }
            break;
            
            case UP_KEY_CODE:
            if(rotation.isNeg90 ||rotation.isZero || rotation.isNeg180)
            {
                process_up_key(el,move_distance);
                check_for_up_crash(last_style);            
            }
            break;
            
            case RIGHT_KEY_CODE:
            if(rotation.isPos90 || rotation.isZero || rotation.isNeg90)
            {
                process_right_key(el,move_distance);
                check_for_right_crash(last_style,offset);      
            }
            break;

            case DOWN_KEY_CODE:
            if(rotation.isPos90 || rotation.isZero || rotation.isNeg180)
            {
                process_down_key(el,move_distance)
                check_for_down_crash(last_style,offset);
            }
            break;
            
            default:
            isItTheExpectedKey=false;
            alert('Unexpected key');
       }
       if(isItTheExpectedKey)
       {
           try_to_gulp(el);
       }
   }
   
    function try_to_gulp(el)
    {
      var last=body.querySelector(LAST_BODY_PART_SELECTOR);
      var last_style=last.style;
      var last_style_top=last_style.top;
      var last_style_left=last_style.left;
      console.log('Trying to Gulp',snake.point.x,last_style_left,snake.point.y,last_style_top);
      if(((snake.point.x+"px")==last_style_left) && ((snake.point.y+"px")==last_style_top))
      {
          console.log('finally Gulped');
          snake_playground.removeChild(point.el);
          gulp(el,true);
          mark_point();
      }      
    }
    function gulp(el,consume)
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
          
          var offsetx=0;
          var offsety=0;
          var firstChild=el.childNodes[0];
          var firstChild_style=firstChild.style;
          var left=getIntegerPartFromString(firstChild_style.left);
          var top=getIntegerPartFromString(firstChild_style.top);
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
         
          var span=createSnakeElement({
                tagName:'span',
                className:SNAKE_BODY_PART_CLASS,
                id:SNAKE_BODY_PART_ID+gulp.id,
                innerHTML:SNAKE_FIGURE,
                style:{
                       left:left+offsetx,
                       top:top+offsety
                      }
                });
          el.insertBefore(span,el.childNodes[0]);
         }
         gulp.count+=1;
         gulp_counter_el.innerHTML=gulp.count;
        }
        else
        {
            gulp.id+=1;
            el.appendChildWithInformation({
                tagName:'span',
                className:SNAKE_BODY_PART_CLASS,
                id:SNAKE_BODY_PART_ID+gulp.id,
                innerHTML:SNAKE_FIGURE,
                style:{
                       left:0,
                       top:0
                      }
                });
        }
        
    }
    
    function snake_crashed_into_wall()
    {
          if(isDestroyed)
          {
           alert('Already destroyed-snake_crashed_into_wall');
           return;
          }
          isDestroyed=true;
          kill_game();
          var response=confirm("Game Over.\nRestart the Game ?");          
          if(response)
          restart_game();
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
         var left_coordinate=getIntegerPartFromString(child_style.left);
         var top_coordinate=getIntegerPartFromString(child_style.top);

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
         var top_coordinate=getIntegerPartFromString(child_style.top);
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
         var top_coordinate=getIntegerPartFromString(child_style.top);
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
         var left_coordinate=getIntegerPartFromString(child_style.left);
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
        var left_coordinate=getIntegerPartFromString(child_style.left);
        var leave_last=false;
         
        if((rotation==POSITIVE_90_ROTATION) || (rotation==NEGATIVE_90_ROTATION))
        {
          leave_last=true;
          process_general(element,distance,leave_last);
          child_style.left=(left_coordinate-(distance))+"px";
          element.childNodes[key].rotation=NEGATIVE_180_ROTATION;
         }
      
    }
    function simulate_snake(el)
    {
      var queue=key_queue;
      var len=queue.length;
      
      if(len===0)
      {
        process_general(el,BODY_PART_SIZE);
        
        //Not pressing any key means snake is moving in direction of last body_part
        var last=body.querySelector(LAST_BODY_PART_SELECTOR);
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
         if(isDestroyed)
         return;
         check_for_overlap(el);
         try_to_gulp();
      }
      else
      {
       process_keypress(queue.pop());
      }
    }
    
    function make_initial_snake(el)
    {
     for(var i=0;i<NO_OF_INITIAL_BODY_PARTS;i++)
     {
        gulp(el);
        if(i>=1 && (i< NO_OF_INITIAL_BODY_PARTS))
        {
         el.childNodes[i].style.left=(getIntegerPartFromString(el.childNodes[i].style.left)+(i*BODY_PART_SIZE))+"px";
        }
     }
    }
    
    function start(el)
    {
     snake.interval=setInterval(function(){simulate_snake(el);},SPEED);    
     addKeyListener();
     make_initial_snake(el);
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
        snake.interval=setInterval(function(){simulate_snake(snake_body);},SPEED);
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
    start(snake_body);
    
})();
