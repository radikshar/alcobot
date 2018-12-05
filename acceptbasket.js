var bot = require('./index').bot;
var SQL = require('./index').con;


bot.onText(/\🗒 Заказать товар/,function (msg){

	var userId = msg.from.id;

	bot.sendMessage(userId,'Укажите свой адрес');
	address(userId);


});


function address(userId){
	var telegram_id = userId;
	var address = '';

	bot.on('message', async function (msg){


		if (msg.from.id == telegram_id) {


			if (address == '') {

				address = msg.text;

				var select_basket = await SQL("SELECT count(product_id) as quantity, b.product_id FROM basket b join product p on p.id = b.product_id where telegram_id = ? group by product_id;",[userId]);


				for(var i = 0; i < select_basket.length; i++){

					var insert_order = await SQL("INSERT INTO order_user (product_id,telegram_id,address,amount) VALUES (?,?,?,?)",[select_basket[i].product_id,userId,String(address),select_basket[i].quantity]);

				}

				var select_phone = await SQL("SELECT phone FROM users WHERE telegram_id = ?",[userId]);

				select_phone = select_phone[0];

				bot.sendMessage(userId,'Это ваш номер телефона: '+select_phone.phone,{
					reply_markup: JSON.stringify({
						inline_keyboard: [
						[{text: '✅ Потвердить', callback_data: 'yes' }, {text: '❌ Не правильный', callback_data: 'no' }],
						]
					})
				})
			}

		}

	})
}