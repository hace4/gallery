<?php
// Укажите путь к директории с изображениями
$imageDir = 'thumbs\\';

// Получите список файлов в директории
$files = scandir($imageDir);

// Отфильтруйте только файлы с расширением .jpg
$imageFiles = array_filter($files, function ($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'jpg';
});


$imageData = [];

foreach ($imageFiles as $image) {
    $imagePath = $imageDir . $image;
    $hash = md5_file($imagePath); // Генерируем хеш изображения
    $imageData[] = [
        "src" => $imagePath,
        "hash" => $hash,
        "alt" => "Image description",
    ];
}


header('Content-Type: application/json');
echo json_encode($imageData);
?>
