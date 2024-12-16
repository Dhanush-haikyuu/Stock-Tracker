let isLoggedIn = false;

async function handleInputChange(inputValue) {
    const suggestionsContainer = document.getElementById('suggestions');

    suggestionsContainer.innerHTML = '';

    
    const companyNames = await fetchCompanyNames(inputValue);
    displaySuggestions(companyNames);
}

async function fetchCompanyNames(query) {

    const staticCompanyList = ['TCS', 'HD', 'IBM','AAPL', 'GOOGL','AMZN','MSFT','TSLA','JPM','V','PYPL','BA','NVDA','GS','DIS','NFLX','INTC','VZ','CVX','SBUX','WMT','PG','KO','CMCSA','BAIDU','GS','ADBE','CRM','AMD','ORCL','CSCO','MU','UBER','LYFT','SNAP','GS','GS','GE','CAT','RTX','JD','BABA','ABBV','AAPL','MSFT','AMZN','FB','JPM','PYPL','NVDA','INTC','VZ','RTX','CMG','BIIB','GILD','COST','VOD','TM','ORCL','INTU','SAP','NOW','VMW','CTXS','RHT','NTAP','RPD','INFY','ITC','HERO','BTC','M','BABA','ETSY','TGT','JNJ','PFE','BAC','F','GM','TWTR','XOM','SPY','CTSH'];
    return staticCompanyList.filter(company => company.toLowerCase().startsWith(query.toLowerCase()));
}

function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestions.forEach(company => {
        const suggestionItem = document.createElement('div');
        suggestionItem.innerText = company;
        suggestionItem.addEventListener('click', () => selectSuggestion(company));
        suggestionsContainer.appendChild(suggestionItem);
    });
}

function selectSuggestion(selectedCompany) {

    document.getElementById('symbol').value = selectedCompany;


    document.getElementById('suggestions').innerHTML = '';
}

// async function login() {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

  
//     if (username === '' && password === '') {
//         isLoggedIn = true;
//         document.getElementById('login-form').style.display = 'none';
//         document.getElementById('search-container').style.display = 'block';
//     } else {
//         alert('Invalid credentials. Please try again.');
//     }
// }

async function searchStock() {
    if (isLoggedIn) {
        alert('Please login first.');
        return;
    }

    const symbolInput = document.getElementById('symbol');
    const resultContainer = document.getElementById('result-container');
    const symbol = symbolInput.value.toUpperCase();

    if (!symbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    try {

        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_ALPHA_VANTAGE_API_KEY`);
        const data = await response.json();

        if (data['Global Quote']) {
            const stockData = data['Global Quote'];

        
            const exchangeRateResponse = await fetch(`https://open.er-api.com/v6/latest/USD`);
            const exchangeRateData = await exchangeRateResponse.json();
            const usdToInrRate = exchangeRateData.rates.INR;

         
            const openPriceInr = (parseFloat(stockData['02. open']) * usdToInrRate).toFixed(2);
            const highPriceInr = (parseFloat(stockData['03. high']) * usdToInrRate).toFixed(2);
            const lowPriceInr = (parseFloat(stockData['04. low']) * usdToInrRate).toFixed(2);
            const currentPriceInr = (parseFloat(stockData['05. price']) * usdToInrRate).toFixed(2);

        
            displayStockData(resultContainer, symbol, {
                ...stockData,
                '02. open': openPriceInr,
                '03. high': highPriceInr,
                '04. low': lowPriceInr,
                '05. price': currentPriceInr,
            });
        } else {
            resultContainer.innerHTML = '<p>Error fetching stock data. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
        resultContainer.innerHTML = '<p>Error fetching stock data. Please try again.</p>';
    }
}

function displayStockData(container, symbol, data) {
    const currentPrice = parseFloat(data['05. price']);
    const openPrice = parseFloat(data['02. open']);
    const arrowClass = currentPrice >= openPrice ? 'arrow-up' : 'arrow-down';
    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    const volume = parseInt(data['06. volume']);
    const previousVolume = container.dataset.previousVolume || volume;
    const volumeChangeRate = ((volume - previousVolume) / previousVolume) * 100;
    const marketStatus = currentPrice >= openPrice ? 'Positive' : 'Negative';
    const statusMessage = getStatusMessage(marketStatus);

    
    container.innerHTML = `
        <b><h2 style="color:white">${symbol}</h2>
        <span><p style="color:white;font-family:sans-serif;">Open Price: ₹${data['02. open']}</p>
        <span><p style="color:white;font-family:sans-serif;">High Price: ₹${data['03. high']}</p>
        <span><p style="color:white;font-family:sans-serif;">Low Price: ₹${data['04. low']}</p>
        <span><p style="color:white;font-family:sans-serif;">Current Price: ₹${data['05. price']} <span class="${arrowClass}">&#x219${currentPrice >= openPrice ? 1 : 3};</span></p>
        <span><p style="color:white;font-family:sans-serif;">Volume: ${data['06. volume']}(${volumeChangeRate.toFixed(2)}%) ${volumeChangeRate >= 0 ? '📈' : '📉'}</p>
        <span><p style="color:white;font-family:sans-serif;">Last Updated: ${now.toLocaleString()}</p>
        <span><p style="color:white;font-family:sans-serif;">Login Time: ${currentTime}</p>
        <span><p style="color:white;font-family:sans-serif;">Market Status: ${marketStatus}</p>
        <span><p style="color:white;font-family:sans-serif;">Status: ${statusMessage}</p></b>
    `;
    container.dataset.previousVolume = volume;

}

function getStatusMessage(marketStatus) {
    if (marketStatus === 'Positive') {
        return 'The market is positive today. Prices are on the rise.';
    } else if (marketStatus === 'Negative') {
        return 'The market is negative today. Prices are falling.';
    } else {
        return 'The market status is unknown.';
    }
}

