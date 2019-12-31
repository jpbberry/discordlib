# discord-tag
Low weight tag bot.

Using [discord-no-cache](https://github.com/jpbberry/discord-no-cache) internal library for lightweight websocket and restful use, with no caching. This means your simple tag bot no longer needs an extremely powerful memory intensive library.

## How to
```js
const Client = require("discord-tag");
let client = new Client()
    // Add a prefix
    .addPrefix("!")
    // Set a log function
    .setLog(console.log)
    // Add a command
    .addCommand("commandname", "command response")
    // Add a command using a function
    .addCommand("commandname2", (message, send) => {
        send("Yada");
    })
    // Add a command that deletes the invoking message
    .addCommand("commandname3", "command response", true)
    // Log in and start the bot
    .login(YOUR_BOT_TOKEN);
```

## Docs

### addPrefix(prefix)
Adds a prefix to the list, adding multiple prefix' does work

### setMentionPrefix(boolean)
Sets whether or not the bot will treat it's mention as a prefix (Ex: responds to `@Bot Mention commandname`)

### setStatus(type, game)
Sets status. Type = 'playing'/'streaming'/'listening'/'watching'. And game is the text after said type.

### setBotRun(botrun)
Sets whether or not bots can run commands. This is false by default as is recommended. 

### addCommand(commandName, commandResponse, [autoDelete])
commandName = What the bot responds too (after prefix).

commandResponse = A string that will be sent as a response, or a function that will be ran

autoDelete = A boolean to tell whether the invoking message will be deleted

### setLog(fn)
Set's the log function thats ran with the first parameter being the log message

### login(token, [extraopts])
token = The bot token that is used to log into the websocket and send requests to the RESTful

extraopts = Options object to be sent directly to the internal discord-no-cache library

### setDebug(fn)
Set's the function for debug messages sent by the internal discord-no-cache library

## Links
- [GitHub](https://github.com/jpbberry/discord-tag)
- [NPM Package](https://npmjs.com/package/discord-tag)