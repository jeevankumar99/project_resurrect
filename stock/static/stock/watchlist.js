
// Get all stocks added to user's watchlist from database.
fetch('/get_watchlist')
.then(response => response.json())
.then(data => {
    console.log(data);    
    let serializedStockList = []
    let formatted_data = []
    
    // Yahoo accepts ONLY upto 10 stock queries in one request.
    // Splits watchlist into arrays containg upto 10 stocks.
    if (data.length > 10) {
        while (data.length > 0) {
            formatted_data.push(data.splice(0, 10))
        }
    }

    // Add stocks in a (AAPL,TSLA,MRSFT) format to get quotes
    formatted_data.forEach(chunksOfTen => {
        let serializedStocks = '';
        chunksOfTen.forEach((stock, key, stocks) => {
            if (key === stocks.length - 1) {
                serializedStocks = serializedStocks + stock.symbol;
            }
            else {
                serializedStocks = serializedStocks + `${stock.symbol}%2C`;
            }
        });
        serializedStockList.push(serializedStocks);
    })

    // Watchlist won't update to avoid API overuse. Just to test styling.
    if (!localStorage.getItem('watchlistStockData')) {
        let watchlistStockList = [], cacheWatchlistStocks = [], requests = []
        
        // To create promise objects for Promise.all
        serializedStockList.forEach(chunksOfTen => {
            requests.push(fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?symbols=${chunksOfTen}`, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b",
                    "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
                }
            }))
        }) 

        // Wait for all promises to complete before proceeding
        Promise.all(requests)

            // accepts all response objects and converts it to json for processing.
            .then(responses => Promise.all(responses.map(response => response.json())))
            
            // Populate table rows with json data and store them locally.
            .then(data => {
                console.log(data)
                data.forEach(chunksOfTen => {
                    chunksOfTen.quoteResponse.result.forEach(stock => {
                        watchlistStockList.push(<PopularStockData key={stock.symbol} stock={stock} />)
                        cacheWatchlistStocks.push(stock)
                    })
                })
            })

            // Render the entire table with populated data.
            .then(() => {
                localStorage.setItem('watchlistStockData', JSON.stringify(cacheWatchlistStocks))
                ReactDOM.render(<PopularStockTable stocksData={watchlistStockList} />, document.querySelector('#watchlist-stocks'));
            })
    }
        
    else {
        
        // Get locally stored data and parse it.
        let watchlistStocks = localStorage.getItem('watchlistStockData');
        watchlistStocks = JSON.parse(watchlistStocks);
        
        // Populate row data into table
        let watchlistStockList = []
        watchlistStocks.forEach(stock => {
            watchlistStockList.push(<PopularStockData key={stock.symbol} stock={stock}/>)
        })

        // Render entire table.
        ReactDOM.render(<PopularStockTable stocksData={watchlistStockList}/>, document.querySelector('#watchlist-stocks'))
    }
})

