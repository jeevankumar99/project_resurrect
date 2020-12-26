fetch('/get_transactions')
.then(response => response.json())
.then(data => {
    console.log(data);
    ReactDOM.render(<TransactionTable transactionData={data} />, document.querySelector('#transactions-table'));
})