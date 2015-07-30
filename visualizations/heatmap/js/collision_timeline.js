function CollisionTimeline(baseUrl, getBoundingBox) {

    var labels = ["2003", "2004", "2005", "2006", "2007", "2008", "2009"];
    var points = [    65,     59,     80,     81,     56,     55,     40];
    render(labels, points);

    var labels = ["2003", "2004", "2005", "2006", "2007", "2008", "2009"];
    var points2 = [    30,     60,     30,     60,     30,     60,     30];
    render(labels, points2);

    function render(labels, points) {

        var context = document.getElementById('line-chart').getContext("2d");

        var data = {
            labels: labels,
            datasets: [{
                label: "Collisions",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: points
            }]
        };
        var options = {};

        // Is it ok to just keep overriding this? Do we need to blow away the existing one first?  //
        var myLineChart = new Chart(context).Line(data, options);
    }
}

