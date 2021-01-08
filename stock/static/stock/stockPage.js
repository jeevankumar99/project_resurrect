
// load google charts
google.charts.load('current', {'packages': ['corechart', 'table']});

// get stock symbol from url bar.
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

    // X-axis, Y-axis labels for the chart.
    var chartData = [[{label:'Month', type: 'date'}, {label:'Price', type: 'number'}]];
    let currentDataPoint;
    
    // Add timestamps to the chartData.
    for (let i=0; i < 5; i++) {
        console.log(data[symbol].timestamp[i])
        var stockDate = new Date(data[symbol].timestamp[i] * 1000);
        console.log(stockDate.getDate())
        currentDataPoint = [stockDate, data[symbol].close[i]]
        chartData.push(currentDataPoint)
    }

    // If stock price is dropping make chart red color
    data[symbol].close[4] < data[symbol].close[3] ? 
        (chartColor = "rgb(100, 25, 10)") : (chartColor = 'rgb(80, 100, 10)');
    
    // Assign callback function for the chart.
    google.charts.setOnLoadCallback(() => drawChart(chartData))
})

// For stock news.
fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v2/finance/news?symbols=${symbol}`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": API_KEY,
		"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
	}
})
.then(response => response.json())
.then(data => {

    // Display top 9 articles.
    let slicedData = data.Content.result.slice(0, 9);
    ReactDOM.render(<StockNewsParent newsChildren={slicedData} />, document.querySelector('#stock-news'));
})


function drawChart(chartData) {
    var data = google.visualization.arrayToDataTable(chartData)
    
    // Options object for the chart.
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

    // to render the chart in selected div.
    var chart = new google.visualization.AreaChart(document.querySelector('#stock-chart'));

    // draw the chart with the given data and options.
    chart.draw(data, options);

}

