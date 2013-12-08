

var ROOM_TITLE = "WebRTC Copy - Room "; /* constant - room title bar string */

/* your username */
var username = "";

/* server name */
var rtccopy_server = "wss:rtccopy.com:8001"; /* 8001 for secure, 8000 for insecure */

/* your crpyto information */
var encryption_type = "";
var encryption_key = "";

/* intro function */
initRTCCopy();

/* Chrome 31 does not work right now :( */
function display_31_error() {

	if ($.browser.name == "chrome" && ($.browser.versionNumber < 32) ) {
		boot_alert('Due to a bug in your browser, this website will not work, sorry. Please try Firefox 24+ or Chrome Canary 32+.');
	}
}

function display_error() {

	/* REQUIRED SCTP data channels behind flag in 29 & 30 */
	if ($.browser.name == "chrome" && ($.browser.versionNumber == 29 || $.browser.versionNumber == 30)) {
		boot_alert('You are using Chrome version ' + $.browser.versionNumber + ', please turn the "Enable SCTP Data Channels" flag in: chrome://flags/#enable-sctp-data-channels');
	} else {
		if ($.browser.name == "chrome") {
			boot_alert('Your browser is not supported. Please update to the latest version of Chrome to use this site. Please try Firefox 24+ or Chrome Canary 32+.');
		}else if ($.browser.name == "firefox") {
			boot_alert('Your browser is not supported. Please update to Firefox 24+.');
		}else {
			boot_alert('Your browser is not supported. Please use Chrome or Firefox, sorry :(');
		}
	}
}

/* intro function */
function initRTCCopy() {

	var button = document.getElementById("newRoom");

	/* create a new room when button is clicked */ 
	button.addEventListener('click', function(event) {
		var chars = "2345689ABCDEFGHJKMNPQRSTUVWXTZabcdefghkmnpqrstuvwxyz";
		var string_length = 8;//53^8 = 62259690411361, lots of room for everyone!
		var randomstring = '';
		for(var i = 0; i < string_length; i++) {
		  var rnum = Math.floor(Math.random() * chars.length);
		  randomstring += chars.substring(rnum, rnum + 1);
		}

		window.location.hash = randomstring;
		location.reload();
	});
	
	/* handle crypto type input */
    // ?????

	
	/* handle & intercept connect button/form submission */
	document.getElementById('webrtc_input_form').addEventListener("submit", function(event) {
		if (event.preventDefault) {
            // canvas display

			event.preventDefault();
		}

		transition_from_username_to_main();
		return false;
	});
  
	/* initial create room/username logic */
	var r = window.location.hash.slice(1);
	if (r != 0){
		/* we have a room #, so lets get some information on this room */
		rtc.room_info(rtccopy_server, r); /* This sends a request (logic processed via 'recieve room info' cb) */
		
		/* let's update the title bar as well */
		document.title = ROOM_TITLE+r;

		/* existing room, show username & crypto input */
		$("#userprompt").show();
	} else {
		/* no room number? lets make one*/
		$("#roomprompt").show();
	
		/* allow entering a room number */
		document.getElementById('webrtc_room_form').addEventListener("submit", function(event) {
			var existing_input = document.getElementById("existing");
			
			event.preventDefault();
			window.location.hash = existing_input.value;
			location.reload();
		});
	}
	
	/* TODO - somewhat temporary - alert about SCTP bug in pre-canary Chrome browsers */
	display_31_error();
	
	/* let's run a quick check before we begin to make sure we have rtc datachannel support */
	var rtc_status = rtc.checkDataChannelSupport();
	if (rtc_status != reliable_true) {
		display_error();
	}
}

