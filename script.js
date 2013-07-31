var state = 0,
	ws,
	context,
	oscillator,
	gainer;

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
	WebSocket = MozWebSocket;
}

// Create the socket with event handlers
function init() {
	//Create and open the socket
	ws = new WebSocket("ws://localhost:6437/");

	// On successful connection
	ws.onopen = function(event) {
		console.log('Connected to WebSocket');
	};

	// On message received
	ws.onmessage = function(event) {
		var obj = JSON.parse(event.data);
		if(state > 0) {
			if(obj.pointables.length > 0) {
				var value = obj.pointables[0].tipPosition[0];
				var intensity = $('#intensity').val();
				var modified = (350 - value) * intensity;
				if( modified <= 0 ) {
					modified = 5;
				}
				modified = modified.toFixed(2);

				var gainval = (obj.pointables[0].tipPosition[1] - 25) / 600;
				if (gainval < 0){
					gainval = 0;
				}
				if (gainval > 1){
					gainval = 1;
				}

				oscillator.frequency.value = modified;
				gainer.gain.value = gainval;
				$('#frequency').html(modified + ' Hz');
			}			
		}
	};

	// On socket close
	ws.onclose = function(event) {
		ws = null;
		console.log('Connection closed.');
	}

	//On socket error
	ws.onerror = function(event) {
		alert("Received error");
	};
}

$(function() {
	init();

	$( "#slider" ).slider({
        value: 10,
        min: 1,
        max: 30,
        step: 1,
        slide: function( event, ui ) {
            $( "#intensity" ).val( ui.value );
        }
    });

    $('#play').click(function() {
    	state = 1;
		context = new webkitAudioContext(),
		oscillator = context.createOscillator()
		gainer = context.createGain();
		gainer.connect(context.destination);
		oscillator.connect(gainer);
		oscillator.frequency.value = 901;
		oscillator.start(0);

		$(this).addClass('active');
		$('#stop').removeClass('active');
		$('#frequency').html('900.00 Hz');
    });

    $('#stop').click(function() {
    	oscillator.stop(0);
		state = 0;
	
		$(this).addClass('active');
		$('#play').removeClass('active');
		$('button.wave').removeClass('active');
    });

    $('button.wave').click(function() {
    	if(state > 0) {
    		$('button.wave').removeClass('active');
    		$(this).addClass('active');
			oscillator.type = $(this).val();
		}
    });

});