"use strict";
/// <reference path="./SPR_Simulator.ts" />
//Canvas element for Sensorgram depiction
const ctx = document.getElementById("Sensorgram");
//Defines CanvasContainer as a Div element and the items which size the container should encompass
var CanvasContainer = document.getElementById("canvas-container");
//List of the item 1-7. Their height is the heigt of the sensorgram
const ItemListForCanvasContainer = [
    document.getElementById("item1"),
    document.getElementById("item2"),
    document.getElementById("item3"),
    document.getElementById("item4"),
    document.getElementById("item5"),
    document.getElementById("item6"),
    document.getElementById("item7")
].filter((el) => el !== null);
//Declares chart as any element to allow override. Can be used to access graph after drawing
var SensorgramInstance;
//Main function, app starts by ploting the default values
function Main() {
    Plot_Values();
}
//Function to draw the graph as a scatter plot. Takes the data set and titles of axis as parameters
function Generate_Graph(datavalues, xAxixTitel, PointColor) {
    if (SensorgramInstance != undefined) {
        SensorgramInstance.destroy();
    }
    const Sensorgram = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                    label: ChartTitle,
                    pointRadius: 1,
                    hoverRadius: 1,
                    pointBackgroundColor: PointColor,
                    data: datavalues,
                }]
        },
        options: {
            legend: {
                labels: {
                    boxWidth: 0
                },
            },
            scales: {
                xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: xAxixTitel //"Time [s]"
                        }
                    }],
                yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Maximal Response [%]"
                        },
                        ticks: {
                            min: 0,
                            max: YaxisScaleValue
                        }
                    }]
            },
            tooltips: {
                enabled: false
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
    SensorgramInstance = Sensorgram;
}
//Adopts size  of the sensorgram so it is not too high
window.addEventListener("resize", function () {
    //if the elements CanvasContainer exists and the windows size is over the minimul to switch to mobile screen size 
    if (CanvasContainer && this.window.outerWidth > 1100) {
        //resets div height to 0
        CanvasContainer.style.height = "0px";
        var gridheight = 0;
        //Calculates height + MArigin of item 1-7 which additive size should be the size of the sensorgram
        ItemListForCanvasContainer.forEach(item => {
            gridheight += item.getBoundingClientRect().height +
                parseFloat(window.getComputedStyle(item).marginTop) +
                parseFloat(window.getComputedStyle(item).marginBottom);
        });
        //sets sensorgram size
        CanvasContainer.style.height = gridheight + "px";
    }
});
//Upon DOM loading, main function is executed
document.addEventListener("DOMContentLoaded", Main);
