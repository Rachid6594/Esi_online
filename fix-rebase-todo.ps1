# Remplace "pick" par "edit" pour le commit 97d9695 (pour corriger le secret)
$path = $args[0]
$content = Get-Content $path -Raw
$content = $content -replace 'pick 97d9695 ', 'edit 97d9695 '
Set-Content $path $content -NoNewline
