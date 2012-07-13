var MSG_TYPE = { //It has a duplicate in snake.js
        DATABASE_UPDATED: 'DATABASE_UPDATED',
        UPLOAD_DATA: 'UPLOAD_DATA',
        UPDATE_PAGE: 'UPDATE_PAGE',
        INITIATE_LOGIN: 'INITIATE_LOGIN',
        INITIALIZE_HOST_PAGE: 'INITIALIZE_HOST_PAGE'
    },
    MODE = { //It has duplicate in snake.js
            SAVE_KILL: 0,
            SAVE: 1,
            SAVE_KILL_RESTART:2
        },
    xmlhttp = new XMLHttpRequest(),
    data,
    username,
    email,
    uuid;
(function() {
    var container = {};
    uuid = getCookie('uuid');
    container.msgType = MSG_TYPE.INITIALIZE_HOST_PAGE;
    container.data = {
    uuid:uuid
    };
    window.parent.postMessage(container,'*');
    if(uuid) {
        cookiedRequest();
    }
})();
function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name) {
            return unescape(y);
        }
    }
}
function requestForCookie() {
    var xmlhttp1 =new XMLHttpRequest(),
        first_get = 1;
    xmlhttp1.open('POST','http://php-hariombalhara.rhcloud.com/process.php',true);
    xmlhttp1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp1.send('name='+username+'&email='+email+'&firstget='+first_get);
    xmlhttp1.onreadystatechange = function() {
        var container = {};
        if(xmlhttp1.status == 200 && xmlhttp1.readyState == 4) {
            console.log('Fetching Data from database');
            data = eval('('+xmlhttp1.responseText+')');
            console.log('Received Data:',JSON.stringify(data));
            container.data = data;
            container.msgType = MSG_TYPE.UPDATE_PAGE;
            window.parent.postMessage(container, '*');
        }
    };
}
function gotAssertion(assertion) {
    username = 'DEFAULT';
    if(!uuid) {
        xmlhttp.open('POST','../verify.php',true);
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlhttp.send('assertion='+assertion);//location.host should be changed to hardcoded string.Its not safe.
        xmlhttp.onreadystatechange = function() {
            if(xmlhttp.status === 200 && xmlhttp.readyState === 4) {
                console.log('verified_obj',xmlhttp.responseText);      
                var verified_obj = eval('('+xmlhttp.responseText+')');
                if(verified_obj.status !== 'okay') {
                    console.log('LOGIN FAILURE for '+verified_obj.email);
                    return;
                }
                console.log('browserId verified it');
                email = verified_obj.email;
                requestForCookie();
            }
        };
    } else {
        cookiedRequest();
    }
}
function cookiedRequest() {
    var xmlhttp = new XMLHttpRequest(),
        first_get = 1;
    xmlhttp.open('POST','http://php-hariombalhara.rhcloud.com/process.php',true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send('firstget='+first_get);
    xmlhttp.onreadystatechange = function() {
        var container = {};
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4) {
            console.log('Fetching Data from database');
            data = eval('('+xmlhttp.responseText+')');
            console.log('Received Data:',JSON.stringify(data));
            container.data = data;
            container.msgType = MSG_TYPE.UPDATE_PAGE;
            window.parent.postMessage(container, '*');
        }
    }
}
function initiateLogin() {
    navigator.id.get(gotAssertion);
}
window.onmessage = function(e) {
    var container = e.data,
        score,body_map,
        mode;
    if(container.msgType === MSG_TYPE.INITIATE_LOGIN) {
        initiateLogin();
        return;
    } else {
        mode = container.mode;
        if(container.msgType === MSG_TYPE.UPLOAD_DATA) {
            score = container.score;    
            xmlhttp.onreadystatechange = function(){
                container = {
                mode:mode    
                };
                if(xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                    container.msgType = MSG_TYPE.DATABASE_UPDATED;
                    window.parent.postMessage(container,'*');    
                }
            };
            xmlhttp.open('POST','http://php-hariombalhara.rhcloud.com/process.php',true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send('score='+score+'&body_map='+body_map);
        }
    }
};