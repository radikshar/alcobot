var bot = require('./index').bot;
var SQL = require('./index').con;
var buttonmenu = require('./registeruser');
var savebasket = require('./basket').savebasket;
var savemenu = require('./savemenu').savemenu;

bot.onText(/\🗑 Очистить корзину/, async function(msg){

	var userId = msg.from.id;

	var delete_basket = await SQL("DELETE * FROM basket WHERE telegram_id = ?",[userId]);

	for(var i = 0; i < savebasket.length; i++){
		if (savebasket[i].userid == userId) {
			savebasket.splice(i,1);
		}
	}

	for(var i = 0; i < savemenu.length; i++){
		if (savemenu[i].userid == userId) {
			savemenu.splice(i,1);
		}
	}

	await bot.sendMessage(userId,'Корзина пуста',buttonmenu);
});