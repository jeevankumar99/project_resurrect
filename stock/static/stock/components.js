const profileIcon = "/static/stock/images/profile-icon.png";
const searchIcon = "/static/stock/images/search-icon2.png";
const settingsIcon = "/static/stock/images/settings-icon.png"
const watchlistIcon = "/static/stock/images/watchlist-icon.png";
const stockIcon = "/static/stock/images/stock-icon.png";
const API_KEY = "479462f012mshe76e1e5aaa27ccdp1567d6jsnd0b820804b3b";



// Additional Stock Info in the individual stock page.
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
			inPortfolio: false,
			currency: this.props.stockInfo.currency,
		}
		this.state.marketState === 'CLOSED' ? this.marketColor = 'red' : this.marketColor = 'green';
	}

	componentDidMount() {
		if (isUserLoggedIn()) {
			
			fetch(`/get_portfolios/${this.props.stockInfo.symbol}`)
			.then(response => response.json())
			.then(data => {
				if (data.length > 0) {
					this.setState(() => ({
						inPortfolio: true,
						portfolioInfo: data[0]
					}))
				}
			})
		}	
	}

	// Renders the buy/sell popup once buy is clicked.
	buyStock = () => {
		if (isUserLoggedIn()) {
			fetch('/get_user_info')
			.then(response => response.json())
			.then(data => {
				this.userInfo = data;
				ReactDOM.render(
					<BuySellPopup 
						motive="buy"
						userInfo={this.userInfo} 
						stockInfo={this.props.stockInfo}
						portfolioInfo={this.state.portfolioInfo} 
						updateOwnedShares={this.updateOwnedShares}
					/>, 
					document.querySelector('#popup-container')
				);
			})
		}
		else {
			window.location.href = '/login';
		}
	}

	sellStock = () => {
		if (isUserLoggedIn()) {
			fetch('/get_user_info')
			.then(response => response.json())
			.then(data => {
				this.userInfo = data;
				ReactDOM.render(
					<BuySellPopup 
						motive="sell"
						userInfo={this.userInfo} 
						stockInfo={this.props.stockInfo}
						portfolioInfo={this.state.portfolioInfo} 
						updateOwnedShares={this.updateOwnedShares}
					/>, 
					document.querySelector('#popup-container')
				);
			})
		}
		else {
			window.location.href = '/login';
		}
	}

	// to pass as prop for BuySellPopup to update this component's state.
	updateOwnedShares = (newQuantity, motive) => {

		console.log('updating', newQuantity, motive)
		
		// duplicate the portfolioInfo object
		let newPortfolioInfo = this.state.portfolioInfo;
		console.log(newPortfolioInfo, newQuantity)
		
		// check if motive is to buy or sell to credit or debit total price.
		motive === 'sell' ? 
			(newPortfolioInfo.quantity = this.state.portfolioInfo.quantity - newQuantity) :
			(newPortfolioInfo.quantity = this.state.portfolioInfo.quantity + newQuantity);
		
		if (newPortfolioInfo.quantity === 0) {
			this.setState(() => ({
				inPortfolio: false,
				portfolioInfo: null
			}))
		}
		else {
			this.setState(() => ({
				portfolioInfo: newPortfolioInfo
			}))
		}
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
						{this.state.inPortfolio ? 
							(<button onClick={this.sellStock} className="sell-button"  id="sell-button">Sell</button>) :
							(null)}
					</div>
				</ul>

			</div>
		)
	}
}


