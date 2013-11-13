/**
 * Created with JetBrains WebStorm.
 * User: paulroosens
 * Date: 24/09/13
 * Time: 20:53
 * To change this template use File | Settings | File Templates.
 */

function PartyLocal( )
{
    this.canvas = document.getElementById('myCanvas') ;
    this.context = this.canvas.getContext('2d') ;
    this.p = new personnage(300, 300 , this.context) ;
    this.joueurs = new Array() ;
    this.shoots = new Array() ;
    this.viewX = -200 ;
    this.viewY = 0 ;
    this.map = new Map(this.viewX , this.viewY , this.context) ;
    this.mousePositionX = 0 ;
    this.mousePositionY = 0 ;
    this.waitingPlayer = true ;
    this.listJoueurServer = new Array() ;
    this.scoreYellow = 0 ;
    this.scoreBlue   = 0 ;
    this.timeStart ;
    // this.socket = socket ;


    // methodes
    this.start = start ;
    this.gestionPersonnage = gestionPersonnage ;
    this.limiterMouvementY  = limiterMouvementY ;
    this.gestionShoot = gestionShoot ;
    this.updatePositionPerso = updatePositionPerso ;
    this.updatePlayers = updatePlayers ;
    this.gestionAutreJoueur = gestionAutreJoueur ;
    this.sendYourShoot = sendYourShoot ;
    this.addShoot = addShoot ;
    this.choixEquipe  = choixEquipe ;
    this.outPlayer = outPlayer ;
    this.restart = restart ;
    this.mainLoop = mainLoop ;
    this.getTimeAction = getTimeAction ;
    this.chiffre = chiffre ;




    Array.prototype.unset = function(index){
        if(index > -1){
            this.splice(index,1) ;
        }
    }


    function start()
    {

        this.timeStart  = new Date().getTime() ;
        this.mainLoop() ;


    }

    function mainLoop()
    {
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

        if(this.getTimeAction()< 1000 )
        {
            this.chiffre(3) ;

        }else if(this.getTimeAction() < 2000 )
        {
            this.chiffre(2) ;
        }else if(this.getTimeAction() < 3000 )
        {
            this.chiffre(1) ;
        }else
        {

            this.map = new Map(this.viewX , this.viewY , this.context ) ;
            this.gestionPersonnage() ;
            this.gestionShoot() ;

            if(!this.waitingPlayer )
            {
              //    this.p.afficher() ;
            }


            this.gestionAutreJoueur() ;
        }
           $("#chrono").html(Math.round( this.getTimeAction() / 1000 ));



        window.requestAnimationFrame($.proxy(function() {this.mainLoop()}, this) )  ;
    }



    function gestionPersonnage()
    {

        limitM =  this.limiterMouvementY((this.viewX +this.p.vitesseX) ,this.viewY + this.p.vitesseY  ) ;

        // mise a jours position perso sur Serveur
        if(this.p.vitesseX > 0 )
        {

        }
        if (limitM == 1)
        {

            this.viewY  += this.p.vitesseY ;
            this.p.mapY += this.p.vitesseY ;
            if(this.p.vitesseY != 0 )
            {
                this.updatePositionPerso();
            }
        }
        if (limitM == 2)
        {


            this.viewX += this.p.vitesseX ;
            this.p.mapX +=  this.p.vitesseX  ;
            if(this.p.vitesseX != 0 )
            {
                this.updatePositionPerso() ;
            }
        }
        if (limitM == 0)
        {
            this.viewY   += this.p.vitesseY ;
            this.p.mapY  += this.p.vitesseY ;
            this.viewX   += this.p.vitesseX ;
            this.p.mapX  += this.p.vitesseX  ;
            if(this.p.vitesseY != 0 || this.p.vitesseX != 0 )
            {
                this.updatePositionPerso();
            }
        }

        if (limitM == 3)
        {

            // this.p.vitesseY = 0 ;
            // this.p.vitesseX = 0 ;

        }
    }

    function limiterMouvementY(potentielX , potentielY)
    {
        var rep = 0 ;
        for(var i = 0 ; i< this.map.blocs.length ; i++)
        {
            if((this.map.blocs[i].NY < (this.p.mapY + this.p.vitesseY + this.p.height) &&  (this.map.blocs[i].NY + this.map.blocs[i].NHeight)> (this.p.mapY +  this.p.vitesseY) ) &&
                (this.map.blocs[i].NX < (this.p.mapX + this.p.vitesseX + this.p.width) &&  (this.map.blocs[i].NX + this.map.blocs[i].NWidth)> (this.p.mapX +this.p.vitesseX))  )
            {

                if((this.map.blocs[i].NY < (this.p.mapY  + this.p.height) &&  (this.map.blocs[i].NY + this.map.blocs[i].NHeight)> (this.p.mapY) ) &&
                    (this.map.blocs[i].NX < (this.p.mapX + this.p.vitesseX + this.p.width) &&  (this.map.blocs[i].NX + this.map.blocs[i].NWidth)> (this.p.mapX +this.p.vitesseX))  )
                {
                    // no Y vitess
                    rep =  1 ;
                }
                if((this.map.blocs[i].NY < (this.p.mapY + this.p.vitesseY + this.p.height) &&  (this.map.blocs[i].NY + this.map.blocs[i].NHeight)> (this.p.mapY +  this.p.vitesseY) ) &&
                    (this.map.blocs[i].NX < (this.p.mapX  + this.p.width) &&  (this.map.blocs[i].NX + this.map.blocs[i].NWidth)> (this.p.mapX ))  )
                {
                    if(rep == 1)
                    {
                        return 3 ;
                    }
                    rep =  2 ;
                }
            }
        }
        return rep ;

    }
    function gestionShoot()
    {
        // gestion SHoot
        for (var i = 0 ; i<this.shoots.length ; i++)
        {
            var shootDel = false ;
            var allTeamDead = false ;
            var countYellow ;
            var countBlue   ;
            for(var j = 0 ; j < this.map.blocs.length ; j++)
            {
                if((this.map.blocs[j].NY < (this.shoots[i].y + this.shoots[i].vitesseY + this.shoots[i].height) &&  (this.map.blocs[j].NY + this.map.blocs[j].NHeight)> (this.shoots[i].y +  this.shoots[i].vitesseY) ) &&
                    (this.map.blocs[j].NX < (this.shoots[i].x + this.shoots[i].vitesseX + this.shoots[i].width) &&  (this.map.blocs[j].NX + this.map.blocs[j].NWidth)> (this.shoots[i].x +this.shoots[i].vitesseX))  )
                {
                    shootDel = true ;
                    break ;
                }
            }

            for(var j = 0 ; j < this.joueurs.length ; j++)
            {

                if((this.joueurs[j].mapY < (this.shoots[i].y + this.shoots[i].vitesseY + this.shoots[i].height) &&  (this.joueurs[j].mapY + this.joueurs[j].height)> (this.shoots[i].y +  this.shoots[i].vitesseY) ) &&
                    (this.joueurs[j].mapX < (this.shoots[i].x + this.shoots[i].vitesseX + this.shoots[i].width) &&  (this.joueurs[j].mapX + this.joueurs[j].width)> (this.shoots[i].x +this.shoots[i].vitesseX))  )
                {

                    if(this.joueurs[j].name != this.shoots[i].tireur.name && this.joueurs[j].team != this.shoots[i].tireur.team)
                    {

                        if(this.joueurs[j].etat == "life")
                        {
                            this.joueurs[j].aie() ;
                            if(this.joueurs[j].life <= 0   )
                            {
                                this.joueurs[j].dead ++ ;
                                this.joueurs[j].etat = "dead" ;
                                // retrouver le killeur et profiter pour savoir si la partie et terminé
                                countYellow = 0 ;
                                countBlue   = 0  ;
                                for(var p = 0 ; p< this.joueurs.length ; p++)
                                {
                                    if(this.joueurs[p].etat == "life" )
                                    {
                                         if(this.joueurs[p].team == "yellow")
                                         {
                                             countYellow++ ;
                                         }else
                                         {
                                             countBlue++
                                         }
                                    }
                                    if(this.shoots[i].tireur.name == this.joueurs[p].name )
                                    {
                                        this.joueurs[p].kill ++  ;
                                    }
                                }
                                if(countYellow == 0 || countBlue == 0)
                                {
                                    allTeamDead = true ;
                                    break ;
                                }

                                j += -1 ;

                            }
                        }
                        shootDel = true ;
                        break ;
                    }

                }


            }



            if(!shootDel)
            {
                this.shoots[i].x =  this.shoots[i].x -     this.shoots[i].vitesseX ;
                this.shoots[i].y =  this.shoots[i].y -     this.shoots[i].vitesseY ;
                this.shoots[i].afficher(this.viewX , this.viewY) ;
            }else
            {
                this.shoots.unset(i) ;
                i = i -1 ;
            }

            if(allTeamDead)
            {
               if(countYellow == 0 )
               {
                  alert("The Blue team Win") ;
                   this.scoreBlue++ ;
               }else
               {
                   alert("The Yellow team Win") ;
                   this.scoreYellow++ ;
               }

                $('#scoreTeam').html("") ;
                $('#scoreTeam').append(" BLUE :" +  this.scoreBlue + " | YELLOW :" + this.scoreYellow ) ;
                this.restart() ;

            }

        }
    }

    function gestionAutreJoueur()
    {
        bloc = new blocsquare(this.context) ;
        var table = "<table id='hor-minimalist-b' summary='Score'>" +
        "<thead>" +
            "<tr>" +
                "<th scope='col'>Name</th>" +
                "<th scope='col'>Kill</th>" +
                "<th scope='col'>Dead</th>" +
                "<th scope='col'>Life</th>" +
                "<th scope='col'>Latence</th>"+
                "</tr>" +
            "</thead>" +
        "<tbody>";


        for(var i = 0 ; i< this.joueurs.length ; i++)
        {
            // verifier joueur visibilité map
            //   this.map.blocsquare( this.joueurs[i].mapX   , this.joueurs[i].mapY, this.joueurs[i].width , this.joueurs[i].height ) ;
            table += "" +
                "<tr>" +
                    "<td> " +  this.joueurs[i].name +" </td>" +
                    "<td> " + this.joueurs[i].kill  + "</td>" +
                    "<td> " +  this.joueurs[i].dead +"</td>" +
                    "<td>"+ 0 + "</td> " +
                     "<td>"+ 0 + "</td> " +
                "</tr> ";
            if(this.joueurs[i].etat == "life")
            {
                bloc.makeSquare(this.joueurs[i].mapX   , this.joueurs[i].mapY, this.joueurs[i].width , this.joueurs[i].height , this.joueurs[i].team , this.viewX , this.viewY) ;

            }
        }
        table +=  "</tbody></table>" ;
        $('#score').html(table);

    }
    function updatePositionPerso()
    {
        //  console.log(" JOUEUR POSITION X => " + this.joueurs[0].mapX + " JOUEUR POSITION Y => "  + this.joueurs[0].mapY )
        var data ;
        data = {namePlayer: this.p.name,  x: this.p.mapX , y: this.p.mapY , team: this.p.team} ;

        envoyerPosition(data) ;

      //  this.socket.emit('sendPlayersPosition', data);
    }
    function sendYourShoot(bullet)
    {
        var data ;

        data = { username:this.p.name,   vitesseX: bullet.vitesseX , vitesseY: bullet.vitesseY , x: bullet.x , y:bullet.y , timeShoot:bullet.timeShoot}        ;
      //  this.socket.emit('sendShoot' , data ) ;

        /*
        TEST POUR LE WEB RTC
         */
        envoyerShoot(data) ;


    }

    function addShoot(x , y , vX , vY , username, time)
    {
        console.log("name when add shoot =>" + username)
        var latence =  this.getTimeAction() ;
        latence = latence - time ;
        console.log(" latence => " +latence) ;

        var o = new Bullet(x ,  y+2  , this.context , time )  ;
        for(var i = 0 ;  i< this.joueurs.length ; i++)
        {
            if(this.joueurs[i].name == username )
            {
                o.tireur =    this.joueurs[i] ;
            }
        }


        o.width = 10 ;
        o.height = 10 ;
        o.vitesseX = vX ;
        o.vitesseY = vY ;
        this.shoots.push(o) ;

    }
//    function sendAllThePlayers( playerWhoAsking)
//    {
//
//        var data =  new Array() ;
//
//        for(var i = 0 ; i< this.joueurs.length ; i++)
//        {
//            data.push({name: this.joueurs[i].name  , x: this.joueurs[i].mapX  , y: this.joueurs[i].mapY , team: this.joueurs[i].team})
//
//        }
//
//       this.socket.emit ('sendAllPlayer' , playerWhoAsking , data) ;
//
//    }

//    function updateAllPlayers(data)
//    {
//         for(  var i = 0 ; i<data.length ; i++)
//        {
//             this.updatePlayers(data[i].name , data[i].x , data[i].y , data[i].team) ;
//        }
//    }
    function updatePlayers(namePlayer , x , y ,team)
    {

        if(namePlayer != null)
        {
           var  trouver = false ;
            for(var i = 0 ; i < this.joueurs.length ; i++)
            {
                if(namePlayer == this.joueurs[i].name )
                {

                    this.joueurs[i].mapX = x ;
                    this.joueurs[i].mapY = y ;
                    this.joueurs[i].team = team ;
                    trouver = true ;
                }
            }
            if(!trouver)
            {
                var player = new personnage(300 , 300 , this.context) ;
                player.name = namePlayer ;
                player.mapX = x ;
                player.mapY = y ;
                player.team = team ;

                this.joueurs.push(player) ;

                console.log("joueur dans la partie =>"+ this.joueurs.length  +"/"+  this.listJoueurServer.length);
                console.log(player.name) ;
                if( this.joueurs.length == this.listJoueurServer.length)
                {
                     this.waitingPlayer = false ;
                     this.choixEquipe() ;
                     readyToStart() ;
                }
//                this.restart() ;

            }
        }


    }
    function outPlayer(namePlayer)
    {
        for(var i = 0 ; i< this.joueurs.length ; i++)
        {
            if(this.joueurs[i].name == namePlayer )
            {
                this.joueurs.unset(i);
            }
        }
    }
    function choixEquipe()
    {
        var nbTeamBlue = 0;
        var nbTeamYellow = 0;

        for(var i = 0 ; i< this.joueurs.length ; i++)
        {
            if(this.joueurs[i].team == "blue" )
            {
                nbTeamBlue++ ;
            }else
            {
                nbTeamYellow ++ ;
            }
        }
        if(nbTeamBlue>nbTeamYellow)
        {
            this.p.team = "yellow" ;
            this.p.mapX = 2900 ;
            this.p.mapY = 300 ;
            this.viewX = 2600 ;
        }else
        {
             this.p.team = "blue" ;
        }

        this.joueurs.push(this.p);
        // envoi perso

    }
    function restart()
    {
        this.shoots = new Array() ;
         for( var i = 0 ; i< this.joueurs.length ; i++)
         {

              if(this.joueurs[i].team == "yellow")
              {
                  this.joueurs[i].mapX = 2900 ;
                  this.joueurs[i].mapY = 300 ;
                  this.viewX = 2600 ;
                  this.viewY = 0 ;

              }else
              {
                  this.joueurs[i].mapX = 100 ;
                  this.joueurs[i].mapY = 300 ;
                  this.viewX = -200 ;
                  this.viewY = 0 ;
              }
             this.joueurs[i].etat = "life" ;

         }
        if(this.p.team == "yellow")
        {


            this.p.mapX = 2900 ;
            this.p.mapY = 300 ;

        }else
        {
            this.p.mapX = 100 ;
            this.p.mapY = 300 ;
            this.viewX = -200 ;
            this.viewY = 0 ;

        }
        this.p.vitesseX = 0 ;
        this.p.vitesseY = 4 ;
        this.p.etat = "life" ;

    }
    function getTimeAction()
    {
       var timestamp = new Date().getTime()  ;
       var diff =     timestamp - this.timeStart ;
       return diff ;
    }
    function chiffre( numero )
    {

        var img = document.getElementById("img_1");
        if(numero == 2)
        {
            img = document.getElementById("img_2");
        }else if(numero == 3)
        {
            img = document.getElementById("img_3");
        }

            this.context.drawImage(img ,600/2-100,600/2-100,200,200);


    }
}