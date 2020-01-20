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

    canvas.on("mousemove mousedown mouseenter mouseup", function(e) {
        prevX = currX;
        prevY = currY;
        currX = e.pageX - canvas.offset().left + $(window).scrollLeft();
        currY = e.pageY - canvas.offset().top + $(window).scrollTop();

        if (e.type == "mousedown") {
            flag = true;
        }
        if (e.type == "mouseup") {
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
    // console.log("dataURL", dataURL);
    $("#empty").val(dataURL);
});

var btn = $("#button");

$(window).scroll(function() {
    if ($(window).scrollTop() > 300) {
        btn.addClass("show");
    } else {
        btn.removeClass("show");
    }
});

btn.on("click", function(e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "300");
});

// $(".logout").on("click", function() {
//     console.log(HttpSessionState.Current.session);
// });

$("#logout").on("mouseenter", function() {
    console.log("i'm hovering");
    $("#logout").css("box-shadow: 4px 7px 10px black");
});

$("#logout").on("mouseout", function() {
    console.log("i'm hovering");
    $("#logout").animate({ borderColor: "#fff" }, "fast");
});
