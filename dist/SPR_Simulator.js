"use strict";
var AffinitySimulation;
(function (AffinitySimulation) {
    /*
    Glossar
    - ka is the association rate constant.
    - kd is the dissociation rate constant.
    - Rmax represents the calculated maximum achievable binding for an analyte to a given level of immobilized ligand on the biosensor surface
    - AnalyteConc refers to the provided concentration of the analyte in solution.
    - kobs is the observed rate constant reflecting the overall rate of the combined association and dissociation of the two binding partner
    - Y0 (in association phase) is the fitted nm shift from zero (the initial Y value) assimilated to noise, or the initial Y binding level of the fitted association curve.
    - Ye (in dissociation phase) is the fitted value that the exponential decay curve will eventually approach to.
    - Theta is the required to equilibrium given a concentration and kinetic values
    */
    // #region Calculate Basic affinity values
    //Calculates the KD value based on kon and kdis
    function Calculate_KD(kon, kdis) {
        return kdis / kon;
    }
    AffinitySimulation.Calculate_KD = Calculate_KD;
    //calculates the Halflife based on kdis
    function Calculate_Halflife(kdis) {
        return Math.LN2 / kdis;
    }
    AffinitySimulation.Calculate_Halflife = Calculate_Halflife;
    // #endregion
    // #region Main Functions
    //Main function for the full simulation of MCK experiments
    function Simulation_MCK(cycles, dilutionfactor, kon, kdis, maxconc, AssociationTime, DissociationTime) {
        //creates empty dataset
        var dataset = [];
        //Loops through al cycles that are defined as input
        for (let i = 0; i < cycles; i++) {
            //In each cycle a Binding simulation is done (Association and Disscoaition). The dilution factor is inlcudes. Later cycles have higher dilutions
            var set = Generate_Binding_Simulation_MCK(kon, kdis, maxconc * (1 / dilutionfactor) ** (i), AssociationTime, DissociationTime);
            //The current dataset is added to the final dataset
            dataset = dataset.concat(set);
        }
        //Final dataset is returned
        return dataset;
    }
    AffinitySimulation.Simulation_MCK = Simulation_MCK;
    //Main function for the full simulation of SCK experiments
    function Simulation_SCK(associaction_cycles, dilutionfactor, kon, kdis, maxconc, AssociationTime, DissociationTime, DissociationInBetween = false, DissociationInBetweenTime) {
        //An empty dataset is created
        var dataset = [];
        //
        //Associations
        //
        //Loops through the number of associations
        for (let i = 0; i < associaction_cycles; i++) {
            //The Y0 value, the value at which the association curve starts is either the value in the current dataset or 0
            var lastValue = dataset.length > 0 ? dataset[dataset.length - 1] : 0;
            //The association curve is calculated. The dilution factor is inlcudes. Later cycles have higher dilutions
            var Association_Y_Values = Calculate_AssociationCurve(kon, kdis, maxconc * (1 / dilutionfactor) ** (associaction_cycles - i), AssociationTime, lastValue);
            //The association curve is added to the dataset
            dataset = dataset.concat(Association_Y_Values);
            //In case disscoaition between associations is activated, a dissociation curve is simulated
            if (DissociationInBetween == true && DissociationInBetweenTime != undefined && i != associaction_cycles - 1) {
                //The dissociation curve is added to the dataset
                //The start of the dissociation (Ye) is the last value in the dataset
                dataset = dataset.concat(Calculate_DissociationCurve(dataset[dataset.length - 1], kdis, DissociationInBetweenTime));
            }
        }
        //
        //Dissociation
        //
        //On main dissociation curve is simulated and added to the dataset
        dataset = dataset.concat(Calculate_DissociationCurve(dataset[dataset.length - 1], kdis, DissociationTime));
        //based on the number of "setps" (association and dissociation) the timeframe of the simulation changes. This is calculated here and the datasets that can be plotted are generated
        if (DissociationInBetween == true && DissociationInBetweenTime != undefined) {
            return Generate_Datasets(dataset, 0, (AssociationTime * associaction_cycles) + (DissociationInBetweenTime * associaction_cycles - 1) + DissociationTime);
        }
        else {
            return Generate_Datasets(dataset, 0, AssociationTime * associaction_cycles + DissociationTime);
        }
    }
    AffinitySimulation.Simulation_SCK = Simulation_SCK;
    //Main function to simulate Steady State kinetics
    function Simulate_SteadyState(KD, conc, numberOfDatapoints) {
        //defines how many datapoints should be calculated. If nothing is stated, its 1000
        if (numberOfDatapoints == undefined) {
            numberOfDatapoints = 1000;
        }
        //creates empty dataset
        var xyValues = [];
        //loops over the number of datapoints
        for (let i = 0; i < numberOfDatapoints; i++) {
            //steady state plaots Req values in dependence of the conc. the conc. is calculates based on the number of datapoints, with the last datapoint (= number ofDatapoints) beeing exactly the provded conc. value
            var datapoint = Calculate_Req_SteadyState(KD, conc * (i / numberOfDatapoints));
            //Adds values to the dataset
            xyValues.push({ x: conc * (i / numberOfDatapoints), y: datapoint });
        }
        return xyValues;
    }
    AffinitySimulation.Simulate_SteadyState = Simulate_SteadyState;
    // #endregion
    // #region MCK Submethods
    //Calcuclates a single curve of an MCK
    function Generate_Binding_Simulation_MCK(kon, kdis, conc, AssociationTime, DissociationTime) {
        //Calcuclates Association curve
        var Association_Y_Values = Calculate_AssociationCurve(kon, kdis, conc, AssociationTime);
        //Calculates dissociation curve. The start of the dissociation (Ye) is the last value in the association curve
        var Dissociation_Y_Values = Calculate_DissociationCurve(Association_Y_Values[AssociationTime - 1], kdis, DissociationTime);
        //Creates plottable datasets of both curves
        var datasetAssCurve = Generate_Datasets(Association_Y_Values, 0, AssociationTime);
        var datasetDissCurve = Generate_Datasets(Dissociation_Y_Values, AssociationTime, AssociationTime + DissociationTime);
        //combine both datasets into one and returns it
        return datasetAssCurve.concat(datasetDissCurve);
    }
    // #endregion
    // #region Association
    //Calculates the Req value based on kinetic parameters
    function Calculate_Req(kon, kdis, AnalyteConc, Rmax) {
        //if no Rmax is given, 100 is used (100% or Rmax)
        if (Rmax == undefined) {
            Rmax = 100;
        }
        return Rmax * ((kon * AnalyteConc) / (kon * AnalyteConc + kdis));
    }
    //Calculates the Req value based on KD value
    function Calculate_Req_SteadyState(KD, AnalyteConc, Rmax) {
        //if no Rmax is given, 100 is used (100% or Rmax)
        if (Rmax == undefined) {
            Rmax = 100;
        }
        return Rmax / (1 + KD / AnalyteConc);
    }
    //Calcuclates the kobs value
    function Calculate_kobs(kon, kdis, AnalyteConc) {
        return kon * AnalyteConc + kdis;
    }
    //Calculates an association curve. Agnostic of SCK or MCK
    function Calculate_AssociationCurve(kon, kdis, AnalyteConc, timeframe, YO) {
        //if no Y= is given, the curve starts at 0. For SCK, association curvs start where the previous one ended
        if (YO == undefined) {
            YO = 0;
        }
        //Creates empty dataset
        var assosication_curve = [];
        //calculates Req and kobs values
        var Req = Calculate_Req(kon, kdis, AnalyteConc);
        var kobs = Calculate_kobs(kon, kdis, AnalyteConc);
        //loops over the association time, one second after on another
        for (let i = 0; i < timeframe; i++) {
            //the signal (Y value) at that specific time is calculates
            var datapoint = YO + Req * (1 - Math.E ** (-kobs * i));
            //Assuming the Rmax value is 100, no vlaues above 100 can be generted, as the ligand is saturated with analyte
            //option to keep values at 100% maximal value!
            //If value is above 100, is nudged to 100
            var datapoint = datapoint < 100 ? datapoint : 100;
            //The datapoint is added to the dataset
            assosication_curve.push(datapoint);
        }
        return assosication_curve;
    }
    // #endregion
    // #region Disscoiation
    //Calculates a dissociation curve, agnostic of MCK or SCK
    function Calculate_DissociationCurve(Ye, kdis, timeframe) {
        //Create empty dataset
        var disscoiation_curve = [];
        //loops over the dissociation time, second by second
        for (let i = 0; i < timeframe; i++) {
            //a datapoint is calculates based on input values...
            var datapoint = Ye * Math.E ** (-kdis * i);
            //...and added to the dataset
            disscoiation_curve.push(datapoint);
        }
        return disscoiation_curve;
    }
    // #endregion
    // #region Theta - Time to equilibrium
    //Calculates time required to reach the equilibrium at a given concentration
    function Theta(kon, kdis, conc, theta) {
        //Rmax is 100%, so Theta 0.95 is the time required to reach a 95% equilibrium
        if (theta == undefined) {
            theta = 0.9;
        }
        return (-Math.log(1 - theta)) / (kon * conc + kdis);
    }
    AffinitySimulation.Theta = Theta;
    // #endregion
    // #region Gibbs energy
    function GibbsEnergy(KD) {
        var R = 8.314; //gas constant in J/mol*k
        var T = 298.15; //25°C in Kelvin
        var Co = 1; // standard state concentration (i.e. 1 M)
        return R * T * Math.log(KD / Co);
    }
    AffinitySimulation.GibbsEnergy = GibbsEnergy;
    // #endregion
    // #region Theta eq
    function Thetaeq(KD, conc) {
        return (conc) / (KD + conc);
    }
    AffinitySimulation.Thetaeq = Thetaeq;
    //based on a array with Y values, the dataset for plotting is created
    function Generate_Datasets(curve, start, end) {
        //creates empty dataset
        var xyValues = [];
        //counter
        var count = 0;
        //performes loop from start to end points
        for (let i = start; i < end; i++) {
            //the dataset is added the x vlaue (a point between start end end) and a value of the array based on the number of iterations
            // The number of iterations is derived from the counter calue
            xyValues.push({ x: i, y: curve[count] });
            count++;
        }
        return xyValues;
    }
    // #endregion
})(AffinitySimulation || (AffinitySimulation = {}));
