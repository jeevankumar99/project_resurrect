
google.charts.load('current', {'packages': ['corechart', 'table']});

var symbol = String(window.location.pathname).slice(7, );
var chartColor;

ReactDOM.render(<StockInfo symbol={symbol}/>, document.querySelector('#stock-info'));


fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v8/finance/spark?symbols=${symbol}&interval=1d&range=1wk`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": API_KEY,
		"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
	}
})
.then(response => response.json())
.then(data => {
    var chartData = [[{label:'Month', type: 'date'}, {label:'Price', type: 'number'}]];
    let currentDataPoint;
    for (let i=0; i < 5; i++) {
        console.log(data[symbol].timestamp[i])
        var stockDate = new Date(data[symbol].timestamp[i] * 1000);
        console.log(stockDate.getDate())
        currentDataPoint = [stockDate, data[symbol].close[i]]
        chartData.push(currentDataPoint)
    }
    data[symbol].close[4] < data[symbol].close[3] ? 
        (chartColor = "rgb(100, 25, 10)") : (chartColor = 'rgb(80, 100, 10)');
    console.log(chartData)
    google.charts.setOnLoadCallback(() => drawChart(chartData))
})


function drawChart(chartData) {
    // var data = google.visualization.arrayToDataTable([
    //     ['Month', 'Price', {type: 'string', role: 'tooltip'}],
    //     ['Jan', 360, '$300'],
    //     ['Feb', 310, '$310'],
    //     ['Mar', 320, '$330'],
    //     ['Apr', 370, '$302'], 
    //     ['May', 390, '$280'], 
    //     ['June', 340, '$310'],
    //     ['July', 302, '$302'],
    //     ['Aug', 280, '$330'],
    //     ['Sep', 350, '$350'], 
    //     ['Oct', 360, '$390'],
    //     ['Nov', 420, '$420'],
    //     ['Dec', 400, '$360']
    // ]);

    // var tempData = [['Month', 'Price', {type: 'string', role: 'tooltip'}],
    // ['Jan', 360, '$300'],
    // ['Feb', 310, '$310'],
    // ['Mar', 320, '$330'], 
    // ['Apr', 370, '$302'], 
    // ['May', 390, '$280'], 
    // ['June', 340, '$310'],
    // ['July', 302, '$302'],
    // ['Aug', 280, '$330'],
    // ['Sep', 350, '$350'], 
    // ['Oct', 360, '$390'],
    // ['Nov', 420, '$420'],
    // ['Dec', 400, '$360']]

     console.log(chartData)

    var data = google.visualization.arrayToDataTable(chartData)


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
        chartArea: {left: 100, width: '80%', height: '80%'},
        width: '90%',
        crosshair: {trigger: 'both'},
        colors: [chartColor],
        backgroundColor: {
            fill: 'rgb(18, 18, 18)',
            stroke: 'white',
            strokeWidht: 10 
        },
        hAxis: {
            textStyle: {color: 'gray'},
            gridlines: {
                count: 4,
                units: {
                    days: {format: 'MMM d'}
                }
            },
            minorGridlines: {
                count: 4,
            }
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

