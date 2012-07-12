var MSG_TYPE = { //It has a duplicate in snake.js
        DATABASE_UPDATED: 'DATABASE_UPDATED',
        UPLOAD_DATA: 'UPLOAD_DATA',
        UPDATE_PAGE: 'UPDATE_PAGE',
        INITIATE_LOGIN: 'INITIATE_LOGIN'
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
    uid;
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
function gotAssertion(assertion) {
    var first_get = 1;//Means its the first time we are contacting database
    uid = getCookie('uuid');
    username = 'DEFAULT';
    if(!uid) {
        xmlhttp.open('POST','https://browserid.org/verify',true);
        xmlhttp.setRequestHeader("Content-Type", "text/plain");
        xmlhttp.send('assertion='+assertion+'&audience=php-hariombalhara.rhcloud.com');//location.host should be changed to hardcoded string.Its not safe.
        xmlhttp.onreadystatechange = function() {
        if(xmlhttp.status === 200 && xmlhttp.readyState === 4) {
            var verified_obj = JSON.parse(xmlhttp.responseText);
            console.log('verified_obj',verified_obj);      
            if(verified_obj.status !== 'okay') {
                console.log('LOGIN FAILURE for '+verified_obj.email);
                return;
            }
            email = verified_obj.email;
            xmlhttp.open('POST','http://php-hariombalhara.rhcloud.com/process.php,true');
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send('name='+username+'&email='+email+'&firstget='+first_get);
            }
        };
    } else {
        xmlhttp.open('POST','http://php-hariombalhara.rhcloud.com/process.php',true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send('firstget='+first_get);
    }
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
    };
}
function initiateLogin() {
    navigator.id.get(gotAssertion);
}
window.onmessage = function(e) {
    var container = e.data,
        score,
        mode;
    if(container.msgType === MSG_TYPE.INITIATE_LOGIN) {
        initiateLogin();
        return;
    } else {
        mode = container.mode;
        console.log('Updating Score');
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
            xmlhttp.send('score='+score);
        }
    }
};