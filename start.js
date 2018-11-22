var bot = require('./index').bot;

const stbutton = {
    parse_mode: "Markdown",
    reply_markup: {
        keyboard: [["Регистрация 🗒"]],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
};

bot.onText(/\/start/,async function (msg) {
    var userId = msg.from.id;
    await bot.sendMessage(userId,'Здравствуйте, для пользование ботом сначала зарегистрируйтесь');
    await bot.sendMessage(userId,'Нажмите на кнопку Регистрация',stbutton);
});

module.exports = stbutton;
