
// Get all stocks added to user's watchlist from database.
fetch('/get_watchlist')
.then(response => response.json())
.then(data => {
    console.log(data);    
    let serializedstocks = ''

    // Add stocks in a (AAPL,TSLA,MRSFT) format to get quotes
    data.forEach((stock, key, stocks) => {
        if (key === stocks.length - 1) {
            serializedstocks = serializedstocks + stock.symbol;
        }
        else {
            serializedstocks = serializedstocks + `${stock.symbol}%2C`;
        }
    })
    console.log(serializedstocks);

    // Watchlist won't update to avoid API overuse. Just to test styling.
    if (!localStorage.getItem('watchlistStockData')) {
        fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?symbols=${serializedstocks}`, {
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
            let watchlistStockList = []
            data.quoteResponse.result.forEach(stock => {
                watchlistStockList.push(<PopularStockData key={stock.symbol} stock={stock}/>)
            })

            // Render entire table
            ReactDOM.render(<PopularStockTable stocksData={watchlistStockList}/>, document.querySelector('#watchlist-stocks'))
        })
        .catch(err => {
            console.error(err);
        });
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

