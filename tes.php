<?php
echo "User: " . shell_exec('whoami') . "<br>";
echo "Home: " . shell_exec('echo $HOME') . "<br>";
echo "SSH Folder: " . (file_exists(shell_exec('echo $HOME').'/.ssh') ? 'Exists' : 'Not Found') . "<br>";
echo "Git Version: " . shell_exec('git --version');
?>