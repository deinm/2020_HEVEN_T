let map;
let markers = [];
let marker;
let mapContainer;
let geocoder = new kakao.maps.services.Geocoder();
let newAddress = '';
let oldAddress = '';

Chart.defaults.global.defaultFontColor = 'white';

$( document ).ready(function() {
    $("#map").css("height", $(window).height()+"px");
    // $("#map").css("height", "100%");
    // $("#map").css("width", $(window).width()+"px");

    mapContainer = document.getElementById('map'), // 지도를 표시할 div
        mapOption = {
            center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    map = new kakao.maps.Map(mapContainer, mapOption);
    /* -- 현재 접속 위치 받아오기 --*/
    // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
    if (navigator.geolocation) {
        // GeoLocation을 이용해서 접속 위치를 얻어옵니다
        navigator.geolocation.getCurrentPosition(function(position) {

            let lat = position.coords.latitude, // 위도
                lon = position.coords.longitude; // 경도

            let locPosition = new kakao.maps.LatLng(lat, lon);// 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다

            // 마커와 인포윈도우를 표시합니다
            displayMarker(locPosition);

            // 지도에 클릭 이벤트를 등록합니다
            // 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
            kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                // 클릭한 위도, 경도 정보를 가져옵니다
                let latlng = mouseEvent.latLng;

                // 마커 위치를 클릭한 위치로 옮깁니다
                marker.setPosition(latlng);

                // sidebar 정보 보여주기
                searchInfo(mouseEvent.latLng);
            });
        });
    }
    else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
        let locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
            message = '현재 위치를 받아올 수 없습니다. 위치정보 사용을 허용해 주세요.';
        displayMarker(locPosition, message);
    }
});

// 지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {
    hideMarkers();

    // 마커를 생성합니다
    marker = new kakao.maps.Marker({
        map: map,
        position: locPosition
    });
    markers.push(marker);

    let iwContent = message, // 인포윈도우에 표시할 내용
        iwRemoveable = true;

    // 지도 중심좌표를 접속위치로 변경합니다
    map.setCenter(locPosition);
}

function searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

function searchWeather(newAddress, oldAddress){
    $.ajax({
        type: "post",
        url: "/search_weather",
        data: {'new_address':newAddress, 'old_address':oldAddress},
        dataType: "text"
    }).done(function (result) {
        let res = JSON.parse(result);

        removeInfoDiv();

        $('#dustText').text(res['finedust']);
        $('#ultradustText').text(res['ultrafinedust']);
        $('#rainText').text(res['rain']);
        $('#uvText').text(res['uv']);
    })
    .fail(function () {
        console.log("오류 발생");
    });
}

function removeInfoDiv(){
    $("#location_text").removeClass("dis_none");

    $("#dust").removeClass("dis_none");
    $("#dustText").removeClass("dis_none");
    $("#ultradust").removeClass("dis_none");
    $("#ultradustText").removeClass("dis_none");
    $("#uv").removeClass("dis_none");
    $("#uvText").removeClass("dis_none");
    $("#rain").removeClass("dis_none");
    $("#rainText").removeClass("dis_none");
    $("#refresh").removeClass("dis_none");
}

function deleteInfoDiv(){
    $("#location_text").addClass("dis_none");

    $("#dustChartArea").addClass("dis_none");
    $("#uvChartArea").addClass("dis_none");

    $("#dust").addClass("dis_none");
    $("#dustText").addClass("dis_none");
    $("#ultradust").addClass("dis_none");
    $("#ultradustText").addClass("dis_none");
    $("#uv").addClass("dis_none");
    $("#uvText").addClass("dis_none");
    $("#rain").addClass("dis_none");
    $("#rainText").addClass("dis_none");
    $("#refresh").addClass("dis_none");
}

function showLocation(){
    let currentAddress = oldAddress;
    if(newAddress.length != 0) currentAddress = newAddress;

    $("#location_text").removeClass("dis_none");
    $("#location_text").text(currentAddress);
}

$('#weather_button').click(function(){
    // $("#dustChartArea").removeClass("dis_none");
    // $("#uvChartArea").removeClass("dis_none");

    $("#info_text").removeClass("dis_none");

    showLocation();

    $("#no_data").addClass("dis_none");
    $("#no_data1").addClass("dis_none");
    $("#no_data2").addClass("dis_none");
    $("#weather_button").addClass("dis_none");

    searchWeather(newAddress, oldAddress);
});


// chart
let dustChartElem = document.getElementById('dustChart').getContext('2d');
let dustChart = new Chart(dustChartElem, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3],
        datasets: [{
            label: '미세먼지',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 1)',
            data: [{x: 0, y: 1},
                {x: 1, y: 2},
                {x: 2, y: 3},
                {x: 3, y: 2}],
            fill: false,
        },{
            label: '초미세먼지',
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 1)',
            data: [{x: 0, y: 1},
                {x: 1, y: 2},
                {x: 2, y: 1},
                {x: 3, y: 0}],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        legend: {
            labels: {
                // This more specific font property overrides the global property
                fontColor: 'white'
            }
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: '시간'
                },
                ticks: {
                    fontColor: 'white'
                },
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: '척도'
                },
                ticks: {
                    fontColor: 'white'
                },
            }]
        }
    }
});


