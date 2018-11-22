var bot = require('./index').bot;
var SQL = require('./index').con;


const buttonmenu = {
	parse_mode: "Markdown",
	reply_markup: {
		keyboard: [["🛍 Корзина"]],
		resize_keyboard: true,
		one_time_keyboard: true,
	},
};

//Для хранение заказов клиента
var saveorder = [];

//Для обработки кнопки
var count = 0;

//Запрос вытаскивание меню
var select_menu;

//Для хранение кол-во товара
var amount = 0;

//Обработка кнопки меню
bot.onText(/\🍴 Меню/, async function (msg){

	var userId = msg.from.id;

	select_menu = await SQL("SELECT * FROM product");

	for(var i = 0; i < select_menu.length; i++){

		saveorder.push({
			name:select_menu[i].name,
			count: count,
			price: select_menu[i].price,
			status: false,
			sum: 0,
			userid: userId,
			amount: amount
		});

		await bot.sendMessage(userId, 'Название виски:'+select_menu[i].name);

		await bot.sendPhoto(userId, select_menu[i].photo, 
			{
				caption:'Название виски:'+select_menu[i].name+ 'Описание:\n'+select_menu[i].description+"\nЦена: "+select_menu[i].price + " тг.", 
				reply_markup: JSON.stringify({
            		inline_keyboard: [
            		[{text: '✅ Потвердить', callback_data: count }],
            		]
            	})
			}
		);

		count++;

	}
});



//Функция добавление товара клиента
var menu = function addorder (userId, buttonstatus) {


	for(var i = 0; i < saveorder.length; i++){


		if (buttonstatus == saveorder[i].count && userId == saveorder[i].userid) {

			saveorder[i].amount++; 

			saveorder[i].status = true;

			saveorder[i].sum = Number(saveorder[i].price) + Number(saveorder[i].sum);


			bot.sendMessage(userId,'Можете перейти в корзину для оформление заказа',buttonmenu);

		}
	}

}


module.exports = {
	menu:menu,
	saveorder: saveorder,
}