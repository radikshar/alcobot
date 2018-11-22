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


//Обработка кнопки меню
bot.onText(/\🥃 Меню/, async function (msg){

	var userId = msg.from.id;

	select_menu = await SQL("SELECT * FROM product");

	for(var i = 0; i < select_menu.length; i++){

		saveorder.push({
			name:select_menu[i].name,
			photo: select_menu[i].photo,
			count: count,
			price: select_menu[i].price,
			status: false,
			sum: 0,
			userid: userId,
			amount: 0
		});

		await bot.sendPhoto(userId, select_menu[i].photo, 
			{
				caption:'Название виски:'+select_menu[i].name+ '\nОписание:\n'+select_menu[i].description+"\nЦена: "+select_menu[i].price + " тг.", 
				reply_markup: JSON.stringify({
            		inline_keyboard: [
            		[{text: '🗑Добавить в корзину', callback_data: count }],
            		]
            	})
			}
		);

		count++;

	}
});



module.exports = {
	saveorder: saveorder
}