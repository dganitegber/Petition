console.log($);

$(document).ready(function() {
    var flag,
        prevX,
        prevY,
        currX,
        currY = 0,
        color = "black",
        thickness = 2;
    var canvas = $("#canvas");
    var ctx = canvas[0].getContext("2d");

    canvas.on("mousemove mousedown mouseup mouseout", function(e) {
        prevX = currX;
        prevY = currY;
        currX = e.pageX - canvas.offset().left + $(window).scrollLeft();
        currY = e.pageY - canvas.offset().top + $(window).scrollTop();

        if (e.type == "mousedown") {
            flag = true;
        }
        if (e.type == "mouseup" || e.type == "mouseout") {
            flag = false;
        }
        if (e.type == "mousemove") {
            if (flag) {
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(currX, currY);
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness;
                ctx.stroke();
                ctx.closePath();
            }
        }
    });
});

$("#submit").on("click", function() {
    var dataURL = $("#canvas")[0].toDataURL("image/png");
    console.log("dataURL", dataURL);
    $("#empty").val(dataURL);
});
