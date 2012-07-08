<?php
header('Access-Control-Allow-Origin:*');
header('Content-Type:text/html');
$uuid = $_COOKIE['identifier'];
echo 'Host is'.$_ENV['OPENSHIFT_DB_HOST'];
if(isset($uuid)) {
   //RTRV;
} else {
    //$_POST[]
   $uuid = uniqid();
}

?>