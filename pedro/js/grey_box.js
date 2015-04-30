function open(url) {
    $('#block').fadeIn();
    $('#iframe').attr('src', url);
    $('#grey_container').fadeIn();
    $('#iframe').css('src', url);
}

function close() {  
    $('#block').fadeOut();
    $('#grey_container').fadeOut();  
}

$(document).ready(function() {
  $('ul').css({})
        
     $('#closebtn').click( function() { close() })
     $('.d3js_box').click( function() { open('http://jsfiddle.net/') })
        
});
