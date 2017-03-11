var topics = ['truffles', 'tiramisu', 'pears', 'potatoe', 'cheetos', 'popcorn'];
var prependString = '';
var appendString = '';
var globalObj = {};

function buildButton(value) {
  var $newButton = $('<button>');
  var inputValue = value;
  $newButton.attr('data-query', inputValue);
  $newButton.attr('data-delete', false);
  $newButton.text(inputValue);
  $newButton.addClass('btn btn-success api-query');
  $('#buttons-container').append($newButton);
}
function createImg(imgObj) {
  var $newImg = $('<img>',{
    data: {
      "stop": imgObj.images.fixed_width_still.url,
      "animate": imgObj.images.fixed_width.url,
      "rating": imgObj.rating,
      "state": "stop"
    },
    class: "img-responsive image-gifs",
    src: imgObj.images.fixed_width_still.url
  });
  var $rating = $('<p class="h4 text-center">').text("Rating: " + $newImg.data("rating"));
  $('#gif-container').append($('<li>', {
    class: 'img-container'
  }).append($newImg, $rating));
}
function postAjaxObject(doThis, search, numItems) {
  search = prependString + search  + appendString;
  $.ajax({
    url: 'https://api.giphy.com/v1/gifs/search?q=' + search + '&api_key=dc6zaTOxFJmzC&offset='
    + Math.floor(Math.random() * 3) * 25 + '&rating=PG-13',
    method: "GET"
  }).done(function (response) {
    var data = response.data;
    var dataSize = data.length;
    var randIndex;
    var prevRandIndexes = [];

    if (dataSize != 0) {
      for (var i = 0; i < numItems; i++) {
        randIndex = Math.floor(Math.random() * dataSize);
        while (prevRandIndexes.indexOf(randIndex) !== -1) {
          randIndex = Math.floor(Math.random() * dataSize);
        }
        prevRandIndexes.push(randIndex);
        doThis(data[randIndex]);
      }
      prevRandIndexes = [];
    } else {
      console.log("Check");
    }
  });
}
$(document).ready(function () {
  if(localStorage.getItem('topicsArray')){
    topics = localStorage.getItem('topicsArray').split(',');
  }
  for(var i = 0; i < topics.length; i++){
    buildButton(topics[i]);
  }
  $('.modifier-term').on('click', function () {
    var $checkBox = $(this);
    if($checkBox.is(":checked")){

      if($checkBox.hasClass('prepend')){
        prependString = $checkBox.attr('value') + " ";
      }
      if($checkBox.hasClass('append')){
        appendString = " " + $checkBox.attr('value');
      }
    }else{
      if($checkBox.hasClass('prepend')){
        prependString = " ";
      }
      if($checkBox.hasClass('append')){
        appendString = " ";
      }
    }
  });
  $('#submit-input').on('click', function (event) {
    event.preventDefault();
    var searchTerm = $('#input-bar').val();
    if($('#input-bar').val()){
      buildButton(searchTerm);
      topics.push(searchTerm);
      $('#input-bar').val('');
    }
  });
  $('#buttons-container').on('click', '.api-query', function () {
    if($(this).attr('data-delete') !== 'true'){
      $('#gif-container').empty();
      postAjaxObject(createImg, $(this).attr('data-query'), 10);
    }
  });
  $('#gif-container').on('click', '.image-gifs', function () {
    var state = $(this).data("state");
    if(state == "stop"){
      $(this).attr('src', $(this).data("animate"));
      $(this).data("state", 'animate')
    }else{
      $(this).attr('src', $(this).data("stop"));
      $(this).data("state", 'stop')
    }
  });
  $('#save-button').on('click', function () {
    localStorage.setItem('topicsArray', topics);
  });
  $('#delete-button').on('click', function () {
    var buttonsList = $('#buttons-container').children('.api-query');
    if($('#delete-button').attr('data-active') == 'true'){
      $('#delete-button').attr('data-active', 'false');
      $(buttonsList).attr('data-delete', 'false');
      $('#delete-button').removeClass('btn-danger').addClass('btn-default');
      $(buttonsList).attr('class', 'btn btn-success api-query');
    }else if($('#delete-button').attr('data-active') == 'false'){
      $('#delete-button').attr('data-active', 'true');
      $(buttonsList).attr('data-delete', 'true');
      $('#delete-button').removeClass('btn-default').addClass('btn-danger');
      $(buttonsList).attr('class', 'btn btn-danger api-query');
    }
    $('#buttons-container').on('click', '.api-query', function () {
      if($('#delete-button').attr('data-active') == 'true'){
        var buttonData = $(this).attr('data-query');
        topics.splice(topics.indexOf(buttonData), 1);
        localStorage.setItem('topicsArray', topics);
        $(this).remove();
      }
    });
  });
});