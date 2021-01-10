fetch('/get_user_stats')
.then(response =>  response.json())
.then(data => {
    console.log(data);
    ReactDOM.render(
        <ProfileInfo userInfo={data} />, 
        document.querySelector('#profile-info-container')
    )
})
