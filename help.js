var bot = require('./index').bot;


bot.onText(/\❓ Помощь/,function(msg){

	var userId = msg.from.id;

	bot.sendMessage(userId, 'Обращение по поводу заказа можете обратиться по номеру (номер)');

});