const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path);
  next();
});

// Конфигурация
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const SHEET_ID = process.env.SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Инициализация бота
const bot = new TelegramBot(TELEGRAM_TOKEN);

// Хранилище состояний
const userStates = {};

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Функции для работы с таблицей
async function appendRow(sheetName, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] },
  });
}

async function getRows(sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  return response.data.values || [];
}

// Webhook handler
app.post('/webhook', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  const message = `🎉 <b>Добро пожаловать на ЧГК Новый Год 2025!</b>

📋 <b>Доступные команды:</b>

🔹 /register - Регистрация команды
🔹 /answer - Отправить ответ
🔹 /myteam - Проверить свою команду
🔹 /help - Помощь

Начните с регистрации команды! 👇`;

  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const message = `❓ <b>Инструкция:</b>

<b>1. Регистрация:</b>
/register
Затем: <code>Название | Участники</code>

<b>Пример:</b>
<code>Знатоки | Иван, Петр, Мария</code>

<b>2. Ответ:</b>
/answer
Затем: <code>Номер | Ответ</code>

<b>Пример:</b>
<code>1 | Пушкин</code>`;

  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /register
bot.onText(/\/register/, async (msg) => {
  console.log('Register command received');
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  userStates[userId] = { action: 'register' };
  
  const message = `📝 <b>Регистрация команды</b>

Отправьте данные в формате:
<code>Название | Участник1, Участник2</code>

<b>Пример:</b>
<code>Знатоки | Иван, Петр, Мария</code>`;

  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /answer
bot.onText(/\/answer/, async (msg) => {
  console.log('Answer command received');
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  userStates[userId] = { action: 'answer_waiting' };
  
  const message = `✍️ <b>Отправка ответа</b>

Отправьте ответ в формате:
<code>Номер вопроса | Ваш ответ</code>

<b>Пример:</b>
<code>1 | Александр Пушкин</code>`;

  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /myteam
bot.onText(/\/myteam/, async (msg) => {
  console.log('MyTeam command received');
  const chatId = msg.chat.id;
  
  try {
    const rows = await getRows('teams');
    const team = rows.slice(1).find(row => row[3] == chatId);
    
    if (!team) {
      await bot.sendMessage(chatId, '⚠️ Вы не зарегистрированы. Используйте /register');
      return;
    }
    
    const message = `👥 <b>Ваша команда:</b>

📌 <b>${team[0]}</b>
👤 ${team[1]}
📅 ${new Date(team[2]).toLocaleString('ru-RU')}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(chatId, '❌ Ошибка получения данных команды');
  }
});

bot.on('message', async (msg) => {
  console.log('Message received:', msg.text);
  
  if (msg.text && msg.text.startsWith('/')) {
    console.log('Command detected, skipping');
    return;
  }
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  console.log('User state:', userStates[userId]);
  
  const state = userStates[userId];
  if (!state) {
    console.log('No state found for user');
    return;
  }
  
  console.log('Processing state:', state.action);
  
  // Регистрация
  if (state.action === 'register') {
    console.log('Processing registration...');
    // ... остальной код регистрации без изменений
  
  // Регистрация
  if (state.action === 'register') {
    if (!text.includes('|')) {
      await bot.sendMessage(chatId, '⚠️ Неверный формат! Используйте: <code>Название | Участники</code>', { parse_mode: 'HTML' });
      return;
    }
    
    const parts = text.split('|');
    if (parts.length !== 2) {
      await bot.sendMessage(chatId, '⚠️ Должен быть один символ |');
      return;
    }
    
    const teamName = parts[0].trim();
    const members = parts[1].trim();
    
    if (!teamName || !members) {
      await bot.sendMessage(chatId, '⚠️ Заполните все поля!');
      return;
    }
    
    try {
      await appendRow('teams', [teamName, members, new Date().toISOString(), chatId]);
      delete userStates[userId];
      
      const message = `✅ <b>Команда зарегистрирована!</b>

📌 <b>${teamName}</b>
👥 ${members}

Отправляйте ответы: /answer`;

      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
    } catch (error) {
      console.error('Error saving team:', error);
      await bot.sendMessage(chatId, '❌ Ошибка регистрации');
      delete userStates[userId];
    }
  }
  
  // Ответ
  if (state.action === 'answer_waiting') {
    if (!text.includes('|')) {
      await bot.sendMessage(chatId, '⚠️ Формат: <code>Номер | Ответ</code>', { parse_mode: 'HTML' });
      return;
    }
    
    const parts = text.split('|');
    if (parts.length !== 2) {
      await bot.sendMessage(chatId, '⚠️ Должен быть один символ |');
      return;
    }
    
    const questionNum = parts[0].trim();
    const answer = parts[1].trim();
    
    if (!questionNum || !answer) {
      await bot.sendMessage(chatId, '⚠️ Заполните все поля!');
      return;
    }
    
    if (isNaN(parseInt(questionNum))) {
      await bot.sendMessage(chatId, '⚠️ Номер вопроса должен быть числом!');
      return;
    }
    
    try {
      const rows = await getRows('teams');
      const team = rows.slice(1).find(row => row[3] == chatId);
      
      if (!team) {
        await bot.sendMessage(chatId, '⚠️ Команда не найдена. Используйте /register');
        delete userStates[userId];
        return;
      }
      
      await appendRow('answers', [team[0], questionNum, answer, new Date().toISOString()]);
      delete userStates[userId];
      
      const message = `✅ <b>Ответ принят!</b>

📌 <b>${team[0]}</b>
🔢 Вопрос ${questionNum}
✍️ ${answer}

Следующий ответ: /answer`;

      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
    } catch (error) {
      console.error('Error saving answer:', error);
      await bot.sendMessage(chatId, '❌ Ошибка отправки');
      delete userStates[userId];
    }
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
