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
$bodyMap = json_decode($_POST['bodyMap'],false); //Don't Make associative array
$snapshot = serialize($bodyMap);
//if($bodyMap) {
//print_r($bodyMap);
//}
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
    $json = "{";
    $json .= "'email': '".$row['email']."',
             'highestScore': '".$row['highestScore']."',
             'name': '".$row['username']."',
             'uuid': '".$row['sessionId']."',";
    
    if($row['snapshot']) {
        $bodyMap = unserialize($row['snapshot']);
        $json .= "bodyMap: '".json_encode($bodyMap)."',"; 
    }
    $json .= "}";
    syslog(LOG_ERR,$json);
    echo $json;
}
if(!empty($uuid)) {
    if($firstget == '1') {
        $result = select_all_who_match('sessionId',$uuid);
        print_result_json($result[0]);
    } else {
        if(!empty($score) || !empty($snapshot)) {
            $part_query = "";
            $result = select_all_who_match('sessionId',$uuid);
            $row = $result[0];
            if($row['highestScore'] < $score) {
                if(!empty($score)) {
                    $part_query .= '`highestScore` = '.$score.",";
                }    
            }
            if(!empty($bodyMap)) {
                $part_query .= '`snapshot` = '.$snapshot;
            }
                $query = 'Update `snake` set '.$part_query.' where `sessionId` = "'.$uuid.'"';   
                echo $query;
                run_query($query,2);
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
       $row['sessionId'] = $uuid;
   } else {
       $uuid = $row['sessionId'];
   }
   
   //user identified set cookie.
    setcookie('uuid',$uuid,time()+20*365*24*3600);
    print_result_json($row);
} else {
    die('Unknown Handler');
}
syslog(LOG_ERR,'************************************************************************************');
?>