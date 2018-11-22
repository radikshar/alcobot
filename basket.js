var bot = require('./index').bot;
var SQL = require('./index').con;
// var saveorder = require('./menu').saveorder;

//Счетчик для проверки есть ли товар в корзине
// var count =0;

//Хранение итоговой цены
var totalamount = 0;

var basket = async function basketinfo (userId) {

	var select_basket = await SQL("SELECT * FROM basket WHERE telegram_id = ?",[userId]);

	bot.sendMessage(userId,'Корзина:');

	for (var i = 0; i < select_basket.length; i++){

		 bot.sendPhoto(userId, select_basket[i].photo, 
			{
				caption:'Название виски:'+select_basket[i].name+ '\nКоличество бутылок:'+select_basket[i].amount+" шт.", 
				reply_markup: JSON.stringify({
            		inline_keyboard: [
            		[{text: '❌ Убрать из корзины', callback_data: 'count' }],
            		]
            	})
			}
		);
	}

}


module.exports = basket;
