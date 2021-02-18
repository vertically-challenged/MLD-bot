const Messages = {
MD_1: `
Для добавления слова отправьте его в формате: _Слово - Перевод_
Для повторения слов вызовите */learn*

*Доступные функции:*
/learn - изучение 
/help - список команд

*Пока недоступные функции:*
/AddLang - добавить еще один язык
/del (_слово_) - удалить слово
/delLang (_язык_) - удалить язык 
/changeLang - переключить язык 
/export - выгрузить БД слов
/import - загрузить БД слов 
`, 
MD_2: `
Для добавления слова отправьте его в формате: _Слово - Перевод_
Для повторения слов вызовите */learn*

Все доступные функции: /help
`, 
MD_3: `
Я помогу вам изучить иностранный язык ^^
Какой язык вы изучаете?
`,
MD_4: `
Вам больше не нужно выписывать новые слова в тетрадку или хранить в заметках, просто отправьте мне слово в формате: _Слово - Перевод_
Для повторения слов вызовите */learn*

*Доступные функции:*
/learn - изучение 
/help - список команд

*Пока недоступные функции:*
/AddLang - добавить еще один язык
/del (_слово_) - удалить слово
/delLang (_язык_) - удалить язык 
/changeLang - переключить язык 
/export - выгрузить БД слов
/import - загрузить БД слов `
} 

module.exports = Messages; 