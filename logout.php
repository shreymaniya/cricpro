<?php
require_once 'config.php';

logoutAdmin();
redirectTo('login.php?logged_out=1');