// Displays Stock suggestions during search.
class Autocomplete extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			suggestions: null
		}
	}

	// Modifies suggestions according to change in search bar.
	handleChange = (event) => {
		let elementID = event.target.id
		let keyword = String(event.target.value)
		let searchIcon = document.querySelector('#top-bar-search-icon');
		
		// if search bar is not empty.
		if (keyword !== '') {
			searchIcon.style.filter = "brightness(100%)";
			let stockList = [];
			fetch(`https://yahoo-finance-low-latency.p.rapidapi.com/v6/finance/autocomplete?query=${keyword}&lang=en`, {
				"method": "GET",
				"headers": {
					"x-rapidapi-key": API_KEY,
					"x-rapidapi-host": "yahoo-finance-low-latency.p.rapidapi.com"
				}
			})
			.then(response => response.json())
			.then(data => {
				console.log(data);
				let new_keyword = document.querySelector(`#${elementID}`).value;
				if (new_keyword !== '') {
					data.ResultSet.Result.forEach(stock => {
						let para = (<a key={stock.symbol} className="search-suggestion-links" href={`/stock/${stock.symbol}`}>
							<div className="search-suggestion-link-div">
								{stock.symbol}  -  <font className="search-stock-longname">{stock.name}</font>
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

		// show disabled search icon when bar is empty.
		else {
			this.handleFocusOut();
			searchIcon.style.filter = "brightness(45%)"
		}
	}

	// close suggestions when out of focus.
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


 // Displays Popup for buying and selling stocks.
 class BuySellPopup extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props)
		this.state = {
			symbol: this.props.stockInfo.symbol,
			longName: this.props.stockInfo.longName,
			regularMarketPrice: this.props.stockInfo.regularMarketPrice.toFixed(2),
			currency: this.props.stockInfo.currency,
			balance: parseFloat(this.props.userInfo.balance),
			profits: this.props.userInfo.profits,
			losses: this.props.userInfo.losses,
			quantity: 1,
			total: this.props.stockInfo.regularMarketPrice,
			liveBalance: parseFloat(this.props.userInfo.balance),
			overBalance: false,
			overSellShare: false,
		}

	}

	// Calculates total based on the current quantity in the input bar
	calculateTotal = (quantity) => {
		(quantity === 0 || quantity === '') ? quantity = 1 : null;
		quantity = parseInt(quantity);

		// if user clicks the buy button.
		if (this.props.motive === 'buy') {

			// To hide the over balance div.
			let overBalance = false;
			let confirmButton = document.querySelector('#confirm-purchase-button');

			// If total is over the user's balance.
			if ((this.state.regularMarketPrice * quantity) > this.state.balance) {
				overBalance = true;
				confirmButton.disabled = true;
				console.log('overbalance', confirmButton)
				confirmButton.style.backgroundColor = 'red';
			}

			// if total is within the user's balance.
			else {
				confirmButton.disabled = false;
				console.log('not overbalance');
				confirmButton.style.backgroundColor = null;
			}
			console.log(quantity)
			this.setState((state) => ({
				total: state.regularMarketPrice * quantity,
				quantity: quantity,
				liveBalance: state.balance - (state.regularMarketPrice * quantity),
				overBalance: overBalance
			}))
		}

		// if user clicks the sell button.
		else {
			let increaseButton = document.querySelector('#quantity-increase-button');
			let sellButton = document.querySelector('#confirm-sell-button')
			console.log(quantity)

			// if selected quantity of shares is owned by user.
			if (quantity < this.props.portfolioInfo.quantity) {
				console.log(this.props.portfolioInfo)
				increaseButton.disabled = false;
				sellButton.disabled = false;
				this.setState(state => ({
					total: state.regularMarketPrice * quantity,
					quantity: quantity,
					liveBalance: state.balance + (state.regularMarketPrice * quantity),
					overSellShare: false
				}))
			}

			// to disable increase button when user reaches quantity limit
			else if (quantity === this.props.portfolioInfo.quantity) {
				increaseButton.disabled = true;
				sellButton.disabled = false;
				this.setState(state => ({
					total: state.regularMarketPrice * quantity,
					quantity: quantity,
					liveBalance: state.balance + (state.regularMarketPrice * quantity),
					overSellShare: false
				}))
				
			}

			// if user tries to sell more shares than he owns.
			else {
				this.setState(() => ({
					overSellShare: true
				}))
			}
		}
	}

	// Changes quantity when - or + buttons are clicked.
	changeQuantity = (action) => {
		let currentValue = parseInt(document.querySelector('#quantity-input-box').value);
			!currentValue ? (currentValue = 1) : (null);
		
		// to increase quantity.
		if (action === 'increase' ) {
			document.querySelector('#quantity-input-box').value = currentValue + 1;
			this.calculateTotal(currentValue + 1)
		}

		// to decrease quantity.
		else {
			if (currentValue > 1) {
				document.querySelector('#quantity-input-box').value = currentValue - 1;
				this.calculateTotal(currentValue - 1);
			}
		}
	}

	// Closes the buy/sell popup.
	closePopup = () => {
		console.log('close popup button clicked!');
		ReactDOM.unmountComponentAtNode(document.querySelector('#popup-container'));
	}

	// Updates backend to when purchase is confirmed.
	purchaseStock = () => {
		console.log('stock purchase clicked');
		let csrf_token = getCookie('csrftoken');
		fetch('/purchase_stock', {
			method: "POST", 
			body: JSON.stringify({
				stockSymbol: this.state.symbol,
				longName: this.state.longName,
				quantity: this.state.quantity,
				balance: this.state.balance - this.state.total,
				total: this.state.total,
				currentPrice: this.state.regularMarketPrice,
			}),
			headers: {'X-CSRFToken': csrf_token}
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);

			// To get display notification once purchase is complete.
			let info = {
				title: 'Purchase Successful!',
				content: `You bought ${this.state.quantity} stocks of ${this.state.symbol} for ${this.state.total}`,
				titleColor: 'rgb(37, 153, 37)'
			}
			this.closePopup();
			ReactDOM.render(<NotificationPopup info={info} />, document.querySelector('#notification-container'));

			// To update fields according to purchase in portfolio page.
			this.props.updateState ? (this.props.updateState(this.state.quantity, 'buy')) : (null);

			if (this.props.checkPortfolioAndAdd) {
				console.log('executing')
				this.props.checkPortfolioAndAdd(this.state.quantity);
			}
			else {
				// To update shares owned according to purchase
				this.props.updateOwnedShares ? (this.props.updateOwnedShares(this.state.quantity, 'buy')) : (null);
			}


		});
	}

	// Sells the stocks and updates backend.
	sellStock = () => {
		console.log("sell stock clicked!");
		let csrf_token = getCookie('csrftoken');
		let netProfitLoss = this.state.total - ((
			this.props.portfolioInfo.totalSpent / this.props.portfolioInfo.quantity
			) * this.state.quantity);
		fetch('/sell_stocks', {
			method: 'PUT',
			body: JSON.stringify({
				symbol: this.state.symbol,
				quantity: this.state.quantity,
				longName: this.state.longName,
				totalCredit: this.state.total,
				currentPrice: this.state.regularMarketPrice,
				netProfitLoss: netProfitLoss
			}),
			headers: {'X-CSRFToken': csrf_token}
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			let info = {
				title: "Shares Sold Successfully",
				content: `You sold ${this.state.quantity} stocks of ${this.state.symbol} for ${this.state.total}`, 
				titleColor: 'red'
			}

			// updates owned shares from the parent component's state
			this.props.updateOwnedShares ? (this.props.updateOwnedShares(this.state.quantity, 'sell')) : (null);
			
			// To update fields according to sale in portfolio page.
			this.props.updateState ? (this.props.updateState(this.state.quantity, 'sell')) : (null);

			this.closePopup();
			ReactDOM.render(<NotificationPopup info={info} />, document.querySelector('#notification-container'));
		})
	}

	render() {
		console.log(this.props.portfolioInfo)
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
						<font className="popup-span">Your Live Balance: $</font>{this.state.liveBalance.toFixed(2)}
					</div>
					{this.props.motive === 'sell' ? 
						(<div className="popup-stock-info" id="popup-stocks-owned">Shares owned: {this.props.portfolioInfo.quantity}</div>) :
						(null)}
					{this.state.overBalance ? (<div className="popup-stock-info" id="popup-over-balance">
						<font color='red' className="popup-over-balance">Insufficient Balance</font></div>) : (null)}
					{this.state.overSellShare ? (<div className="popup-stock-info" id="popup-over-sell-share">
						<font color='red' className="popup-over-sell-share">Quantity exceeds number of shares owned</font></div>) : (null)}
					<div className="popup-stock-info" id="popup-total">
						Total: <font id="popup-total-figure">${this.state.total.toFixed(2)}</font>
					</div>
					<div id="popup-confirm-purchase">
						{this.props.motive === 'buy' ? 
							(<button onClick={this.purchaseStock} className='buy-sell-button'id="confirm-purchase-button">Confirm Purchase</button>) :
							(<button onClick={this.sellStock} className='buy-sell-button' id="confirm-sell-button">Sell Shares</button>)
						}	
					</div>
				</div>
			</div>
		)
	}
}


// Displays indexes markets in the index page (NSE and BSE).
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

		// if price of stock decreases.
		if (this.state.BSEmarketChange < 0) {
			this.BSEpriceColor = "red";
		}
		// if price of stock increases.
		else {
			this.BSEpriceColor = "green";
		}

		// To handle market price drops and rises.
		(this.state.NSEmarketChange < 0) ? (this.NSEpriceColor = "red") : (this.NSEpriceColor = "green");
		(this.state.NSEmarketPreviousClose > this.state.NSEmarketPrice) ? (this.NSEprevColor = "rgb(0, 88, 0)") : (this.NSEprevColor = "rgb(146, 1, 1)");
		(this.state.BSEmarketPreviousClose > this.state.BSEmarketPrice) ? (this.BSEprevColor = "rgb(0, 88, 0)") : (this.BSEprevColor = "rgb(146, 1, 1)");
		
		// To display fewer stats for smaller screensize.
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


// Displays notification at the bottom-right.
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

		// Starts the close animation after 4 seconds.
		setTimeout(() => {
			let notificationPopup = document.querySelector('#notification-popup');
			notificationPopup.style.animationName = 'slide_out';
			notificationPopup.style.animationFillMode = 'backwards';
		}, 4000)

		// Closes the popup after 5 seconds.
		setTimeout(() => {
			ReactDOM.unmountComponentAtNode(document.querySelector('#notification-container'));
		}, 5000);
		
		return (
			<div id="notification-popup" style={{border: `1px solid ${this.state.titleColor}`}}>
				<div id="notification-title" style={{color: this.state.titleColor}}>
					{this.state.title}
				</div>
				<div id="notification-content">{this.state.content}</div>
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
			longName: this.props.stock.longName,
			price: this.props.stock.regularMarketPrice.toFixed(2),
			marketChange: this.props.stock.regularMarketChange.toFixed(2),
			marketChangePercent: this.props.stock.regularMarketChangePercent.toFixed(2),
			marketOpen: this.props.stock.regularMarketOpen,
			dayHigh: this.props.stock.regularMarketDayHigh.toFixed(2),
			dayLow: this.props.stock.regularMarketDayLow.toFixed(2),
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
		this.userLoggedIn = isUserLoggedIn();
	}

	componentDidMount() {
		
		// Get watchlist data only if user is logged in
		if (this.userLoggedIn) {
			let requests = [
				fetch(`watchlist_handler/${this.state.symbol}`),
				fetch(`get_portfolios/${this.state.symbol}`)
			]

			// get watchlist and porftolio infos.
			Promise.all(requests)
				.then(responses => Promise.all(responses.map(response => response.json())))
				.then(watchlistAndPortfolioData => {
					let buttonState, buttonText, inPortfolio, portfolioInfo
					
					// if user is watching the current stock
					(watchlistAndPortfolioData[0].watching) ?
						(buttonState="brightness(100%)", buttonText = "Unwatch") :
						(buttonState="brightness(40%)", buttonText = "Watch");
					 
					// if stock not in user's watchlist
					(watchlistAndPortfolioData[1].length) ? inPortfolio=true : inPortfolio=false;
					inPortfolio ? (portfolioInfo = watchlistAndPortfolioData[1][0])
						: (portfolioInfo = null);
					
					this.setState(() => ({
						watchlistButtonText: buttonText,
						watchlistButtonState: buttonState,
						inPortfolio: inPortfolio,
						portfolioInfo: portfolioInfo
					}))
					
				})
		}

		// Else just display initial button state.
		else {
			this.setState(() => ({
				watchlistButtonText: "Watch",
				watchlistButtonState: "brightness(40%)"
			}));
		}

	}


	// open buy popup when buy is clicked.
	buyStock = (event) => {
		event.stopPropagation();
		console.log('buy clicked');
		if (isUserLoggedIn()) {
			fetch('/get_user_info')
			.then(response => response.json())
			.then(data => {
				this.userInfo = data;
				console.log(data)
				ReactDOM.render(
					<BuySellPopup 
						motive="buy" 
						updateOwnedShares={this.updateOwnedShares}
						checkPortfolioAndAdd = {this.checkPortfolioAndAdd} 
						userInfo={data} 
						stockInfo={this.props.stock} 
					/>, 
					document.querySelector('#popup-container')
				);
			})
		}
		else {
			window.location.replace('/login');
		}
	}

	checkPortfolioAndAdd = (quantity=null) => {
		console.log(this.state.symbol, this.state.inPortfolio, quantity);
		if (!this.state.inPortfolio) {
			fetch(`/get_portfolios/${this.state.symbol}`)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				this.setState(() => ({
					inPortfolio: true,
					portfolioInfo: data[0]
				}))
				this.updateOwnedShares(0, 'buy');
			})
		}
		else {
			this.updateOwnedShares(quantity, 'buy');
		}
	}

	// open sell popup when sell is clicked.
	sellStock = (event) => {
		event.stopPropagation();
		console.log('sell clicked!');
		fetch('/get_user_info')
		.then(response => response.json())
		.then(data => {
			console.log(data);
			ReactDOM.render(
				<BuySellPopup 
					motive="sell" 
					updateOwnedShares={this.updateOwnedShares} 
					userInfo={data} 
					stockInfo={this.props.stock} 
					portfolioInfo={this.state.portfolioInfo} 
				/>,
				document.querySelector('#popup-container')
			);
		})
	}

	// Add the selected stock to watchlist
	toggleWatchlist = function(event) {
		event.stopPropagation();


		// If button clicked and user not logged in, redirect to login page.
		if (!this.userLoggedIn) {
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
		.then(() => {
			console.log("request sent!")
			this.setState(state => ({
				watchlistButtonText: newButtonText,
				watchlistButtonState: newButtonState,
			}));
			if (this.state.isWatchlistPage) {
				this.props.clickHandler(this.state.symbol);
			}
		})
	}

	// to pass as prop for BuySellPopup to update this component's state.
	updateOwnedShares = (newQuantity, motive) => {

		console.log('updating', newQuantity, motive)
		
		// duplicate the portfolioInfo object
		let newPortfolioInfo = this.state.portfolioInfo;
		console.log(newPortfolioInfo, newQuantity)
		
		// check if motive is to buy or sell to credit or debit total price.
		motive === 'sell' ? 
			(newPortfolioInfo.quantity = this.state.portfolioInfo.quantity - newQuantity) :
			(newPortfolioInfo.quantity = this.state.portfolioInfo.quantity + newQuantity);
		
		if (newPortfolioInfo.quantity === 0) {
			this.setState(() => ({
				inPortfolio: false,
				portfolioInfo: null
			}))
		}
		else {
			this.setState(() => ({
				portfolioInfo: newPortfolioInfo
			}))
		}
	}

	render () {
		return (
			<tr onClick={() => window.location.href = `stock/${this.state.symbol}`} className="table-row-data" id={`table-row-${this.state.symbol}`}>
				<td className="table-data" className="table-symbol">
					{this.state.symbol}
				</td>
				<td className="table-data" className="table-long-name">
					{this.state.longName}
				</td>
				<td className="table-data" className="table-watchlist">
					<button onClick={event => this.toggleWatchlist(event)} className="watchlist-button">
						<img  style={{filter: this.state.watchlistButtonState}} className="watchlist-icon" src={watchlistIcon}></img>
				</button>
				</td>
				<td className="table-data" className="table-price"><font color={this.priceColor}>$ {this.state.price}</font></td>
				<td className="table-data" className="table-change">
					$ {this.state.marketChange} ({this.state.marketChangePercent}) %</td>
				<td className="table-data" className="table-high">$ {this.state.dayHigh}</td>
				<td className="table-data" className="table-low">$ {this.state.dayLow}</td>
				<td className="table-data" className="table-close">
					<button onClick={event => this.buyStock(event)} id="buy-stock-index-page">Buy</button>
					{this.state.inPortfolio ? (
						<button onClick={event => this.sellStock(event)} id="sell-stock-index-page">Sell</button>
					) : (null)}
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


	componentWillUnmount() {
		console.log("Popular table unmounted")
	}

	// Removes stock from watchlist table.
	removeRow = (symbol) => {
		let filtered = this.state.stocksData.filter(stockComponent => stockComponent.key !== symbol);
		console.log(filtered)
		this.setState(state => ({
			stocksData: filtered
		}))
		if (filtered.length === 0) {
			showEmptyWatchlistMessage(true)
		}
	}

	render() {
		console.log(this.state.stocksData)
		return (
			<table className="popular-stocks-table">
				<thead>
					<tr id="all-table-headers">
						<th className="table-headers" id="table-symbol">Symbol</th>
						<th className="table-headers" id="table-long-name">Stock Name</th>
						<th className="table-headers" id="table-watchlist">Watchlist</th>
						<th className="table-headers" id="table-price">Market Price</th>
						<th className="table-headers" id="table-change">Market Change</th>
						<th className="table-headers" id="table-high">Day High</th>
						<th className="table-headers" id="table-low">Day Low</th>
						<th className="table-headers" id="table-close">Buy / Sell</th>
					</tr>
				</thead>
				<tbody id='popular-stocks-data'>
					{this.state.stocksData}
				</tbody>
			</table>
		)
	}
}


class PortfolioStockData extends React.Component {
	constructor(props) {
		super(props);
		let profitLosses = (parseInt(this.props.portfolio.liveStockData.regularMarketPrice) * this.props.portfolio.quantity) - parseInt(this.props.portfolio.totalSpent);
		this.state = {
			symbol: this.props.portfolio.symbol,
			longName: this.props.portfolio.liveStockData.longName,
			quantity: this.props.portfolio.quantity,
			currentPrice: parseInt(this.props.portfolio.liveStockData.regularMarketPrice),
			totalSpent: parseInt(this.props.portfolio.totalSpent),
			profitLosses: profitLosses.toFixed(2),
			isWatchlistPage: this.props.portfolio.isWatchlistPage,
			portfolioInfo: this.props.portfolio
		}

		// To change the color depending on rise and fall of price.	
		if (profitLosses > 0) {
			this.priceColor = "green";
		}
		else {
			this.priceColor = "red";
		}
		
		// Check if user is logged in.
		this.userLoggedIn = isUserLoggedIn();
	}

	buyStock = (event) => {
		event.stopPropagation();
		console.log('buy clicked');
		fetch('/get_user_info')
		.then(response => response.json())
		.then(data => {
			this.userInfo = data;
			ReactDOM.render(
				<BuySellPopup 
					motive='buy' 
					updateState={this.updateState} 
					userInfo={data} 
					stockInfo={this.props.portfolio.liveStockData} 
					updateOwnedShares={this.updateOwnedShares}
				/>, 
				document.querySelector('#popup-container')
			);
		})
	}

	sellStock = (event) => {
		event.stopPropagation();
		console.log('sell stock clicked');
		fetch('/get_user_info')
		.then(response => response.json())
		.then(data => {
			this.userInfo = data;
			ReactDOM.render(
				<BuySellPopup 
					motive='sell' 
					updateState={this.updateState} 
					userInfo={data} 
					stockInfo={this.props.portfolio.liveStockData}
					portfolioInfo={this.state.portfolioInfo} 
					updateOwnedShares={this.updateOwnedShares}
				/>, 
				document.querySelector('#popup-container')
			);
		})
		
	}

	// Updates table based on user's buy or sell.
	updateState = (newQuantity, motive) => {

		// if user buys more shares.
		if (motive === 'buy') {
			let totalQuantity = newQuantity +  this.state.quantity;
			let newTotalSpent = this.state.totalSpent + (newQuantity * this.state.currentPrice);
			let newProfitLosses = (totalQuantity * this.state.currentPrice) - newTotalSpent;
			console.log(newQuantity, newTotalSpent, newProfitLosses)
			this.setState(() => ({
				quantity: totalQuantity,
				totalSpent: newTotalSpent,
				profitLosses: newProfitLosses
			}));
		}

		// if user sells shares.
		else {
			let totalQuantity = this.state.quantity - newQuantity;
			let newTotalSpent = this.state.totalSpent - (newQuantity * this.state.currentPrice);
			let newProfitLosses = (totalQuantity * this.state.currentPrice) - newTotalSpent;
			console.log(totalQuantity, newTotalSpent, newProfitLosses)
			if (totalQuantity === 0) {
				this.props.removeRow(this.state.symbol);
			}
			this.setState(() => ({
				quantity: totalQuantity,
				totalSpent: newTotalSpent,
				profitLosses: newProfitLosses
			}));
		}
	}

	updateOwnedShares = (newQuantity, motive) => {

		console.log('updating', newQuantity, motive)
		
		// duplicate the portfolioInfo object
		let newPortfolioInfo = this.state.portfolioInfo;
		console.log(newPortfolioInfo, newQuantity)
		
		// check if motive is to buy or sell to credit or debit total price.
		motive === 'sell' ? 
			(newPortfolioInfo.quantity = this.state.portfolioInfo.quantity - newQuantity) :
			(newPortfolioInfo.quantity = this.state.portfolioInfo.quantity + newQuantity);
		this.setState(() => ({
			portfolioInfo: newPortfolioInfo
		}))
	}

	render () {
		return (
			<tr onClick={() => window.location.href = `stock/${this.state.symbol}`} className="table-row-data" id={`table-row-${this.state.symbol}`}>
				<td className="table-data" className="table-symbol">
					{this.state.symbol}
				</td>
				<td className="table-data" className="table-long-name">
					{this.state.longName}
				</td>
				<td className="table-data" className="table-quantity">{this.state.quantity}</td>
				<td className="table-data" className="table-total-spent">$ {this.state.totalSpent}</td>
				<td className="table-data" className="table-current-price">$ {this.state.currentPrice}</td>
				<td className="table-data" className="table-profit-loss">
					$ <font color={this.priceColor}>{this.state.profitLosses}</font>
				</td>
				<td className="table-data" className="table-buy-sell">
					<button onClick={event => this.buyStock(event)} id="buy-stock-index-page">Buy</button>
					<button onClick={event => this.sellStock(event)} id="sell-stock-index-page">Sell</button>
				</td>
			</tr>
		)
	}
}


class PortfolioStockTable extends React.Component {
	constructor(props) {
		super(props);
		this.portfolios = [] 
		let counter = 0;
		this.props.portfolios.forEach(portfolio => {
			counter += 1;
			console.log(counter)
			this.portfolios.push(<PortfolioStockData 
				key={portfolio.symbol} 
				portfolio={portfolio}
				removeRow={this.removeRow}
				clickHandler={this.removeRow} />)
		})
		console.log(this.portfolios)
		this.state = {
			portfolios: this.portfolios
		}
	}

	// Removes stock from portfolio table.
	removeRow = (symbol) => {
		console.log('remove row working')
		let filtered = this.state.portfolios.filter(portfolio => portfolio.key !== symbol);
		this.setState(() => ({
			portfolios: filtered
		}))
	}



	render() {
		console.log(this.state.portfolios)
		return (
			<table className="popular-stocks-table">
				<thead>
					<tr id="all-table-headers">
						<th className="table-headers" id="table-symbol">Symbol</th>
						<th className="table-headers" id="table-long-name">Stock Name</th>
						<th className="table-headers" id="table-quantity">Quantity</th>
						<th className="table-headers" id="table-current-price">Total Spent</th>
						<th className="table-headers" id="table-total-spent">Current Price</th>
						<th className="table-headers" id="table-profit-loss">Profit/Loss (current)</th>
						<th className="table-headers" id="table-buy-sell">Buy / Sell</th>
					</tr>
				</thead>
				<tbody>
					{this.state.portfolios}
				</tbody>
			</table>
		)
	}
}


class ProfileInfo extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props.userInfo.portfoliosOwned)
		let netProfitLoss = this.props.userInfo.profits - this.props.userInfo.losses
		this.state = {
			username: this.props.userInfo.username,
			balance: this.props.userInfo.balance,
			profits: this.props.userInfo.profits,
			losses: this.props.userInfo.losses,
			portfoliosOwned: this.props.userInfo.portfoliosOwned,
			sharesOwned: this.props.userInfo.sharesOwned,
			netProfitLoss: netProfitLoss.toFixed(2),
			highestSpent: this.props.userInfo.highestSpent,
			highestSpentStock: this.props.userInfo.highestSpentStock,
			highestShares: this.props.userInfo.highestShares,
			highestSharesStock: this.props.userInfo.highestSharesStock,
			totalInvestment: this.props.userInfo.totalInvestment,
			profilePicture: profileIcon

		}
	}

	render() {
		console.log('line 1036 working')
		return (
			<div id='user-info-container'>
				<div id='username-header'>
					<div className='user-info-div' id='user-profile-picture'>
						<img src={this.state.profilePicture} id='profile-pic'/>
					</div>
					<div className='user-info-div' id='username-profile-page'>
						<div id='username-actual'>
							{this.state.username}
						</div>
						<div id='dmat-id'>
							DMAT: XXXXXXXXX
						</div>
					</div>
					<button className='user-info-div' id='settings-button-div'>
						<div className='button-child'>
							<img src={settingsIcon} id="settings-icon"></img>
						</div>
						<div className='button-child' id='setting-text'>Settings</div>
					</button>
					<div className='user-info-div' id='logout-button-div'>
						<button onClick={() => window.location='/logout'} id='logout-button'>Logout</button>
					</div>
				</div>
				<h2>User Stats</h2>
				<div id="profile-parent-grid">
					<div className='user-stats-grid' id="user-balance">
						<font className='user-info-large'>
							$ {this.state.balance}
						</font>
						<div className='user-info-small'>Balance</div>
					</div>
					<div className='user-stats-grid' id="user-profits">
						<font style={{color: 'green'}} className='user-info-large'>
							$ {this.state.profits}
						</font>
						<div className='user-info-small'>Profits</div>
					</div>
					<div  className='user-stats-grid' id="user-losses">
						<font style={{color: 'red'}} className='user-info-large'>
							$ {this.state.losses}
						</font>
						<div className='user-info-small'>Loss</div>
					</div>
					<div className='user-stats-grid' id="user-net-profit-loss">
						<font className='user-info-large'>
							$ {this.state.netProfitLoss > 0 ? 
								('+' + this.state.netProfitLoss) :
								(this.state.netProfitLoss) 
							}
						</font>
						<div className='user-info-small'>Net Profit/Loss</div>
					</div>
					<div className='user-stats-grid' id='user-portfolios-owned'>
						<font className='user-info-large'>
							{this.state.portfoliosOwned}
						</font>
						<div className='user-info-small'>Stocks Owned</div>
					</div>
					<div className='user-stats-grid' id="user-shares-owned">
						<font className='user-info-large'>
							{this.state.sharesOwned}
						</font>
						<div className='user-info-small'>Shares Owned</div>
					</div>
				</div>
				<h2>Additional Info</h2>
				<div id="profile-parent-grid">
					<div className='user-stats-grid' id="user-highest-spent">
						<font className='user-info-large'>
							{this.state.highestSpentStock}
						</font>
						<div className='user-info-small'>Highest Spent</div>
						<font className='user-info-large'>
							$ {this.state.highestSpent}
						</font>
					</div>
					<div className='user-stats-grid' id="user-highest-shares">
						<font className='user-info-large'>
							{this.state.highestSharesStock}
						</font>
						<div className='user-info-small'>Highest Shares</div>
						<font className='user-info-large'>
							{this.state.highestShares}
						</font>
					</div>
					<div className='user-stats-grid' id="user-highest-shares">
						<font className='user-info-large'>
							$ {this.state.totalInvestment}
						</font>
						<div className='user-info-small'>Total Investment</div>
					</div>
				</div>
			</div>
		)
	}

}


