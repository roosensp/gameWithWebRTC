/**
 * Created with JetBrains WebStorm.
 * User: paulroosens
 * Date: 13/11/2013
 * Time: 23:21
 * To change this template use File | Settings | File Templates.
 */


function packet_inbound(id, message) {


    //récuperation des messages

    console.log("message recu => "+message ) ;
    if (message.byteLength) { /* must be an arraybuffer, aka a data packet */
        //console.log('recieved arraybuffer!');
        process_binary(id,message,0); /* no reason to hash here */
    } else {


        event =  JSON.parse(message).eventName;


        if(event == "chat_msg")
        {
            data = JSON.parse(message).data;


            data.id = id;
            data.username = rtc.usernames[id]; /* username lookup */



            /* pass data along */
            if (data.messages) {
                /* chat */
                addToChat(data.username+": "+data.messages, data.color.toString(16));
            } else {
                /* metadata on file */
                process_data(data);
            }
        }
        if(event == "shoot")
        {

            var data  = JSON.parse(message).data.messages ;

            party.addShoot(data.x , data.y , data.vitesseX , data.vitesseY , data.username , data.timeShoot) ;

        }

        if(event == "position")
        {
            var data  = JSON.parse(message).data.messages ;


            party.updatePlayers( data.namePlayer , data.x , data.y , data.team);
        }
        if(event == "validatename")
        {
            var data  = JSON.parse(message).data.messages ;
        }
        if(event == "askplayersposition")
        {
            var data  = JSON.parse(message).data.message ;
            var mySituation = {namePlayer: party.p.name,   x: party.p.mapX , y: party.p.mapY , team: party.p.team} ;

            envoyerPositionToSomeOne( mySituation , data.name) ;
         }
        if(event == "readytostart")
        {
            var data  = JSON.parse(message).data.message ;
            party.joueurs = new Array() ;
            for(var i = 0 ; i< data.length ; i++)
            {
                var p
                if(data[i].team == "blue")
                {
                    p = new personnage(100, 100 , party.c) ;

                }else if(data[i].team == "yellow")
                {
                    p = new personnage(2700, 300 , party.c) ;

                }
                p.name = data[i].name ;
                party.joueurs.push(p) ;
                if(p.name == party.p.name)
                {
                    party.p = p ;

                }
            }

            party.start() ;
            party.restart() ;
        }


    }
}