var bot = require('./index').bot;
var buttonmenu = require('./registeruser');

bot.onText(/\🔙 Назад в Меню/,function(msg){

	var userId = msg.from.id;

	bot.sendMessage(userId'Вы вернулись в главное Меню',buttonmenu);
})