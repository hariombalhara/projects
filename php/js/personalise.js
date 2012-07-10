var MSG_TYPE = { //It has a duplicate in snake.js
        DATABASE_UPDATED: 'DATABASE_UPDATED',
        UPLOAD_DATA: 'UPLOAD_DATA',
        UPDATE_PAGE: 'UPDATE_PAGE'
    },
    xmlhttp,
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
xmlhttp = new XMLHttpRequest();
(function() {
    var first_get = 1;//Means its the first time we are contacting database
    uid = getCookie('uid');
    if(!uid) {
        email = prompt('New Comer !!\nPls provide your email');
        username = "DEFAULT";
        xmlhttp.open('GET','http://php-hariombalhara.rhcloud.com/process.php?name='+username+'&email='+email+'&firstget='+first_get,true);
        xmlhttp.send(null);
    } else {
        xmlhttp.open('GET','http://php-hariombalhara.rhcloud.com/process.php?firstget='+first_get,true);
        xmlhttp.send(null);
    }
    xmlhttp.onreadystatechange = function() {
        var container = {};
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4) {
            console.log('Fetching Data from database');
                data = eval('('+xmlhttp.responseText+')');
                console.log('Received Data:',JSON.stringify(data));
            }
            container.data = data;
            container.msgType = MSG_TYPE.UPDATE_PAGE;
            window.parent.postMessage(container, '*');
    };
})();
window.onmessage = function(e) {
    var container = e.data,
        score;
    console.log('Updating Score');
    if(container.msgType === MSG_TYPE.UPLOAD_DATA) {
        score = container.score;
    }    
    xmlhttp.onreadystatechange = function(){
        container.msgType = MSG_TYPE.DATABASE_UPDATED;
        window.parent.postMessage(container,'*');    
    };
    xmlhttp.open('GET','http://php-hariombalhara.rhcloud.com/process.php?score='+score,true);
    xmlhttp.send(null);
};