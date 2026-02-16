const axios = require("axios");
const cheerio = require("cheerio");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const KIWI_EMAIL = process.env.KIWI_EMAIL;
const KIWI_PASSWORD = process.env.KIWI_PASSWORD;

let lastOrder = null;

async function checkOrders() {
  try {
    const response = await axios.get("https://kiwitaxi.com/agent.php/orders", {
      auth: {
        username: KIWI_EMAIL,
        password: KIWI_PASSWORD,
      },
    });

    const $ = cheerio.load(response.data);
    const firstOrder = $("table tr").first().text().trim();

    if (firstOrder && firstOrder !== lastOrder) {
      lastOrder = firstOrder;

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: "🚗 Nouvelle course détectée sur KiwiTaxi ! Vérifie immédiatement !",
      });

      console.log("Nouvelle course envoyée !");
    }
  } catch (error) {
    console.log("Erreur :", error.message);
  }
}

setInterval(checkOrders, 30000);