let uvChartElem = document.getElementById('uvChart').getContext('2d');
let uvChart = new Chart(uvChartElem, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3],
        datasets: [{
            label: '자외선',
            borderColor: 'rgba(255, 138, 101, 1)',
            backgroundColor: 'rgba(255, 138, 101, 1)',
            data: [{x: 0, y: 1},
                {x: 1, y: 2},
                {x: 2, y: 3},
                {x: 3, y: 2}],
            fill: false,
        },{
            label: '강우량',
            borderColor: 'rgba(212, 225, 87, 1)',
            backgroundColor: 'rgba(212, 225, 87, 1)',
            data: [{x: 0, y: 1},
                {x: 1, y: 3},
                {x: 2, y: 2},
                {x: 3, y: 1}],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        legend: {
            labels: {
                // This more specific font property overrides the global property
                fontColor: 'white'
            }
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: '시간'
                },
                ticks: {
                    fontColor: 'white'
                },
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: '척도'
                },
                ticks: {
                    fontColor: 'white'
                },
            }]
        }
    }
});

// disable enter key in modal
$(document).ready(function() {
    $('.disableEnter').keypress(function(event) {
        if(event.keyCode == 13) {
            event.preventDefault();
        }
    });
});

/* -- 도로 검색해서 지도 위치로 이동하기 --*/
$("#searchLoc").click(function () {
    let keyword = $('#userInput').text();

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(keyword, function(result, status) {
        // 정상적으로 검색이 완료됐으면
        if (status === kakao.maps.services.Status.OK) {
            // 현재 위도 및 경도
            let latlng = new kakao.maps.LatLng(result[0].y, result[0].x);
            searchInfo(latlng);

            // 마커 표시
            displayMarker(latlng);

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(latlng);
        }
    });
});


function searchInfo(location){
    // 위치 관련 정보를 sidebar에 표시
    /* 좌표로 주소 검색하기 */
    searchDetailAddrFromCoords(location, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            if (detailAddr = !!result[0].road_address) {
                newAddress = result[0].road_address.address_name;
            }
            oldAddress = result[0].address.address_name;
        }
    });

    $.ajax({
        type: "post",
        url: "/get_data",
        data: {'lat': location.getLat(), 'long': location.getLng()},
        dataType: "text"
    }).done(function (result) {
        let res = JSON.parse(result);

        $("#describe").addClass("dis_none");
        $("#describe1").addClass("dis_none");
        $("#info_text").addClass("dis_none");

        if (res.hasOwnProperty('none')) {
            $("#no_data").removeClass("dis_none");
            $("#no_data1").removeClass("dis_none");
            $("#no_data2").removeClass("dis_none");
            $("#weather_button").removeClass("dis_none");

            deleteInfoDiv();

            $('#no_data').text("🚘");
            $('#no_data1').text("아직 데이터가 없어요.");
            $('#no_data2').text("오늘은 이곳으로 떠나볼까요?");
            return;
        }

        showLocation();

        $("#no_data").addClass("dis_none");
        $("#no_data1").addClass("dis_none");
        $("#no_data2").addClass("dis_none");
        $("#weather_button").addClass("dis_none");

        $("#dustChartArea").removeClass("dis_none");
        $("#uvChartArea").removeClass("dis_none");

        removeInfoDiv();

        let finedustText = res['fine_dust'];
        let ultradustText = res['ultrafine_dust'];
        let uvText = res['uv'];
        let rainText = res['rain'];

        if (res['rain'] > 0.8) {
            rainText += "(비)";
        } else {
            rainText += "";
        }

        if (res['fine_dust'] <= 30) {
            finedustText += "(좋음)";
            $('.fa-meh-o').css('color', '#ffffff');
        } else if (res['fine_dust'] <= 80) {
            finedustText += "(보통)";
            $('.fa-meh-o').css('color', '#FDD835');
        } else if (res['fine_dust'] <= 150) {
            finedustText += "(나쁨)";
            $('.fa-meh-o').css('color', '#FF5722');
        } else {
            finedustText += "(매우나쁨)";
            $('.fa-meh-o').css('color', '#DF1C44');
        }

        if (res['ultrafine_dust'] <= 15) {
            ultradustText += "(좋음)";
            $('.fa-frown-o').css('color', '#ffffff');
        } else if (res['ultrafine_dust'] <= 35) {
            ultradustText += "(보통)";
            $('.fa-frown-o').css('color', '#FDD835');
            // $('#ultradustText').css('color','#FDD835');
        } else if (res['ultrafine_dust'] <= 75) {
            ultradustText += "(나쁨)";
            $('.fa-frown-o').css('color', '#FF5722');
        } else {
            ultradustText += "(매우나쁨)";
            $('.fa-frown-o').css('color', '#DF1C44');
        }

        if (res['uv'] <= 2) {
            uvText += "(좋음)";
        } else if (res['ultrafine_dust'] <= 5) {
            uvText += "(보통)";
        } else if (res['ultrafine_dust'] <= 7) {
            uvText += "(나쁨)";
        } else {
            uvText += "(매우나쁨)";
        }

        $('#dustText').text(finedustText);
        $('#ultradustText').text(ultradustText);
        $('#uvText').text(uvText);
        $('#rainText').text(rainText);
    })
    .fail(function () {
        console.log("오류 발생");
    });
}

function hideMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

