var bot = require('./index').bot;
var saveorder = require('./menu').saveorder;

//Счетчик для проверки есть ли товар в корзине
var count =0;

//Хранение итоговой цены
var totalamount = [];

bot.onText(/\🛍 Корзина/,function (msg){

	var userId = msg.from.id;

	for(var i = 0; i < saveorder.length; i++){
		if (saveorder[i].userid == userId && saveorder[i].status == true) {

			count++;

		} 

	}


	if (count == 0) {

		bot.sendMessage(userId,'Вы еще не выбрали товар!');
		return;
	}
	else {

		bot.sendMessage(userId,'Вы выбрали:');

		for(var i = 0; i < saveorder.length; i++){
			if (saveorder[i].userid == userId && saveorder[i].status == true) {

				bot.sendMessage(userId, 'Виски:'+saveorder[i].name + ' Кол-во:'+saveorder[i].amount+ ' Сумма:'+saveorder[i].sum);

			} 

		}


	}


});