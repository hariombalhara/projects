<?php
var identifier = $_COOKIE['identifier'];
if(isset(identifier)) {
    echo 'Got You!!'
} else {
    echo 'Its Ok if you don\'t to share');
}
?>