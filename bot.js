var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const https = require('https');
const mtg = require('mtgsdk');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
        	case 'help':
        		let helpMessage = '***Please include a \"!\" before each of these commands***';
        			helpMessage += '\n \t test - Make sure the bot is working properly...';
        			helpMessage += '\n \t yikes - yikes'
        			helpMessage += '\n \t danger - The classic danger rat.'
	        		helpMessage += '\n \t catfact - Get a random cat fact!';
	        		helpMessage += '\n \t dogfact - Get a random dog fact!';
        			helpMessage += '\n \t scry [mtg-card-name] - Get the price and picture of a given magic the gathering card.';
        			helpMessage += '\n \t insult [person] - Insult someone, or yourself, either way you\'re a bad person.';
        			helpMessage += '\n Tell Shouji about more commands you want implemented.';
                bot.sendMessage({
                    to: channelID,
                    message: helpMessage
                });
            break;
            case 'test':
                bot.sendMessage({
                    to: channelID,
                    message: 'Why was I created?'
                });
            break;
            case 'yikes':
                bot.sendMessage({
                    to: channelID,
                    message: 'https://i.kym-cdn.com/photos/images/newsfeed/001/555/872/b49.jpg'
                });
            break;
            case 'danger':
                bot.sendMessage({
                    to: channelID,
                    message: 'https://i1.sndcdn.com/artworks-000343247160-4ohzyh-t500x500.jpg'
                });
            break;
            case 'catfact':
            	https.get('https://catfact.ninja/fact', (resp) => {
  					let data = '';

 					 resp.on('data', (chunk) => {
    					data += chunk;
  					});

  					resp.on('end', () => {
    					bot.sendMessage({
                    	to: channelID,
                    	message: JSON.parse(data).fact
                		});
  					});

					}).on("error", (err) => {
  						bot.sendMessage({
                    	to: channelID,
                    	message: 'The cats are dead. No more facts.'
                		});
				});
            break;
            case 'dogfact':
            https.get('https://dog-api.kinduff.com/api/facts', (resp) => {
  					let data = '';

 					 resp.on('data', (chunk) => {
    					data += chunk;
  					});

  					resp.on('end', () => {
    					bot.sendMessage({
                    	to: channelID,
                    	message: JSON.parse(data).facts
                		});
  					});

					}).on("error", (err) => {
  						bot.sendMessage({
                    	to: channelID,
                    	message: 'The dogs are dead. No more facts.'
                		});
				});
            break;
            case 'scry':
            let cardname = args.toString();
            cardname = cardname.replace(/,/g, "+");
            https.get('https://api.scryfall.com/cards/named?fuzzy=' + cardname, (resp) => {
  					let data = '';
 					 resp.on('data', (chunk) => {
    					data += chunk;
  					});

  					resp.on('end', () => {
  						let parsedData = JSON.parse(data);
  						if(parsedData.object !== "error")
  						{
  							if (parsedData.prices.usd != null)
  							{
  								bot.sendMessage({
                    				to: channelID,
                    				message: "Card Name: " + parsedData.name + " \nCurrent Price: $" + parsedData.prices.usd
                				});
  							} else 
  							{
								bot.sendMessage({
                    				to: channelID,
                    				message: "Card Name: " + parsedData.name + " No price found."
                				});
  							}
  							
                			bot.sendMessage({
                    			to: channelID,
                    			message: parsedData.image_uris.large
                			});
  						} else if(parsedData.type == 'ambiguous'){
  							bot.sendMessage({
                    			to: channelID,
                    			message: "Please refine your search."
                			});
  						} else if (parsedData.code == 'not_found') {
								bot.sendMessage({
                    			to: channelID,
                    			message: "I couldn't find that card."
                			});
  						} else {
  							bot.sendMessage({
                    			to: channelID,
                    			message: "We encountered a big boy error: please call your local Shouji."
                			});
               console.log("ERROR: scryfall had an unknown error using " + cardname + ".");
  						}
    					

  					});

					}).on("error", (err) => {
  						bot.sendMessage({
                    	to: channelID,
                    	message: 'API connection failed with trace: ' + err
                		});
					});
            break;

            case 'insult':
            let name = args.toString();
            name = name.replace(/,/g, " ");
            if(name != '' && name != 'me')
            {
            	https.get('https://insult.mattbas.org//api/insult.txt?who=' + name, (resp) => {
  					let data = '';

 					 resp.on('data', (chunk) => {
    					data += chunk;
  					});

  					resp.on('end', () => {
    					bot.sendMessage({
                    	to: channelID,
                    	message: data
                		});
  					});

					}).on("error", (err) => {
  						bot.sendMessage({
                    	to: channelID,
                    	message: 'You suck so much, that the API call didn\'t work.'
                		});
				});
            } else if(name == '' || name == 'me') {
            	https.get('https://insult.mattbas.org//api/insult.txt', (resp) => {
  					let data = '';

 					 resp.on('data', (chunk) => {
    					data += chunk;
  					});

  					resp.on('end', () => {
    					bot.sendMessage({
                    	to: channelID,
                    	message: data
                		});
  					});

					}).on("error", (err) => {
  						bot.sendMessage({
                    	to: channelID,
                    	message: 'You suck so much, that the API call didn\'t work.'
                		});
            		});
            	}
            break;






         }
     }
});