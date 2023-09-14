<?php
// Укажите путь к директории с изображениями
$imageDir = 'images/';

// Получите список файлов в директории
$files = scandir($imageDir);

// Отфильтруйте только файлы с расширением .jpg
$imageFiles = array_filter($files, function ($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'jpg';
});

// Преобразуйте список файлов в массив JSON и отправьте его
header('Content-Type: application/json');

echo json_encode(array_values($imageFiles));
?>
