fetch('/get_portfolios')
.then(response => response.json())
.then(data => {
        
    let listOfTenStockSymbols = []
    let tenStockSymbols = '';

    // Yahoo accepts ONLY upto 10 stock queries in one request.
    // Splits watchlist into arrays containg upto 10 stocks.
    if (data.length < 1) {
        let emptyWatchlist = document.createElement('h3');
        emptyWatchlist.innerHTML = "Stocks that you watch will be displayed here.";
        document.querySelector('#watchlist-stocks').appendChild(emptyWatchlist);
    }

    else {
        if (data.length > 10) {
            while (data.length > 0) {
                formattedData.push(data.splice(0, 10))
            }
            // Add stocks in a (AAPL,TSLA,MRSFT) format to get quotes
            formattedData.forEach(chunksOfTen => {
                chunksOfTen.forEach((stock, key, stocks) => {
                    if (key === stocks.length - 1) {
                        tenStockSymbols = tenStockSymbols + stock.symbol;
                    }
                    else {
                        tenStockSymbols = tenStockSymbols + `${stock.symbol}%2C`;
                    }
                });
                listOfTenStockSymbols.push(tenStockSymbols);
            })
        }
        else {
            data.forEach((stock, key, stocks) => {
                if (key === stocks.length - 1) {
                    tenStockSymbols = tenStockSymbols + stock.symbol;
                }
                else {
                    tenStockSymbols = tenStockSymbols + `${stock.symbol}%2C`;
                }
            })
            listOfTenStockSymbols.push(tenStockSymbols)
        }

        // Start requests
        var requests = [];
        // To create promise objects for Promise.all
        listOfTenStockSymbols.forEach(chunksOfTen => {
            requests.push(fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?symbols=${chunksOfTen}`, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b",
                    "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
                }
            }))
        }) 
        console.log(requests)

        // Wait for all promises to complete before proceeding
        Promise.all(requests)

            // accepts all response objects and converts it to json for processing.
            .then(responses => Promise.all(responses.map(response => response.json())))
            
            // Populate table rows with json data and store them locally.
            .then(liveData => {
                console.log(liveData)
                for (let i = 0; i < data.length; i++) {
                    data[i].currentPrice = liveData[0].quoteResponse.result[i].regularMarketPrice;
                    data[i].longName = liveData[0].quoteResponse.result[i].longName;
                }
                ReactDOM.render(<PortfolioStockTable portfolios={data} />, document.querySelector('#portfolio-stocks'));
            });

    }
})
