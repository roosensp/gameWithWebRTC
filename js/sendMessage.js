/**
 * Created with JetBrains WebStorm.
 * User: paulroosens
 * Date: 13/11/2013
 * Time: 23:20
 * To change this template use File | Settings | File Templates.
 */


function readyToStart()
{
    var chat = dataChannelChat;
    var room = window.location.hash.slice(1);

    var messageToSend = "" ;
    var arrayToSend = [] ;
    if(party.joueurs != null)
    {
        var obj ;
        for(var i = 0 ; i<party.joueurs.length ; i++)
        {
            obj = { name: party.joueurs[i].name , team: party.joueurs[i].team}
            arrayToSend.push(obj) ;
        }



    }

    chat.broadcast(JSON.stringify({
        "eventName": "readytostart",
        "data": {
            "message": arrayToSend,
            "room": room
        }
    }));
    console.log("MESSAGE ENVOYER readytostart => " + JSON.stringify(arrayToSend) )  ;
}

function askPlayersPosition()
{

    var chat = dataChannelChat;
    var room = window.location.hash.slice(1);

    chat.broadcast(JSON.stringify({
        "eventName": "askplayersposition",
        "data": {
            "message": {name : party.p.name} ,
            "room": room
        }
    }));
    console.log("MESSAGE ENVOYER  askplayersposition => " + JSON.stringify({name : party.p.name}) )  ;
}

function envoyerPositionToSomeOne( data , who)
{
    var chat = dataChannelChat;
    var room = window.location.hash.slice(1);
    for(var connection in rtc.dataChannels) {
        console.log(" NAME USERS => " + rtc.usernames[connection]) ;

        if(rtc.usernames[connection] == who)
        {
            var channel = rtc.dataChannels[connection];

            if (rtc.connection_ok_to_send[connection]) {


                chat.send(connection
                    , JSON.stringify({
                        "eventName": "position",
                        "data": {
                            "messages": data ,
                            "room": room
                        }
                    })

                )
                console.log("MESSAGE ENVOYER  position to someone=> " + data)  ;

            } else {
                console.log("unable to send message to " + connection);
            }
        }

    }

}

function envoyerPosition(data)
{

    var chat = dataChannelChat;

    // var input = document.getElementById("chatinput");
    var room = window.location.hash.slice(1);
    chat.broadcast(JSON.stringify({
        "eventName": "position",
        "data": {
            "messages": data,
            "room": room
        }
    }));
    console.log("MESSAGE ENVOYER position=> " + data)  ;

}

// fonction de test de polo
function envoyerShoot( data )
{
    var chat = dataChannelChat;

    // var input = document.getElementById("chatinput");
    var room = window.location.hash.slice(1);

    chat.broadcast(JSON.stringify({
        "eventName": "shoot",
        "data": {
            "messages": data,
            "room": room
        }
    }));
    console.log("MESSAGE ENVOYER shoot => " + data)  ;



}

