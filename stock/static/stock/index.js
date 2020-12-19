

// To request the Stock's data only once to keep within the request limit
if (!localStorage.getItem('indexStocks')) {
	fetch("https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote/marketSummary?lang=en&region=IN", {
		"method": "GET",
		"headers": {
			"x-rapidapi-key": API_KEY,
			"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
		}
	})
	.then(response => response.json())
	.then(data => {
		console.log(data)	
		// Store the retrieved data locally in the browser.
		localStorage.setItem('indexStocks', JSON.stringify(data));
		// Render the BSE and NSE indexes, no realtime data added yet.
		ReactDOM.render(
			<IndexStocks 
				BSEdata={data.marketSummaryResponse.result[0]}
				NSEdata={data.marketSummaryResponse.result[1]}
			/>, document.querySelector('#main-indexes'));
		console.log(data.marketSummaryResponse.result[0]);
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
			"x-rapidapi-key": API_KEY,
			"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
		}
	})

	// decode the response to a useable format
	.then(response => response.json())
	
	// Process the received data
	.then(data => {

		console.log("Using new data")
		
		// convert json to string to store locally.
		localStorage.setItem('popularStocks', JSON.stringify(data));
		console.log(data.finance.result[0].quotes);

		// render tables with data.
		let popularStockList = []
		data.finance.result[0].quotes.forEach(stock => {
			stock.isWatchlistPage = false;
			popularStockList.push(stock)
		})
		ReactDOM.render(<PopularStockTable stocksData={popularStockList}/>, document.querySelector('#popular-stocks'));
	})
	.catch(err => {
		console.error(err);
	});
}

// Same as above, use local data if avaiable.
else {
	console.log("using old data")
	let popularStocks = localStorage.getItem('popularStocks');
	
	// parse the locally stored stringified data to json
	popularStocks = JSON.parse(popularStocks);
	console.log(popularStocks.finance);

	// render tables with the data.
	let popularStockList = []
	popularStocks.finance.result[0].quotes.forEach(stock => {
		popularStockList.push(stock)
	})

	ReactDOM.render(<PopularStockTable stocksData={popularStockList} />, document.querySelector('#popular-stocks'))

}




