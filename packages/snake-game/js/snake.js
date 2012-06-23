(function main() {
    "use strict";
    var LEFT_KEY_CODE = 37,
        UP_KEY_CODE = 38,
        RIGHT_KEY_CODE = 39,
        DOWN_KEY_CODE = 40,
        ESCAPE_KEY_CODE = 27,
        SPACE_KEY_CODE = 32,//TO PAUSE THE GAME
        RESTART_KEY_CODE = 82,//R KEY
        SAVE_KEY_CODE = 113,//F2 KEY
        NO_OF_INITIAL_BODY_PARTS = 2,
        POSITIVE_90_ROTATION = "rotate(90deg)",
        NEGATIVE_90_ROTATION = "rotate(-90deg)",
        NEGATIVE_180_ROTATION = "rotate(-180deg)",
        ZERO_ROTATION = "",
        BODY_PART_SIZE, 
        PLAYGROUND_DIMENSION = 550,
        SPEED = 60,
        INCREASE_SIZE_BY = 2,
        GULP_COUNTER_DIV_ID = 'snake_gulp_counter',
        GULP_COUNTER_DIV_CLASS = 'snake_gulp_counter',
        LAST_BODY_PART_SELECTOR = '#snake span:nth-last-child(1)',
        SNAKE_FIGURE,
        PLAYGROUND_CLASS = 'snake_playground',
        PLAYGROUND_ID = 'snake_playground',
        SNAKE_BODY_CLASS = 'snake',
        SNAKE_BODY_ID = 'snake',
        SNAKE_BODY_PART_CLASS = 'snake_body_part',
        SNAKE_BODY_PART_ID = 'snake_body_part',
        GAME_STATE_CLASS = 'snake_state',
        GAME_STATE_ID = 'snake_state',
        GAME_STATE_HTML = '<b>PAUSED</b>',
        CRASH_OPTIONS_CLASS = 'crash_options',
        CRASH_OPTIONS_ID = 'crash_options',
        CRASH_OPTIONS_HTML =  "Game Over.",
        IFRAME_ID = "snake_iframe",
        IFRAME_SRC = "https://hariombalhara.in/snake/personalise.html",
        STATES = {
            RUNNING: 0, 
            PAUSED: 1,
            ENDED: 2, //Game has ended .But things are still there.
            INITIALISING: 3,
            DESTROYED: 4 //Games has ended and complete playground has been destroyed
            },
        MSG_TYPE = { //It has a duplicate in personalise.js
            UPLOAD_DATA: 'UPLOAD_DATA',
            DATABASE_UPDATED: 'DATABASE_UPDATED',
            UPDATE_PAGE: 'UPDATE_PAGE',
            INITIATE_LOGIN: 'INITIATE_LOGIN',
            INITIALIZE_HOST_PAGE: 'INITIALIZE_HOST_PAGE'
        },
        MODE = { //It has duplicate in personalise.js
            SAVE_KILL: 0,
            SAVE: 1,
            SAVE_KILL_RESTART:2
        },
        playground_container,
        body = document.body,
        snake = window.snake = {},//Snake Namespace
        point = snake.point = {},//Holds the position of the point.
        original_cfg = snake.original_cfg = {},//It will hold the original style information for the page
        key_queue = snake.key_queue = [],//Holds the keys to be processed
        window_availWidth = -1,
        window_availHeight = -1,
        width = -1,
        height = -1,
        snake_playground = {},
        snake_body = {},
        state_of_game_el = {},
        gulp_counter_el = {},
        startover_max_counter = 0,
        noSignIn = false,
        score = 0,
        highestScore = 0,
        crash_options,
        iframe,
        login_el,
        loggedIn,
        highestScore_el,
        gameData = {},
        bodyMap = gameData.bodyMap = [],
        cursor = {},
        __log;
        
    function logsOff() {
        __log = console.log;
        console.log = function() {};
    }
    function logsOn() {
        console.log = __log;
    }
    logsOff();
    function getIntPartFromStr(str) {
        return parseInt(str, 10);
    }
    function isDestroyed() {
        if (snake.state === STATES.DESTROYED) {
            return true;
        } else {
            return false;
        }
    }
    function isEnded() {
        if (snake.state === STATES.ENDED) {
            return true;
        } else {
            return false;
        }
    }
    function copy_style(el, save_obj) {
        var style = el.style,
            obj_style = {},
            i;
        if (!save_obj.style) {
            obj_style = save_obj.style = {};
        } else {
            obj_style = save_obj.style;
        }
        for (i in style) { //TODO:Need to be more specific cause style can have methods too.This is a very genric approach,can cause problem in future
            obj_style[i] = style[i];
        }
    }
    //Save the current style info in case something wrong happens or fore restoration
    function saveCurrentCfg() {
        var b = original_cfg.body = {};
        b.style = {};
        b.style.overflow = body.style.overflow;
        b.style.margin = body.style.margin;
        original_cfg.document={title:document.title};
        b.onbeforeunload = body.onbeforeunload; //TODO:Test it by attaching an onbeforeunload function to body on original site.
        //copy_style(body, snake.original_cfg.body);
    }
    function actonbeforeunload() {
      return 'Unsaved Changes';//Not shown
    }
    function modifyCfg() {
        body.style.overflow = "hidden";
        body.style.margin = "0";
        body.onbeforeunload = actonbeforeunload;
    }    
    function moveStateTo(state) {
        if (snake.state === STATES.DESTROYED) {
            clearInterval(snake.interval);
            return;
        }
        if (state === STATES.PAUSED) {
            snake.paused = true;
            snake.state = state;
            state_of_game_el.innerHTML = "PAUSED";
            clearInterval(snake.interval);
        } else if (state === STATES.ENDED) {
            snake.state = state;
            state_of_game_el.innerHTML = "ENDED";
            clearInterval(snake.interval);
        } else if (state == STATES.RUNNING) {
            snake.paused = false;
            state_of_game_el.innerHTML = "";
            snake.interval = setInterval(function() {simulateSnake(snake_body);}, SPEED);
        }
    }
    function getDimensions() {
        var common;
        /*window_availWidth = snake_playground.offsetWidth;
        window_availHeight = snake_playground.offsetHeight;
        if(window_availHeight > window_availWidth) {
            common = window_availHeight = window_availWidth;
        } else {
            common = window_availWidth = window_availHeight;
        }*/
        
        common = PLAYGROUND_DIMENSION;
        BODY_PART_SIZE = Math.ceil(0.02 * common) ;
        SNAKE_FIGURE = '<svg xmlns = "http://www.w3.org/2000/svg" version="1.1"><rect class="snake_figure" id="snake_figure" width="' + BODY_PART_SIZE + '" height="' + BODY_PART_SIZE + '"/></svg>',
        width = height = snake.width = snake.height = Math.floor(common-(common%BODY_PART_SIZE));
    }
    
    function getDimensions_orig() {
        window_availWidth = snake_playground.offsetWidth;
        window_availHeight = snake_playground.offsetHeight;
        width = snake.width = Math.floor(window_availWidth-(window_availWidth%BODY_PART_SIZE));
        height = snake.height = Math.floor(window_availHeight-(window_availHeight%BODY_PART_SIZE));
    }
    function appendChildWithInformation(child) {
        var el = createSnakeElement(child);
        this.appendChild(el);
        return el;
    }
    function createSnakeElement(props) {
        var el = document.createElement(props.tagName),
            props_style=props.style,
            i;
        if (props.className) {
            el.setAttribute('class', props.className);
        }
        if (props.id) {
            el.setAttribute('id', props.id);
        }
        if (props.innerHTML) {
            el.innerHTML = props.innerHTML;
        }
        if ((typeof props_style) !== "undefined") { //TODO:make it a generic style copier.
                for(i in props_style) {
                    el.style[i] = props.style[i];
                }
            }
        el.appendChildWithInformation = appendChildWithInformation;
        return el;
    }
    function insertFrame() {
        iframe = document.createElement('iframe');
        iframe.id = IFRAME_ID;
        iframe.src = IFRAME_SRC;
        snake_playground.appendChild(iframe);
    }

    function gotAssertion(assertion) {
        var container = {
            msgType:MSG_TYPE.INITIATE_LOGIN,
            assertion:assertion,
            audience:location.host
        };
       postToHostingSite(container);
    }
    function init_persona_login(e) {
        e.preventDefault();
        navigator.id.get(gotAssertion);
    }
    function continueAsGuest() {
        login_el.style.display = "none";
        noSignIn = true;
        gulp_counter_el.style.display = "block";
        cacheGameData();
        makeInitialSnake(snake_body);
        markPoint(snake_body);
    }
    function updateLoginButton() {
        var login_anchor=document.createElement('a');
        var nologin_anchor=document.createElement('a');
        login_anchor.onclick = init_persona_login;
        login_anchor.href = "javascript:void(null)";
        nologin_anchor.href = "javascript:void(null)";
        nologin_anchor.innerHTML = "OR &nbsp;&nbsp;GuestIn";
        nologin_anchor.onclick = continueAsGuest;
        login_el.setAttribute('class','login_snake_game');
        login_el.appendChild(login_anchor);
        login_el.appendChild(nologin_anchor);
    }
    function insertLoginButton() {
        login_el=document.createElement('div');
        login_el.id = "login_snake_game";
        login_el.setAttribute('class',"login_snake_game");
        login_el.setAttribute('class',login_el.getAttribute('class')+" waiting");
        snake_playground.appendChild(login_el);
    }
    function dragPlaygroundEnter(e) {
        e.stopPropagation();
    }
    function makePlaygroundDraggable(el) { 
        el.draggable = "true";
        el.addEventListener('dragstart',dragPlaygroundStart,false);
        el.addEventListener('dragend',dragPlaygroundEnd,false);
        playground_container.addEventListener('dragenter',dragPlaygroundEnter,false);
        playground_container.addEventListener('dragover',dragPlaygroundOver,false);
    }
    function setupPlayground() {
        playground_container = createSnakeElement({
            tagName: 'div',
            className: 'playground_container',
            style: {
                height: "100%",
                width: "100%"
            }
        })
        snake_playground = playground_container.appendChildWithInformation.call(playground_container,{
            tagName: 'div',
            className: PLAYGROUND_CLASS,
            id: PLAYGROUND_ID,
            style: {
            height: PLAYGROUND_DIMENSION + "px",
            width: PLAYGROUND_DIMENSION + "px"
        }
    });
        makePlaygroundDraggable(snake_playground);
        snake_body = snake_playground.appendChildWithInformation.call(snake_playground, {
            tagName: 'div',
            className: SNAKE_BODY_CLASS,
            id: SNAKE_BODY_ID,
            style: {
            }
        });
        gulp_counter_el = playground_container.appendChildWithInformation.call(playground_container, {
            tagName: 'div',
            className: GULP_COUNTER_DIV_CLASS,
            id: GULP_COUNTER_DIV_ID,
            innerHTML: score,
            style: {
                display:"none"
            }
        });
        highestScore_el = playground_container.appendChildWithInformation.call(playground_container, {
            tagName: 'div',
            className: 'highestScore',
            innerHTML:highestScore
        });

        state_of_game_el = playground_container.appendChildWithInformation.call(playground_container, {
            tagName: 'div',
            className: GAME_STATE_CLASS,
            id: GAME_STATE_ID,
            innerHTML: GAME_STATE_HTML
        });
        crash_options = snake_playground.appendChildWithInformation.call(snake_playground, {
            tagName: 'div',
            className: CRASH_OPTIONS_CLASS,
            id: CRASH_OPTIONS_ID,
            innerHTML: CRASH_OPTIONS_HTML
        });
        
        body.appendChild(playground_container);
        insertLoginButton();
        insertFrame();
        createPoint();
    }
    function updateCounters() {
         score += 1;
         if(score > highestScore) {
            highestScore += 1;
         }
         gulp_counter_el.innerHTML = score;
         highestScore_el.innerHTML = highestScore;
    }
    function gulp(el, consume) {
        var i;
        if((typeof gulp.id) === "undefined") {
            gulp.id=0;
        }
        if((typeof gulp.count) === "undefined") {
            gulp.count=0;
        }
        if(consume === true) {
            for (i = 0; i < INCREASE_SIZE_BY; i++) {
                gulp.id+=1;
                var offsetx=0;
                var offsety=0;
                var firstChild = el.childNodes[0];
                var firstChild_style = firstChild.style;
                var left = getIntPartFromStr(firstChild_style.left);
                var top = getIntPartFromStr(firstChild_style.top);
                var rotation = firstChild.rotation;
                //The insertion philosophy is opposite to usual
                if(rotation === NEGATIVE_180_ROTATION) {
                    offsetx = BODY_PART_SIZE;
                } else if(rotation === ZERO_ROTATION) {
                    offsetx=-BODY_PART_SIZE;
                } else if(rotation === POSITIVE_90_ROTATION) {
                    offsety=-BODY_PART_SIZE;
                } else if(rotation === NEGATIVE_90_ROTATION) {
                    offsety = BODY_PART_SIZE;
                }
                if((offsetx === 0) && (offsety === 0)) {
                    console.log("RAISE EXCEPTION HERE");
                }
                var span = createSnakeElement({
                    tagName: 'span',
                    className: SNAKE_BODY_PART_CLASS,
                    id: SNAKE_BODY_PART_ID+gulp.id,
                    innerHTML: SNAKE_FIGURE,
                    style: {
                        left:left+offsetx+"px",
                        top:top+offsety+"px"
                    }
                });
                span.rotation = rotation;
                el.insertBefore(span, el.childNodes[0]);
            }
            gulp.count+=1;
            updateCounters();
        } else {
            gulp.id+=1;
            el.appendChildWithInformation.call(el, {
                tagName:'span',
                className:SNAKE_BODY_PART_CLASS,
                id:SNAKE_BODY_PART_ID+gulp.id,
                innerHTML:SNAKE_FIGURE
            });
        }
    }
    function dragPlaygroundOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move"
        movePlayground(e);
    }
    function movePlayground(e) {
       
       var x = e.clientX;
       var y = e.clientY
       var diffx = (x - cursor.x);
       var diffy = (y - cursor.y);
       snake_playground.style.left = snake_playground.offsetLeft + diffx + "px";
       snake_playground.style.top = snake_playground.offsetTop + diffy +"px"; 
       cursor.x = x;
       cursor.y = y;
    }
    function dragPlaygroundStart(e) {
        snake.paused = true; 
        moveStateTo(STATES.PAUSED);
        cursor.x = e.clientX;
        cursor.y = e.clientY;
//        e.target.style.opacity = "0.3";
        e.dataTransfer.setData('text/html',"Hello Beign dragged")
        var dragIcon = document.createElement('img');
        dragIcon.src = 'https://hariombalhara.in/snake/images/ajax-loader.gif';
        dragIcon.width = 100;
        e.dataTransfer.setDragImage(dragIcon, -10, -10);
        e.dataTransfer.effectAllowed = "move";
        
        //Place the snake at ir original positon with absolute positioning.Cause placement of div will change when postioning type changes.
        snake_playground.style.left = snake_playground.offsetLeft +"px";
        snake_playground.style.top = snake_playground.offsetTop + "px"; 
        snake_playground.style.position = "absolute";
    
        drawSnake(snake_body,false);
        drawPoint();
    }
    function dragPlaygroundEnd(e) {
//        snake.paused = false
  //      moveStateTo(STATES.RUNNING);
        e.target.style.opacity ="1";
    }
    function drawSnake(el,onstart) {
        var i,
            node,
            obj;
        window.snmap = gameData;
        bodyMap = gameData.bodyMap; //Its Important
        for (i = 0; i < bodyMap.length; i++) {
            if(onstart) {
                gulp(el);
            }
            obj = bodyMap[i];
            node = el.childNodes[i];
            setPositionForBodyPart(node,((obj.left)*width),((obj.top)*height))
            if(onstart) {
                node.rotation = obj.rotation;
            }
        }
        if(onstart) {
            gulp_counter_el.innerHTML = score = getIntPartFromStr(gameData.score);
            snake.paused = true;
        }
    }
    function makeInitialSnake(el) {
        var i,
            child;
        for (i = 0; i < NO_OF_INITIAL_BODY_PARTS; i++) {
            gulp(el);
            child = el.childNodes[i]; 
            setPositionForBodyPart(child,(i*BODY_PART_SIZE),0);
        }
        snake.paused = true;
        gulp_counter_el.innerHTML = score;
        highestScore_el.innerHTML = highestScore;
    }
    function restoreCfg() {
        var b = original_cfg.body;
        body.style.overflow = b.style.overflow;
        body.style.margin = b.style.margin;
        document.title = original_cfg.document.title;
        body.onbeforeunload = b.onbeforeunload;
    }
    
    function drawPoint() {
        point.el.style.display = "block";
        setPositionForBodyPart(point.el,((gameData.point.left)*width),((gameData.point.top)*height))
    }
    function createPoint() {
        var point_svg_style; 
        point.el = snake_playground.appendChildWithInformation.call(snake_playground, {
            tagName:'div',
            className:'snake_point',
            id:'snake_point',
            innerHTML:SNAKE_FIGURE,
            style:{
                display:'none'
            }
        });
       point_svg_style = body.querySelectorAll('.snake_point > svg')[0].style;
       point_svg_style.fill = "green";
       point_svg_style.stroke = "green";
    }
    function markPoint(el) { 
        var x = -1,
            y = -1,
            count = 0,
            len = el.childNodes.length;
            if(point.el.style.display !== "block")
            point.el.style.display = "block";
        while(true) {
            var startover = false,
                randx = Math.random(),
                randy = Math.random(),
                i;
            x = (randx)*(getIntPartFromStr(width)-BODY_PART_SIZE);
            y = (randy)*(getIntPartFromStr(height)-BODY_PART_SIZE);
            x = x-(x%BODY_PART_SIZE);
            y = y-(y%BODY_PART_SIZE);
            for(i = 0; i < len-1; i++) {
                var child = el.childNodes[i],
                    child_style = child.style,
                    top = child_style.top,
                    left = child_style.left;
                if((top === (y + getRequiredOffset('top') + "px")) && (left === (x + getRequiredOffset('left') + "px"))) {
                    startover = true;
                    if(startover_max_counter < count) {
                        startover_max_counter = count;
                        console.log("Startovercount highest value=", startover_max_counter);
                    }
                    break;
                }
            }
            if(!startover) {
                break;
            } else {
                count++;
            }
        }
        setPositionForBodyPart(point.el,x,y);
    }
    function append(keyCode) {
        //FOR NOW ONLY THE LAST ELEMENT of QUEUE IS CONSIDERED
        if(key_queue.length === 1) {
            key_queue.shift();
        }
        key_queue.push(keyCode);
    }
    function addKeyListener() {
        document.addEventListener("keydown", keyEventListener, true);
    }
    function removeKeyListener() {
        document.removeEventListener("keydown", keyEventListener, true);
    }
    function freeze() {
        clearInterval(snake.interval);
        removeKeyListener();
    }
    function killGame() {
        var script = document.getElementById('snake_script');
        freeze();
        try {
            if(playground_container) {
                body.removeChild(playground_container);
            }
        }
        catch(e) {
            console.log('Exception:', "ParentNode="+snake_playground.parentNode, "Node="+snake_playground);
        }
        restoreCfg();
        if(script) {
            document.getElementsByTagName('head')[0].removeChild(script);
        }
        logsOn();
    }
    function restartGame() {
        if(loggedIn) {
            saveGame(MODE.SAVE_KILL_RESTART); 
        } else if(noSignIn) {
            killGame();
            main();
        }
    }
    function crashSnake() {
        if(isDestroyed() || (snake.state === STATES.ENDED)) {
            return;
        }
        crash_options.style.display = "block";
        snake_body.style.display = "none";
        point.el.style.display = "none";
        moveStateTo(STATES.ENDED);
    }
    function checkUpCrash(last_style) {
        if((getIntPartFromStr(last_style.top)) < getRequiredOffset('top')) {
            crashSnake();
        }
    }
    function checkLeftCrash(last_style) {
        if((getIntPartFromStr(last_style.left)) < getRequiredOffset('left')) {
            crashSnake();
        }
    }
    function checkRightCrash(last_style, offset) {
        if((getIntPartFromStr(last_style.left)+offset) > (getRequiredOffset('left')+PLAYGROUND_DIMENSION)) {
            crashSnake();
        }
    }
    function checkDownCrash(last_style, offset) {
        if((getIntPartFromStr(last_style.top)+offset) > (getRequiredOffset('top')+PLAYGROUND_DIMENSION)) {
            crashSnake();
        }
    }
    function setPositionForBodyPart(node,left,top) {
        var offsetx,offsety;
        offsetx =  getRequiredOffset('left');
        offsety =  getRequiredOffset('top');
        if((typeof left) !== 'undefined') {
            node.style.left = offsetx + left +"px";
        }
        if ((typeof top) !== 'undefined') {
            node.style.top = offsety + top + "px";
        }
    }
    function processGeneral(element, distance, leave_last) {
        //TODO: make a copy of node list as traversing it is costly.
        var len = element.childNodes.length,
            up_to = len,
            i;
        if(leave_last) {
            up_to = len-1;
        }
        for(i = 0; i < up_to; i++) {
            var child = element.childNodes[i],
                child_style = child.style,
                rotation,
                rotation_flag = false,
                lookahead_rotation_flag,
                left_coordinate,
                top_coordinate;
            child.rotation=((typeof child.rotation) === "undefined")?ZERO_ROTATION:child.rotation;
            rotation = child.rotation;            
            if(child.rotation === POSITIVE_90_ROTATION || child.rotation === NEGATIVE_90_ROTATION) {
                rotation_flag = true;
            }
            lookahead_rotation_flag=-1;
            left_coordinate = getIntPartFromStr(child_style.left);
            top_coordinate = getIntPartFromStr(child_style.top);
            if(i+1 < len) {
                if(element.childNodes[i+1].rotation === POSITIVE_90_ROTATION || element.childNodes[i+1].rotation === NEGATIVE_90_ROTATION) {
                    lookahead_rotation_flag = true;
                }
                if(element.childNodes[i+1].rotation === ZERO_ROTATION || element.childNodes[i+1].rotation === NEGATIVE_180_ROTATION) {
                    lookahead_rotation_flag = false;
                }
            }
            if(((typeof rotation_flag) === "undefined") || (rotation_flag === false)) {
                child.isRotated = false;
                if(((typeof lookahead_rotation_flag) !== "undefined") && (lookahead_rotation_flag === true)) {
                    child.isRotated = true;
                    child.rotation = element.childNodes[i+1].rotation;
                    //Simulate rotation
                    if(child.rotation === NEGATIVE_90_ROTATION) {
                        child_style.top = (top_coordinate-(distance)) + "px";
                    }
                    if(child.rotation === POSITIVE_90_ROTATION) {
                        child_style.top = (top_coordinate+(distance)) + "px";
                    }
                } else {
                    if(rotation === ZERO_ROTATION) {
                        child_style.left = (left_coordinate+(distance)) + "px";
                    } else if(rotation === NEGATIVE_180_ROTATION) {
                        child_style.left = (left_coordinate-(distance)) + "px";
                    }
                }
            }
            else {//rotation flag is true
                if(((typeof lookahead_rotation_flag) === "undefined") || (lookahead_rotation_flag === false)) {
                    child.isRotated = false;
                    child.rotation = element.childNodes[i+1].rotation;
                    //Simulate rotation
                    if(child.rotation === ZERO_ROTATION) {
                        child_style.left = (left_coordinate + (distance)) + "px";
                    }
                    if(child.rotation === NEGATIVE_180_ROTATION) {
                        child_style.left = (left_coordinate-(distance))+"px";
                    }
                }
                else
                {
                    if(rotation === NEGATIVE_90_ROTATION) {
                        child_style.top = (top_coordinate-(distance))+'px';
                    }
                    else if(rotation === POSITIVE_90_ROTATION) {
                        child_style.top = (top_coordinate+(distance))+'px';
                    }
                }
            }
        }
    }
    function checkOverlap(el) {
        //TODO:copy childnodes to an array cause domenodes processing is costly
        var last = body.querySelector(LAST_BODY_PART_SELECTOR),
            last_style = last.style,
            last_style_top = last_style.top,
            last_style_left = last_style.left,
            len = el.childNodes.length,
            i;
        for(i = 0; i < len-1; i++) {
            var child = el.childNodes[i],
                child_style = child.style,
                top = child_style.top,
                left = child_style.left;
            if((top === last_style_top) && (left === last_style_left)) {
                crashSnake();
            }
        }
    }
    function tryGulp(el) {
        var last = body.querySelector(LAST_BODY_PART_SELECTOR);
        var last_style = last.style;
        var last_style_top = last_style.top;
        var last_style_left = last_style.left;
        if(((point.el.style.left) === last_style_left) && ((point.el.style.top) === last_style_top)) {
           // snake_playground.removeChild(point.el);
            gulp(el, true);
            markPoint(el);
        }
    }
    function processDownKey(element, distance) {
        var children = element.childNodes;
        var key = children.length-1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var top_coordinate = getIntPartFromStr(child_style.top);
        var leave_last = false;
        if((rotation === ZERO_ROTATION) || (rotation === NEGATIVE_180_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.top = (top_coordinate + (distance)) + "px";
            element.childNodes[key].rotation = POSITIVE_90_ROTATION;
        }
    }
    function processUpKey(element, distance) {
        var children = element.childNodes;
        var key = children.length-1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var top_coordinate = getIntPartFromStr(child_style.top);
        var leave_last = false;
        if((rotation === ZERO_ROTATION) || (rotation === NEGATIVE_180_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.top = (top_coordinate - (distance)) + "px";
            element.childNodes[key].rotation = NEGATIVE_90_ROTATION;
        }
    }
    function processRightKey(element, distance) {
        var children = element.childNodes;
        var key = children.length-1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var left_coordinate = getIntPartFromStr(child_style.left);
        var leave_last = false;
        if((rotation === POSITIVE_90_ROTATION) || (rotation === NEGATIVE_90_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.left = (left_coordinate + (distance)) + "px";
            element.childNodes[key].rotation = ZERO_ROTATION;
        }
    }
    function processLeftKey(element, distance) {
        var children = element.childNodes;
        var key = children.length-1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var left_coordinate = getIntPartFromStr(child_style.left);
        var leave_last = false;
        if((rotation === POSITIVE_90_ROTATION) || (rotation === NEGATIVE_90_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.left = (left_coordinate-(distance))+"px";
            element.childNodes[key].rotation = NEGATIVE_180_ROTATION;
        }
    }
    function processKeyEvent(el, keyCode) {
        var no_of_child_nodes = el.childNodes.length;
        var rotation = {};
        rotation.value = el.childNodes[(no_of_child_nodes-1)].rotation;
        el.childNodes[no_of_child_nodes-1].rotation = rotation.value = (typeof rotation.value === "undefined")?ZERO_ROTATION: rotation.value;
        rotation.isNeg90 = (rotation.value === NEGATIVE_90_ROTATION );
        rotation.isPos90 = (rotation.value === POSITIVE_90_ROTATION );
        rotation.isNeg180=(rotation.value === NEGATIVE_180_ROTATION );
        rotation.isZero = (rotation.value === ZERO_ROTATION );
        var move_distance = BODY_PART_SIZE;
        var last = document.body.querySelector(LAST_BODY_PART_SELECTOR);
        var last_style = last.style;
        var offset = BODY_PART_SIZE;
        var isItTheExpectedKey = true;
        switch(keyCode) {
            case LEFT_KEY_CODE:
                if(rotation.isNeg90 || rotation.isPos90 || rotation.isNeg180) {
                    processLeftKey(el, move_distance);
                    checkLeftCrash(last_style);
                }
                break;
            case UP_KEY_CODE:
                if(rotation.isNeg90 ||rotation.isZero || rotation.isNeg180) {
                    processUpKey(el, move_distance);
                    checkUpCrash(last_style);
                }
                break;
            case RIGHT_KEY_CODE:
                if(rotation.isPos90 || rotation.isZero || rotation.isNeg90) {
                    processRightKey(el, move_distance);
                    checkRightCrash(last_style, offset);
                }
                break;
            case DOWN_KEY_CODE:
                if(rotation.isPos90 || rotation.isZero || rotation.isNeg180) {
                    processDownKey(el, move_distance);
                    checkDownCrash(last_style, offset);
                }
                break;
            default:
                isItTheExpectedKey = false;
                alert('Unexpected key');
        }
        if(isItTheExpectedKey) {
            tryGulp(el);
        }
    }
    function simulateSnake(el) {
        var queue = key_queue;
        var len = queue.length;
        if(isDestroyed()) {
          clearInterval(snake.interval); 
        }
        getDimensions(); //Get updated dimensions always
        if(len === 0) {
            processGeneral(el, BODY_PART_SIZE);
            //Not pressing any key means snake is moving in direction of last body_part
            var last = body.querySelector(LAST_BODY_PART_SELECTOR);
            var rotation = last.rotation;
            var last_style = last.style;
            // console.log("STYLE", last_style)
            var offset = BODY_PART_SIZE;//Need to adjust it
            if(rotation === NEGATIVE_180_ROTATION) {
                checkLeftCrash(last_style);
            }
            else if(rotation === ZERO_ROTATION) {
                checkRightCrash(last_style, offset);
            }
            else if(rotation === POSITIVE_90_ROTATION) {
                checkDownCrash(last_style, offset);
            }
            else if(rotation === NEGATIVE_90_ROTATION) {
                checkUpCrash(last_style);
            }
            if(isDestroyed()) {
                return;
            }
            checkOverlap(el);
            tryGulp(el);
        }
        else {
            processKeyEvent(el, queue.pop());
        }
        cacheGameData();
    }

    function postToHostingSite(container) {
        //TODO:Put Restriction here for target ORigin
        console.log('POSTING MESSAGE to Game Host'+JSON.stringify(container));
        iframe.contentWindow.postMessage(container,'*');
    }
    function getRequiredOffset(type) {
        var offsetx,offsety;
        offsetx = snake_playground.offsetLeft;
        offsety = snake_playground.offsetTop;
        if(getComputedStyle(snake_playground).getPropertyValue("position") !== "static") {
            offsetx = 0;
            offsety = 0;
        }
       if(type === "left") {
           return offsetx;
       }
       if(type === "top") {
           return offsety;
       }
    }
    function cacheGameData() {
      var childNodes = snake_body.childNodes,
          len = childNodes.length,
          node,i,xy = {},
          p_xy = {};
      p_xy.left = (getIntPartFromStr(point.el.style.left) - getRequiredOffset('left'))/width;
      p_xy.top = (getIntPartFromStr(point.el.style.top) - getRequiredOffset('top'))/height;
      for(i = 0; i < len; i++) {
        xy = {};
        node = childNodes[i];
        xy.left = (getIntPartFromStr(node.style.left) - getRequiredOffset('left'))/width;
        xy.top = (getIntPartFromStr(node.style.top) - getRequiredOffset('top'))/height;
        xy.rotation = node.rotation;
        bodyMap[i] = xy;
      }
      gameData.point = p_xy;
      gameData.score = gulp_counter_el.innerHTML;
      window.gameData = gameData;//hariom- Delete it
    }
    function saveGame(mode) {
        var container = {
            msgType: MSG_TYPE.UPLOAD_DATA,
            score: gulp_counter_el.innerHTML,
            mode:mode
        };
        if(mode === MODE.SAVE) {
            if(isDestroyed()) { //Dont' save crashed snake.
                return;
            }
            cacheGameData();
            container.gameData = JSON.stringify(gameData);
            console.log('Uploading FULL '+container.gameData);
        } else {
            playground_container.style.display = "none";//Set Display to none to make it look like the game is killed instantly.
        }
        postToHostingSite(container);
    }
    function keyEventListener(e) {
        if((noSignIn || loggedIn)&&(e.keyCode === LEFT_KEY_CODE ||e.keyCode === DOWN_KEY_CODE ||e.keyCode === UP_KEY_CODE ||e.keyCode === RIGHT_KEY_CODE )) {
            e.preventDefault();
            e.stopPropagation();
            if(!isDestroyed() && !isEnded()) {
                append(e.keyCode);
            }
        } else {
            if(e.keyCode === ESCAPE_KEY_CODE) {
                if(isDestroyed()) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                saveGame(MODE.SAVE_KILL);
                //killGame();Game will be killed when a message is received that score is updated to database
            } else if((noSignIn || loggedIn)&&(e.keyCode === SPACE_KEY_CODE)) {
                e.preventDefault();
                e.stopPropagation();
                if(isDestroyed() || isEnded()) {
                    return;
                }
                if(snake.paused === true) {
                    moveStateTo(STATES.RUNNING);
                } else {
                    moveStateTo(STATES.PAUSED);
                }
            } else if((noSignIn || loggedIn)&&(e.keyCode === RESTART_KEY_CODE)) {
                e.preventDefault();
                e.stopPropagation();
                restartGame();
            } else if((noSignIn || loggedIn)&&(e.keyCode === SAVE_KEY_CODE)) {
                e.preventDefault();
                e.stopPropagation();
                saveGame(MODE.SAVE);
            }
        }
    }
    function personaliseGame() {
         window.onmessage = function(e) {
            var container = e.data,
                data;
            //TODO: Put restrictions somehow on which origin is accepted
            console.log("ONMESSAGE EVENT received on Parent");
            if(container.msgType === MSG_TYPE.DATABASE_UPDATED) {
                console.log('Received DATABASE_UDPATED.Killing Now');
                if(container.mode === MODE.SAVE_KILL) {
                    killGame();
                } else if(container.mode === MODE.SAVE_KILL_RESTART) {
                    killGame();
                    main();
                }
            }
            else if(container.msgType === MSG_TYPE.UPDATE_PAGE) {
                data = container.data;
                if(data.highestScore !== '-1') {
                  highestScore_el.innerHTML = highestScore = data.highestScore;
                }
                //Processing after logging In
                login_el.style.display = "none";
                gulp_counter_el.style.display = "block";
                document.title = "Hi "+data.email;
                if(data.uuid) {
                    loggedIn = true;
                }
                if(data.gameData) {
                    gameData = eval("("+data.gameData+")");
                    console.log(JSON.stringify(gameData));
                    if(gameData) {
                        drawSnake(snake_body,true);
                        drawPoint(snake_body);
                        highestScore_el.innerHTML = highestScore = getIntPartFromStr(data.highestScore);
                        cacheGameData();
                    }
                    else {
                        makeInitialSnake(snake_body);
                        markPoint(snake_body);
                        cacheGameData();
                    }
                } else {
                    makeInitialSnake(snake_body);
                    markPoint(snake_body);
                    cacheGameData();
                }
            } else if(container.msgType === MSG_TYPE.INITIALIZE_HOST_PAGE) {
                var uuid = container.data.uuid;
                console.log('KNOWN USER'+uuid);
                if(uuid) {
                    loggedIn = true;
                    login_el.style.display = "none";
                } else {
                    updateLoginButton();
                }
            }
         };
    }
    function start() {
        snake.state = STATES.INITIALISING,
        saveCurrentCfg();
        modifyCfg();
        getDimensions();
        setupPlayground();
        //makeInitialSnake(snake_body);
        //markPoint(snake_body);
        addKeyListener();
        personaliseGame();
    }
    start();
})();