
let cryptos = [];
let filteredCryptos = [];

const cryptoGrid = document.getElementById('cryptoGrid');
const loadingGrid = document.getElementById('loadingGrid');
const errorDiv = document.getElementById('errorDiv');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const lastUpdated = document.getElementById('lastUpdated');

const topCryptos = [
    'Bitcoin'
];

function fetchCryptoData() {
    fetch('https://api.diadata.org/v1/assetQuotation/Bitcoin/0x0000000000000000000000000000000000000000')
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) {
                data = [data];
            }

            cryptos = data.map(crypto => ({
                name: crypto.name || crypto.Asset || 'Bitcoin',
                symbol: crypto.symbol || crypto.Symbol || '',
                current_price: crypto.current_price || crypto.Price || 0
            }));

            filteredCryptos = allCryptos;
            displayCryptos(filteredCryptos);
        })
        .catch(err => console.error('Error fetching data', err));
}

searchInput.addEventListener('keydown', function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const searchTerm = searchInput.value.trim();

        if (searchTerm === "") {
            // If search is empty, reset to all cryptos
            displayCryptos(cryptos);
        } else {
            filterCryptos(searchTerm);
        }
    }
});

function filterCryptos(searchTerm) {
    const term = searchTerm.toLowerCase();
    const results = cryptos.filter(crypto => {
        const name = crypto.name?.toLowerCase() || '';
        const symbol = crypto.symbol?.toLowerCase() || '';
        return name.includes(term) || symbol.includes(term);
    });

    displayCryptos(results);
}


function displayCryptos(cryptos) {
    if (!cryptos || cryptos.length === 0) {
        cryptoGrid.innerHTML = `<div style="text-align: center; color: white; padding: 40px;">
      
        </div>`;
        return;
    }

    cryptoGrid.innerHTML = cryptos.map(crypto => {
        const priceChange24h = crypto.price_change_percentage_24h || 0;
        const priceChange7d = crypto.price_change_percentage_7d || 0;
        const priceChange1h = crypto.price_change_percentage_1h || 0;

        return `
            <div class="crypto-card">
                <div class="crypto-header">
                    <div class="crypto-info">
                        <img src="btc.jpeg" alt="${crypto.name}" class="crypto-icon">
                        <div>
                            <div class="crypto-name">${crypto.name}</div>
                            <div class="crypto-symbol">${crypto.symbol || ''}</div>
                        </div>
                    </div>
                    <div class="crypto-rank">${crypto.market_cap_rank || 'Bitcoin'}</div>
                </div>
                <div class="crypto-price">$${formatPrice(crypto.current_price)}</div>
                <div class="market-cap">
                    Market Cap: $${formatLargeNumber(crypto.market_cap)}
                </div>
                <div class="crypto-changes">
                    <div class="change-item">1h</div>
                    <div class="change-value ${getChangedClass(priceChange1h)}">
                        ${formatPercentage(priceChange1h)}
                    </div>
                </div>
                <div class="crypto-changes">
                    <div class="change-item">24h</div>
                    <div class="change-value ${getChangedClass(priceChange24h)}">
                        ${formatPercentage(priceChange24h)}
                    </div>
                </div>
                <div class="crypto-changes">
                    <div class="change-item">7d</div>
                    <div class="change-value ${getChangedClass(priceChange7d)}">
                        ${formatPercentage(priceChange7d)}
                    </div>
                </div>
                <div class="crypto-changes">
                    <div class="change-item">Volume 24h</div>
                    <div class="change-value neutral">
                        ${formatLargeNumber(crypto.total_volume)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return 'crypto';
    }
    const numPrice = Number(price);
    if (numPrice >= 1) {
        return numPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        return numPrice.toFixed(6);
    }
}

function formatLargeNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return 'crypto';
    }
    const n = Number(num);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    return n.toLocaleString('en-US');
}

function formatPercentage(percentage) {
    if (percentage === null || percentage === undefined) return 'crypto';
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
}

function getChangedClass(percentage) {
    if (percentage > 0) return "positive";
    if (percentage < 0) return "negative";
    return "neutral";
}

function showLoading(show) {
    loadingGrid.style.display = show ? 'block' : 'none';
    if (show) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    } else {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
    }
}

function showError() {
    errorDiv.classList.add('show');
}

function hideError() {
    errorDiv.classList.remove('show');
}

function updateLastUpdatedTime() {
    const now = new Date();
    lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

refreshBtn.addEventListener('click', fetchCryptoData);

// Removed the 'input' listener to stop instant searching
// searchInput.addEventListener('input', (e) => {
//     filterCryptos(e.target.value);
// });

setInterval(fetchCryptoData, 60000);
fetchCryptoData();
