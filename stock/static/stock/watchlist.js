
// Get all stocks added to user's watchlist from database.
fetch('/get_watchlist')
.then(response => response.json())
.then(data => {
    console.log(data);    
    let serializedStockList = []
    let serializedStocks = '';
    let formatted_data = []
    
    // Yahoo accepts ONLY upto 10 stock queries in one request.
    // Splits watchlist into arrays containg upto 10 stocks.
    if (data.length < 1) {
        let emptyWatchlist = document.createElement('h3');
        emptyWatchlist.innerHTML = "Stocks that you watch will be displayed here.";
        document.querySelector('#watchlist-stocks').appendChild(emptyWatchlist);
    }

    else {

        // if watchlist is over 10 stocks, split them into chunks
        if (data.length > 10) {
            while (data.length > 0) {
                formatted_data.push(data.splice(0, 10))
            }
            // Add stocks in a (AAPL,TSLA,MRSFT) format to get quotes
            formatted_data.forEach(chunksOfTen => {
                chunksOfTen.forEach((stock, key, stocks) => {

                    // if stock is the last in the list dont add comma
                    if (key === stocks.length - 1) {
                        serializedStocks = serializedStocks + stock.symbol;
                    }
                    
                    // else add a comma after every stock. %2C is comma.
                    else {
                        serializedStocks = serializedStocks + `${stock.symbol}%2C`;
                    }
                });
                serializedStockList.push(serializedStocks);
            })
        }

        // if fewer than 10, send the requests as is.
        else {
            data.forEach((stock, key, stocks) => {

                // avoid comma for last stock
                if (key === stocks.length - 1) {
                    serializedStocks = serializedStocks + stock.symbol;
                }

                // add comma after every stock
                else {
                    serializedStocks = serializedStocks + `${stock.symbol}%2C`;
                }
            })
            serializedStockList.push(serializedStocks)
        }

        // Watchlist won't update to avoid API overuse. Just to test styling.
        if (!localStorage.getItem('watchlistStockData')) {
            let watchlistStockList = [];
            var requests = [];
            
            console.log(serializedStockList)

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
            console.log(requests)

            // Wait for all promises to complete before proceeding
            Promise.all(requests)

                // accepts all response objects and converts it to json for processing.
                .then(responses => Promise.all(responses.map(response => response.json())))
                
                // Populate table rows with json data and store them locally.
                .then(data => {
                    console.log(data)
                    data.forEach(chunksOfTen => {
                        chunksOfTen.quoteResponse.result.forEach(stock => {
                            stock.isWatchlistPage = true;
                            watchlistStockList.push(stock)
                        })
                    })
                })

                // Render the entire table with populated data.
                .then(() => {
                    localStorage.setItem('watchlistStockData', JSON.stringify(watchlistStockList))
                    ReactDOM.render(<PopularStockTable stocksData={watchlistStockList} />, document.querySelector('#watchlist-stocks'));
                })
        }
            
        else {
            
            // Get locally stored data and parse it.
            let watchlistStocks = localStorage.getItem('watchlistStockData');
            watchlistStocks = JSON.parse(watchlistStocks);
            watchlistStocks.map(stock => stock.isWatchlistPage = true)
            
            // Populate row data into table
            let watchlistStockList = []

            // Render entire table.
            ReactDOM.render(<PopularStockTable stocksData={watchlistStocks}/>, document.querySelector('#watchlist-stocks'))
        }
    }
})
.catch(err => console.error(err));
