
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



//регистрация клиента
bot.onText(/\Регистрация/, async function (msg) {
	var userId = msg.from.id;

	var select_user = await SQL("SELECT * FROM users WHERE telegram_id = ?",[userId]);

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

//хранение юзеров в массиве
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
                	telegram_id: telegram_id,
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
       if (saveuser[i].status == true && saveuser[i].telegram_id == userId) {
          bot.sendMessage(userId, 'Вы уже потвердили свой возраст!');
          return;
      }
  }


  for (var i = 0; i<saveuser.length; i++) {


    if (buttonstatus == saveuser[i].countdec) {

       var insert_user = await SQL("INSERT INTO users (name,phone,age,telegram_id) VALUES (?,?,?,?)",[saveuser[i].name,saveuser[i].phone,false,saveuser[i].telegram_id]);

       await bot.sendMessage(saveuser[i].telegram_id,'Вам нет 21 года');

   }

   else if (buttonstatus == saveuser[i].countacc) {

       saveuser[i].status = true;

       var insert_user = await SQL("INSERT INTO users (name,phone,age,telegram_id) VALUES (?,?,?,?)",[saveuser[i].name,saveuser[i].phone,true,saveuser[i].telegram_id]);

       await bot.sendMessage(saveuser[i].telegram_id,'Теперь можете выбрать товар в меню',buttonmenu);


   }
}


}


var savemenu = require('./menu').savemenu;
var basket = require('./basket').basket;
var savebasket = require('./basket').savebasket;
var end_order = require('./order_end').end_order;



//обработка кнопки на нажатия
bot.on('callback_query', async function (msg) {

    var userId = msg.from.id;

    var buttonstatus = msg.data;

    var chatId = msg.message.chat.id;
    var messageId = msg.message.message_id;


    if (buttonstatus == 'yes') {

        var select_phone = await SQL("SELECT phone FROM users WHERE telegram_id = ?",[userId]);
        select_phone = select_phone[0];
        // var datatime = new Date();

        var insert_order = await SQL("UPDATE order_user SET phone = ? WHERE telegram_id = ?",[select_phone.phone,userId]);

        end_order(userId);

        return;
    }

    if (buttonstatus == 'no') {

        bot.sendMessage(userId,'Введите ваш номер');
        newnumber(userId);
        return;
    }


     if (msg.message.text == 'Потвердите, что вам есть 21 год') {

        regsiteruser(userId, buttonstatus);
        return;

    } 


    if (buttonstatus.indexOf == 'шт.') {
        return;
     }


    if (buttonstatus == 'basket') {
        basket(userId);
        return;
    }

    for (var i = 0; i < savebasket.length; i++){


        if (buttonstatus == savebasket[i].coudel) {
            

            var delete_basket = await SQL("DELETE FROM basket WHERE telegram_id = ? AND product_id = ?",[userId,savebasket[i].id]);

            bot.deleteMessage(chatId,messageId);



        } else if (buttonstatus == savebasket[i].couup) {

            var insert_basket = await SQL("INSERT INTO basket (product_id,telegram_id) VALUES (?,?)",[savebasket[i].id,userId]);

            var select_basket = await SQL("SELECT count(product_id) as quantity FROM basket where telegram_id = ? AND product_id = ?",[userId,savebasket[i].id]);

            select_basket = select_basket[0];

            var  reply = JSON.stringify({
                inline_keyboard: [
                [{text: ' ❌ ', callback_data: savebasket[i].coudel}, {text: '🔽', callback_data: savebasket[i].coudown },{text: select_basket.quantity+' шт.', callback_data: 'шт'},{text: '🔼',callback_data: savebasket[i].couup}],
                ]
            })


            bot.editMessageReplyMarkup(reply, {message_id: messageId, chat_id: chatId});


        } else if (buttonstatus == savebasket[i].coudown) {

            var select_count_basket = await SQL("SELECT count(product_id) as quantity FROM basket where telegram_id = ? AND product_id = ?",[userId,savebasket[i].id]);

            select_count_basket = select_count_basket[0];

            if (select_count_basket.quantity == 1) {
                return;
            }

            var delete_basket_amount = await SQL ("DELETE FROM basket WHERE telegram_id = ? AND product_id = ? LIMIT 1",[userId,savebasket[i].id]);

             var select_basket = await SQL("SELECT count(product_id) as quantity FROM basket where telegram_id = ? AND product_id = ?",[userId,savebasket[i].id]);

            select_basket = select_basket[0];

            var  reply = JSON.stringify({
                inline_keyboard: [
                [{text: ' ❌ ', callback_data: savebasket[i].coudel}, {text: '🔽', callback_data: savebasket[i].coudown },{text: select_basket.quantity+' шт.', callback_data: 'шт'},{text: '🔼',callback_data: savebasket[i].couup}],
                ]
            })


            bot.editMessageReplyMarkup(reply, {message_id: messageId, chat_id: chatId});
            
        }
    }

    for(var i = 0; i < savemenu.length; i++){


        if (savemenu[i].count == buttonstatus && savemenu[i].userid == userId) {


            var insert_basket = await SQL("INSERT INTO basket (product_id,telegram_id) VALUES (?,?)",[savemenu[i].id,userId]);


            var select_basket = await SQL("SELECT count(product_id) as quantity FROM basket where telegram_id = ? AND product_id = ?",[userId,savemenu[i].id]);

            select_basket = select_basket[0];

            var  replyMarkup2 = JSON.stringify({
              inline_keyboard: [
              [{text: '🗑Добавлено в корзину('+select_basket.quantity+' шт.)', callback_data: savemenu[i].count }],
              [{text: '🗑Перейти в корзину', callback_data: 'basket'}],
              ]
          })


            bot.editMessageReplyMarkup(replyMarkup2, {message_id: messageId, chat_id: chatId});

        }

    }


});


function newnumber(userId){
    var telegram_id = userId;
    var number = '';

    bot.on('message', async function (msg){


        if (msg.from.id == telegram_id) {


            if (number == '') {

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

                var update_phone = await SQL("UPDATE users SET phone = ? WHERE telegram_id = ?",[phone,userId]);

                var insert_order = await SQL("UPDATE order_user SET phone = ? WHERE telegram_id = ?",[phone,userId]);

                end_order(userId);
            }

        }

    })
}


module.exports = buttonmenu;