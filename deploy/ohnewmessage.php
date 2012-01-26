<?php
$email    = $_POST['email'];
$content  = $_POST['content'];

if(!empty($email) && !empty($content)) {
	
	$body = "Email:\n{$email}\n\n\nContent:\n{$content}";
	$send = mail("liangmorr@gmail.com", '[WWM]收到了一条留言', $body);
	if($send) {
		echo 'Success';
	} else {
		echo 'Failure';
	}
} else {
	echo 'Failure';
}
?>