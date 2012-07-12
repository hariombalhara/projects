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
$name = $_POST['name']; //TODO CHANGE TO POST
$email = $_POST['email'];
$score = $_POST['score'];
$firstget = $_POST['firstget'];
define('DEFAULT_SCORE','-1');
if(!$conn) {
    die('Error Connecting:'.mysql_error());
}
mysql_select_db('php',$conn);
function run_query($query, $is_get_or_set/*1 for GET and 2 for SET*/){
    $res = mysql_query($query) or die(mysql_error());
    $i = 0;
    $arr = array();
    if($is_get_or_set == 1) {
        while($row = mysql_fetch_array($res,MYSQL_BOTH)) {
            $arr[$i++] = $row;
        }
        return $arr;
    }
}
function select_all_who_match($columnName,$value) {
    $query = 'Select * from `snake` where `'.$columnName.'` = "'.$value.'"';
    $result = run_query($query,1);
    return $result;
}
function print_result_json($row) {
    echo "{
            'email':'".$row['email']."',
            'highestScore':'".$row['highestScore']."',
            'name':'".$row['username']."',
          }";
}
if(!empty($uuid)) {
    if($firstget == '1') {
        $result = select_all_who_match('sessionId',$uuid);
        print_result_json($result[0]);
    } else {
        if(!empty($score)) {
            $result = select_all_who_match('sessionId',$uuid);
            $row = $result[0];
            if($row['highestScore'] < $score) {
                $query = 'Update `snake` set `highestScore` = '.$score.' where `sessionId` = "'.$uuid.'"';
                run_query($query,2);
            }
        }
    }
  
} else if($firstget == '1'){
   $result = select_all_who_match('email',$email);
   $row = $result[0];
   if(empty($row)) {
       $uuid = uniqid();
       $query = "Insert into `snake` (`email`,`sessionId`,`username`) values ('".$email."','".$uuid."','".$name."')";
       run_query($query,2);
       $row['email'] = $email;
       $row['highestScore'] = DEFAULT_SCORE;
       $row['username'] = $name;
   } else {
       $uuid = $row['sessionId'];
   }
   //user identified set cookie.
    setcookie('uuid',$uuid,time()+20*365*24*3600);
    print_result_json($row);
} else {
    die('Unknown Handler');
}
syslog(LOG_DEBUG,'************************************************************************************');
?>