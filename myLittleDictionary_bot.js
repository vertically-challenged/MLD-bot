const TelegramBot = require('node-telegram-bot-api'); 
const botMessages = require('./botMessages');
const {connectDB, findUser, addUser, addLang, addWord, activationLanguage, randomWord, getWordTranslation, nextWord} = require('./botMethods');
const config = require('./config');
// -----

const token = config.token;
const mongoUrl = config.mongoUrl;
const adminID = config.adminID;
const engineering = config.engineering;

connectDB(mongoUrl);
const bot = new TelegramBot(token, {
    polling: {
        interval: 300,
        autoStart: true, 
        params: {
            timeout: 10
        }
    }
}); 

console.log('Bot has been started...')

async function forStartCmd(id) {
    findUser(id).then((result) => {
        // Проверка, есть ли пользователь в БД

        if (result) {
            // Так же при входе будет клавиатура с help и learn для уже добавленных в БД пользователей, а для пользователей с несколькими языками, сначала клавиатура для выбора языка 
            let markdown = botMessages.MD_2;
            bot.sendMessage(id, markdown, {
                parse_mode: 'Markdown'
            });    
        } else {
            //Первичная настройка (tutor)
            let markdown = botMessages.MD_3;
            bot.sendMessage(id, markdown, {
                parse_mode: 'Markdown'
            })
        }
    })
}

async function forHelpCmd(id) {
    let markdown = botMessages.MD_1;
    bot.sendMessage(id, markdown, {
        parse_mode: 'Markdown'
    }); 
}

async function forLearnCmd(id) {
    findUser(id).then((result) => {
        // Проверка, есть ли пользователь в БД

        if (result) {
            // Вывод слова
            randomWord(result).then((result) => {
                if (result === undefined) {
                    bot.sendMessage(id, `ERROR: Вы не добавили ни одного слова`, {
                        disable_notification: true,
                    }); 
                } else {
                    let markdown = `Слово: *${result.word}*`;
                    bot.sendMessage(id, markdown, {
                        disable_notification: true,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Я знаю это слово', 
                                        callback_data: 'next'
                                    }
                                ], 
                                [
                                    {
                                        text: 'Показать перевод',
                                        callback_data: 'translate'
                                    }
                                ]
                            ]
                        }
                    })  
                }
            })  
        } else {
            //Первичная настройка (tutor)
            let markdown = botMessages.MD_3;
            bot.sendMessage(id, markdown, {
                parse_mode: 'Markdown'
            })
        }
    })
}

async function forNextCmd(id) {
    findUser(id).then((result) => {
        // Проверка, есть ли пользователь в БД
        if (result) {
            // Вывод следующего слава
            nextWord(result).then((result) => {
                if (result === undefined) {
                    bot.sendMessage(id, `ERROR: У вас нет добавленных слов`, {
                        disable_notification: true,
                    }); 
                } else {
                    let markdown = `Слово: *${result.word}*`;
                    bot.sendMessage(id, markdown, {
                        disable_notification: true,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Я знаю это слово', 
                                        callback_data: 'next'
                                    }
                                ], 
                                [
                                    {
                                        text: 'Показать перевод',
                                        callback_data: 'translate'
                                    }
                                ]
                            ]
                        }
                    })  
                }
            })  
        } else {
            //Первичная настройка (tutor)
            let markdown = botMessages.MD_3;
            bot.sendMessage(id, markdown, {
                parse_mode: 'Markdown'
            })
        }
    })  
}

async function forTranslateCmd(id) {
    findUser(id).then((result) => {
        // Проверка, есть ли пользователь в БД

        if (result) {
            // Вывод перевода
            getWordTranslation(result).then((result) => {
                if (result === undefined) {
                    bot.sendMessage(id, `ERROR: Перевод не найден`, {
                        disable_notification: true,
                    }); 
                } else {
                    let markdown = `Перевод: *${result}*`;
                    bot.sendMessage(id, markdown, {
                        disable_notification: true,
                        parse_mode: 'Markdown', 
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Следующее слово', 
                                        callback_data: 'next'
                                    }
                                ]
                            ]
                        }
                    })  
                }
            })  
        } else {
            //Первичная настройка (tutor)
            let markdown = botMessages.MD_3;
            bot.sendMessage(id, markdown, {
                parse_mode: 'Markdown'
            })
        }
    })  
}

async function forMessage(id, message) {
    findUser(id).then((result) => {
        // Проверка, есть ли пользователь в БД
        if (result) {
            // Добавляем новое слово в БД
            let user = result;
            addWord(message.text, user).then((result) => {
                if (result === 'ERROR') {
                    bot.sendMessage(id, 'ERROR: Ошибка ввода', {
                        disable_notification: true,
                    });
                } else {
                    bot.sendMessage(id, '...Слово добавлено', {
                        disable_notification: true,
                    });
                }
            })
        } else {
            // Запускаем туториал 
            addUser(message.chat.id)
            .then((result) => {
                let user = result;
                addLang(message.text, user);
                let markdown = botMessages.MD_4;
                bot.sendMessage(id, markdown, {
                    disable_notification: true,
                    parse_mode: 'Markdown'
                })  
                return user;
            })
        }
    })   
}

async function forAddLangCmd(id) {
    let markdown = `Какой язык вы хотите добавить?`;
    bot.sendMessage(id, markdown, {
        disable_notification: true,
        parse_mode: 'Markdown'
    })  
}

async function forTechnicalWork(id) {
    bot.sendMessage(id, 'Технические работы...', {
        disable_notification: true,
    });
}


bot.onText(/\/start/, message => {
    const {id} = message.chat;
    if ((id != adminID) && engineering) {
        forTechnicalWork(id);
        return;
    }
    forStartCmd(id);
})

bot.onText(/\/learn/, message => {
    const {id} = message.chat;
    if ((id != adminID) && engineering) {
        forTechnicalWork(id);
        return;
    }
    forLearnCmd(id);
})

bot.onText(/\/translate/, message => {
    const {id} = message.chat;
    if ((id != adminID) && engineering) {
        forTechnicalWork(id);
        return;
    }
    forTranslateCmd(id);
})

bot.onText(/\/next/, message => {
    const {id} = message.chat;
    if ((id != adminID) && engineering) {
        forTechnicalWork(id);
        return;
    }
    forNextCmd(id);
})

bot.onText(/\/help/, message => {
    const {id} = message.chat;
    if ((id != adminID) && engineering) {
        forTechnicalWork(id);
        return;
    }
    forHelpCmd(id);
})

bot.on('message', (message) => {
    if (!(message.entities)) {
        const {id} = message.chat;
        if ((id != adminID) && engineering) {
            forTechnicalWork(id);
            return;
        }
        forMessage(id, message);
    }
})

bot.on('callback_query', (query) => {
    const {id} = query.message.chat;
    switch (query.data) {
        case 'next': 
            forNextCmd(id);
            break;
        case 'translate': 
            forTranslateCmd(id);
            break;
    }
})