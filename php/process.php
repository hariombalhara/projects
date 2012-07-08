<?php
header('Access-Control-Allow-Origin:*');
header('Content-Type:text/html');
$uuid = $_COOKIE['identifier'];
$host = $_ENV['OPENSHIFT_DB_HOST'];
$pass = $_ENV['OPENSHIFT_DB_PASSWORD'];
$username = $_ENV['OPENSHIFT_DB_USERNAME'];
$port = $_ENV['OPENSHIFT_DB_PORT'];
$conn = mysql_connect($host.":"$port,$username,$pass);
echo $conn;
if(!$conn)
{
    die('Error Connecting:'.mysql_error());
}
mysql_select_db('php',$conn);
if(isset($uuid)) {
   //RTRV;
} else {
    //$_POST[]
   $uuid = uniqid();
}

?>