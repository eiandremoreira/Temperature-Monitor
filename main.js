const {
    find
} = require("weather-js")
const {
    WebhookClient
} = require("discord.js")
const {
    connect,
    Schema,
    model
} = require("mongoose");

const config = require("./config.json")

const Webhook = new WebhookClient(config.webhook.id, config.webhook.token)

connect(config.database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("DataBase ligada."));

const Data = new Schema({
    temp: String,
    id: Number
});

const mongo = model("temp", Data);


setInterval(() => {
    find({
        search: config.weather.localização,
        degreeType: "C"
    }, function(err, result) {

        if (err) return Webhook.send(`:x: Ocorreu um erro ao efetuar a pesquisa. `)

        mongo.findOne({
            id: 1
        }, async (err, data) => {

            var current = result[0].current;

            if (!data) {
                new mongo({
                    id: 1,
                    temp: current.temperature
                }).save()
            }

            if (data.temp == current.temperature) return console.log(`Não ouve atualizações na temperatura desde a ultima notificação.`)

            if (data) {
                data.temp = current.temperature
                data.save()
            }

            if (!result) return Webhook.send(`:x: Não encontrei a sua cidade.`)

            Webhook.send(`**- Clima de hoje**\n\n**Dia:** ${current.date} (Hoje)\n**Temperatura:** ${current.temperature} Cº\n**Sensação:** ${current.feelslike} Cº\n**Vento:** ${current.winddisplay}\n**Umidade:** ${current.humidity} %`).then(() => console.log("Mensagem de atualização enviada"))

        });
    });
}, 120000);
