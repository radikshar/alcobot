var bot = require('./index').bot;
var SQL = require('./index').con;


var end_order = async function order_end(userId){

	var select_order = await SQL("SELECT count(product_id) as quantity, b.product_id, b.telegram_id, p.name, p.price, sum(p.price) as summa FROM basket b join product p on p.id = b.product_id where telegram_id = ? group by product_id",[userId]);

	var select_user = await SQL("SELECT * FROM users WHERE telegram_id = ?",[userId]);

		select_user = select_user[0];

	var sum_user = await SQL ("SELECT sum(p.price) as summa FROM basket b join product p on p.id = b.product_id where telegram_id = ?",[userId]);

	sum_user = sum_user[0];

	var select_address = await SQL("SELECT address FROM order_user WHERE telegram_id = ?",[userId]);

	select_address = select_address[0];

	await bot.sendMessage(userId,'\rИнформация о Заказе');

	await bot.sendMessage(userId,"Ваше имя: "+select_user.name+"\nВаш номер: "+select_user.phone+'\nАдрес: '+select_address.address+'\nВаш Заказ:\n');

	for(var i = 0; i < select_order.length ;i++){

		await bot.sendMessage(userId,'Название Виски: '+select_order[i].name+"\nКоличетсво бутылок: "+select_order[i].quantity+"\nЦена: "+select_order[i].price+"\nСумма: "+select_order[i].summa);

	}

	await bot.sendMessage(userId,'Итого к Оплате: '+sum_user.summa);


}

module.exports = {
	end_order:end_order
}