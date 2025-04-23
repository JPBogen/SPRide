"use strict";
var BindingMode;
(function (BindingMode) {
    BindingMode["SCK"] = "SCK";
    BindingMode["MCK"] = "MCK";
    BindingMode["SteadyState"] = "SteadyState";
})(BindingMode || (BindingMode = {}));
//the current mode in which the app works (MSC is standard)
var mode = BindingMode.MCK;
// #region kinetic parameters and variables
var AssociationTime; // in s
var DissociationTime; //in s
var DissociationInBetweenTime; //in s
var kon; // in Ms
var kdis; // in 1/s
var NumberOfCyles;
var DilutionFactor;
var MaximalConcentration; // in M
var DissociationInSCK;
var KD; // in M
var Halflife; // in sec
// #endregion
// #region Defines HTML elements
//Input field
var CycleInput = document.getElementById("CycleInput");
var DilutionInput = document.getElementById("DilutionInput");
var ConcInput = document.getElementById("ConcInput");
var konInput = document.getElementById("konInput");
var kdisInput = document.getElementById("kdisInput");
var AssociationTimeInput = document.getElementById("AssociationTimeInput");
var DissociationTimeInput = document.getElementById("DissociationTimeInput");
var KDInput = document.getElementById("KDInput");
var DissociationInBetweenTimeInput = document.getElementById("DissociationInBetweenTimeInput");
DissociationInBetweenTimeInput.disabled = true;
//Dropdown fields
var ConcDimensionDD = document.getElementById("ConcDimensionDD");
var BindingModeDD = document.getElementById("BindingModeDD");
var konDimensionDD = document.getElementById("konDimensionDD");
var kdisDimensionDD = document.getElementById("kdisDimensionDD");
var KDDD = document.getElementById("KDDD");
var HalflifeDD = document.getElementById("HalflifeDD");
var ThetaDD = document.getElementById("ThetaDD");
//Checkboxes
var DissInBetweenCheck = document.getElementById("DissInBetweenCheck");
var SteadyStateSwitch = document.getElementById("SteadyStateSwitch");
//Labels
var HalflifeLabel = document.getElementById("HalflifeLabel");
var ThetaLabel = document.getElementById("ThetaLabel");
var FreeEnergyLabel = document.getElementById("FreeEnergyLabel");
var ThetaeqLabel = document.getElementById("ThetaeqLabel");
// #endregion
// #region Add onchange eventlisteners
// Array of specific elements to add event listener to. Required for refrashing of plot in case of onchange event
var specificElements = [
    CycleInput, DilutionInput, ConcInput, konInput, kdisInput,
    AssociationTimeInput, DissociationTimeInput, DissociationInBetweenTimeInput,
    ConcDimensionDD, konDimensionDD, kdisDimensionDD, DissInBetweenCheck, KDInput
];
// Attach the event listener to each specified element
specificElements.forEach(attachPlotValuesListener);
// Function to attach the event listener. Required for refrashing of plot in case of onchange event
function attachPlotValuesListener(element) {
    element.onchange = function () {
        Plot_Values();
    };
}
//if theta dropdown is changed, the KD is newly calculated
ThetaDD.onchange = function () {
    FillLabels();
};
//if KD dropdown is changed, the KD is newly calculated
KDDD.onchange = function () {
    if (mode == BindingMode.SteadyState) {
        //if the steady state mode is used, the input of the KD is used for plotting the data
        Plot_Values();
    }
    else {
        //in the SCK or MCK modes the KD value does not change but only the dimension change is displayed
        FillLabels();
    }
};
//if halflife dropdown is changed, the KD is newly calculated
HalflifeDD.onchange = function () {
    FillLabels();
};
//if the dissociation between cylces for SCK is clicked, the input field for the diss time is disabled/enabled
DissInBetweenCheck.onchange = function () {
    if (DissInBetweenCheck.checked && mode == BindingMode.SCK) {
        DissociationInBetweenTimeInput.disabled = false;
        Plot_Values();
    }
    else {
        DissociationInBetweenTimeInput.disabled = true;
        Plot_Values();
    }
};
//If the binding mode is changed from SCK to MCK or vice versa, the mode need to be assessed anew
BindingModeDD.onchange = function () {
    SwitchMode();
};
//If the binding mode is changed from kinetic to steady state or vice versa, the mode need to be assessed anew
SteadyStateSwitch.onchange = function () {
    SwitchMode();
};
// #endregion
// #region Mode-dependent Functions
//Function to change the current mode of the app
function SwitchMode() {
    if (SteadyStateSwitch.checked == false) {
        if (BindingModeDD.value == "MCK") {
            mode = BindingMode.MCK;
        }
        else {
            mode = BindingMode.SCK;
        }
    }
    else // SteadyStateSwitch.checked == true
     {
        mode = BindingMode.SteadyState;
    }
    ActivateMode(mode);
}
//Function to disable and enable the representativ element in the DOM based on the mode
function ActivateMode(mode) {
    switch (mode) {
        case BindingMode.MCK:
            {
                //enable
                KDInput.disabled = true;
                //disable
                CycleInput.disabled = false;
                DissInBetweenCheck.disabled = true;
                BindingModeDD.disabled = false;
                //DissociationInBetweenTimeInput.disabled = false;
                konInput.disabled = false;
                konDimensionDD.disabled = false;
                kdisInput.disabled = false;
                kdisDimensionDD.disabled = false;
                AssociationTimeInput.disabled = false;
                DilutionInput.disabled = false;
                DissociationTimeInput.disabled = false;
            }
            break;
        case BindingMode.SCK:
            {
                //enable
                KDInput.disabled = true;
                //disable
                CycleInput.disabled = false;
                DissInBetweenCheck.disabled = false;
                BindingModeDD.disabled = false;
                //DissociationInBetweenTimeInput.disabled = false;
                konInput.disabled = false;
                konDimensionDD.disabled = false;
                kdisInput.disabled = false;
                kdisDimensionDD.disabled = false;
                AssociationTimeInput.disabled = false;
                DilutionInput.disabled = false;
                DissociationTimeInput.disabled = false;
            }
            break;
        case BindingMode.SteadyState:
            {
                //enable
                KDInput.disabled = false;
                //disable
                CycleInput.disabled = true;
                DissInBetweenCheck.disabled = true;
                BindingModeDD.disabled = true;
                //DissociationInBetweenTimeInput.disabled = true;
                konInput.disabled = true;
                konDimensionDD.disabled = true;
                kdisInput.disabled = true;
                kdisDimensionDD.disabled = true;
                AssociationTimeInput.disabled = true;
                DilutionInput.disabled = true;
                DissociationTimeInput.disabled = true;
            }
            break;
    }
    Plot_Values();
}
// #endregion
// #region Parse user input
//parses the values of the user and saves it as the kinetic aparameters
function ParseUserInput() {
    //AssociationTime = parseFloat(AssociationTimeInput.value);
    AssociationTime = CheckValue(AssociationTimeInput.value, 1, AssociationTimeInput, 10000);
    //DissociationTime = parseFloat(DissociationTimeInput.value);
    DissociationTime = CheckValue(DissociationTimeInput.value, 1, DissociationTimeInput, 10000);
    //DissociationInBetweenTime = parseFloat(DissociationInBetweenTimeInput.value);
    DissociationInBetweenTime = CheckValue(DissociationInBetweenTimeInput.value, 1, DissociationInBetweenTimeInput, 5000);
    Parse_kon();
    Parse_kdis();
    //NumberOfCyles = parseFloat(CycleInput.value);
    NumberOfCyles = CheckValue(CycleInput.value, 1, CycleInput, 15);
    //DilutionFactor = parseFloat(DilutionInput.value);
    DilutionFactor = CheckValue(DilutionInput.value, 1, DilutionInput, 100);
    Parse_Conc();
    if (mode == BindingMode.SteadyState) {
        Parse_KD();
    }
    else {
        KD = AffinitySimulation.Calculate_KD(kon, kdis);
    }
    Halflife = AffinitySimulation.Calculate_Halflife(kdis);
}
//parses kon values based on the number and the dropdown to choose the dimension
function Parse_kon() {
    var dimension = 0;
    switch (konDimensionDD.value) {
        case "10E1":
            dimension = 10;
            break;
        case "10E2":
            dimension = 100;
            break;
        case "10E3":
            dimension = 1000;
            break;
        case "10E4":
            dimension = 10000;
            break;
        case "10E5":
            dimension = 100000;
            break;
        case "10E6":
            dimension = 1000000;
            break;
    }
    var interim = CheckValue(konInput.value, 0.1, konInput, 100);
    kon = interim * dimension;
}
//parses kdis values based on the number and the dropdown to choose the dimension
function Parse_kdis() {
    var dimension = 0;
    switch (kdisDimensionDD.value) {
        case "10E-1":
            dimension = 10 ** -1;
            break;
        case "10E-2":
            dimension = 10 ** -2;
            break;
        case "10E-3":
            dimension = 10 ** -3;
            break;
        case "10E-4":
            dimension = 10 ** -4;
            break;
        case "10E-5":
            dimension = 10 ** -5;
            break;
        case "10E-6":
            dimension = 10 ** -6;
            break;
    }
    var interim = CheckValue(kdisInput.value, 0.1, kdisInput, 100);
    kdis = interim * dimension;
}
//parses concentartion values based on the number and the dropdown to choose the dimension
function Parse_Conc() {
    var dimension = 0;
    switch (ConcDimensionDD.value) {
        case "M":
            dimension = 1;
            break;
        case "mM":
            dimension = 10 ** -3;
            break;
        case "µM":
            dimension = 10 ** -6;
            break;
        case "nM":
            dimension = 10 ** -9;
            break;
        case "pM":
            dimension = 10 ** -12;
            break;
        case "fM":
            dimension = 10 ** -15;
            break;
    }
    var interim = CheckValue(ConcInput.value, 0.1, ConcInput, 10000);
    MaximalConcentration = interim * dimension;
}
//parses the KD value in the steady state mode
function Parse_KD() {
    var dimension = 0;
    switch (KDDD.value) {
        case "M":
            dimension = 1;
            break;
        case "mM":
            dimension = 10 ** -3;
            break;
        case "µM":
            dimension = 10 ** -6;
            break;
        case "nM":
            dimension = 10 ** -9;
            break;
        case "pM":
            dimension = 10 ** -12;
            break;
        case "fM":
            dimension = 10 ** -15;
            break;
    }
    var interim = CheckValue(KDInput.value, 0, KDInput, 1000);
    KD = interim * dimension;
}
//Verifies that input is a number. In case its not a min value is returend. If a max value is given and the input is above, the maxvalue is returned
function CheckValue(input, minimum, inputelement, maximum) {
    var interim = parseFloat(input);
    if (Number.isNaN(interim) || interim < minimum) {
        inputelement.value = minimum.toString();
        return minimum;
    }
    else if (maximum != undefined && interim > maximum) {
        inputelement.value = maximum.toString();
        return maximum;
    }
    else {
        return interim;
    }
}
// #endregion
// #region Plot values
// Main function for the display of the graph and values
function Plot_Values() {
    ParseUserInput();
    FillLabels();
    var Result = [];
    if (SteadyStateSwitch.checked == false) {
        if (BindingModeDD.value == "MCK") {
            Result = Plot_MCK();
            DissociationInBetweenTimeInput.disabled = true;
        }
        else {
            Result = Plot_SCK();
            if (DissInBetweenCheck.checked == true) {
                DissociationInBetweenTimeInput.disabled = false;
            }
            else {
                DissociationInBetweenTimeInput.disabled = true;
            }
        }
        if (TitleSwitch.checked == false) {
            ChartTitle = "Simulated Sensorgram";
        }
        Generate_Graph(Result, "Time [s]", "rgba(0,0,255,1)");
    }
    else {
        Result = AffinitySimulation.Simulate_SteadyState(KD, MaximalConcentration);
        DissociationInBetweenTimeInput.disabled = true;
        if (TitleSwitch.checked == false) {
            ChartTitle = "Simulated Steady State Plot";
        }
        Generate_Graph(Result, "Concentration [M]", "crimson");
    }
}
// Generates a simulated MCK dataset
function Plot_MCK() {
    return AffinitySimulation.Simulation_MCK(NumberOfCyles, DilutionFactor, kon, kdis, MaximalConcentration, AssociationTime, DissociationTime);
}
// Generates a simulated SCK dataset
function Plot_SCK() {
    if (DissInBetweenCheck.checked) {
        return AffinitySimulation.Simulation_SCK(NumberOfCyles, DilutionFactor, kon, kdis, MaximalConcentration, AssociationTime, DissociationTime, true, DissociationInBetweenTime);
    }
    else {
        return AffinitySimulation.Simulation_SCK(NumberOfCyles, DilutionFactor, kon, kdis, MaximalConcentration, AssociationTime, DissociationTime);
    }
}
// Changes Halflife and KD labes
function FillLabels() {
    //KD Value calculation
    if (mode != BindingMode.SteadyState) {
        var dimensionKD = 1;
        switch (KDDD.value) {
            case "M":
                dimensionKD = 1;
                break;
            case "mM":
                dimensionKD = 10 ** -3;
                break;
            case "µM":
                dimensionKD = 10 ** -6;
                break;
            case "nM":
                dimensionKD = 10 ** -9;
                break;
            case "pM":
                dimensionKD = 10 ** -12;
                break;
            case "fM":
                dimensionKD = 10 ** -15;
                break;
        }
        var internalKD = formatValue(KD, dimensionKD); //Math.round( (KD / dimensionKD) * 100) / 100;
        KDInput.value = internalKD;
    }
    //
    //Half-life calculation
    var dimensionTime = 0;
    switch (HalflifeDD.value) {
        case "h":
            dimensionTime = 60 * 60;
            break;
        case "min":
            dimensionTime = 60;
            break;
        case "s":
            dimensionTime = 1;
            break;
    }
    var internalHalflife = formatValue(Halflife, dimensionTime); //Math.round( (Halflife / dimensionTime)*100) / 100;
    HalflifeLabel.textContent = internalHalflife.toString();
    //
    //Theta calculation
    var dimensionThetaTime = 0;
    switch (ThetaDD.value) {
        case "h":
            dimensionThetaTime = 60 * 60;
            break;
        case "min":
            dimensionThetaTime = 60;
            break;
        case "s":
            dimensionThetaTime = 1;
            break;
    }
    var internalTheta = formatValue(AffinitySimulation.Theta(kon, kdis, MaximalConcentration), dimensionThetaTime);
    ThetaLabel.textContent = internalTheta.toString();
    //
    //Gibbs energy calculation
    //Devided by 1000 to get kiloJule
    //the time 100 are for two numbers after the komma
    FreeEnergyLabel.textContent = (Math.round(AffinitySimulation.GibbsEnergy(KD) / 1000 * 100) / 100).toString();
    //
    //Theta eq
    ThetaeqLabel.textContent = (Math.round(AffinitySimulation.Thetaeq(KD, MaximalConcentration) * 100) / 100).toString();
    //
}
function formatValue(KD, dimensionKD) {
    const result = KD / dimensionKD;
    if (result >= 1) {
        // For values >= 1, we round to two decimal points
        return (Math.round(result * 100) / 100).toFixed(2);
    }
    else if (result === 0) {
        return "0.0000";
    }
    else {
        // value below 1: Get number of 0 after the komma
        // example: 0.007778 -> log10(0.007778) ≈ -2.108, floor = -3 →  |(-3)| - 1 = 2 instances of 0
        const exponent = Math.floor(Math.log10(result));
        const leadingZeros = Math.abs(exponent) - 1;
        // Atleast four values with numbers
        const decimals = leadingZeros + 4;
        const factor = Math.pow(10, decimals);
        return (Math.round(result * factor) / factor).toFixed(decimals);
    }
}
// #endregion
