<?php
// Укажите путь к директории с миниатюрами
$thumbDir = 'thumbs/';

// Получите список файлов в директории
$files = scandir($thumbDir);

// Отфильтруйте только файлы с расширением .jpg
$thumbFiles = array_filter($files, function ($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'jpg';
});

// Преобразуйте список файлов в массив JSON и отправьте его
header('Content-Type: application/json');
echo json_encode(array_values($thumbFiles));
?>
