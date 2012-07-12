<?php
$url = 'https://browserid.org/verify';
$data = http_build_query(array('assertion' => $_POST['assertion'], 'audience' => urlencode('php-hariombalhara.rhcloud.com')));

$params = array(
    'http' => array(
        'method' => 'POST',
        'content' => $data,
        'header'=> "Content-type: application/x-www-form-urlencoded\r\n"
            . "Content-Length: " . strlen($data) . "\r\n"
    )
);
    
$ctx = stream_context_create($params);
$fp = fopen($url, 'rb', false, $ctx);

if ($fp) {
  $result = stream_get_contents($fp);
}
else {
  $result = FALSE;
}

$json = json_decode($result);

if ($json->status == 'okay') {
  // the user logged in successfully.
  echo "{'status':'okay'}";
}
else {
  // log in failed.
  echo "{'status':'fail'}"
}
?>