var bot = require('./index').bot;
var SQL = require('./index').con;

//Для хранение заказов клиента
var savemenu = [];

//Для обработки кнопки
var count = 0;

//Запрос вытаскивание меню
var select_menu;


//Обработка кнопки меню
bot.onText(/\🥃 Меню/, async function (msg){

	var userId = msg.from.id;

	select_menu = await SQL("SELECT * FROM product");

	for(var i = 0; i < select_menu.length; i++){

		savemenu.push({
			id: select_menu[i].id,
			count: count,
			userid: userId,
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
	savemenu: savemenu
}