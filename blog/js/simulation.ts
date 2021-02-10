function Simulation(id) {
    let el = document.getElementById(id);
    this.el = el;

    this.applyStyle();
    console.log("sim constructor", self);
}

Simulation.prototype.applyStyle = function () {
    console.log("sim style", self);
    this.el.style.backgroundColor = "red";
}


Simulation.prototype.start = function() {
    console.log("sim starting");
}

