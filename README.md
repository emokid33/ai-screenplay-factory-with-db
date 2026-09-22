# AI Система Создания Сценариев с MySQL

## 📋 Что включено

1. **database_schema.sql** - SQL скрипт для создания базы данных
2. **api.php** - PHP API для работы с базой данных
3. **ai-screenplay-system-with-db.html** - HTML интерфейс с интеграцией БД
4. **ai-screenplay-system.html** - Базовая версия без БД (для быстрого тестирования)

## 🚀 Установка и настройка

### Шаг 1: Установка MySQL (если ещё не установлен)

**Windows:**
- Скачайте MySQL с https://dev.mysql.com/downloads/installer/
- Установите MySQL Server и MySQL Workbench
- Запомните пароль root-пользователя

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### Шаг 2: Создание базы данных

1. Откройте MySQL командную строку или MySQL Workbench
2. Выполните команду:
```bash
mysql -u root -p < database_schema.sql
```

Или через MySQL Workbench:
- File → Open SQL Script → выберите database_schema.sql
- Execute (молния ⚡)

### Шаг 3: Настройка PHP

**Проверьте наличие PHP:**
```bash
php -v
```

Если PHP не установлен:

**Windows:**
- Скачайте XAMPP: https://www.apachefriends.org/
- Установите и запустите Apache + MySQL

**Linux:**
```bash
sudo apt install php php-mysql apache2
```

**macOS:**
```bash
brew install php
```

### Шаг 4: Настройка API

Откройте файл `api.php` и при необходимости измените параметры подключения:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'screenplay_ai_system');
define('DB_USER', 'root');
define('DB_PASS', ''); // Ваш пароль MySQL
```

### Шаг 5: Запуск проекта

**Вариант 1: Используя встроенный PHP сервер (для разработки)**
```bash
cd /путь/к/проекту
php -S localhost:8000
```

Откройте браузер: http://localhost:8000/ai-screenplay-system-with-db.html

**Вариант 2: Используя XAMPP (рекомендуется для Windows)**
1. Скопируйте все файлы в папку `C:\xampp\htdocs\screenplay\`
2. Запустите XAMPP Control Panel
3. Запустите Apache и MySQL
4. Откройте: http://localhost/screenplay/ai-screenplay-system-with-db.html

**Вариант 3: Используя Apache**
```bash
# Linux/macOS
sudo cp -r . /var/www/html/screenplay/
sudo systemctl start apache2
sudo systemctl start mysql
```
Откройте: http://localhost/screenplay/ai-screenplay-system-with-db.html

## 📊 Структура базы данных

### Таблицы:

1. **projects** - Основные проекты
   - id, user_idea, genre, length_type, status, created_at

2. **prompts** - Сгенерированные промпты
   - id, project_id, prompt_text, generated_at, tokens_used

3. **screenplays** - Готовые сценарии
   - id, project_id, prompt_id, screenplay_text, word_count, scene_count

4. **activity_log** - История действий
   - id, project_id, action_type, details, created_at

5. **genre_statistics** - Статистика по жанрам
   - id, genre, total_projects, avg_word_count, avg_scene_count

### Представления:

- **v_project_full_info** - Полная информация о проектах (JOIN всех таблиц)

### Хранимые процедуры:

- **get_statistics()** - Получение общей статистики и распределения по жанрам

## 🎯 Использование системы

### Основной интерфейс (с БД)

1. **Вкладка "Создать"**
   - Введите идею для фильма
   - Выберите жанр и уровень детализации
   - Нажмите "Запустить AI Агентов"
   - Агент 1 создаст промпт → сохранится в БД
   - Агент 2 создаст сценарий → сохранится в БД
   - Скачайте готовый сценарий

2. **Вкладка "История"**
   - Просмотр всех созданных проектов
   - Поиск по ключевым словам и жанру
   - Просмотр деталей любого проекта

3. **Вкладка "Статистика"**
   - Общее количество проектов
   - Завершённые проекты
   - Распределение по жанрам
   - Среднее время генерации

### API Endpoints

```javascript
// Создать проект
POST /api.php?action=create_project
Body: { user_idea, genre, length_type }

// Сохранить промпт
POST /api.php?action=save_prompt
Body: { project_id, prompt_text, tokens_used }

// Сохранить сценарий
POST /api.php?action=save_screenplay
Body: { project_id, prompt_id, screenplay_text, tokens_used }

// Получить все проекты
GET /api.php?action=get_all_projects&limit=50&offset=0

// Получить проект по ID
GET /api.php?action=get_project&id=1

// Поиск проектов
GET /api.php?action=search&keyword=драма&genre=драма

// Получить статистику
GET /api.php?action=get_statistics

// Удалить проект
POST /api.php?action=delete_project
Body: { project_id }
```

## 🔧 Полезные SQL запросы

```sql
-- Посмотреть все проекты
SELECT * FROM v_project_full_info;

-- Статистика по жанрам
SELECT genre, COUNT(*) as total 
FROM projects 
WHERE genre IS NOT NULL 
GROUP BY genre;

-- Проекты за последние 7 дней
SELECT * FROM projects 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Средняя длина сценариев
SELECT AVG(word_count) as avg_words, AVG(scene_count) as avg_scenes 
FROM screenplays;

-- Вызов статистики
CALL get_statistics();
```

## 🐛 Устранение неполадок

### Ошибка подключения к БД
```
Ошибка: Access denied for user 'root'@'localhost'
```
**Решение:** Проверьте пароль в api.php или сбросьте пароль MySQL

### База данных не создаётся
```
ERROR 1007: Can't create database; database exists
```
**Решение:** Удалите существующую БД:
```sql
DROP DATABASE screenplay_ai_system;
```
Затем выполните schema.sql снова

### PHP не находит MySQL
```
Fatal error: Call to undefined function mysqli_connect()
```
**Решение:** Установите PHP MySQL расширение:
```bash
sudo apt install php-mysql
# или в php.ini раскомментируйте:
extension=mysqli
```

### CORS ошибки
```
Access to fetch blocked by CORS policy
```
**Решение:** Уже настроено в api.php. Если проблема сохраняется, используйте локальный сервер (php -S или XAMPP)

## 📝 Примеры данных

В schema.sql уже есть 3 тестовых проекта:
1. Драма о пианисте
2. Научно-фантастический триллер про ИИ
3. Романтическая комедия о соседях

## 🎨 Кастомизация

### Добавление новых жанров

В HTML (ai-screenplay-system-with-db.html):
```html
<option value="новый_жанр">Новый Жанр</option>
```

### Изменение лимитов токенов

В HTML измените max_tokens в функциях:
```javascript
max_tokens: 1000  // для промптов
max_tokens: 4000  // для сценариев
```

### Добавление новых полей в БД

```sql
ALTER TABLE projects ADD COLUMN director_notes TEXT;
```

Затем обновите api.php для работы с новым полем.

## 📚 Дополнительные возможности

- Экспорт сценариев в PDF
- Совместное редактирование
- Версионирование сценариев
- Интеграция с Final Draft
- Добавление изображений персонажей
- AI-генерация постеров

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи MySQL: `/var/log/mysql/error.log`
2. Проверьте логи PHP: `tail -f /var/log/apache2/error.log`
3. Проверьте консоль браузера (F12 → Console)

