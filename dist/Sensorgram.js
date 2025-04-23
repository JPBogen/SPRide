"use strict";
var CustomScale = false;
var YaxisScaleValue = undefined;
var CustomFontSize = false;
var FontSize = undefined;
var CustomTitle = false;
var ChartTitle = undefined;
// #region Defines HTML elements
//checkbox
var YAxisScaleSwitch = document.getElementById("YAxisScaleSwitch");
var FontSizeSwitch = document.getElementById("FontSizeSwitch");
var TitleSwitch = document.getElementById("TitleSwitch");
//Input
var YaxisInput = document.getElementById("YaxisInput");
YaxisInput.disabled = true;
var FontSizeInput = document.getElementById("FontSizeInput");
FontSizeInput.disabled = true;
var TitleInput = document.getElementById("TitleInput");
TitleInput.disabled = true;
// #endregion
// #region Add onchange eventlisteners
// Y axis
YaxisInput.onchange = function () {
    YAxisScale();
};
YAxisScaleSwitch.onchange = function () {
    YAxisScale();
};
// Fontsize
FontSizeInput.onchange = function () {
    ChangeChartFontSize();
};
FontSizeSwitch.onchange = function () {
    ChangeChartFontSize();
};
// Titel
TitleSwitch.onchange = function () {
    ChangeTitle();
};
TitleInput.onchange = function () {
    ChangeTitle();
};
// #endregion
// #region ScaleAxis
//Changes the Scale of the Y axis
function YAxisScale() {
    // Update Values
    if (YAxisScaleSwitch.checked == true) {
        CustomScale = true;
        YaxisInput.disabled = false;
        YaxisScaleValue = CheckValue(YaxisInput.value, 1, YaxisInput, 100); //parseFloat(YaxisInput.value);
    }
    else {
        CustomScale = false;
        YaxisInput.disabled = true;
        YaxisScaleValue = undefined;
    }
    // Update Chart
    if (CustomScale == true) {
        SensorgramInstance.options.scales.yAxes[0].ticks.max = YaxisScaleValue;
    }
    else {
        SensorgramInstance.options.scales.yAxes[0].ticks.max = undefined;
    }
    SensorgramInstance.update();
}
// #endregion
// #region FontSize
//Changes the font size of the chart
function ChangeChartFontSize() {
    // Update Values
    if (FontSizeSwitch.checked == true) {
        CustomFontSize = true;
        FontSizeInput.disabled = false;
        FontSize = CheckValue(FontSizeInput.value, 0, FontSizeInput, 100); // parseFloat(FontSizeInput.value);
    }
    else {
        CustomFontSize = false;
        FontSizeInput.disabled = true;
        FontSize = undefined;
    }
    // Update Chart
    ChangeFonts(FontSize);
    SensorgramInstance.update();
}
//Changes every single font in the graph
function ChangeFonts(FS) {
    // Y-axis
    SensorgramInstance.options.scales.yAxes[0].scaleLabel.fontSize = FS;
    SensorgramInstance.options.scales.yAxes[0].ticks.fontSize = FS;
    // X-Axis
    SensorgramInstance.options.scales.xAxes[0].scaleLabel.fontSize = FS;
    SensorgramInstance.options.scales.xAxes[0].ticks.fontSize = FS;
    // Title
    SensorgramInstance.options.title.fontSize = FS;
    // Legend
    SensorgramInstance.options.legend.labels.fontSize = FS;
}
// #endregion
// #region Change Titel
//Changes the title of the graph
function ChangeTitle() {
    // Update Values
    if (TitleSwitch.checked == true) {
        CustomTitle = true;
        TitleInput.disabled = false;
        ChartTitle = TitleInput.value;
    }
    else {
        CustomTitle = false;
        TitleInput.disabled = true;
        if (mode == BindingMode.SteadyState) {
            ChartTitle = "Simulated Steady State Plot";
        }
        else {
            ChartTitle = "Simulated Sensorgram";
        }
    }
    SensorgramInstance.data.datasets[0].label = ChartTitle;
    SensorgramInstance.update();
}
// #endregion
// #region Save Chart
//Adds eventlistener for download option of graph
document.getElementById("savebutton").addEventListener("click", function () {
    SaveImageofChart();
});
//Results in download of the graph
function SaveImageofChart() {
    var currentdate = new Date();
    const link = document.createElement('a');
    link.href = SensorgramInstance.toBase64Image();
    link.download = "Sensorgram" +
        currentdate.getFullYear() +
        (currentdate.getMonth() + 1) +
        currentdate.getDate() +
        currentdate.getHours() +
        currentdate.getMinutes() +
        currentdate.getSeconds() +
        ".png";
    link.click();
}
// #endregion
