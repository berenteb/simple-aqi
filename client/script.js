const scaleColors = {
    good: "#009966",
    moderate: "#FFDE33",
    sensitive: "#FF9933",
    unhealthy: "#CC0033",
    veryUnhealthy: "#660099",
    hazardous: "#7E0023"
}

const themeColors = {
    background: "#fcf8ec",
    front1: "#456268",
    front2: "#79a3b1",
    front3: "#d0e8f2"
}
const url = "http://"+location.host+"/data";
var city = "";

const shadowStyle = "0px 0px 1.5vmin 0px ";

function displayCityError() {
    var dataFields = document.getElementsByClassName("dataFieldValue");
    for (let i = 0; i < dataFields.length; i++) {
        dataFields.item(i).innerHTML = "City?"
    }
    displayError("Could not get info for this city!")
    editColors();
}

function displayLoading(){
    var dataFields = document.getElementsByClassName("dataFieldValue");
    for (let i = 0; i < dataFields.length; i++) {
        dataFields.item(i).innerHTML = "..."
    }
    editColors();
}

function search() {
    displayLoading();
    var cityInput = document.getElementById("locationInput").value;
    getData(cityInput).then((result) => {
        if (result && result.aqi) {
            city = cityInput;
            localStorage.setItem("city", city);
            updateValues(result);
        } else {
            displayCityError();
        }
    }).catch(err=>{
        displayError(err);
    })
}

function loadFromStorage() {
    var value = localStorage.getItem("city");
    if (value !== null && value !== undefined) {
        city = value;
        document.getElementById("locationInput").value = city;
        search();
    } else {
        displayCityError();
    }
}

async function getData(cityArg = city) {
    if (cityArg !== "" && cityArg !== undefined && cityArg !== null) {
        var body = JSON.stringify({ "city": cityArg });
        var response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
        return response.json();
    } else return;
}

function updateValues(data) {
    getValueFromData("aqi", data);
    getValueFromData("pm25", data);
    getValueFromData("pm10", data);
    getValueFromData("o3", data);
    getValueFromData("no2", data);
    getValueFromData("so2", data);
    getValueFromData("co", data);
    editColors(data);
}

function getValueFromData(field, data){
    if(field === "aqi"){
        var parsed = data.aqi;
    }else{
        var parsed = data.gases[field];
        if(parsed) parsed = parsed.v;
    }
    if(parsed){
        document.getElementById(field+"value").innerHTML = parsed;
    }else{
        document.getElementById(field+"value").innerHTML = "N/A";
        // displayError("Some fields are not available for this location!");
    }
}

function editColors(data = {}) {
    var aqi = data.aqi;
    var bgcolor;
    var fontcolor;
    if (aqi) {
        if (aqi <= 50) {
            bgcolor = scaleColors.good;
            fontcolor = themeColors.front3;
        } else if (aqi <= 100) {
            bgcolor = scaleColors.moderate;
            fontcolor = themeColors.front1;
        } else if (aqi <= 150) {
            bgcolor = scaleColors.sensitive;
            fontcolor = themeColors.front1;
        } else if (aqi <= 200) {
            bgcolor = scaleColors.unhealthy;
            fontcolor = themeColors.front3;
        } else if (aqi <= 300) {
            bgcolor = scaleColors.veryUnhealthy;
            fontcolor = themeColors.front3;
        } else {
            bgcolor = scaleColors.hazardous;
            fontcolor = themeColors.front3;
        }
    } else {
        bgcolor = themeColors.front2;
        fontcolor = themeColors.front3;
    }
    var aqiContainerStyle = document.getElementById("aqiValueContainer").style;
    aqiContainerStyle.backgroundColor = bgcolor;
    document.getElementById("aqivalue").style.color = fontcolor;
    aqiContainerStyle.boxShadow = shadowStyle + bgcolor
}

function displayError(message) {
    document.getElementById("errorMessage").innerHTML = message;
    document.getElementById("error").style.display = "block"
    setTimeout(dismissError, 3000);
}

function dismissError() {
    document.getElementById("error").style.display = "none"
}

window.onload = function () {
    loadFromStorage();
    document.getElementById("locationInput").addEventListener("keypress",(evt)=>{
        if(evt.key === "Enter"){
            search();
        }
    })
}