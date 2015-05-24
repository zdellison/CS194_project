function open(url) {
    $('#block').fadeIn();
    $('#iframe').attr('src', url);
    $('#grey_container').fadeIn();
    document.getElementById("container").style.position = "fixed";
    $('.container').css('position')
}

function close() {  
    $('#block').fadeOut();
    $('#grey_container').fadeOut();  
    document.getElementById("container").style.position = "relative";
}

$(document).ready(function() {
  $('ul').css({})
        
     $('#closebtn').click( function() { close() })
     $('.d3js_box').click( function() { open('http://d3js.org/') })
        
});
