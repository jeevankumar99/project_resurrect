
// Yet to fetch and add realtime data
class IndexStocks extends React.Component {
	render () {
		return (
			<div className="index-stocks-container">
				<div className="index-stocks" id="index-NSE">NSE</div>
				<div className="index-stocks" id="index-BSE">BSE</div>
			</div>
		)
	}
}

// Table Row Component (each stock in the popular's table)
class PopularStockData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			symbol: this.props.stock.symbol,
			price: this.props.stock.regularMarketPrice,
			marketChange: this.props.stock.regularMarketChange,
			marketChangePercent: this.props.stock.regularMarketChangePercent,
			marketOpen: this.props.stock.regularMarketOpen,
			dayHigh: this.props.stock.regularMarketDayHigh,
			dayLow: this.props.stock.regularMarketDayLow,
			previousClose: this.props.stock.regularMarketPreviousClose
		}

		// To change the color depending on rise and fall of price.
		if (this.state.price > this.state.marketOpen) {
			this.priceColor = "green";
		}
		else {
			this.priceColor = "red";
		}
	}

	render () {
		return (
			<tr className="table-row-data">
				<td className="table-data" className="table-symbol">{this.state.symbol}</td>
				<td className="table-data" className="table-price"><font color={this.priceColor}>$ {this.state.price}</font></td>
				<td className="table-data" className="table-change">$ {this.state.marketChange} / {this.state.marketChangePercent} %</td>
				<td className="table-data" className="table-open">$ {this.state.marketOpen}</td>
				<td className="table-data" className="table-high">$ {this.state.dayHigh}</td>
				<td className="table-data" className="table-low">$ {this.state.dayLow}</td>
				<td className="table-data" className="table-close">$ {this.state.previousClose}</td>
			</tr>
		)
	}
}


// For headers. Static data as of now, we'll update after we get unlimited API requests
class PopularStockTable extends React.Component {
	
	render() {
		return (
			<table id="popular-stocks-table">
			<tr id="all-table-headers">
				<th className="table-headers" id="table-symbol">Symbol</th>
				<th className="table-headers" id="table-price">Market Price</th>
				<th className="table-headers" id="table-change">Market Change</th>
				<th className="table-headers" id="table-open">Market Open</th>
				<th className="table-headers" id="table-high">Day High</th>
				<th className="table-headers" id="table-low">Day Low</th>
				<th className="table-headers" id="table-close">Previous Close</th>
			</tr>
			<tbody>
				{this.props.stocksData}
			</tbody>
			</table>
		)
	}
}

// Render the BSE and NSE indexes, no realtime data added yet.
ReactDOM.render(<IndexStocks/>, document.querySelector('#main-indexes'));

// To request the Stock's data only once to keep within the request limit
if (!localStorage.getItem('indexStocks')) {
	fetch("https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote/marketSummary?lang=en&region=IN", {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b",
		"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
	}
})
.then(response => response.json())
.then(data => {
	// Store the retrieved data locally in the browser.
	localStorage.setItem('indexStocks', JSON.stringify(data));
	console.log(data);
})
.catch(err => {
	console.error(err);
});
}

// If data is already stored locally, take it from there.
else {
	let indexStocks = localStorage.getItem('indexStocks');
	indexStocks = JSON.parse(indexStocks);
	indexStocks.marketSummaryResponse.result.slice(0, 2).forEach(element => {
		console.log(element)		
	});
}


// Same as above, retieve data only once.
if (!localStorage.getItem('popularStocks')) {
	fetch("https://yahoo-finance-low-latency.p.rapidapi.com/ws/screeners/v1/finance/screener/predefined/saved?scrIds=day_gainers&count=25", {
		"method": "GET",
		"headers": {
			"x-rapidapi-key": "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b",
			"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
		}
	})

	// decode the response to a useable format
	.then(response => response.json())
	
	// Process the received data
	.then(data => {
		
		// convert json to string to store locally.
		localStorage.setItem('popularStocks', JSON.stringify(data));
		console.log(data.finance.result[0].quotes);

		// render tables with data.
		let popularStockList = []
		data.finance.result[0].quotes.forEach(stock => {
		popularStockList.push(<PopularStockData key={stock.symbol} stock={stock}/>)
	})

	ReactDOM.render(<PopularStockTable stocksData={popularStockList}/>, document.querySelector('#popular-stocks'));
	})
	.catch(err => {
		console.error(err);
	});
}

// Same as above, use local data if avaiable.
else {
	let popularStocks = localStorage.getItem('popularStocks');
	
	// parse the locally stored stringified data to json
	popularStocks = JSON.parse(popularStocks);
	console.log(popularStocks.finance);

	// render tables with the data.
	let popularStockList = []
	popularStocks.finance.result[0].quotes.forEach(stock => {
		popularStockList.push(<PopularStockData key={stock.symbol} stock={stock}/>)
	})
	ReactDOM.render(<PopularStockTable stocksData={popularStockList}/>, document.querySelector('#popular-stocks'));
}

