const searchIcon = "/static/stock/images/search-icon2.png";
const watchlistIcon = "/static/stock/images/watchlist-icon.png";
const API_KEY =  "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b";

class NotificationPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: this.props.info.title,
			content: this.props.info.content,
			titleColor: this.props.info.titleColor
		}
	}

	render () {
		setTimeout(() => {
			let notificationPopup = document.querySelector('#notification-popup');
			notificationPopup.style.animationName = 'slide_out';
			notificationPopup.style.animationFillMode = 'backwards';
		}, 4000)
		setTimeout(() => {
			ReactDOM.unmountComponentAtNode(document.querySelector('#notification-container'));
		}, 5000);
		return (
			<div id="notification-popup">
				<div id="notification-title" style={{color: this.state.titleColor}}>
					{this.state.title}
				</div>
				<div id="notification-content">{this.state.content}</div>
			</div>
		)
	}

}


class BuySellPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			symbol: this.props.stockInfo.symbol,
			longName: this.props.stockInfo.longName,
			regularMarketPrice: this.props.stockInfo.regularMarketPrice.toFixed(2),
			currency: this.props.stockInfo.currency,
			balance: this.props.userInfo.balance,
			profits: this.props.userInfo.profits,
			losses: this.props.userInfo.losses,
			quantity: 1,
			total: this.props.stockInfo.regularMarketPrice.toFixed(2)
		}
	}

	calculateTotal = (quantity) => {
		quantity === 0 ? quantity = 1 : null;
		console.log(quantity)
		this.setState((state) => ({
			total: state.regularMarketPrice * quantity,
			quantity: quantity
		}))
	}

	closePopup = () => {
		console.log('close popup button clicked!');
		ReactDOM.unmountComponentAtNode(document.querySelector('#popup-container'));
	}

	changeQuantity = (action) => {
		let currentValue = parseInt(document.querySelector('#quantity-input-box').value);
			!currentValue ? (currentValue = 1) : (null);
		if (action === 'increase' ) {
			document.querySelector('#quantity-input-box').value = currentValue + 1;
			this.calculateTotal(currentValue + 1)
		}
		else {
			if (currentValue > 1) {
				document.querySelector('#quantity-input-box').value = currentValue - 1;
				this.calculateTotal(currentValue - 1);
			}
		}
	}

	purchaseStock = () => {
		console.log('stock purchase clicked');
		let csrf_token = getCookie('csrftoken');
		fetch('/purchase_stock', {
			method: "POST", 
			body: JSON.stringify({
				stockSymbol: this.state.symbol,
				quantity: this.state.quantity,
				balance: this.state.balance - this.state.total
			}),
			headers: {'X-CSRFToken': csrf_token}
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			let info = {
				title: 'Purchase Successful!',
				content: `You bought ${this.state.quantity} stocks of ${this.state.symbol} for ${this.state.total}`,
				titleColor: 'rgb(37, 153, 37)'
			}
			this.closePopup();
			ReactDOM.render(<NotificationPopup info={info} />, document.querySelector('#notification-container'));
		});
	}


	render() {
		return (
			<div>
				<div id="overlay"></div>
				<div className="buy-sell-popup">
					<div id='popup-header-div'>
						<div id="popup-title">
							Buy {this.props.stockInfo.symbol} stocks
						</div>
						<div id='popup-close-button-div'>
							<button onClick={this.closePopup} id="popup-close-button">X</button>
						</div>
					</div>
					<div id="popup-long-name">
						 {this.state.longName}
					</div>
					<div className="popup-stock-info" id="popup-current-price">
						<font className="popup-span">Current Price:</font> {this.state.regularMarketPrice} {this.state.currency}
					</div>
					<div className="popup-stock-info" id="popup-balance">
						<font className="popup-span">Your Balance:</font> ${this.state.balance}
					</div>
					<div className="popup-stock-info" id="popup-quantity">
						<div className="popup-span" style={{marginBottom: '25px'}}>Quantity:</div> 
						<div id="popup-quantity-selector">
							<button onClick={() => this.changeQuantity('reduce')} className="quantity-selector-item" id="quantity-reduce-button">-</button>
							<input onChange={event => this.calculateTotal(event.target.value)} placeholder='1' className="quantity-selector-item" id="quantity-input-box"  type="number" min="1">
							</input>
							<button onClick={() => this.changeQuantity('increase')} className="quantity-selector-item" id="quantity-increase-button">+</button>
						</div>
					</div>
					<div className="popup-stock-info" id="popup-balance">
						<font className="popup-span">Your Live Balance: $</font>{this.state.balance - this.state.total}
					</div>
					<div className="popup-stock-info" id="popup-total">
						Total: <font id="popup-total-figure">${this.state.total}</font>
					</div>
					<div id="popup-confirm-purchase">
						<button onClick={this.purchaseStock} id="confirm-purchase-button">Confirm Purchase</button>
					</div>
				</div>
			</div>
		)
	}
}

