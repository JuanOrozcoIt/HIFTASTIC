// Initialize Firebase
var config = {
  apiKey: "AIzaSyAaXpI7PJYH2bWr5dGUp4yA3H95WbG_vxw",
  authDomain: "piedrapapeltijera-37073.firebaseapp.com",
  databaseURL: "https://piedrapapeltijera-37073.firebaseio.com",
  storageBucket: "piedrapapeltijera-37073.appspot.com",
  messagingSenderId: "27222296895"
 };
firebase.initializeApp(config);

// GENERAL VARIABLES
var database = firebase.database();
var dialogueData = database.ref("/dialogue");
var playersRef = database.ref("players");
var currentTurnRef = database.ref("turn");
var username = "Guest";
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var jugador1Exists = false;
var jugador2Exists = false;
var jugador1Data = null;
var jugador2Data = null;


// LISTENERS FOR USERNAMES
// The GO button captures the name entered by user and attempts to get user into a game
$("#GO").click(function() {
  if ($("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});


// Listener for 'enter' in user name input
$("#username").keypress(function(e) {
  if (e.keyCode === 13 && $("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});


// Function to capitalize user names
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}



// LISTENERS FOR DIALOGUE
// dialogue send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
$("#dialogue-send").click(function() {
  if ($("#dialogue-input").val() !== "") {
    var message = $("#dialogue-input").val();
    dialogueData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });
    $("#dialogue-input").val("");
  }
});

// Dialogue-box input listener
$("#dialogue-input").keypress(function(e) {
  if (e.keyCode === 13 && $("#dialogue-input").val() !== "") {
    var message = $("#dialogue-input").val();
    dialogueData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });
    $("#dialogue-input").val("");
  }
});

// Click event for dynamically added <li> elements
$(document).on("click", "li", function() {
  console.log("click");
  // Grabs text from li choice
  var clickChoice = $(this).text();
  console.log(playerRef);
  // Sets the choice in the current player object in firebase
  playerRef.child("choice").set(clickChoice);
  // User has chosen, so removes choices and displays what they chose
  $("#player" + playerNum + " ul").empty();
  $("#player" + playerNum + "chosen").html(clickChoice);
  // Increments turn. Turn goes from:
  // 1 - JUGADOR UNO
  // 2 - JUGADOR DOS
  // 3 - DESEMPATE
  currentTurnRef.transaction(function(turn) {
    return turn + 1;
  });
});

// Update dialogue on screen when new message detected - ordered by 'time' value
dialogueData.orderByChild("time").on("child_added", function(snapshot) {
  // If idNum is 0, then its a disconnect message and displays accordingly
  // If not - its a user dialogue message
  if (snapshot.val().idNum === 0) {
    $("#dialogue-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  else {
    $("#dialogue-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  // Keeps div scrolled to bottom on each update.
  $("#dialogue-messages").scrollTop($("#dialogue-messages")[0].scrollHeight);
});


// Tracks changes in key that contains the player objects
playersRef.on("value", function(snapshot) {
  // Length of the 'players' array
  currentPlayers = snapshot.numChildren();
  // Check to see if players exist
  jugador1Exists = snapshot.child("1").exists();
  jugador2Exists = snapshot.child("2").exists();
  // Player data objects
  jugador1Data = snapshot.child("1").val();
  jugador2Data = snapshot.child("2").val();
  // if theres a player UNO, fill in name and win-loss data
  if (jugador1Exists) {
    $("#jugador01-name").text(jugador1Data.name);
    $("#jugador01-wins").text("Wins: " + jugador1Data.wins);
    $("#jugador01-losses").text("Losses: " + jugador1Data.losses);
  }
  else {
    // If there is no player UNO, undisputable win-loss data and show waiting
    $("#jugador01-name").text("Waiting for Player 1");
    $("#jugador01-wins").empty();
    $("#jugador01-losses").empty();
  }
  // If theres a player DOS, fill in name and win-loss data
  if (jugador2Exists) {
    $("#jugador02-name").text(jugador2Data.name);
    $("#jugador02-wins").text("Wins: " + jugador2Data.wins);
    $("#jugador02-losses").text("Losses: " + jugador2Data.losses);
  }
  else {
    // If there is no player DOS, undisputable win-loss and show waiting
    $("#jugador02-name").text("Esperando por el jugador 2");
    $("#jugador02-wins").empty();
    $("#jugador02-losses").empty();
  }
});


// Detects changes in current turn key
currentTurnRef.on("value", function(snapshot) {
  // Gets current turn from snapshot
  currentTurn = snapshot.val();
  // Don't do the following unless you're logged in
  if (playerNum) {
    // For turn 1
    if (currentTurn === 1) {
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        $("#current-turn").html("<h2>Es tu turno!</h2>");
        $("#player" + playerNum + " ul").append("<li>Piedra</li><li>Papel</li><li>Tijera</li>");
      }
      else {
        // If it isnt the current players turn, tells them theyre waiting for player one
        $("#current-turn").html("<h2>Estoy esperando que " + jugador1Data.name + " escoja!</h2>");
      }
      // Shows yellow border around active player
      $("#jugador01").css("border", "2px solid yellow");
      $("#jugador02").css("border", "1px solid black");
    }
    else if (currentTurn === 2) {
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        $("#current-turn").html("<h2>Es tu turno!</h2>");
        $("#player" + playerNum + " ul").append("<li>Piedra</li><li>Papel</li><li>Tijera</li>");
      }
      else {
        // If it isnt the current players turn, tells them theyre waiting for player two
        $("#current-turn").html("<h2>Estoy esperando que " + jugador2Data.name + " escoja!</h2>");
      }
      // Shows yellow border around active player
      $("#jugador02").css("border", "2px solid yellow");
      $("#jugador01").css("border", "1px solid black");
    }
    else if (currentTurn === 3) {
      // Where the game win logic takes place then resets to turn 1
      gameLogic(jugador1Data.choice, jugador2Data.choice);
      // reveal both player choices
      $("#jugador01-chosen").html(jugador1Data.choice);
      $("#jugador02-chosen").html(jugador2Data.choice);
      //  reset after timeout
      var moveOn = function() {
        $("#jugador01-chosen").empty();
        $("#jugador02-chosen").empty();
        $("#result").empty();
        // check to make sure players didn't leave before timeout
        if (jugador1Exists && jugador2Exists) {
          currentTurnRef.set(1);
        }
      };
      //  show results for 2 seconds, then resets
      setTimeout(moveOn, 2000);
    }
    else {
      //  if (playerNum) {
      //    $("#player" + playerNum + " ul").empty();
      //  }
      $("#jugador01 ul").empty();
      $("#jugador02 ul").empty();
      $("#current-turn").html("<h2>Estoy esperando que venga otro jugador.</h2>");
      $("#jugador02").css("border", "1px solid black");
      $("#jugador01").css("border", "1px solid black");
    }

  }

});


// When the player enters, verifies that there are two players ready. If so, then it will GO the game.
playersRef.on("child_added", function(snapshot) {
  if (currentPlayers === 1) {
    // set turn to 1, to begin the match
    currentTurnRef.set(1);
  }

});


// This function to get into the match
function getInGame() {
  // This is for adding disconnects to the dialogue with a unique id (the date or time the user entered the game)
  // It is necessary since Firebase's '.push()' creates its unique keys client side,
  // Thus, user is unable to ".push()" in a ".onDisconnect"
  var dialogueDataDisc = database.ref("/dialogue/" + Date.now());
  // This inspects for current players, if theres a player one connected, then the user becomes player 2.
  // if there is no player UNO, then the user becomes player UNO
  if (currentPlayers < 2) {
    if (jugador1Exists) {
      playerNum = 2;
    }
    else {
      playerNum = 1;
    }
    // This creates a key based on the assigned player number
    playerRef = database.ref("/players/" + playerNum);
    // This creates a player object. 'choice' is really not mandatory here, yet it better completes the code.
    playerRef.set({
      name: username,
      wins: 0,
      losses: 0,
      choice: null
    });
    // On disconnect remove this user's player object
    playerRef.onDisconnect().remove();
    // If a user disconnects, set the current turn to 'null' so the game does not continue
    currentTurnRef.onDisconnect().remove();
    // Send disconnect message to dialogue with Firebase server generated timestamp and id of '0' to denote system message
    dialogueDataDisc.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNum: 0
    });
    // Removes name input box and shows current player number
    $("#barter-area").html("<h2>Hola " + username + "! Eres el Jugador " + playerNum + "</h2>");
  }
  else {
    // if current players is "2", will not allow the player to join
    alert("Vas a tener que esperar!");
  }

}

// GAME LOGIC HERE
// Displays who wins, loses, or ties the match in the result div
// Increments wins and losses.

function gameLogic(jugador01choice, jugador02choice) {
  var jugador1Won = function() {
    $("#result").html("<h2>" + jugador1Data.name + "</h2><h2>GANA!</h2>");
    if (playerNum === 1) {
      playersRef.child("1").child("wins").set(jugador1Data.wins + 1);
      playersRef.child("2").child("losses").set(jugador2Data.losses + 1);
    }
  };
  var jugador2Won = function() {
    $("#result").html("<h2>" + jugador2Data.name + "</h2><h2>GANA!</h2>");
    if (playerNum === 2) {
      playersRef.child("2").child("wins").set(jugador2Data.wins + 1);
      playersRef.child("1").child("losses").set(jugador1Data.losses + 1);
    }
  };
  var tie = function() {
    $("#result").html("<h2>EMPATE!</h2>");
  };
  if (jugador01choice === "Piedra" && jugador02choice === "Piedra") {
    tie();
  }
  else if (jugador01choice === "Papel" && jugador02choice === "Papel") {
    tie();
  }
  else if (jugador01choice === "Tijera" && jugador02choice === "Tijera") {
    tie();
  }
  else if (jugador01choice === "Piedra" && jugador02choice === "Papel") {
    jugador2Won();
  }
  else if (jugador01choice === "Piedra" && jugador02choice === "Tijera") {
    jugador1Won();
  }
  else if (jugador01choice === "Papel" && jugador02choice === "Piedra") {
    jugador1Won();
  }
  else if (jugador01choice === "Papel" && jugador02choice === "Tijera") {
    jugador2Won();
  }
  else if (jugador01choice === "Tijera" && jugador02choice === "Piedra") {
    jugador2Won();
  }
  else if (jugador01choice === "Tijera" && jugador02choice === "Papel") {
    jugador1Won();
  }
}

// END OF JS