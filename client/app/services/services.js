angular.module('spliced.services', [])

.factory('Draw', function($http, $location) {
  var services = {};

  // This makes a POST request and sends the image, as well as cookie data, back to the server.
  services.save = function(image, gameCode, cookieData) {
    console.log("Inside services, the image is", image);
    console.log("Inside services, the gameCode is", gameCode);
    console.log("Inside services, the cookieData is", cookieData);
    // write post request here! :)
    $http.post('/game/' + gameCode, { image: image, cookieData: cookieData } )
    .then(function(response) {
      console.log("The response is", response);
    }, function(err) {
      console.log("The error is", err);
    });
  };

  // This makes a POST request to the server and takes the user to the /draw page if
  // the player was successfully registered. 
  services.registerPlayer = function(gameCode, callback){
    $http.get('/game/' + gameCode )
    .then(function(response){
      var newUrl;
      console.log("This is the response.data from registerPlayer()", response.data);
      var submittedDrawing = response.data[gameCode + '_submitted_drawing'];
      if (response.data.game_does_not_exist) {
        console.log("The game does not exist");
        $location.path('/');
      } else {
        if (submittedDrawing === true) {
          var newUrl = '/game/' + gameCode + '/status';
          $location.path(newUrl);
        } else {
          var newUrl = '/game/' + gameCode + '/draw';
          $location.path(newUrl);
        }
        if (response.data.imageURL){
          console.log("Forwarding you to /#/game/:code/status");
          var newLocation = '/game/' + gameCode + '/status';
          $location.path(newLocation);
        }
        console.log(newUrl);
        console.log(response);
      }
    }), function(err){
      console.log("There was an error registering the player", err);
    };
  };

  // This gets the game status. If the game doesn't exist, then it'll redirect the user back to
  // home (#).
  services.getGameStatus = function(gameCode, callback) {
    console.log("Getting game data...");

    $http.get('/game/' + gameCode + '/status')
    .then(function(response){
      console.log("The game data is...", response);
      var submittedDrawing = gameCode + '_submitted_drawing';
      if (response.data[submittedDrawing] || response.data.imageURL) {
        console.log("Forwarding you to /#/game/:code/status");
        var newLocation = '/game/' + gameCode + '/status';
        $location.path(newLocation);
      }
      callback(response);
    }, function(err){
      console.log("The game doesn't exist", err);
      $location.path('/#');
    });
  };

  return services;

})
.factory('Socket', function($rootScope) {
  var socket = io.connect();

  var on = function (event, cb) {
    socket.on(event, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        cb.apply(socket, args);
      });
    });
  };

  var emit = function (event, data, cb) {
    socket.emit(event, data, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        if (cb) {
          cb.apply(socket, args);
        }
      });
    });
  };

  return {
    on: on,
    emit: emit
  };

});