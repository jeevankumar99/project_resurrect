const searchIcon = "/static/stock/images/search-icon2.png"

class Autocomplete extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			suggestions: null
		}
	}
	handleChange = (event) => {
		let elementID = event.target.id
		let keyword = String(event.target.value)
		let searchIcon = document.querySelector('#top-bar-search-icon');
		console.log(keyword.length)
		if (keyword !== '') {
			searchIcon.style.filter = "brightness(100%)";
			let stockList = [];
			fetch(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete?q=${keyword}&region=US`, {
				"method": "GET",
				"headers": {
					"x-rapidapi-key": "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b",
					"x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
				}
			})
			.then(response => response.json())
			.then(data => {
				let new_keyword = document.querySelector(`#${elementID}`).value;
				if (new_keyword !== '') {
					data.quotes.forEach(stock => {
						let para = (<a key={stock.symbol} className="search-suggestion-links" href={`stock/${stock.symbol}`}>
							<div className="search-suggestion-link-div">
								{stock.symbol}  -  <font className="search-stock-longname">{stock.longname}</font>
							</div>
						</a>)
						stockList.push(para)
					})
					this.setState(() => ({
						suggestions: <div id="search-suggestions">{stockList}</div>
					}))
				}
			})
		}
		else {
			this.handleFocusOut();
			searchIcon.style.filter = "brightness(45%)"
		}
	}

	handleFocusOut = () => {
		setTimeout(() => {
			this.setState(() => ({
				suggestions: null
			}))
		}, 200)
	}

	 render() {
		 return (
			 <div>
				<div id="top-bar-search">
					<input onFocus={event=> this.handleChange(event)} onChange={event => this.handleChange(event)} onBlur={this.handleFocusOut} className="search-components" id="top-bar-search-bar" type="text" placeholder="Search"/>
					<img src={searchIcon} className="search-components" id="top-bar-search-icon"/>
				</div>
				{this.state.suggestions}
			</div>
		 )
	 }
 }

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
		if (window.innerWidth > 1600) {
			this.desktopSite = true
		}
		else {
			this.desktopSite = false
		}
	}
	render () {
		return (
			<table id="main-indexes-table">
				<thead>
				<tr className="big-row">
					<td onClick={() => window.location.href = 'stock/BSE'} id="BSE-symbol">{this.state.BSEsymbol}</td>
					<td id="BSE-market-price">{this.state.BSEmarketPrice}</td>
					{ (this.desktopSite) ? 
						(<td id="BSE-market-close" style={{color: this.BSEprevColor}}>{this.state.BSEmarketPreviousClose}</td>)
						: (null)}
					<td onClick={() => window.location.href = 'stock/NSE'} id="NSE-symbol">{this.state.NSEsymbol}</td>
					<td id="NSE-market-price">{this.state.NSEmarketPrice}</td>
					{ (this.desktopSite) ? 
						(<td id="NSE-market-close" style={{color: this.NSEprevColor}}>{this.state.NSEmarketPreviousClose}</td>)
						: (null)}
				</tr>
				</thead>
				<tbody>
				<tr className="small-row">
					<td id="BSE-lower-symbol">{this.state.BSEquoteType} | {this.state.BSEexchangeTimezoneShortName}</td>
					<td id="BSE-market-change"><font color={this.BSEpriceColor}>{this.state.BSEmarketChange} ({this.state.BSEmarketChangePercent})</font></td>
					{ (this.desktopSite) ? 
						(<td id="BSE-lower-close">Previous market close</td>)
						: (null)}
					<td id="NSE-lower-symbol">{this.state.NSEquoteType} | {this.state.NSEexchangeTimezoneShortName}</td>
					<td id="NSE-market-change"><font color={this.NSEpriceColor}>{this.state.NSEmarketChange} ({this.state.NSEmarketChangePercent})</font></td>
					{ (this.desktopSite) ? 
						(<td id="NSE-lower-close">Previous market close</td>)
						: (null)}
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
			previousClose: this.props.stock.regularMarketPreviousClose,
			isWatchlistPage: this.props.stock.isWatchlistPage,
			watchlistButtonText: null,
		}

		// To change the color depending on rise and fall of price.
		if (this.state.price > this.state.marketOpen) {
			this.priceColor = "green";
		}
		else {
			this.priceColor = "red";
		}
		
		// Check if user is logged in.
		this.userLoggedIn = document.querySelector('#user-logged-in').innerHTML;
	}

	componentDidMount() {
		
		// Get watchlist data only if user is logged in
		if (this.userLoggedIn === "true") {
			fetch(`watchlist_handler/${this.state.symbol}`)
			.then(response => response.json())
			.then(data => {
				let buttonState
				(data.watching) ? (buttonState = "Unwatch") : (buttonState = "Watch");
				this.setState(()=> ({
					watchlistButtonText: buttonState
				}));
			})
		}

		// Else just display initiale button state.
		else {
			this.setState(() => ({
				watchlistButtonText: "watch"
			}));
		}

	}

	// Add the selected stock to watchlist
	toggleWatchlist = function(event) {
		event.stopPropagation();


		// If button clicked and user not logged in, redirect to login page.
		if (this.userLoggedIn === "false") {
			window.location.replace("/login")
		}

		// Handle toggle when user is logged in.
		let action, newButtonState;
		if (this.state.watchlistButtonText === "Watch") {
			action = "add";
			newButtonState = "Unwatch";
		}
		else {
			action = "remove";
			newButtonState = "Watch"
		}

		if (this.state.isWatchlistPage) {
			this.props.clickHandler(this.state.symbol);
		}

		// Get CSRF token from cookies for POST request
		let csrf_token = getCookie('csrftoken')
		fetch("/watchlist_handler", {
			method: "POST", 
			body: JSON.stringify({
				stockSymbol: this.state.symbol,
				action: action,
			}),
			headers: {'X-CSRFToken': csrf_token}
		})

		// Change state
		this.setState(state => ({
			watchlistButtonText: newButtonState
		}));
		console.log("request sent!")
	}

	render () {
		return (
			<tr onClick={() => window.location.href = `stock/${this.state.symbol}`} className="table-row-data" id={`table-row-${this.state.symbol}`}>
				<td className="table-data" className="table-symbol">
					{this.state.symbol}
				</td>
				<td className="table-data" className="table-watchlist">
					<button onClick={event => this.toggleWatchlist(event)} className="watchlist-button">{this.state.watchlistButtonText}</button>
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
	constructor(props) {
		super(props);
		this.stocksData = []
		this.props.stocksData.forEach(stock => {
			this.stocksData.push(<PopularStockData 
				key={stock.symbol} 
				stock={stock}
				clickHandler={this.removeRow} />)
		})
		console.log(this.stocksData)
		this.state = {
			stocksData: this.stocksData
		}
	}

	// Removes stock from watchlist table.
	removeRow = (symbol) => {
		let filtered = this.state.stocksData.filter(stockComponent => stockComponent.key !== symbol);
		this.setState(state => ({
			stocksData: filtered
		}))
	}

	render() {
		console.log(this.state.stocksData)
		return (
			<table className="popular-stocks-table">
				<thead>
					<tr id="all-table-headers">
						<th className="table-headers" id="table-symbol">Symbol</th>
						<th className="table-headers" id="table-watchlist">Watchlist</th>
						<th className="table-headers" id="table-price">Market Price</th>
						<th className="table-headers" id="table-change">Market Change</th>
						<th className="table-headers" id="table-open">Market Open</th>
						<th className="table-headers" id="table-high">Day High</th>
						<th className="table-headers" id="table-low">Day Low</th>
						<th className="table-headers" id="table-close">Previous Close</th>
					</tr>
				</thead>
				<tbody>
					{this.state.stocksData}
				</tbody>
			</table>
		)
	}
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
