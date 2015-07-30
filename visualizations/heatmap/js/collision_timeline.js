function collisionTimeline() {
    var context = document.getElementById('line-chart').getContext("2d");

    var data = {
        labels: ["2003", "2004", "2005", "2006", "2007", "2008", "2009"],
        datasets: [{
            label: "Collisions",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        }]
    };

    var options = {};

    var myLineChart = new Chart(context).Line(data, options);
}

