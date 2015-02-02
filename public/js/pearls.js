/* SERVER */

/* Put connection address here */
var socket = io();

var mygroup = ~~(Math.random()*4)+1;

var incomingNotes = new Array();

var pingint = setInterval("howmidoin()",4000);

function howmidoin() {
	if (socket.connected) {
		$("#broken").hide(0);
	} else {
		$("#broken").show(0);
	}
}

// LISTEN for data
socket.on('updatedata', function (type, data) {
	if (type=="mouse") {
		incomingNotes.push(data);
	} else {
		console.log(type);
	}
	if (type=="chat") {
		postToChat(data);
	}
});
socket.on('updatepearlchat', function (type, data) {
	postToChat(data);
});

socket.on('playsound', function (type, data) {
	chord1.src = "/audio/"+data
	chord1.currentTime = 0
	chord1.loop = true;
	chord1.play()
});

function playLocal(file,rate) {
	//chord1.src = "audio/"+file
//	chord1.currentTime = 0
	$("#chord1").attr("playbackRate","rate")
	console.log(chord1);
	chord1.play(0)
};


socket.on('loadpage', function (page, group) {
	console.log(page);
	if (group==0 || group==mygroup) {
		$(".frame").hide(0)
		$("#"+page).show(0)
		if (page=="river") {
			startPulse();
			$(".button").show(0)
		}
	}
});



function playPno() {
	console.log(pno7buf)
	//pno7buf.playbackRate.value = 0.6;
	pno7.currentTime = 0;
	//pno7.setAttributeNode("playbackRate", "0.6");
	pno7.play();
}


/* Onload */
var imgObj;

$(document).ready(function() {

	howmidoin();
	
	canvas = document.getElementById("harp");
	visctx = canvas.getContext("2d");
	
	canvas.width = $(window).width();
	canvas.height = 500;
	
	
	// audio priming
	
	//window.AudioContext = window.AudioContext || window.webkitAudioContext;

	//context = new AudioContext();
	context = Tone.context;

	
	/** new audio playing **/

	pno7 = new Audio("audio/pno7.mp3");

	pno7.addEventListener("canplaythrough", function() {
		
		pno7buf = context.createMediaElementSource(pno7);
		pno7buf.connect(context.destination);
		
		//myBuffer.currentTime = 20;
		//myBuffer.play();
		
	});

	pno7.load();

	// load mouse pic
	
	imgObj = new Image();
	imgObj.src= "mouse.png";

	//handle shift key
	//$(document).bind('keyup keydown', function(e){shifted = e.shiftKey} );
	
	$( window ).resize(function() {
		canvas.width = $(window).width();
	});

	$(".button").click(function() {
		$(".button").css("border-color", "#aaa");
		$(this).css("border-color", "#7ae");
	})



});

var hassines = false;
var mixer = 0.5;

function addSines() {
	hassines = true;

	prefxbus = context.createGain();	
	prefxbus.gain.value = 0;
	
	/* fx - needs work */
	
	delay = context.createDelay();
	delay.delayTime.value = 0.5;
	
	delayGain = context.createGain();
	delayGain.gain.value = 0.5;
	
	sine1 = context.createOscillator();
	sine1.type = 0;
	sine1.frequency.value = 200;
	sine1.start(context.currentTime);
	
	sine2 = context.createOscillator();
	sine2.type = "sine";
	sine2.frequency.value = 300;
	sine2.start(context.currentTime);
	
	sine1.connect(prefxbus);
	sine2.connect(prefxbus);
	prefxbus.connect(context.destination);
	prefxbus.connect(delay);
	delay.connect(delayGain);
	delayGain.connect(context.destination);
	delayGain.connect(delay);

}


var mousePos;
var voiceReg = 132;

function playpearl(e) {
		if (!hassines) {
			addSines();
		}

		var now = context.currentTime;
		
		canvasOffset = findPosition(canvas);
		mousePos = getCursorPosition(e, canvasOffset);
		sine1.frequency.value = (mousePos.x/canvas.width)*voiceReg + voiceReg;
		sine2.frequency.value = ((mousePos.x/canvas.width)*voiceReg + voiceReg)*1.5;
		prefxbus.gain.value = (1 - Math.abs(nx.clip(mousePos.y,0,canvas.height)/(canvas.height/2) - 1)) * mixer;

}

function movesilentpearl(e) {
		if (!hassines) {
			addSines();
		}
		
		canvasOffset = findPosition(canvas);
		mousePos = getCursorPosition(e, canvasOffset);
		sine1.frequency.value = (mousePos.x/canvas.width)*voiceReg + voiceReg;
		sine2.frequency.value = ((mousePos.x/canvas.width)*voiceReg + voiceReg)*1.5;
		
}

