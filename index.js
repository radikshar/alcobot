process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
const util = require('util');


const TOKEN = '774155792:AAH4m37TUQ5nPSqZ6tzQDKIkBXUdH-22r_o';

let con = async function(query, data, flag)
{
  let con = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "bot"
});
  try
  {
    if(data)
    {
      if(flag)
      {
        let result = await con.query(query, data);
        return result;
      }
      else
      {
        let [result] = await con.query(query, data);
        return result;
      }
    }
    else
    {
      if(flag)
      {
        let result = await con.query(query);
        return result;
      }
      else
      {
        let [result] = await con.query(query);
        return result;
      }
    }
  }
  catch(err)
  {
    console.log('SQL::ERROR::', err);
  }
  finally
  {
    con.end();
  }
}

const bot = new TelegramBot(TOKEN, {polling: true});

module.exports = {

    bot:bot,
    con:con
};


require('./start');
require('./registeruser');
require('./menu');
require('./basket');
require('./help');
require('./acceptbasket');
require('./order_end');
require('clear_basket');
require('back_menu');