// Displays the primary stock info in individual stock page.
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


// Displays individual news related to current stock.
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


// Displays stocknews in individual stock page.
class StockNewsParent extends React.Component {
	constructor(props) {
		super(props);
		this.newsChildrenList = []

		// Add stock news components into a list.
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


class TransactionData extends React.Component {
	constructor(props) {
		super(props);
		if (this.props.transactionInfo.transactionType === 'BUY') {
			this.rowColor = 'rgb(19,255,130)';
		}
		else {
			// rgb(255,89,109)
			this.rowColor = 'red';
		}
	}
	render() {
		return (
			<tr className="table-row-data">
				<td className="table-data" className="table-symbol">
					{this.props.transactionInfo.symbol}
				</td>
				<td className="table-data" className="table-long-name">
					{this.props.transactionInfo.longName}
				</td>
				<td className="table-data" className="table-quantity">
					{this.props.transactionInfo.quantity}
				</td>
				<td className="table-data" className="table-timestamp">
					{this.props.transactionInfo.timestamp}</td>
				<td className="table-data" className="table-price-bought">
					$ {this.props.transactionInfo.priceAtPurchase}
				</td>
				<td className="table-data" className="table-transaction-type">
					<font color={this.rowColor}>{this.props.transactionInfo.transactionType}</font>
				</td>
			</tr>
		)
	}
}


class TransactionTable extends React.Component {
	constructor(props) {
		super(props);
		this.transactionData = [];

		// Add Transaction row data components to a list.
		this.props.transactionData.forEach(transactionInfo => {
			this.transactionData.push(<TransactionData 
				transactionInfo={transactionInfo} 
				key={transactionInfo.transactionID} />)
		})
		this.state = {
			transactionData: this.transactionData
		}
	}
	
	render() {
		return (
			<table className="popular-stocks-table">
				<thead>
					<tr id="all-table-headers">
					<th className="table-headers" id="table-symbol">Symbol</th>
						<th className="table-headers" id="table-long-name">Stock Name</th>
						<th className="table-headers" id="table-quantity">Quantity</th>
						<th className="table-headers" id="table-timestamp">Timestamp</th>
						<th className="table-headers" id="table-price-at-purchase">Price Bought/Sold</th>
						<th className="table-headers" id="table-transaction-type">Transaction Type</th>

					</tr>
				</thead>
				<tbody>
					{this.state.transactionData}
				</tbody>
			</table>
		)
	}
}


// Render the autocomplete div for  the search bar.
ReactDOM.render(<Autocomplete />, document.querySelector('#top-bar-search-div'))


// To get CSRF token from cookies.
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


// To check if the current user is logged in .
function isUserLoggedIn() {
	let userLoggedIn = document.querySelector('#user-logged-in').innerHTML;
	if (userLoggedIn === 'true') {
		return true;
	}
	else {
		return false;
	}
}


// Show the user is current page location by highlighting the elem in navbar.
// Immediately Invoked Function Expression
(function indicateCurrentPage() {
	let currentPath = window.location.pathname;
	const mapPathToID = {
		'/': '#top-bar-home',
		'/my_watchlist': '#top-bar-watchlist',
		'/my_portfolio': '#top-bar-portfolio',
		'/my_transactions': '#top-bar-transactions',
		'/my_profile': '#top-bar-profile'
	}
	console.log(mapPathToID[currentPath])
	let navElement = document.querySelector(mapPathToID[currentPath]);
	navElement ? (navElement.style.borderBottom = '2px solid white') : (null);
})()

