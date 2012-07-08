<?php
header('Access-Control-Allow-Origin:*');
$identifier = $_COOKIE['identifier'];
if(isset($identifier)) {
    echo 'Hi Hariom';
} else {
    echo 'Hmm New Comer';
}
?>