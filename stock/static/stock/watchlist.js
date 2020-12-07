

class TestComponent extends React.Component {
    render() {
        return (
            <div>
                <h1>Hello!</h1>
            </div>
        )
    }
}

ReactDOM.render(<TestComponent />, document.querySelector('#test-stocks'))


fetch('/get_watchlist')
.then(response => response.json())
.then(data => {
    console.log(data);
    let ul = document.createElement('ul');
    data.forEach(stock => {
        let li = document.createElement('li');
        li.innerHTML = stock.symbol;
        ul.appendChild(li);
    })
    console.log(ul)
    let watchlistDiv = document.querySelector('#watchlist-stocks');
    watchlistDiv.appendChild(ul);
})