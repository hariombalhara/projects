<?php
header('Access-Control-Allow-Origin:*');
header('Content-Type:text/html');
$uuid = $_COOKIE['identifier'];
//echo $uuid;
$host = $_ENV['OPENSHIFT_DB_HOST'];
$pass = $_ENV['OPENSHIFT_DB_PASSWORD'];
$username = $_ENV['OPENSHIFT_DB_USERNAME'];
$port = $_ENV['OPENSHIFT_DB_PORT'];
$conn = mysql_connect($host.":".$port,$username,$pass);
$name = $_GET['name']; //TODO CHANGE TO POST
$email = $_GET['email'];
if(!$conn)
{
    die('Error Connecting:'.mysql_error());
}
mysql_select_db('php',$conn);
//echo $conn;
if(isset($uuid)) {
  $query = 'Select * from `snake` where `sessionId` = "'.$uuid.'"';
  //echo $query;
  $res = mysql_query($query) or die(mysql_error());
  $row = mysql_fetch_array($res,MYSQL_BOTH);
  //print_r($row);
  echo $row['email'];
} else {
   global $uuid;
   global $name;
   global $email;
   $uuid = uniqid();
   $query = "Insert into `snake` (`email`,`sessionId`,`username`) values ('".$email."','".$uuid."','".$name."')";
   //echo $query;
   $res = mysql_query($query) or die(mysql_error());
   //echo "Insert ".$res;
   setcookie('identifier',$uuid);
}
?>