function endpearl() {
	prefxbus.gain.value = 0.0;
}


 
function limitRange(val,low,high) {
	if (val<low) {
		val = low;
	} else if (val>high) {
		val = high;
	}
	return val;
}

var hasriver = false;

function startPulse() {
	if (!hasriver) {
		setInterval("drawHarp();", 75);
		hasriver = true;
	}
}

var harpStrings = [ 1/1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2/1];


function drawHarp() {

	visctx.clearRect(0,0,canvas.width,canvas.height);

	//strings
	visctx.globalAlpha = 1;
	for (var i=0;i<harpStrings.length;i++) {
		var stringPos = canvas.width * (harpStrings[i] - 1);
		with (visctx) {
			lineWidth = 8;
			if (i%2) {
				strokeStyle = "#aaa";
			} else {
				strokeStyle = "#39c";
			}

			beginPath();
			moveTo(stringPos+4, 0);
			lineTo(stringPos+4, canvas.height);
			stroke();
			closePath();
			

		}
	}

	
	
	var grd=visctx.createLinearGradient(0,0,0,canvas.height); 
	grd.addColorStop(1,"rgba(256,256,256,256)");
	grd.addColorStop(0.5,"rgba(256,256,256,0)");
	grd.addColorStop(0,"rgba(256,256,256,256)");
	
	with (visctx) {
		fillStyle = grd;
		fillRect(0,0,canvas.width,canvas.height);
	}
	
	for (var i=0;i<incomingNotes.length;i++) {
		with (visctx) {
			if (incomingNotes[i]!=null) {
				with (visctx) {
					fillStyle = "#0af";
					beginPath()
					arc(incomingNotes[i].x*canvas.width, incomingNotes[i].y*canvas.height,10,0,Math.PI*2);
					globalAlpha = 0.5
					fill();
					globalAlpha = 1
					closePath();
				}
				//visctx.drawImage(imgObj, incomingNotes[i].x*canvas.width, incomingNotes[i].y*canvas.height);		
			}
		}
	}


	var scaledPos = new Object();

	if (mousePos) {
		scaledPos.x = mousePos.x / canvas.width;
		scaledPos.y = mousePos.y / canvas.height;
	}
	
	socket.emit('senddata', "mouse", scaledPos);

	incomingNotes = new Array();
	
}

startPulse();







function Point(x,y){
	this.x = x;
	this.y = y;
}



function getCursorPosition(e, canvas_offset) {
  var x;
  var y;
  if (e.targetTouches) {
  		x = e.targetTouches[0].pageX;
		y = e.targetTouches[0].pageY;
  } else if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
  } else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
	x -= canvas_offset.left;
  y -= canvas_offset.top;
	var click_position = new Point(x,y);
	return click_position;
}


function findPosition(element) {
    var body = document.body,
        win = document.defaultView,
        docElem = document.documentElement,
        box = document.createElement('div');
    box.style.paddingLeft = box.style.width = "1px";
    body.appendChild(box);
    var isBoxModel = box.offsetWidth == 2;
    body.removeChild(box);
    box = element.getBoundingClientRect();
    var clientTop  = docElem.clientTop  || body.clientTop  || 0,
        clientLeft = docElem.clientLeft || body.clientLeft || 0,
        scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
        scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
    return {
        top : box.top  + scrollTop  - clientTop,
        left: box.left + scrollLeft - clientLeft
  	};
}



function submitChat(e) {
	if (e.which==13) {
		var newChat = {
			user: "pearl",
			text: $("#chatinput").val()
		}
		socket.emit('sendpearlchat', "chat", newChat);
		$("#chatinput").val("")
	}
	
}

function postToChat(data) {
	
	$("#chatmessages").html(data.text)
	
}







/** saw **/


var hassaw = false;

function addSaw() {
	hassaw = true;

	sawbus = context.createGain();	
	sawbus.gain.value = 0.3;
	
	/* fx - needs work */
	
	saw1 = context.createOscillator();
	saw1.type = 'sawtooth';
	saw1.frequency.value = 232;
	saw1.start(context.currentTime);

	sawfilter = context.createBiquadFilter();
	sawfilter.type = 'bandpass'
	sawfilter.frequency.value = 232
	sawfilter.gain.value = 1
	sawfilter.Q.value = 100

	saw1.connect(sawfilter);
	sawfilter.connect(sawbus)
	sawbus.connect(context.destination);

	siritilt.active = true;;

}


window.addEventListener("orientationchange", function() {
	// Announce the new orientation number
	window.scroll(0,-300)
}, false);

