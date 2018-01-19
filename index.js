// check for empty keys
const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

if (!SLACK_API_TOKEN)
    return console.error("Please provide a valid slack api token: https://api.slack.com/bot-users")

if (!OPENWEATHER_API_KEY)
    return console.error("Please provide a valid openweather api key: http://openweathermap.org/appid")

const util = require("util")
const request = require("request")
const controller = require("botkit").slackbot()
const bot = controller.spawn({ token: SLACK_API_TOKEN })

const weather_url = `https://weather.qaap.io/data/2.5/weather?q=%s&cnt=1&appid=${OPENWEATHER_API_KEY}&units=metric`

// start real time messaging connection with slack api
bot.startRTM(function(error, bot, payload)
{
    if (error)
        return console.error("Could not connect to Slack: ", error)

    controller.hears("", ["direct_message", "direct_mention", "mention"], function(bot, message)
    {
        console.info("received message:", message.text)

        const request_url = util.format(weather_url, message.text)

        // get weather data from openweather api
        request(request_url, function (error, response, body)
        {
            let reply_message = {}

            // handle errors
            try
            {
                if (response.statusCode !== 200 || error)
                    throw new Error("invalid data")

                const data = JSON.parse(body)
                const weather = data.weather[0]
                const temperature = data.main.temp|0
                const icon_url = `http://openweathermap.org/img/w/${weather.icon}.png`

                reply_message.attachments =
                [{
                    "title" : `${weather.main}, ${temperature} °C`,
                    "image_url": icon_url
                }]
            }
            catch(e)
            {
                reply_message.attachments =
                [{
                    "text": "Sorry, I wasn't able to complete your request, here is a random cat image",
                    "image_url": `http://thecatapi.com/api/images/get?format=src&type=png&_=${Math.random()}` /* prevent image url caching */
                }]
            }

            bot.reply(message, reply_message)
        })
    })
})