/* handles the processing of the room state on the username page */
function process_room_state(data) {

	if (data.browser != "") { /* will be blank if new room */
		var browser_color = 'red';
		var browserVer_color = 'rgb(195, 196, 0)'; /* not super important that versions match */
		if (browser_name == data.browser) { browser_color = 'green'; } else { browserVer_color = 'red'; }
		if (browser_ver == data.browserVer) { browserVer_color = 'green'; }
		
		if (data.encryption == "NONE") {
			$("#room_state").append('This room already exists and the creator used:<br /> <span style="color:'+browser_color+'">'+ sanitize(data.browser) + '</span> <span style="color:'+browserVer_color+'">' + sanitize(data.browserVer) + '</span> without OTR.<br /><br />');
		} else {
			$("#room_state").append('This room already exists and the creator used:<br /> <span style="color:'+browser_color+'">'+ sanitize(data.browser) + '</span> <span style="color:'+browserVer_color+'">' + sanitize(data.browserVer) + '</span> with OTR encryption.<br /><br />');
		}
		
		/* set the dropdown box to default to the encryption value */
		$("#encryption_type").val(data.encryption);
		if (document.getElementById("encryption_type").value != "NONE") {
			$("#encryption_key").show();
		}
		
	}
}

/* handles the transition from the username prompt to main screen prompt */
function transition_from_username_to_main() {

	username = document.getElementById("username").value;
	encryption_type = document.getElementById("encryption_type").value;
	encryption_key = document.getElementById("encryption_key").value;
	
	/* clear out any warnings that may have popped up previously */
	$("#alerts").empty();
	
	/* check for empty input */
	if (username == "") {
		boot_alert("Please enter a username.");
		return;
	}
	if (encryption_type != "NONE" && encryption_key == "") {
		boot_alert("Please specify a encryption key.");
		return;
	}
	
	$("#userprompt").hide(); // hide the login!
	init(); /* THIS IS THE MAIN CONNECTING FUNCTION CALL! */

	$("#chat_display").show();

    // ask position of everybody
  //  askPlayersPosition() ;
    $("#gameside").show() ;
}

/* adds to your chat */
function addToChat(msg, color) {

  var messages = document.getElementById('messages');
  msg = sanitize(msg);
  if(color) {
    msg = '<span style="color: ' + color + '; padding-left: 15px">' + msg + '</span>';
  } else {
    msg = '<strong style="padding-left: 15px">' + msg + '</strong>';
  }
  messages.innerHTML = messages.innerHTML + msg + '<br>';
  messages.scrollTop = 10000;
}

/* adds small text to chat */
function systemMessage(msg) {

  var messages = document.getElementById('messages');
  msg = sanitize(msg);
  msg = '<strong class="small" style="padding-left: 15px">' + msg + '</strong>';
  messages.innerHTML = messages.innerHTML + msg + '<br>';
  messages.scrollTop = 10000;
}

/* this isn't actual security, just avoids accidential html input */
function sanitize(msg) {

  msg = msg.toString();
  return msg.replace(/</g, '&lt;');
}

/* WebRTC functionality */
var dataChannelChat = {


	broadcast: function(message) {

		for(var connection in rtc.dataChannels) {

			var channel = rtc.dataChannels[connection];
			if (rtc.connection_ok_to_send[connection]) {
				if (encryption_type != "NONE") {
					otr_send_msg(connection,message);
				} else {
					channel.send(message);
				}
			} else {
				console.log("unable to send message to " + connection);
			}
		}
	},
	send: function(connection, message) {

		var channel = rtc.dataChannels[connection];
		if (rtc.connection_ok_to_send[connection]) {
			if (encryption_type != "NONE") {
				otr_send_msg(connection,message);
			} else {
				channel.send(message);
			}
		} else {
			console.log("unable to send message to " + connection);
		}
	},
	recv: function(channel, message) {

		return message; /* need to do post processing later */
	},
	event: 'data stream data'
};



