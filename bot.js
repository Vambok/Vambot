const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
var customResponse = require(config.customPath);
var rp = require(config.rpPath);
var stuff = require(config.stuffPath);
var fs = require('fs');
//var stuffs = [[]];

bot.on("ready",function(){
	fs.writeFile(config.stuffPath.replace('.json','_backup.json'), JSON.stringify(stuff), function (err){if(err){return console.log(err);}});
	fs.writeFile(config.rpPath.replace('.json','_backup.json'), JSON.stringify(rp), function (err){if(err){return console.log(err);}});
	fs.writeFile(config.customPath.replace('.json','_backup.json'), JSON.stringify(customResponse), function (err){if(err){return console.log(err);}});
	console.log("Ready!");
/*	fs.readFile('datas.txt', (err, data) => {
			if (err) throw err;
			console.log("The file was read!");
			data.toString('utf8').split("\r\n").forEach(function(x){var arr = x.split(" ");stuffs[arr[0]] = [parseInt(arr[1])||0,arr[2]||"",arr[3]||""];console.log(arr[0]);});
		});*/
});
bot.on("guildMemberAdd",function(member){
	let guild = member.guild;
	guild.defaultChannel.sendMessage(member.user+" **est un nouveau zombie !**");
});
bot.on("message", function(message){
	if(message.author.bot)return;
	if(message.content.startsWith(config.prefix)){
		let commande = message.content.split(" ")[0];
		commande=commande.slice(config.prefix.length);
		let args = message.content.split(" ").slice(1);
		if(commande === "help"){
			message.channel.sendMessage("Tu peux : me demander d'afficher ton "+config.prefix+"profil ou ton "+config.prefix+"nbcookies, ou "+config.prefix+"acheter (type d'objet)");
		} else if(commande === "profil"){
			var inventaire = rp[message.author.id];
			if(inventaire){
				var reponse = message.author.username+" "+inventaire[0]+config.emoteCookie;
				if(inventaire[1]){
					Object.keys(inventaire[1]).forEach(function(x){reponse += ", "+x+" : "+inventaire[1][x];});
				}
				message.reply(reponse);
			} else {
				message.reply("Tu n'as absolument rien. Un vrai va-nu-pieds !");
			}
		} else if(commande === "acheter"){
			var typeObjet = stuff[args[0]];
			if(typeObjet){
				if(args.length>1){
					var choice = parseInt(args[1]);
					if(typeObjet[choice]){
						var sous = (rp[message.author.id]?rp[message.author.id][0]:0);
						if(typeObjet[choice]["prix"]>sous){
							message.reply("T'es trop pauvre pour acheter **"+typeObjet[choice][choice+""]+"** ! Il te manque "+(typeObjet[choice]["prix"]-sous)+config.emoteCookie);
						} else {
							var slot = rp[message.author.id][1][args[0]];
							sous-=typeObjet[choice]["prix"];
							if(slot){
								typeObjet.forEach(function(x,i){if(x[i+""]==slot){
									sous+=x["prix"];
									return;
								}});
								message.reply("Tu as troqué : **"+slot+"** contre **"+typeObjet[choice][choice+""]+"**. La différence a été payée en "+config.emoteCookie+". Tu as maintenant "+sous+config.emoteCookie);
							} else {
								message.reply("Tu possède maintenant : **"+typeObjet[choice][choice+""]+"**. Il te reste "+sous+config.emoteCookie);
							}
							rp[message.author.id][1][args[0]]=typeObjet[choice][choice+""];
						}
					} else {
						message.reply("Il n'y a pas "+(choice+1)+" "+args[0]+"s, ne fais pas l'enfant.");
					}
				} else {
					message.reply("Précise le numéro de ton "+args[0]+" parmi : "+JSON.stringify(typeObjet));
				}
			} else {
				var unknowntype = "";
				if(args.length>0){unknowntype="Je n'ai pas de "+args[0]+" en stock ! ";}
				message.channel.sendMessage(unknowntype+"J'ai des **"+Object.keys(stuff).join("**s des **")+"**s.");
			}
		} else if((commande === "nbcookies")||(commande === "nbcookie")){
			var reponse = "";
			var toto = Array.from(message.mentions.users.values());
			if(toto.length==0){toto=[message.author];}
			toto.forEach(function(x){
				if(rp[x.id]){
					reponse += x+" possède actuellement "+rp[x.id][0]+config.emoteCookie+" !\r\n";
				} else {
					reponse += x+" ne possède aucun "+config.emoteCookie+" !\r\n";
				}
			});
			message.channel.sendMessage(reponse);
		} else if (message.author.id==="137399765083095042"){
			if((commande === "cookie")||(commande === "cookies")){
				var mentionned = Array.from(message.mentions.users.values());
				var membernb = mentionned.length;
				var cookienb = (parseInt(args[0])||1);
				message.channel.sendMessage(mentionned.join(" ")+" Kuro "+(membernb == 1 ? "t'a" : "vous a")+" donné "+(cookienb == 1 ? "un" : cookienb)+" de ses **cookies d'or** ! "+config.emoteCookie);
				mentionned.forEach(function(x){
					if(rp[x.id]){
						rp[x.id][0]+=cookienb;
					} else {
						rp[x.id]=[cookienb]
					}
				});
				//rp["137399765083095042"][0]-=membernb*cookienb;
			}
		} else if (message.author.id==="152901292090458113"){
			if(commande === "thinkings"){
				var getResult="";
				var currentId;
				var toto = [message];
				do{getResult+=Array.prototype.join.call(toto, "");
				currentId=toto[0].id;
				console.log(currentId);
				toto=httpGet("https://discordapp.com/api/channels/"+message.channel.id+"/messages",currentId);
				console.log(toto);}while(toto.length>0);
				message.channel.sendMessage("Nous en sommes a "+(getResult.match(/\:thinking\:/g) || []).length+" :thinking: !");
			} else if(commande === "say"){
				message.channel.sendMessage(args.join(" "));
			} else if((commande === "cookie")||(commande === "cookies")){
				var mentionned = Array.from(message.mentions.users.values());
				var membernb = mentionned.length;
				var cookienb = (parseInt(args[0])||1);
				message.channel.sendMessage(mentionned.join(" ")+" GGaient ! "+(membernb == 1 ? "Tu as" : "Vous avez")+" reçu "+(cookienb == 1 ? "un **cookie" : cookienb+" **cookies")+" d'or** ! "+config.emoteCookie);
				mentionned.forEach(function(x){
					if(rp[x.id]){
						rp[x.id][0]+=cookienb;
					} else {
						rp[x.id]=[cookienb]
					}
				});
			} else if(commande === "add"){
				if(args.length>2){
					if(!stuff[args[0]]){stuff[args[0]]=[];console.log("tata");}
					var nbObjet = stuff[args[0]].length;
					stuff[args[0]][nbObjet]={[nbObjet]:args.slice(2).join(" "),"prix":parseInt(args[1])};
					fs.writeFile(config.stuffPath, JSON.stringify(stuff), function (err){if(err){return console.log(err);}});
				}
			} else if(commande === "remove"){
				if(args.length>1){
					var typeObjet = stuff[args[0]];
					if(typeObjet){var remid=parseInt(args[1]);if((remid>=0)&&(remid<typeObjet.length)){
						for(i=remid;i<typeObjet.length-1;i++){
							stuff[args[0]][i][i+""]=stuff[args[0]][i+1][(i+1)+""];
							stuff[args[0]][i]["prix"]=stuff[args[0]][i+1]["prix"];
						}
						stuff[args[0]].splice(-1);
					}}
					fs.writeFile(config.stuffPath, JSON.stringify(stuff), function (err){if(err){return console.log(err);}});
				}
			}
		} else {
			return;
		}
		fs.writeFile(config.rpPath, JSON.stringify(rp), function (err){if(err){return console.log(err);}});
		message.delete();
	} else if(~config.chatChannels.indexOf(message.channel.name)){
		if(message.mentions.users.size>0){
			if(message.mentions.users.first().equals(bot.user)){
				var reponsesPossibles;
				if(~message.content.indexOf('?')){
					reponsesPossibles = customResponse.reponsesPassePartout.concat(customResponse.reponsesPassePartoutQ);
				} else {
					reponsesPossibles = customResponse.reponsesPassePartout.concat(customResponse.reponsesPassePartoutA);
				}
				message.reply(reponsesPossibles[Math.floor(Math.random()*reponsesPossibles.length)]);
			}
		} else if (~message.content.indexOf("je suis ")) {
			message.channel.sendMessage("Salut "+message.content.split("je suis ")[1]+", je suis "+bot.user+" :wave:");
		}
	}
});

function httpGet(theUrl,premiermess){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	xmlHttp.setRequestHeader("Authorization","Bot "+config.token);
    xmlHttp.send({"after":premiermess,"limit":100});
    return xmlHttp.responseText;
}

bot.login(config.token);