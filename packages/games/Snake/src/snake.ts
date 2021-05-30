"use strict";
import css from "../css/snake.css"
import type { Snake } from "../global.d"
export enum STATES {
    RUNNING,
    PAUSED,
    ENDED, //Game has ended .But things are still there.
    INITIALISING,
    DESTROYED //Games has ended and complete playground has been destroyed
};
(function main() {
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
        // Size of each piece of Snake Body
        BODY_PART_SIZE: number,
        PLAYGROUND_DIMENSION = 550,
        DELAY_IN_MOVEMENT = 60,
        INCREASE_SIZE_BY = 2,
        GULP_COUNTER_DIV_ID = 'snake_gulp_counter',
        GULP_COUNTER_DIV_CLASS = 'snake_gulp_counter',
        LAST_BODY_PART_SELECTOR = '#snake span:nth-last-child(1)',
        SNAKE_FIGURE: string,
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
        CRASH_OPTIONS_HTML = "Game Over. Press `r` to restart.";

    var MSG_TYPE = { //It has a duplicate in personalise.js
        UPLOAD_DATA: 'UPLOAD_DATA',
        DATABASE_UPDATED: 'DATABASE_UPDATED',
        UPDATE_PAGE: 'UPDATE_PAGE',
        INITIATE_LOGIN: 'INITIATE_LOGIN',
        INITIALIZE_HOST_PAGE: 'INITIALIZE_HOST_PAGE'
    };

    const enum MODE { //It has duplicate in personalise.js
        SAVE_KILL,
        SAVE,
        SAVE_KILL_RESTART
    };

    type MyElement = { appendChildWithInformation: Function } & HTMLElement
    var playground_container: MyElement,
        body = document.body,
        snake = window.snake = {} as Snake,//Snake Namespace

        // Holds the position of the food.
        food = snake.food = {} as typeof snake.food,

        // It holds the initial styles for the page
        original_cfg = snake.original_cfg = {} as typeof snake.original_cfg,

        // Holds the keys to be processed
        key_queue = snake.key_queue = [] as typeof snake.key_queue,
        width = -1,
        height = -1,
        snake_playground: MyElement,
        snake_body: MyElement,
        state_of_game_el: HTMLElement,
        gulp_counter_el: HTMLElement,
        startover_max_counter = 0,
        score = 0,
        highestScore = 0,
        crash_options: MyElement,
        iframe: HTMLIFrameElement,
        login_el: HTMLElement,
        highestScore_el: HTMLElement,
        gameData = {} as { bodyMap: any[] },
        bodyMap = gameData.bodyMap = [] as any[],
        cursor = {},
        __log: typeof console.log;

    function logsOff() {
        __log = console.log;
        console.log = function () { };
    }
    function logsOn() {
        console.log = __log;
    }

    logsOff();

    function getIntPartFromStr(str: string) {
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

    // Save the current style info in case something wrong happens or for restoration
    function saveCurrentCfg() {
        var b = original_cfg.body = {} as typeof original_cfg.body;
        b.style = {};
        b.style.overflow = body.style.overflow;
        b.style.margin = body.style.margin;
        original_cfg.document = { title: document.title };
        b.onbeforeunload = (body as HTMLBodyElement).onbeforeunload; //TODO:Test it by attaching an onbeforeunload function to body on original site.
        //copy_style(body, snake.original_cfg.body);
    }

    // Takes confirmation from the user before exiting.
    function onBeforeUnload() {
        // TODO: Here it should wait for the data to be synced.
        // The message won't be shown to the user.
        return 'Unsaved Changes';
    }

    // Prepares the page for the game.
    function modifyCfg() {
        body.style.overflow = "hidden";
        body.style.margin = "0";
        (body as HTMLBodyElement).onbeforeunload = onBeforeUnload;
    }

    function moveStateTo(state: STATES) {
        if (snake.state === STATES.DESTROYED) {
            cancelAnimationFrame(snake.interval);
            return;
        }
        if (state === STATES.PAUSED) {
            snake.paused = true;
            snake.state = state;
            state_of_game_el.innerHTML = "PAUSED";
            cancelAnimationFrame(snake.interval);
        } else if (state === STATES.ENDED) {
            snake.state = state;
            state_of_game_el.innerHTML = "ENDED";
            cancelAnimationFrame(snake.interval);
        } else if (state == STATES.RUNNING) {
            snake.paused = false;
            state_of_game_el.innerHTML = "";
            snake.interval = requestAnimationFrame(function moveSnake() { 
                simulateSnake(snake_body);
                setTimeout(function () {
                    if (snake.paused) {
                        return;
                    }
                    snake.interval = requestAnimationFrame(moveSnake);
                }, DELAY_IN_MOVEMENT)
            });
        }
    }

    /**
     * Sets sizes for the playground and Snake.
     */
    function setDimensions() {
        var common;
        common = PLAYGROUND_DIMENSION;
        BODY_PART_SIZE = Math.ceil(0.02 * common);
        SNAKE_FIGURE = '<svg xmlns = "http://www.w3.org/2000/svg" version="1.1"><rect class="snake_figure" id="snake_figure" width="' + BODY_PART_SIZE + '" height="' + BODY_PART_SIZE + '"/></svg>';
        width = height = snake.width = snake.height = Math.floor(common - (common % BODY_PART_SIZE));
    }

    function appendChildWithInformation(this: HTMLElement, child: { tagName: string, className: string, id: string, style: Record<any, any>, innerHTML: string }) {
        var el = createSnakeElement(child);
        this.appendChild(el);
        return el;
    }

    function createSnakeElement(props: { tagName: string, className?: string, id?: string, style?: Record<any, any>, innerHTML?: string }) {
        var el = document.createElement(props.tagName) as MyElement,
            props_style = props.style,
            i;
        if (props.className) {
            el.setAttribute('class', props.className);
        }
        if (props.id) {
            el.setAttribute('id', props.id);
        }
        el.classList.add('js-snake')
        if (props.innerHTML) {
            el.innerHTML = props.innerHTML;
        }
        if (props_style !== undefined) { //TODO:make it a generic style copier.
            for (i in props_style) {
                el.style[i] = props_style[i];
            }
        }
        el.appendChildWithInformation = appendChildWithInformation;
        return el;
    }

    function dragPlaygroundEnter(e) {
        e.stopPropagation();
    }
    function makePlaygroundDraggable(el) {
        el.draggable = "true";
        el.addEventListener('dragstart', dragPlaygroundStart, false);
        el.addEventListener('dragend', dragPlaygroundEnd, false);
        playground_container.addEventListener('dragenter', dragPlaygroundEnter, false);
        playground_container.addEventListener('dragover', dragPlaygroundOver, false);
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
        snake_playground = createSnakeElement({
            tagName: 'div',
            className: PLAYGROUND_CLASS,
            id: PLAYGROUND_ID,
            style: {
                height: PLAYGROUND_DIMENSION + "px",
                width: PLAYGROUND_DIMENSION + "px",
                left: `calc(50% - ${PLAYGROUND_DIMENSION/2}px)`,
                top: `calc(50% - ${PLAYGROUND_DIMENSION/2}px)`,
                position: 'fixed'
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
                display: "none"
            }
        });
        highestScore_el = playground_container.appendChildWithInformation.call(playground_container, {
            tagName: 'div',
            className: 'highestScore',
            innerHTML: highestScore
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
        body.appendChild(snake_playground);
        createFood();
    }
    function updateCounters() {
        score += 1;
        if (score > highestScore) {
            highestScore += 1;
        }
        gulp_counter_el.innerHTML = score;
        highestScore_el.innerHTML = highestScore;
    }
    function gulp(el, consume) {
        var i;
        if ((typeof gulp.id) === "undefined") {
            gulp.id = 0;
        }
        if ((typeof gulp.count) === "undefined") {
            gulp.count = 0;
        }
        if (consume === true) {
            for (i = 0; i < INCREASE_SIZE_BY; i++) {
                gulp.id += 1;
                var offsetx = 0;
                var offsety = 0;
                var firstChild = el.childNodes[0];
                var firstChild_style = firstChild.style;
                var left = getIntPartFromStr(firstChild_style.left);
                var top = getIntPartFromStr(firstChild_style.top);
                var rotation = firstChild.rotation;
                //The insertion philosophy is opposite to usual
                if (rotation === NEGATIVE_180_ROTATION) {
                    offsetx = BODY_PART_SIZE;
                } else if (rotation === ZERO_ROTATION) {
                    offsetx = -BODY_PART_SIZE;
                } else if (rotation === POSITIVE_90_ROTATION) {
                    offsety = -BODY_PART_SIZE;
                } else if (rotation === NEGATIVE_90_ROTATION) {
                    offsety = BODY_PART_SIZE;
                }
                if ((offsetx === 0) && (offsety === 0)) {
                    console.log("RAISE EXCEPTION HERE");
                }
                var span = createSnakeElement({
                    tagName: 'span',
                    className: SNAKE_BODY_PART_CLASS,
                    id: SNAKE_BODY_PART_ID + gulp.id,
                    innerHTML: SNAKE_FIGURE,
                    style: {
                        left: left + offsetx + "px",
                        top: top + offsety + "px"
                    }
                });
                span.rotation = rotation;
                el.insertBefore(span, el.childNodes[0]);
            }
            gulp.count += 1;
            // Increase Speed on every gulp
            DELAY_IN_MOVEMENT -= 3
            updateCounters();
        } else {
            gulp.id += 1;
            el.appendChildWithInformation.call(el, {
                tagName: 'span',
                className: SNAKE_BODY_PART_CLASS,
                id: SNAKE_BODY_PART_ID + gulp.id,
                innerHTML: SNAKE_FIGURE
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
        snake_playground.style.top = snake_playground.offsetTop + diffy + "px";
        cursor.x = x;
        cursor.y = y;
    }
    function dragPlaygroundStart(e) {
        snake.paused = true;

        moveStateTo(STATES.PAUSED);
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        //        e.target.style.opacity = "0.3";
        e.dataTransfer.setData('text/html', "Hello Beign dragged")
        //var dragIcon = document.createElement('img');
        //dragIcon.src = 'https://hariombalhara.in/snake/images/ajax-loader.gif';
        //dragIcon.width = 100;
        //e.dataTransfer.setDragImage(dragIcon, -10, -10);
        e.dataTransfer.effectAllowed = "move";

        //Place the snake at ir original positon with absolute positioning.Cause placement of div will change when postioning type changes.
        snake_playground.style.left = snake_playground.offsetLeft + "px";
        snake_playground.style.top = snake_playground.offsetTop + "px";
        snake_playground.style.position = "fixed";

        drawSnake(snake_body, false);
        drawFood();
    }
    function dragPlaygroundEnd(e) {
        //        snake.paused = false
        //      moveStateTo(STATES.RUNNING);
        e.target.style.opacity = "1";
    }
    function drawSnake(el, onstart) {
        var i,
            node,
            obj;
        window.snmap = gameData;
        bodyMap = gameData.bodyMap; //Its Important
        for (i = 0; i < bodyMap.length; i++) {
            if (onstart) {
                gulp(el);
            }
            obj = bodyMap[i];
            node = el.childNodes[i];
            setPositionForBodyPart(node, ((obj.left) * width), ((obj.top) * height))
            if (onstart) {
                node.rotation = obj.rotation;
            }
        }
        if (onstart) {
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
            setPositionForBodyPart(child, (i * BODY_PART_SIZE), 0);
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

    function drawFood() {
        food.el.style.display = "block";
        setPositionForBodyPart(food.el, ((gameData.food.left) * width), ((gameData.food.top) * height))
    }
    function createFood() {
        var food_svg_style;
        food.el = snake_playground.appendChildWithInformation.call(snake_playground, {
            tagName: 'div',
            className: 'snake_food',
            id: 'snake_food',
            innerHTML: SNAKE_FIGURE,
            style: {
                display: 'none'
            }
        });
        food_svg_style = body.querySelectorAll('.snake_food > svg')[0].style;
        food_svg_style.fill = "green";
        food_svg_style.stroke = "green";
    }
    function markFood(el) {
        var x = -1,
            y = -1,
            count = 0,
            len = el.childNodes.length;
        if (food.el.style.display !== "block")
            food.el.style.display = "block";
        while (true) {
            var startover = false,
                randx = Math.random(),
                randy = Math.random(),
                i;
            x = (randx) * (getIntPartFromStr(width) - BODY_PART_SIZE);
            y = (randy) * (getIntPartFromStr(height) - BODY_PART_SIZE);
            x = x - (x % BODY_PART_SIZE);
            y = y - (y % BODY_PART_SIZE);
            for (i = 0; i < len - 1; i++) {
                var child = el.childNodes[i],
                    child_style = child.style,
                    top = child_style.top,
                    left = child_style.left;
                if ((top === (y + getRequiredOffset('top') + "px")) && (left === (x + getRequiredOffset('left') + "px"))) {
                    startover = true;
                    if (startover_max_counter < count) {
                        startover_max_counter = count;
                        console.log("Startovercount highest value=", startover_max_counter);
                    }
                    break;
                }
            }
            if (!startover) {
                break;
            } else {
                count++;
            }
        }
        setPositionForBodyPart(food.el, x, y);
    }

    function queueKey(keyCode: number) {
        // FOR NOW ONLY THE LAST ELEMENT of QUEUE IS CONSIDERED
        if (key_queue.length === 1) {
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
        cancelAnimationFrame(snake.interval);
        removeKeyListener();
    }
    function killGame() {
        freeze();
        document.querySelectorAll('.js-snake').forEach((el)=>el.remove());
        restoreCfg();
        logsOn();
    }
    function restartGame() {
        killGame();
        main();
    }
    function crashSnake() {
        if (isDestroyed() || (snake.state === STATES.ENDED)) {
            return;
        }
        crash_options.style.display = "block";
        snake_body.style.display = "none";
        food.el.style.display = "none";
        moveStateTo(STATES.ENDED);
    }
    function checkUpCrash(last_style) {
        if ((getIntPartFromStr(last_style.top)) < getRequiredOffset('top')) {
            crashSnake();
        }
    }
    function checkLeftCrash(last_style) {
        if ((getIntPartFromStr(last_style.left)) < getRequiredOffset('left')) {
            crashSnake();
        }
    }
    function checkRightCrash(last_style, offset) {
        if ((getIntPartFromStr(last_style.left) + offset) > (getRequiredOffset('left') + PLAYGROUND_DIMENSION)) {
            crashSnake();
        }
    }
    function checkDownCrash(last_style, offset) {
        if ((getIntPartFromStr(last_style.top) + offset) > (getRequiredOffset('top') + PLAYGROUND_DIMENSION)) {
            crashSnake();
        }
    }
    function setPositionForBodyPart(node, left, top) {
        var offsetx, offsety;
        offsetx = getRequiredOffset('left');
        offsety = getRequiredOffset('top');
        if ((typeof left) !== 'undefined') {
            node.style.left = offsetx + left + "px";
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
        if (leave_last) {
            up_to = len - 1;
        }
        for (i = 0; i < up_to; i++) {
            var child = element.childNodes[i],
                child_style = child.style,
                rotation,
                rotation_flag = false,
                lookahead_rotation_flag,
                left_coordinate,
                top_coordinate;
            child.rotation = ((typeof child.rotation) === "undefined") ? ZERO_ROTATION : child.rotation;
            rotation = child.rotation;
            if (child.rotation === POSITIVE_90_ROTATION || child.rotation === NEGATIVE_90_ROTATION) {
                rotation_flag = true;
            }
            lookahead_rotation_flag = -1;
            left_coordinate = getIntPartFromStr(child_style.left);
            top_coordinate = getIntPartFromStr(child_style.top);
            if (i + 1 < len) {
                if (element.childNodes[i + 1].rotation === POSITIVE_90_ROTATION || element.childNodes[i + 1].rotation === NEGATIVE_90_ROTATION) {
                    lookahead_rotation_flag = true;
                }
                if (element.childNodes[i + 1].rotation === ZERO_ROTATION || element.childNodes[i + 1].rotation === NEGATIVE_180_ROTATION) {
                    lookahead_rotation_flag = false;
                }
            }
            if (((typeof rotation_flag) === "undefined") || (rotation_flag === false)) {
                child.isRotated = false;
                if (((typeof lookahead_rotation_flag) !== "undefined") && (lookahead_rotation_flag === true)) {
                    child.isRotated = true;
                    child.rotation = element.childNodes[i + 1].rotation;
                    //Simulate rotation
                    if (child.rotation === NEGATIVE_90_ROTATION) {
                        child_style.top = (top_coordinate - (distance)) + "px";
                    }
                    if (child.rotation === POSITIVE_90_ROTATION) {
                        child_style.top = (top_coordinate + (distance)) + "px";
                    }
                } else {
                    if (rotation === ZERO_ROTATION) {
                        child_style.left = (left_coordinate + (distance)) + "px";
                    } else if (rotation === NEGATIVE_180_ROTATION) {
                        child_style.left = (left_coordinate - (distance)) + "px";
                    }
                }
            }
            else {//rotation flag is true
                if (((typeof lookahead_rotation_flag) === "undefined") || (lookahead_rotation_flag === false)) {
                    child.isRotated = false;
                    child.rotation = element.childNodes[i + 1].rotation;
                    //Simulate rotation
                    if (child.rotation === ZERO_ROTATION) {
                        child_style.left = (left_coordinate + (distance)) + "px";
                    }
                    if (child.rotation === NEGATIVE_180_ROTATION) {
                        child_style.left = (left_coordinate - (distance)) + "px";
                    }
                }
                else {
                    if (rotation === NEGATIVE_90_ROTATION) {
                        child_style.top = (top_coordinate - (distance)) + 'px';
                    }
                    else if (rotation === POSITIVE_90_ROTATION) {
                        child_style.top = (top_coordinate + (distance)) + 'px';
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
        for (i = 0; i < len - 1; i++) {
            var child = el.childNodes[i],
                child_style = child.style,
                top = child_style.top,
                left = child_style.left;
            if ((top === last_style_top) && (left === last_style_left)) {
                crashSnake();
            }
        }
    }
    function tryGulp(el) {
        var last = body.querySelector(LAST_BODY_PART_SELECTOR);
        var last_style = last.style;
        var last_style_top = last_style.top;
        var last_style_left = last_style.left;
        if (((food.el.style.left) === last_style_left) && ((food.el.style.top) === last_style_top)) {
            // snake_playground.removeChild(food.el);
            gulp(el, true);
            markFood(el);
        }
    }
    function processDownKey(element, distance) {
        var children = element.childNodes;
        var key = children.length - 1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var top_coordinate = getIntPartFromStr(child_style.top);
        var leave_last = false;
        if ((rotation === ZERO_ROTATION) || (rotation === NEGATIVE_180_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.top = (top_coordinate + (distance)) + "px";
            element.childNodes[key].rotation = POSITIVE_90_ROTATION;
        }
    }
    function processUpKey(element, distance) {
        var children = element.childNodes;
        var key = children.length - 1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var top_coordinate = getIntPartFromStr(child_style.top);
        var leave_last = false;
        if ((rotation === ZERO_ROTATION) || (rotation === NEGATIVE_180_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.top = (top_coordinate - (distance)) + "px";
            element.childNodes[key].rotation = NEGATIVE_90_ROTATION;
        }
    }
    function processRightKey(element, distance) {
        var children = element.childNodes;
        var key = children.length - 1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var left_coordinate = getIntPartFromStr(child_style.left);
        var leave_last = false;
        if ((rotation === POSITIVE_90_ROTATION) || (rotation === NEGATIVE_90_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.left = (left_coordinate + (distance)) + "px";
            element.childNodes[key].rotation = ZERO_ROTATION;
        }
    }
    function processLeftKey(element, distance) {
        var children = element.childNodes;
        var key = children.length - 1;
        var rotation = children[key].rotation;
        var child_style = children[key].style;
        var left_coordinate = getIntPartFromStr(child_style.left);
        var leave_last = false;
        if ((rotation === POSITIVE_90_ROTATION) || (rotation === NEGATIVE_90_ROTATION)) {
            leave_last = true;
            processGeneral(element, distance, leave_last);
            child_style.left = (left_coordinate - (distance)) + "px";
            element.childNodes[key].rotation = NEGATIVE_180_ROTATION;
        }
    }
    function processKeyEvent(el, keyCode) {
        var no_of_child_nodes = el.childNodes.length;
        var rotation = {};
        rotation.value = el.childNodes[(no_of_child_nodes - 1)].rotation;
        el.childNodes[no_of_child_nodes - 1].rotation = rotation.value = (typeof rotation.value === "undefined") ? ZERO_ROTATION : rotation.value;
        rotation.isNeg90 = (rotation.value === NEGATIVE_90_ROTATION);
        rotation.isPos90 = (rotation.value === POSITIVE_90_ROTATION);
        rotation.isNeg180 = (rotation.value === NEGATIVE_180_ROTATION);
        rotation.isZero = (rotation.value === ZERO_ROTATION);
        var move_distance = BODY_PART_SIZE;
        var last = document.body.querySelector(LAST_BODY_PART_SELECTOR);
        var last_style = last.style;
        var offset = BODY_PART_SIZE;
        var isItTheExpectedKey = true;
        switch (keyCode) {
            case LEFT_KEY_CODE:
                if (rotation.isNeg90 || rotation.isPos90 || rotation.isNeg180) {
                    processLeftKey(el, move_distance);
                    checkLeftCrash(last_style);
                }
                break;
            case UP_KEY_CODE:
                if (rotation.isNeg90 || rotation.isZero || rotation.isNeg180) {
                    processUpKey(el, move_distance);
                    checkUpCrash(last_style);
                }
                break;
            case RIGHT_KEY_CODE:
                if (rotation.isPos90 || rotation.isZero || rotation.isNeg90) {
                    processRightKey(el, move_distance);
                    checkRightCrash(last_style, offset);
                }
                break;
            case DOWN_KEY_CODE:
                if (rotation.isPos90 || rotation.isZero || rotation.isNeg180) {
                    processDownKey(el, move_distance);
                    checkDownCrash(last_style, offset);
                }
                break;
            default:
                isItTheExpectedKey = false;
                alert('Unexpected key');
        }
        if (isItTheExpectedKey) {
            tryGulp(el);
        }
    }
    function simulateSnake(el:HTMLElement) {
        var queue = key_queue;
        var len = queue.length;
        if (isDestroyed()) {
            cancelAnimationFrame(snake.interval);
        }
        setDimensions(); //Get updated dimensions always
        if (len === 0) {
            processGeneral(el, BODY_PART_SIZE);
            //Not pressing any key means snake is moving in direction of last body_part
            var last = body.querySelector(LAST_BODY_PART_SELECTOR);
            var rotation = last.rotation;
            var last_style = last.style;
            // console.log("STYLE", last_style)
            var offset = BODY_PART_SIZE;//Need to adjust it
            if (rotation === NEGATIVE_180_ROTATION) {
                checkLeftCrash(last_style);
            }
            else if (rotation === ZERO_ROTATION) {
                checkRightCrash(last_style, offset);
            }
            else if (rotation === POSITIVE_90_ROTATION) {
                checkDownCrash(last_style, offset);
            }
            else if (rotation === NEGATIVE_90_ROTATION) {
                checkUpCrash(last_style);
            }
            if (isDestroyed()) {
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

    function getRequiredOffset(type) {
        var offsetx, offsety;
        offsetx = snake_playground.offsetLeft;
        offsety = snake_playground.offsetTop;
        if (getComputedStyle(snake_playground).getPropertyValue("position") !== "static") {
            offsetx = 0;
            offsety = 0;
        }
        if (type === "left") {
            return offsetx;
        }
        if (type === "top") {
            return offsety;
        }
    }
    function cacheGameData() {
        var childNodes = snake_body.childNodes,
            len = childNodes.length,
            node, i, xy = {} as { left: number; top: number; rotation: number },
            p_xy = {} as { left: number; top: number };
        p_xy.left = (getIntPartFromStr(food.el.style.left) - getRequiredOffset('left')) / width;
        p_xy.top = (getIntPartFromStr(food.el.style.top) - getRequiredOffset('top')) / height;
        for (i = 0; i < len; i++) {
            xy = {} as typeof xy;
            node = childNodes[i];
            xy.left = (getIntPartFromStr(node.style.left) - getRequiredOffset('left')) / width;
            xy.top = (getIntPartFromStr(node.style.top) - getRequiredOffset('top')) / height;
            xy.rotation = node.rotation;
            bodyMap[i] = xy;
        }
        gameData.food = p_xy;
        gameData.score = gulp_counter_el.innerHTML;
        window.gameData = gameData;//hariom- Delete it
    }
    function saveGame(mode: MODE) {
        var container = {
            msgType: MSG_TYPE.UPLOAD_DATA,
            score: gulp_counter_el.innerHTML,
            mode: mode
        };
        if (mode === MODE.SAVE) {
            if (isDestroyed()) { //Dont' save crashed snake.
                return;
            }
            cacheGameData();
            container.gameData = JSON.stringify(gameData);
            console.log('Uploading FULL ' + container.gameData);
        } else {
            playground_container.style.display = "none";//Set Display to none to make it look like the game is killed instantly.
        }
    }
    
    function keyEventListener(e: KeyboardEvent) {
        if ((e.keyCode === LEFT_KEY_CODE || e.keyCode === DOWN_KEY_CODE || e.keyCode === UP_KEY_CODE || e.keyCode === RIGHT_KEY_CODE)) {
            e.preventDefault();
            e.stopPropagation();
            if (!isDestroyed() && !isEnded()) {
                queueKey(e.keyCode);
            }
        } else {
            if (e.keyCode === ESCAPE_KEY_CODE) {
                if (isDestroyed()) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                saveGame(MODE.SAVE_KILL);
                killGame();
            } else if (e.keyCode === SPACE_KEY_CODE) {
                e.preventDefault();
                e.stopPropagation();
                if (isDestroyed() || isEnded()) {
                    return;
                }
                if (snake.paused === true) {
                    moveStateTo(STATES.RUNNING);
                } else {
                    moveStateTo(STATES.PAUSED);
                }
            } else if (e.keyCode === RESTART_KEY_CODE) {
                e.preventDefault();
                e.stopPropagation();
                restartGame();
            } else if (e.keyCode === SAVE_KEY_CODE) {
                e.preventDefault();
                e.stopPropagation();
                saveGame(MODE.SAVE);
            }
        }
    }
    function personaliseGame() {
        makeInitialSnake(snake_body);
        markFood(snake_body);
        cacheGameData();
    }
    function start() {
        var snake_playground = document.getElementById('snake_playground');
        if (snake_playground) {
            return;
        }
        const style = document.createElement('style');
        style.classList.add('js-snake')
        style.innerHTML = css;
        document.body.appendChild(style);
        snake.state = STATES.INITIALISING;
        saveCurrentCfg();
        modifyCfg();
        setDimensions();
        setupPlayground();
        //makeInitialSnake(snake_body);
        //markFood(snake_body);
        addKeyListener();
        personaliseGame();
    }
    start();
})();