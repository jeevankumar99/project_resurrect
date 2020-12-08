
// Get all stocks added to user's watchlist from database.
fetch('/get_watchlist')
.then(response => response.json())
.then(data => {
    console.log(data);    
    let serializedStockList = []
    let formatted_data = []

    if (data.length > 10) {
        console.log('working')
        while (data.length > 0) {
            formatted_data.push(data.splice(0, 10))
        }
    }
    console.log(formatted_data);
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
    console.log(serializedStockList);

    // Watchlist won't update to avoid API overuse. Just to test styling.
    if (!localStorage.getItem('watchlistStockData')) {
        let watchlistStockList = []
        serializedStockList.forEach(chunksOfTen => {
            fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?symbols=${chunksOfTen}`, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b",
                    "x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
                }
            })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem("watchlistStockData", JSON.stringify(data.quoteResponse.result));
            
                // Populate row data into table
                data.quoteResponse.result.forEach(stock => {
                    watchlistStockList.push(<PopularStockData key={stock.symbol} stock={stock}/>)
                })
            })
            .catch(err => {
                console.error(err);
            });
        })
        console.log(watchlistStockList)
        // Render entire table
        ReactDOM.render(<PopularStockTable stocksData={watchlistStockList}/>, document.querySelector('#watchlist-stocks'))
    }
    else {
        let watchlistStocks = localStorage.getItem('watchlistStockData');
        watchlistStocks = JSON.parse(watchlistStocks);
        console.log(watchlistStocks)
        
        // Populate row data into table
        let watchlistStockList = []
        watchlistStocks.forEach(stock => {
            watchlistStockList.push(<PopularStockData key={stock.symbol} stock={stock}/>)
        })

        // Render entire table.
        ReactDOM.render(<PopularStockTable stocksData={watchlistStockList}/>, document.querySelector('#watchlist-stocks'))
    }
})

