/**
 * Created with JetBrains WebStorm.
 * User: paulroosens
 * Date: 13/11/2013
 * Time: 23:21
 * To change this template use File | Settings | File Templates.
 */


function packet_inbound(id, message) {


    //récuperation des messages

    console.log("METHODE 12 message => "+message ) ;
    if (message.byteLength) { /* must be an arraybuffer, aka a data packet */
        //console.log('recieved arraybuffer!');
        process_binary(id,message,0); /* no reason to hash here */
    } else {


        event =  JSON.parse(message).eventName;
        console.log("EVENT => "+ event) ;

        if(event == "chat_msg")
        {
            data = JSON.parse(message).data;


            data.id = id;
            data.username = rtc.usernames[id]; /* username lookup */

            //console.log(data);

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
            console.log("SHOOT EVENTS RECEIVE") ;
            var data  = JSON.parse(message).data.messages ;

            console.log("send your shoot =>" + JSON.stringify(data)  ) ;
            console.log("send your shoot NAME =>" +  data.username  ) ;
            party.addShoot(data.x , data.y , data.vitesseX , data.vitesseY , data.username , data.timeShoot) ;
            console.log("JE TIRE") ;

        }

        if(event == "position")
        {
            var data  = JSON.parse(message).data.messages ;

            console.log( data ) ;

            party.updatePlayers( data.namePlayer , data.x , data.y , data.team);
        }
        if(event == "validatename")
        {
            var data  = JSON.parse(message).data.messages ;
            console.log("reception Message") ;



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
            party.start() ;
        }


    }
}