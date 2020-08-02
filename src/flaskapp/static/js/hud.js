let count = 0;
let dust, uv, rain, co2;
let lat, long;
let before_dust=-1, before_uv=-1, before_rain=-1, before_co2=-1;

$( document ).ready(function() {
    let time = setInterval(refreshWindow, 15000);
});

function refreshWindow(){
    let text="";

    count += 1;

    // get data from database
    $.ajax({
        type: "post",
        url: "/get_data",
        data: {},
        dataType: "text"
    }).done(function (result) {
        let res = JSON.parse(result);

        dust = res['fine_dust'];
        uv = res['uv'];
        rain = res['rain'];
        co2 = res['co2'];

        lat = res['lat'];
        long = res['long'];

        $('#dusttext').text("미세먼지 : "+dust);
        $('#uvtext').text("자외선 : "+uv);
        $('#raintext').text("강우량 : "+rain);
        $('#co2text').text("CO₂ : "+co2);

        console.log(dust, before_dust);

        if(dust<30 && before_dust>30){
            text = "미세먼지 수치가 "+ dust +"입니다. 아주 좋아요.";
        }
        else if(dust >=30 && dust<80 && (before_dust<30 || before_dust>80)){
            text = "미세먼지 수치가 "+ dust +"입니다. 보통이에요.";
        }
        else if(dust >= 80 && dust<150 && (before_dust<80 || before_dust>150)){
            text = "미세먼지 수치가 "+ dust +"입니다. 공기가 나쁘니 창문을 닫아주세요.";
        }
        else if(dust>=150 && before_dust<150){
            text = "미세먼지 수치가 "+ dust +"입니다. 아주 나빠요. 공기청정기 가동을 위해 창문을 닫아주세요.";
        }

        if(text !== "") getTTS(text);

        before_dust = dust;
        before_uv = uv;
        before_rain = rain;
        before_co2 = co2;
    })
    .fail(function () {
        console.log("오류 발생");
        return;
    });
}

function getTTS(text){
    console.log(count);
    $.ajax({
        type: "post",
        url: "/get_tts",
        data: {'text':text},
        dataType: "text"
    }).done(function (result) {
        let res = JSON.parse(result);
        console.log(res);

        let audio = $("#audio_tts");
        $("#audio_src").attr("src", "data:audio/ogg;base64,"+res['success']);
        audio[0].pause();
        audio[0].load();

        audio[0].oncanplaythrough = audio[0].play();
    })
    .fail(function () {
        console.log("TTS 오류 발생");
    });
}
