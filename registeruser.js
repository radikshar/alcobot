
var bot = require('./index').bot;
var SQL = require('./index').con;

const buttonmenu = {
    parse_mode: "Markdown",
    reply_markup: {
        keyboard: [["🥃 Меню", "🛍 Корзина", "❓ Помощь"]],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
};



//регистрация сотрудника
bot.onText(/\Регистрация/, async function (msg) {
	var userId = msg.from.id;

	var select_user = await SQL("SELECT * FROM user WHERE user_id = ?",[userId]);

	select_user = select_user[0];


	if (typeof select_user == 'undefined') {


		bot.sendMessage(userId, 'Введите свое имя');
		register(userId);
	}
	else if (select_user.age == false) {
		bot.sendMessage(userId,'Вам нельзя покупать алкоголь!');
	}   else {
		bot.sendMessage(userId,'Вы уже зарегистрированы!');
	}     

});

var saveuser = [];


//Проверка для кнопок
var countaccept = 0;
var countdec = 10000;

//Регистрирует сотрудника
function register(userId) {

	var telegram_id = userId;
	var firstname = '';
	var surname = '';
	var middlename = '';
	var phone = '';
	var strname;
	var regex = /[.*%&!@#№+?^${}()|[\]\\,0-9]/g;
	var found = '';


	bot.on('message', async function (msg) {


        //провека что именно этот человек пишет
        if (msg.from.id == telegram_id) {


            //Добавляет имя
            if (firstname === '') {

                //проверка если пользователь нажал на кнопку
                if (msg.text === 'Регистрация 🗒') {
                	msg.text = '';
                	return;
                }

                let serchcommand = msg.text.indexOf('/');

                //Проверка, если пользователь ввел команду для имени
                if (serchcommand>=0) {
                	msg.text = '';
                	bot.sendMessage(userId,'Вы ввели комманду!Введите свое имя!');
                	return;
                }

                firstname = msg.text;


                found = firstname.match(regex);

                if (found !=null) {
                	firstname = '';

                	await bot.sendMessage(userId, 'Введите еще раз Имя');

                	return;

                }


                //Проверка имени на длину
                if (firstname.length === 1) {
                	firstname = '';

                	await bot.sendMessage(userId, 'Введите еще раз Имя');

                	return;
                }

                await bot.sendMessage(userId, 'Здравствуйте ' + firstname + ', теперь введите номер');

                return;

            }

            //Добавляет телефон
            if (phone === '') {


                //Проверка, если пользователь нажал на кнопку
                if (msg.text == 'Регистрация 🗒') {
                	phone = '';
                	msg.text = '';
                	return;
                }


                if (msg.text!= null) {
                	phone = msg.text;
                }

                


                //Проверка, если в номере присувствуют символы
                if (isNaN(phone)) {
                	phone = '';
                	await bot.sendMessage(userId, 'Вы ввели неправильно телефон, введите заново');
                	return;
                }


                //Проверка длины номера на соответствие
                if (phone.length <= 10) {
                	phone = '';
                	await bot.sendMessage(userId, 'Вы ввели неправильно телефон, введите заново');
                	return;
                }

                saveuser.push({
                	name: firstname,
                	phone: phone,
                	countacc:countaccept,
                	countdec: countdec,
                	userid: telegram_id,
                	status:false
                });

                await bot.sendMessage(telegram_id, "Потвердите, что вам есть 21 год", {
                	reply_markup: JSON.stringify({
                		inline_keyboard: [
                		[{text: '✅ Потвердить', callback_data: countaccept }, {text: '❌ Меньше 21 года', callback_data: countdec }],
                		]
                	})
                });


                countaccept++;
                countdec++;

            }

        }

    });
}


//Регистрация юзеров
async function regsiteruser(userId,buttonstatus){

 for (var i = 0; i < saveuser.length; i++) {
     if (saveuser[i].status == true && saveuser[i].userid == userId) {
      bot.sendMessage(userId, 'Вы уже потвердили свой возраст!');
      return;
  }
}


for (var i = 0; i<saveuser.length; i++) {


    if (buttonstatus == saveuser[i].countdec) {

     saveuser[i].status = true;


     var insert_user = await SQL("INSERT INTO user (name,phone,age,user_id) VALUES (?,?,?,?)",[saveuser[i].name,saveuser[i].phone,false,saveuser[i].userid]);

     await bot.sendMessage(saveuser[i].userid,'Вам нет 21 года');

 }

 else if (buttonstatus == saveuser[i].countacc) {

     saveuser[i].status = true;

     var insert_user = await SQL("INSERT INTO user (name,phone,age,user_id) VALUES (?,?,?,?)",[saveuser[i].name,saveuser[i].phone,true,saveuser[i].userid]);

     await bot.sendMessage(saveuser[i].userid,'Теперь можете выбрать товар в меню',buttonmenu);


 }
}


}


var saveorder = require('./menu').saveorder;
var basket = require('./basket');



//обработка кнопки на нажатия
bot.on('callback_query', async function (msg) {

    var userId = msg.from.id;

    var buttonstatus = msg.data;

    // console.log(msg);

    var chatId = msg.message.chat.id;
    var messageId = msg.message.message_id;

    if (msg.message.text == 'Потвердите, что вам есть 21 год') {


        regsiteruser(userId, buttonstatus);
        return;

    } 


    if (buttonstatus == 'basket') {
        basket(userId);
        return;
    }

    for(var i = 0; i < saveorder.length; i++){


        if (saveorder[i].count == buttonstatus && saveorder[i].userid == userId) {


            saveorder[i].amount++; 

            saveorder[i].status = true;

            saveorder[i].sum = Number(saveorder[i].price) + Number(saveorder[i].sum);

            var select_basket = await SQL ("SELECT * FROM basket WHERE telegram_id = ? AND name = ?",[userId,saveorder[i].name]);

            select_basket = select_basket[0];


            if (typeof select_basket == 'undefined') {
                var insert_base = await SQL("INSERT INTO basket (name,photo,price,sum,amount,telegram_id) VALUES (?,?,?,?,?,?)",
                [saveorder[i].name,saveorder[i].photo,saveorder[i].price,saveorder[i].sum,saveorder[i].amount,saveorder[i].userid]);
            } else {
                var update_basket = await SQL("UPDATE basket SET amount = ?,sum = ?  WHERE telegram_id = ? AND name = ?",
                    [saveorder[i].amount,saveorder[i].sum,select_basket.telegram_id,select_basket.name]);
            }

             

            var  replyMarkup2 = JSON.stringify({
              inline_keyboard: [
              [{text: '🗑Добавлено в корзину('+saveorder[i].amount+' шт.)', callback_data: saveorder[i].count }],
              [{text: '🗑Перейти в корзину', callback_data: 'basket'}],
              ]
          })


            bot.editMessageReplyMarkup(replyMarkup2, {message_id: messageId, chat_id: chatId});

        }

    }


});