/* init - starts WebRTC connection, called after username is entered */
function init() {


   party.p.name = username ;
   party.listJoueurServer.push(username) ;
   //party.start() ;

   if(!PeerConnection) {
	display_error();
	return;
  }
  
  /* the room # is taken from the url */
  var room = window.location.hash.slice(1);
  
  /* Add an entry to the username list at id=0 with your name */
  create_or_clear_container(0,username);
  
  /* If crypto enabled, create OTR key */
  if (encryption_type != "NONE") {
	otr_init_function();
	$('#OTRWarning').html("File transfer will be slower in encrpyted mode.<br />");
  } else {
	$('#OTRWarning').html("You are not using OTR, therefore anyone with this link can join this room and other users identities cannot be verified.<br />");
  }
  
  if (room != 0) {

	  /* the important call */
	  rtc.connect(rtccopy_server, room, username, encryption_type);

	  /* fire when ready to init chat & communication! */
	  rtc.on('ready', function(my_socket, usernames) {


		/* first, print out the usernames in the room */
		var username_arr = [];//convert to array
		for (var x in usernames) {
			if (x != my_socket) {//no reason to print yourself
				username_arr.push(usernames[x]);
			}
		}
          party.listJoueurServer =   username_arr ;
		usernames_list = username_arr.join(",");//then join

		$('#pleasewait').hide();
		$('#chatinput').show();//show the text input box now
		accept_inbound_files();
		if (username_arr.length > 0) {
			systemMessage("Other users currently in the room: " + usernames_list);
		} else {
			systemMessage("There are no other users currently in this room!");
		}


	  });
	  
	  /* when a new user's data channel is opened and we are offering a file, tell them */
	  rtc.on('data stream open', function(id, username) {
          console.log("DATA STREAM OPEN ") ;
          askPlayersPosition() ;
	    /* add to usernames list */
		create_or_clear_container(id, username);
		/* log a message (we do this in crypto.js if crypto is enabled) */
		if (encryption_type == "NONE") {
			systemMessage('now connected to ' + username);
			/* if we have a file, send it their way */
			send_meta(id);
		}
		/* if crypto is enabled, negoiate crypto information */
		if (encryption_type != "NONE") {
			otr_connect_buddy(id);
		}
	  });
	  
	  /* when another user disconnects */
	  rtc.on('disconnect stream', function(disconnecting_socket, disconnecting_username) {
         party.outPlayer(disconnecting_username) ;
        systemMessage(disconnecting_username + " has left the room");
		remove_container(disconnecting_socket);
	  });
	  
	  /* start the chat box */
	  initChat();
	  
	  /* add Room Name */
	  var roomname = document.getElementById('roomname');
	  roomname.innerHTML = 'Room: ' + sanitize(room);
  }
}

/* start the chat box */
function initChat() {

   var chat;
  chat = dataChannelChat;
  
  var input = document.getElementById("chatinput");
  var room = window.location.hash.slice(1);
  var color = hsv_random_color(Math.random(), .5, .7); /* This values appear to make all text readable - test via /test/color_tester.html */



  input.addEventListener('keydown', function(event) {

    var key = event.which || event.keyCode;
    if(key === 13) {

      chat.broadcast(JSON.stringify({
        "eventName": "chat_msg",
        "data": {
          "messages": input.value,
          "room": room,
          "color": color
        }
      }));
      addToChat(username+": "+input.value);
      input.value = "";
    }
  }, false);
  
  /* this function is called with every data packet recieved */
  rtc.on(chat.event, function(conn, data, id, username) {
    /* decode and append to data */
    data = chat.recv.apply(this, arguments);




	if (encryption_type != "NONE") {
		/* encrpyted file chunk inbound! (a bit of hack, but crpyto-js doesn't support native array buffer crypto, so we keep things as a JSON string through here */
		if (data.charAt(0) == "{") {
			file_decrypt(id,data);
			return;
		}
		otr_rcv_msg(id,data);  /* this triggers a callback! (calling packet_inbound) */
	} else {
		packet_inbound(id, data);
	}
  });
}







