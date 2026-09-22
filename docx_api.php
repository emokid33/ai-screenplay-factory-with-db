<?php
/**
 * API endpoint для генерации Word документов
 * Использует Node.js скрипт для создания .docx файлов
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Конфигурация
define('TEMP_DIR', sys_get_temp_dir());
define('NODE_SCRIPT', __DIR__ . '/generate_docx.js');

/**
 * Генерация Word документа из данных проекта
 */
function generateWordDocument($projectData) {
    try {
        // Создание временных файлов
        $dataFile = TEMP_DIR . '/screenplay_data_' . uniqid() . '.json';
        $outputFile = TEMP_DIR . '/screenplay_' . uniqid() . '.docx';
        
        // Подготовка данных
        $jsonData = json_encode($projectData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        file_put_contents($dataFile, $jsonData);
        
        // Выполнение Node.js скрипта
        $command = sprintf(
            'node %s %s %s 2>&1',
            escapeshellarg(NODE_SCRIPT),
            escapeshellarg($dataFile),
            escapeshellarg($outputFile)
        );
        
        $output = shell_exec($command);
        
        // Проверка результата
        if (file_exists($outputFile) && filesize($outputFile) > 0) {
            // Чтение содержимого файла
            $docxContent = file_get_contents($outputFile);
            $base64Content = base64_encode($docxContent);
            
            // Очистка временных файлов
            @unlink($dataFile);
            @unlink($outputFile);
            
            return [
                'success' => true,
                'filename' => 'screenplay_' . date('Y-m-d_His') . '.docx',
                'content' => $base64Content,
                'size' => strlen($docxContent)
            ];
        } else {
            // Очистка
            @unlink($dataFile);
            @unlink($outputFile);
            
            return [
                'success' => false,
                'error' => 'Не удалось создать документ',
                'output' => $output
            ];
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Получение данных проекта из базы данных
 */
function getProjectData($projectId) {
    require_once 'api.php';
    $api = new ScreenplayAPI();
    $result = $api->getProjectById($projectId);
    
    if ($result['success']) {
        $project = $result['project'];
        
        return [
            'userIdea' => $project['user_idea'],
            'genre' => $project['genre'],
            'prompt' => $project['prompt_text'],
            'screenplay' => $project['screenplay_text'],
            'wordCount' => $project['word_count'],
            'sceneCount' => $project['scene_count'],
            'createdAt' => $project['created_at']
        ];
    }
    
    return null;
}

// Обработка запросов
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'generate_docx':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                // Получение данных из БД или из запроса
                if (isset($input['project_id'])) {
                    $projectData = getProjectData($input['project_id']);
                    if (!$projectData) {
                        echo json_encode(['error' => 'Проект не найден']);
                        exit;
                    }
                } else {
                    // Прямая передача данных
                    $projectData = [
                        'userIdea' => $input['user_idea'] ?? '',
                        'genre' => $input['genre'] ?? null,
                        'prompt' => $input['prompt'] ?? '',
                        'screenplay' => $input['screenplay'] ?? '',
                        'wordCount' => $input['word_count'] ?? null,
                        'sceneCount' => $input['scene_count'] ?? null,
                        'createdAt' => $input['created_at'] ?? date('Y-m-d H:i:s')
                    ];
                }
                
                $result = generateWordDocument($projectData);
                echo json_encode($result);
            }
            break;
            
        case 'generate_from_project':
            // Генерация по ID проекта
            $projectId = $_GET['id'] ?? 0;
            $projectData = getProjectData($projectId);
            
            if ($projectData) {
                $result = generateWordDocument($projectData);
                echo json_encode($result);
            } else {
                echo json_encode(['error' => 'Проект не найден']);
            }
            break;
            
        default:
            echo json_encode(['error' => 'Неизвестное действие']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
