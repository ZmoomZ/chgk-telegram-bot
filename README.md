# ЧГК Telegram Bot

Telegram бот для игры "Что? Где? Когда?" на Новый Год 2025.

## Функции

- Регистрация команд
- Отправка ответов на вопросы
- Сохранение данных в Google Sheets

## Команды бота

- `/start` - Начало работы
- `/register` - Регистрация команды
- `/answer` - Отправить ответ
- `/myteam` - Информация о команде
- `/help` - Помощь

## Настройка

1. Создайте Telegram бота через @BotFather
2. Настройте Google Service Account
3. Разверните на Vercel
4. Установите переменные окружения
5. Установите webhook

## Переменные окружения

- `TELEGRAM_TOKEN` - Токен Telegram бота
- `SHEET_ID` - ID Google таблицы
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Email сервисного аккаунта
- `GOOGLE_PRIVATE_KEY` - Private key сервисного аккаунта
