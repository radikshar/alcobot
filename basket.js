var bot = require('./index').bot;
var SQL = require('./index').con;
var buttonmenu = require('./registeruser');

//Кнопки для Корзины
const buttonbasket = {
    parse_mode: "Markdown",
    reply_markup: {
        keyboard: [["🗒 Заказать товар"],
        ["🗑 Очистить корзину"],
        ["🔙 Назад в Меню"]],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
};

//Для обработки кнопок
var coudel=10000,couup=11200,coudown=14500;

//Массив хренение заказа
var savebasket = [];


var basket = async function basketinfo (userId) {

	var check_basket = await SQL("SELECT * FROM basket WHERE telegram_id = ?",[userId]);

	if (check_basket.length == 0) {
		bot.sendMessage(userId,'Корзина пуста! Перейдите в меню для выбора товара',);
	}

	var select_basket = await SQL("SELECT count(product_id) as quantity, b.product_id, p.name, p.price, p.photo FROM basket b join product p on p.id = b.product_id where telegram_id = ? group by product_id;",[userId]);

	bot.sendMessage(userId,'Корзина:');

	for(var i = 0; i < select_basket.length; i++){

		savebasket.push({
			id:select_basket[i].product_id,
			coudel: coudel,
			couup: couup,
			coudown: coudown,
			userid:userId
		});

		bot.sendPhoto(userId, select_basket[i].photo, 
		{
			caption:'Название виски: '+select_basket[i].name+ '\nЦена товара: '+select_basket[i].price, 
			reply_markup: JSON.stringify({
				inline_keyboard: [
				[{text: ' ❌ ', callback_data: coudel }, {text: '🔽', callback_data: coudown },{text: select_basket[i].quantity+' шт.', callback_data: 'шт'},{text: '🔼',callback_data: couup}],
				]
			})
		}
		);

		coudel++;
		couup++;
		coudown++;

	}

	bot.sendMessage(userId,'Потвердите свой заказ нажав на кнопку "Заказать товар"',buttonbasket);


}


bot.onText(/\🛍 Корзина/, function (msg){

	var userId = msg.from.id;

	basket(userId);

});


module.exports = {
	basket:basket,
	savebasket:savebasket
};
