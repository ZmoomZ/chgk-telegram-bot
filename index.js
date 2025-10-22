const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
app.use(express.json());

// Конфигурация из переменных окружения
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const SHEET_ID = process.env.SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Инициализация бота
const bot = new TelegramBot(TELEGRAM_TOKEN);

// Хранилище состояний пользователей (в памяти)
const userStates = {};

// Инициализация Google Sheets
async function getSheet(sheetName) {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  
  await doc.useServiceAccountAuth({
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  });
  
  await doc.loadInfo();
  return doc.sheetsByTitle[sheetName];
}

// Обработчик webhook
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
  
  const message = `❓ <b>Инструкция по использованию бота:</b>

<b>1. Регистрация команды:</b>
Отправьте: /register
Затем отправьте данные в формате:
<code>Название команды | Участник1, Участник2, Участник3</code>

<b>Пример:</b>
<code>Знатоки | Иван Иванов, Петр Петров, Мария Сидорова</code>

<b>2. Отправка ответа:</b>
Отправьте: /answer
Затем отправьте ответ в формате:
<code>Номер вопроса | Ваш ответ</code>

<b>Пример:</b>
<code>1 | Александр Пушкин</code>

⚠️ Можно зарегистрировать только одну команду на пользователя.`;

  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /register
bot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Проверяем, не зарегистрирован ли уже
  try {
    const sheet = await getSheet('teams');
    const rows = await sheet.getRows();
    const existingTeam = rows.find(row => row.get('chatId') == chatId);
    
    if (existingTeam) {
      await bot.sendMessage(chatId, 
        `⚠️ Вы уже зарегистрировали команду: <b>${existingTeam.get('teamName')}</b>\n\nДля изменения обратитесь к организаторам.`,
        { parse_mode: 'HTML' }
      );
      return;
    }
  } catch (error) {
    console.error('Error checking existing team:', error);
  }
  
  userStates[userId] = { action: 'register' };
  
  const message = `📝 <b>Регистрация команды</b>

Отправьте данные команды в следующем формате:

<code>Название команды | Участник1, Участник2, Участник3</code>

<b>Пример:</b>
<code>Знатоки | Иван Иванов, Петр Петров, Мария Сидорова</code>

⚠️ Используйте символ | (вертикальная черта) для разделения.`;

  await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
});

// Команда /answer
bot.onText(/\/answer/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Проверяем, есть ли команда
  try {
    const sheet = await getSheet('teams');
    const rows = await sheet.getRows();
    const team = rows.find(row => row.get('chatId') == chatId);
    
    if (!team) {
      await bot.sendMessage(chatId, '⚠️ Сначала зарегистрируйте команду с помощью /register');
      return;
    }
    
    userStates[userId] = { action: 'answer', teamName: team.get('teamName') };
    
    const message = `✍️ <b>Отправка ответа</b>

Ваша команда: <b>${team.get('teamName')}</b>

Отправьте ответ в формате:
<code>Номер вопроса | Ваш ответ</code>

<b>Пример:</b>
<code>1 | Александр Пушкин</code>

⚠️ Используйте символ | (вертикальная черта) для разделения.`;

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Error getting team:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении данных команды');
  }
});

// Команда /myteam
bot.onText(/\/myteam/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const sheet = await getSheet('teams');
    const rows = await sheet.getRows();
    const team = rows.find(row => row.get('chatId') == chatId);
    
    if (!team) {
      await bot.sendMessage(chatId, '⚠️ Вы еще не зарегистрировали команду. Используйте /register');
      return;
    }
    
    const message = `👥 <b>Информация о вашей команде:</b>

📌 Название: <b>${team.get('teamName')}</b>
👤 Участники: ${team.get('people')}
📅 Дата регистрации: ${new Date(team.get('dateReg')).toLocaleString('ru-RU')}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
  } catch (error) {
    console.error('Error getting team info:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении информации о команде');
  }
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) {
    return; // Команды обрабатываются отдельно
  }
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  const state = userStates[userId];
  
  if (!state) {
    await bot.sendMessage(chatId, '❓ Используйте /start для просмотра доступных команд');
    return;
  }
  
  // Обработка регистрации
  if (state.action === 'register') {
    if (!text.includes('|')) {
      await bot.sendMessage(chatId, '⚠️ Неверный формат! Используйте:\n<code>Название команды | Участник1, Участник2</code>', { parse_mode: 'HTML' });
      return;
    }
    
    const parts = text.split('|');
    if (parts.length !== 2) {
      await bot.sendMessage(chatId, '⚠️ Неверный формат! Должен быть один символ |');
      return;
    }
    
    const teamName = parts[0].trim();
    const members = parts[1].trim();
    
    if (!teamName || !members) {
      await bot.sendMessage(chatId, '⚠️ Название команды и список участников не могут быть пустыми!');
      return;
    }
    
    try {
      const sheet = await getSheet('teams');
      await sheet.addRow({
        teamName: teamName,
        people: members,
        dateReg: new Date().toISOString(),
        chatId: chatId
      });
      
      delete userStates[userId];
      
      const message = `✅ <b>Команда успешно зарегистрирована!</b>

📌 Название: <b>${teamName}</b>
👥 Участники: ${members}

Теперь вы можете отправлять ответы командой /answer`;

      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
    } catch (error) {
      console.error('Error saving team:', error);
      await bot.sendMessage(chatId, '❌ Ошибка при регистрации. Попробуйте позже.');
      delete userStates[userId];
    }
  }
  
  // Обработка ответа
  if (state.action === 'answer') {
    if (!text.includes('|')) {
      await bot.sendMessage(chatId, '⚠️ Неверный формат! Используйте:\n<code>Номер вопроса | Ваш ответ</code>', { parse_mode: 'HTML' });
      return;
    }
    
    const parts = text.split('|');
    if (parts.length !== 2) {
      await bot.sendMessage(chatId, '⚠️ Неверный формат! Должен быть один символ |');
      return;
    }
    
    const questionNum = parts[0].trim();
    const answer = parts[1].trim();
    
    if (!questionNum || !answer) {
      await bot.sendMessage(chatId, '⚠️ Номер вопроса и ответ не могут быть пустыми!');
      return;
    }
    
    if (isNaN(parseInt(questionNum))) {
      await bot.sendMessage(chatId, '⚠️ Номер вопроса должен быть числом!');
      return;
    }
    
    try {
      const sheet = await getSheet('answers');
      await sheet.addRow({
        teamName: state.teamName,
        questionNumber: questionNum,
        answer: answer,
        timeSend: new Date().toISOString()
      });
      
      delete userStates[userId];
      
      const message = `✅ <b>Ответ принят!</b>

📌 Команда: <b>${state.teamName}</b>
🔢 Вопрос: ${questionNum}
✍️ Ответ: ${answer}

Для отправки следующего ответа используйте /answer`;

      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
    } catch (error) {
      console.error('Error saving answer:', error);
      await bot.sendMessage(chatId, '❌ Ошибка при отправке ответа. Попробуйте позже.');
      delete userStates[userId];
    }
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
