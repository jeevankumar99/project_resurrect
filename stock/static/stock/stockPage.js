
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Month', 'Price', {type: 'string', role: 'tooltip'}],
        ['Jan', 360, '$300'],
        ['Feb', 310, '$310'],
        ['Mar', 320, '$330'], 
        ['Apr', 370, '$302'], 
        ['May', 390, '$280'], 
        ['June', 340, '$310'],
        ['July', 302, '$302'],
        ['Aug', 280, '$330'],
        ['Sep', 350, '$350'], 
        ['Oct', 360, '$390'],
        ['Nov', 420, '$420'],
        ['Dec', 400, '$360']
    ]);

    var options = {
        title: 'Stock price',
        titleTextStyle: {color: 'white'},
        legend: {
            position: 'bottom',
            textStyle: {color: 'white'}
        },
        animation: {
            duration: 1000,
            easing: 'out',
            startup: true
        },
        crosshair: {trigger: 'both'},
        colors: ['rgb(80, 100, 10)'],
        backgroundColor: {
            fill: 'rgb(18, 18, 18)',
            stroke: 'white',
            strokeWidht: 10 
        },
        hAxis: {
            textStyle: {color: 'gray'},
        },
        pointSize: 10,
        vAxis: {
            textStyle: {color: 'gray'},
            format: 'currency',
            gridlines: {color: 'rgb(70, 70, 70)'},
        },
    };

    var chart = new google.visualization.AreaChart(document.querySelector('#stock-chart'));

    chart.draw(data, options);

}