class StockNewsChild extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: this.props.newsInfo.title.replace('&#39;', "'"),
			summary: this.props.newsInfo.summary,
			author_name: this.props.newsInfo.author_name,
			thumbnail: this.props.newsInfo.thumbnail
		}
	}

	render() {
		return (
			<div className="stock-news-info">
				<div className="stock-news-thumbnail-div">
				<img className="stock-news-thumbnail" src={this.state.thumbnail}></img>
				</div>
				<div><font className="news-title">{this.state.title}</font></div>
				<div><font className="news-author">by {this.state.author_name}</font></div>
			</div>
		)
	}
}

class StockNewsParent extends React.Component {
	constructor(props) {
		super(props);
		this.newsChildrenList = []
		this.props.newsChildren.forEach(news => {
			this.newsChildrenList.push(
				<StockNewsChild key={news.id} newsInfo={news} />
			)	
		});
		this.state = {
			newsChildrenData: this.newsChildrenList
		}
	}

	render() {
		return (
			<div id="stock-news-component">
				{this.state.newsChildrenData}
			</div>
		)
	}

}

class AdditionalInfo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			regularMarketDayHigh: this.props.stockInfo.regularMarketDayHigh,
			regularMarketDayLow: this.props.stockInfo.regularMarketDayLow,
			regularMarketDayRange: this.props.stockInfo.regularMarketDayRange,
			regularMarketOpen: this.props.stockInfo.regularMarketDayRange,
			twoHundredDayAverage: this.props.stockInfo.twoHundredDayAverage,
			marketState: this.props.stockInfo.marketState,
			marketCap: this.props.stockInfo.marketCap,
			currency: this.props.stockInfo.currency,
		}
		this.state.marketState === 'CLOSED' ? this.marketColor = 'red' : this.marketColor = 'green';
		this.userInfo
	}

	componentDidMount() {
		console.log('lolvava');
		fetch('/get_user_info')
		.then(response => response.json())
		.then(data => {
			this.userInfo = data;
			this.setState(() => ({
				balance: data.balance,
				profits: data.profits,
				losses: data.losses
			}))
		})
	}

	buyStock = () => {
		console.log('buy stock initiated!');
		ReactDOM.render(<BuySellPopup userInfo={this.userInfo} stockInfo={this.props.stockInfo} />, document.querySelector('#popup-container'));
	}
	render() {
		return (
			<div className="stock-chart-data" id="additional-data">
				<ul>
					<div className="additional-data-children">Market State : <font color={this.marketColor}> {this.state.marketState}</font></div>
					<div className="additional-data-children">Regular Market Range: <font color="white"> {this.state.regularMarketDayRange} {this.state.currency}</font></div>
					<div className="additional-data-children">Regular Market Low: <font color="red"> {this.state.regularMarketDayLow} {this.state.currency}</font></div>
					<div className="additional-data-children">Regular Market High: <font color="green"> {this.state.regularMarketDayHigh} {this.state.currency}</font></div>
					<div className="additional-data-children">Two Hundred Day Average: <font color="white"> {this.state.twoHundredDayAverage} {this.state.currency}</font></div>
					<div className="additional-data-children">Market Cap: <font color="white"> {this.state.marketCap} {this.state.currency}</font></div>
					<div className="additional-data-children" id="buy-sell-button-div">
						<button onClick={this.buyStock} className="buy-button" id="buy-button">Buy</button>
						<button onClick={this.sellStock} className="sell-button"  id="sell-button">Sell</button>
					</div>
				</ul>

			</div>
		)
	}
}

