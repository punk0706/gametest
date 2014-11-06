'use strict';

angular.module('myApp')
.service('platformMessageService', function($window, $log, $rootScope) {
  this.sendMessage = function (message) {
    $log.info("Platform sent message", message);
    var iframeObj = $window.document.getElementById("game_iframe");
    iframeObj.contentWindow.postMessage(
      message, "*");
  };
  this.addMessageListener = function (listener) {
    $window.addEventListener("message", function (event) {
      $rootScope.$apply(function () {
        var message = event.data;
        $log.info("Platform got message", message);
        listener(message);
      });
    }, false);
  };
});
