
// Yet to fetch and add realtime data
class IndexStocks extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			BSEsymbol: this.props.BSEdata.symbol,
			BSEexchangeTimezoneShortName: this.props.BSEdata.exchangeTimezoneShortName,
			BSEquoteType: this.props.BSEdata.quoteType,
			BSEmarketPrice: this.props.BSEdata.regularMarketPrice.raw.toFixed(2),
			BSEmarketChange: this.props.BSEdata.regularMarketChange.raw.toFixed(2),
			BSEmarketChangePercent: this.props.BSEdata.regularMarketChangePercent.fmt,
			BSEmarketPreviousClose: this.props.BSEdata.regularMarketPreviousClose.raw,
			NSEsymbol: this.props.NSEdata.symbol,
			NSEexchangeTimezoneShortName: this.props.NSEdata.exchangeTimezoneShortName,
			NSEquoteType: this.props.NSEdata.quoteType,
			NSEmarketPrice: this.props.NSEdata.regularMarketPrice.raw.toFixed(2),
			NSEmarketChange: this.props.NSEdata.regularMarketChange.raw.toFixed(2),
			NSEmarketChangePercent: this.props.NSEdata.regularMarketChangePercent.fmt,
			NSEmarketPreviousClose: this.props.NSEdata.regularMarketPreviousClose.raw,
		}
		if (this.state.BSEmarketChange < 0) {
			this.BSEpriceColor = "red";
		}
		else {
			this.BSEpriceColor = "green";
		}
		(this.state.NSEmarketChange < 0) ? (this.NSEpriceColor = "red") : (this.NSEpriceColor = "green");
		(this.state.NSEmarketPreviousClose > this.state.NSEmarketPrice) ? (this.NSEprevColor = "rgb(0, 88, 0)") : (this.NSEprevColor = "rgb(146, 1, 1)");
		(this.state.BSEmarketPreviousClose > this.state.BSEmarketPrice) ? (this.BSEprevColor = "rgb(0, 88, 0)") : (this.BSEprevColor = "rgb(146, 1, 1)");
	}
	render () {
		return (
			<table id="main-indexes-table">
				<thead>
				<tr className="big-row">
					<td onClick={() => window.location.href = 'stock/BSE'} id="BSE-symbol">{this.state.BSEsymbol}</td>
					<td id="BSE-market-price">{this.state.BSEmarketPrice}</td>
					<td id="BSE-market-close" style={{color: this.BSEprevColor}}>{this.state.BSEmarketPreviousClose}</td>
					<td onClick={() => window.location.href = 'stock/NSE'} id="NSE-symbol">{this.state.NSEsymbol}</td>
					<td id="NSE-market-price">{this.state.NSEmarketPrice}</td>
					<td id="NSE-market-close" style={{color: this.NSEprevColor}}>{this.state.NSEmarketPreviousClose}</td>
				</tr>
				</thead>
				<tbody>
				<tr className="small-row">
					<td id="BSE-lower-symbol">{this.state.BSEquoteType} | {this.state.BSEexchangeTimezoneShortName}</td>
					<td id="BSE-market-change"><font color={this.BSEpriceColor}>{this.state.BSEmarketChange} ({this.state.BSEmarketChangePercent})</font></td>
					<td id="BSE-lower-close">Previous market close</td>
					<td id="NSE-lower-symbol">{this.state.NSEquoteType} | {this.state.NSEexchangeTimezoneShortName}</td>
					<td id="NSE-market-change"><font color={this.NSEpriceColor}>{this.state.NSEmarketChange} ({this.state.NSEmarketChangePercent})</font></td>
					<td id="NSE-lower-close">Previous market close</td>
				</tr>
				</tbody>
			</table>
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

	// PASS CSRF COOKIES ---NOT SECURE---
	addToWatchlist = function(event) {
		event.stopPropagation();
		console.log("Added to watchlist dummy!")
		fetch("/add_watchlist", {
			method: "POST", 
			body: JSON.stringify({
				stockSymbol: this.state.symbol
			}),
		})
		console.log("request sent!")
	}

	render () {
		return (
			<tr onClick={() => window.location.href = `stock/${this.state.symbol}`} className="table-row-data">
				<td className="table-data" className="table-symbol">
					{this.state.symbol}
					<button onClick={event => this.addToWatchlist(event)} className="watchlist-button">Watch</button>
				</td>
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
				<thead>
					<tr id="all-table-headers">
						<th className="table-headers" id="table-symbol">Symbol</th>
						<th className="table-headers" id="table-price">Market Price</th>
						<th className="table-headers" id="table-change">Market Change</th>
						<th className="table-headers" id="table-open">Market Open</th>
						<th className="table-headers" id="table-high">Day High</th>
						<th className="table-headers" id="table-low">Day Low</th>
						<th className="table-headers" id="table-close">Previous Close</th>
					</tr>
				</thead>
				<tbody>
					{this.props.stocksData}
				</tbody>
			</table>
		)
	}
}

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
	console.log(data)	
	// Store the retrieved data locally in the browser.
	localStorage.setItem('indexStocks', JSON.stringify(data));
})
.catch(err => {
	console.error(err);
});
}

// If data is already stored locally, take it from there.
else {
	let indexStocks = localStorage.getItem('indexStocks');
	indexStocks = JSON.parse(indexStocks);
	// Render the BSE and NSE indexes, no realtime data added yet.
ReactDOM.render(
	<IndexStocks 
		BSEdata={indexStocks.marketSummaryResponse.result[0]}
		NSEdata={indexStocks.marketSummaryResponse.result[1]}
	/>, document.querySelector('#main-indexes'));
	console.log(indexStocks.marketSummaryResponse.result[0]);
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