class StockInfo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
		this.priceColor = null;
	}

	componentDidMount() {
		fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/quote?symbols=${this.props.symbol}`, {
			"method": "GET",
			"headers": {
				"x-rapidapi-key": API_KEY,
				"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
			}
		})
		.then(response => response.json())
		.then(data => {
			console.log(data.quoteResponse.result[0]);
			let stockInfo = data.quoteResponse.result[0];
			this.setState(() => ({
				symbol: stockInfo.symbol,
				longName: stockInfo.longName,
				currency: stockInfo.currency,
				exchangeTimezoneShortName: stockInfo.exchangeTimezoneShortName,
				fiftyDayAverage: stockInfo.fiftyDayAverage.toFixed(2),
				fullExchangeName: stockInfo.fullExchangeName,
				region: stockInfo.region,
				regularMarketChange: stockInfo.regularMarketChange.toFixed(4)	,
				regularMarketChangePercent: stockInfo.regularMarketChangePercent.toFixed(4),
				regularMarketPreviousClose: stockInfo.regularMarketPreviousClose,
				regularMarketPrice: stockInfo.regularMarketPrice.toFixed(2)
			}));
			ReactDOM.render(<AdditionalInfo stockInfo={stockInfo} />, document.querySelector('#stock-additional-data'));
		})
	}

	render() {
		this.state.regularMarketChange < 0 ? this.priceColor = 'red' : this.priceColor = 'green';
		return (
			<table id="stock-info-table">
				<thead>
					<tr>
						<td className="stock-info-upper-row" id="stock-info-title">
							{this.state.symbol} - <font>{this.state.longName}</font>
						</td>
						<td className="stock-info-upper-row" id="stock-info-regular-price">
							{this.state.regularMarketPrice} <font>{this.state.currency}</font>
						</td>
						<td className="stock-info-upper-row" id="stock-info-previous-close">
							{this.state.regularMarketPreviousClose} <font>{this.state.currency}</font>
						</td>
						<td className="stock-info-upper-row" id="stock-info-fifty-day-average">
							{this.state.fiftyDayAverage} <font>{this.state.currency}</font>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="stock-info-lower-row" id="stock-info-exchange">
							{this.state.fullExchangeName}  {this.state.region} ({this.state.exchangeTimezoneShortName})
						</td>
						<td className="stock-info-lower-row" id="stock-info-market-change">
							<font color={this.priceColor}>
								{this.state.regularMarketChange > 0 ? ('+') : (null)}
								{this.state.regularMarketChange} ({this.state.regularMarketChangePercent}%)</font>
						</td>
						<td className="stock-info-lower-row">	
							<font color='gray'>Previous Market Close</font>
						</td>
						<td className="stock-info-lower-row" id="stock-info-fifty-lower">
							<font color='gray'>Fifty Day Average</font>
						</td>
					</tr>
				</tbody>
			</table>
		)
	}
}

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
					"x-rapidapi-key": API_KEY,
					"x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
				}
			})
			.then(response => response.json())
			.then(data => {
				let new_keyword = document.querySelector(`#${elementID}`).value;
				if (new_keyword !== '') {
					data.quotes.forEach(stock => {
						let para = (<a key={stock.symbol} className="search-suggestion-links" href={`/stock/${stock.symbol}`}>
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
					<td id="BSE-market-change"><font color={this.BSEpriceColor}>
						{this.state.BSEmarketChange > 0 ? ('+') : (null)}
						{this.state.BSEmarketChange} ({this.state.BSEmarketChangePercent})</font></td>
					{ (this.desktopSite) ? 
						(<td id="BSE-lower-close">Previous market close</td>)
						: (null)}
					<td id="NSE-lower-symbol">{this.state.NSEquoteType} | {this.state.NSEexchangeTimezoneShortName}</td>
					<td id="NSE-market-change"><font color={this.NSEpriceColor}>
						{this.state.NSEmarketChange > 0 ? ('+') : (null)}
						{this.state.NSEmarketChange} ({this.state.NSEmarketChangePercent})</font></td>
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
			watchlistButtonState: null
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

	buyStock = (event) => {
		event.stopPropagation();
		console.log('buy clicked');
		fetch('/get_user_info')
		.then(response => response.json())
		.then(data => {
			this.userInfo = data;
			ReactDOM.render(<BuySellPopup userInfo={data} stockInfo={this.props.stock} />, document.querySelector('#popup-container'));
		})
	}

	componentDidMount() {
		
		// Get watchlist data only if user is logged in
		if (this.userLoggedIn === "true") {
			fetch(`watchlist_handler/${this.state.symbol}`)
			.then(response => response.json())
			.then(data => {
				let buttonState, buttonText;
				(data.watching) ? (buttonState = "brightness(100%)", buttonText = "Unwatch") : 
					(buttonState="brightness(40%)", buttonText = "Watch");
				this.setState(()=> ({
					watchlistButtonText: buttonText,
					watchlistButtonState: buttonState,
				}));
			})
		}

		// Else just display initiale button state.
		else {
			this.setState(() => ({
				watchlistButtonText: "Watch",
				watchlistButtonState: "brightness(40%)"
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
		let action, newButtonState, newButtonText;
		if (this.state.watchlistButtonText === "Watch") {
			action = "add";
			newButtonText = "Unwatch";
			newButtonState = 'brightness(100%)';
		}
		else {
			action = "remove";
			newButtonText = "Watch"
			newButtonState = 'brightness(40%)';
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
			watchlistButtonText: newButtonText,
			watchlistButtonState: newButtonState,
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
					<button onClick={event => this.toggleWatchlist(event)} className="watchlist-button">
						<img  style={{filter: this.state.watchlistButtonState}} className="watchlist-icon" src={watchlistIcon}></img>
				</button>
				</td>
				<td className="table-data" className="table-price"><font color={this.priceColor}>$ {this.state.price}</font></td>
				<td className="table-data" className="table-change">$ {this.state.marketChange} / {this.state.marketChangePercent} %</td>
				<td className="table-data" className="table-open">$ {this.state.marketOpen}</td>
				<td className="table-data" className="table-high">$ {this.state.dayHigh}</td>
				<td className="table-data" className="table-low">$ {this.state.dayLow}</td>
				<td className="table-data" className="table-close">
					<button onClick={event => this.buyStock(event)} id="buy-stock-index-page">Buy</button>
				</td>
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
						<th className="table-headers" id="table-close">Buy / Sell</th>
					</tr>
				</thead>
				<tbody>
					{this.state.stocksData}
				</tbody>
			</table>
		)
	}
}

ReactDOM.render(<Autocomplete />, document.querySelector('#top-bar-search-div'))

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
