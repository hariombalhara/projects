<?php
header('Access-Control-Allow-Origin:*');
header('Content-Type:text/html');
$uuid = $_COOKIE['uuid'];
//echo $uuid;
$host = $_ENV['OPENSHIFT_DB_HOST'];
$pass = $_ENV['OPENSHIFT_DB_PASSWORD'];
$username = $_ENV['OPENSHIFT_DB_USERNAME'];
$port = $_ENV['OPENSHIFT_DB_PORT'];
$conn = mysql_connect($host.":".$port,$username,$pass);
$name = $_GET['name']; //TODO CHANGE TO POST
$email = $_GET['email'];
$score = $_GET['score'];
$firstget = $_GET['firstget'];
if(!$conn) {
    die('Error Connecting:'.mysql_error());
}
mysql_select_db('php',$conn);
function run_query($query, $is_get_or_set/*1 for GET and 2 for SET*/){
    $res = mysql_query($query) or die(mysql_error());
    $res = array();
    $i = 0;
    if($is_get_or_set == 1) {
        while($row = mysql_fetch_array($res,MYSQL_BOTH)) {
            $res[$i++] = $row;
        }
        return $res;
    }
}
function select_all_who_match() {
    $query = 'Select * from `snake` where `sessionId` = "'.$uuid.'"';
    $res = run_query($query,1);
    return $res;
}
if(!empty($uuid)) {
    if($firstget == '1') {
        select_all_who_match();
        echo "{
                'email':'".$row['email']."',
                'score':".$row['highestScore'].",
                'name':'".$row['username']."',
              }";
    } else {
        if(!empty($score)) {
            $query = 'Update `snake` set `highestScore` = '.$score.' where `sessionId` = "'.$uuid.'"';
            run_query($query,2);
        }
    }
  
} else if($firstget == '1'){
   $uuid = uniqid();
   $query = "Insert into `snake` (`email`,`sessionId`,`username`) values ('".$email."','".$uuid."','".$name."')";
   run_query($query,2)
   setcookie('uuid',$uuid,time()+3600);
} else {
    die('Unknown Handler');
}
?>