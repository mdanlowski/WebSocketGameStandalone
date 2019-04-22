$(document).ready(function() {

    for(elem of document.getElementsByClassName("draggable-widget")) {
        console.log(elem)
        elem.addEventListener("drag", function(event){
          // console.log(event.target.parentElement)
          var container = event.target.parentElement;
          container.style.left = window.mouseX + "px";
          container.style.top = window.mouseY + "px";
        });
      };
    
});

socket.on('chatMessage', function(data){
    // console.log('received chat event from server');
    function strip(html){
      let tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }
    let message = "<span class='chat-username'>" + data.username +
      "</span>: " + strip(data.msg) + "<br/>";

    $(".chat-messages").append(message);
});

function sendChatMessage(){
    let messageBody = $('#message-body')[0].value;
    if(!messageBody.length || messageBody.match(/(^\s*$)/)){
      alert("Cannot send empty message");
      return;
    }
    var messageData = {
        username : socket.id.substr(0,6),
        msg : messageBody.trim(),
    };
    socket.emit('chatMessage', messageData);
    $('#message-body').val('');
}
