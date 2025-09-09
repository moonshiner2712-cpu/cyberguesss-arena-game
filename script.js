// Game State
let gameState = {
    level: 1,
    score: 0,
    wallet: null,
    currentTrader: null,
    helpUsed: false,
    maxLevel: 500,
    isPlaying: false,
    hasPaid: false,
    traderData: [],
    shuffledIndices: [], // Array untuk menyimpan urutan acak
    difficulty: 'easy' // Tingkat kesulitan
};

// DOM Elements
const gameArea = document.getElementById('gameArea');
const walletPanel = document.getElementById('walletPanel');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const currentLevelSpan = document.getElementById('currentLevel');
const gameImage = document.getElementById('gameImage');
const loadingIndicator = document.getElementById('loadingIndicator');
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const helpBtn = document.getElementById('helpBtn');
const showKeyBtn = document.getElementById('showKeyBtn');
const privateKey = document.getElementById('privateKey');
const walletAddress = document.getElementById('walletAddress');
const walletBalance = document.getElementById('walletBalance');
const depositBtn = document.getElementById('depositBtn');
const playBtn = document.getElementById('playBtn');
const traderRank = document.getElementById('traderRank');
const traderScore = document.getElementById('traderScore');
const top25List = document.getElementById('top25List');

// Initialize Game
function initGame() {
    loadTraderData();
    loadLeaderboard();
    setupEventListeners();
    
    // Check if wallet already connected
    const savedWallet = localStorage.getItem('cyberguess_wallet');
    if (savedWallet) {
        gameState.wallet = JSON.parse(savedWallet);
        showWalletPanel();
    }
}

// Fungsi untuk mengacak array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Load Trader Data from Arena.Trade (Top 500)
function loadTraderData() {
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    gameImage.parentElement.classList.add('loading');
    
    // Simulate loading delay
    setTimeout(() => {
        // Data Top 500 Trader dari Arena.Trade (contoh data)
        // Dalam implementasi nyata, data ini bisa diambil dari API
        const arenaTradeTop500 = [
            // Top 10 (data sebenarnya dari Arena.Trade)
            {
                rank: 1,
                name: "CryptoKing",
                score: 2847392,
                avatar: "https://arena.trade/images/traders/cryptoking.png",
                bio: "Bullish trader with 1000x returns"
            },
            {
                rank: 2,
                name: "WhaleMaster",
                score: 2738192,
                avatar: "https://arena.trade/images/traders/whalemaster.png",
                bio: "Specializes in large cap cryptocurrencies"
            },
            {
                rank: 3,
                name: "BullRun2023",
                score: 2654321,
                avatar: "https://arena.trade/images/traders/bullrun2023.png",
                bio: "Momentum trader focusing on trending coins"
            },
            {
                rank: 4,
                name: "DiamondHands",
                score: 2543210,
                avatar: "https://arena.trade/images/traders/diamondhands.png",
                bio: "Long-term holder with iron resolve"
            },
            {
                rank: 5,
                name: "MoonShot",
                score: 2432109,
                avatar: "https://arena.trade/images/traders/moonshot.png",
                bio: "High-risk high-reward specialist"
            },
            {
                rank: 6,
                name: "HODLer",
                score: 2321098,
                avatar: "https://arena.trade/images/traders/hodler.png",
                bio: "Believes in long-term crypto adoption"
            },
            {
                rank: 7,
                name: "SatoshiFan",
                score: 2210987,
                avatar: "https://arena.trade/images/traders/satoshifan.png",
                bio: "Bitcoin maximalist and evangelist"
            },
            {
                rank: 8,
                name: "DeFiLord",
                score: 2109876,
                avatar: "https://arena.trade/images/traders/defilord.png",
                bio: "DeFi protocols expert and yield farmer"
            },
            {
                rank: 9,
                name: "NFTWhale",
                score: 2098765,
                avatar: "https://arena.trade/images/traders/nftwhale.png",
                bio: "NFT collector and digital art investor"
            },
            {
                rank: 10,
                name: "StableKing",
                score: 1987654,
                avatar: "https://arena.trade/images/traders/stableking.png",
                bio: "Stablecoin strategist and risk manager"
            },
            // Lanjutan sampai rank 500 (contoh data)
            // Anda bisa menambahkan data trader lainnya di sini
            // Format: { rank, name, score, avatar, bio }
            {
                rank: 11,
                name: "AltCoinHunter",
                score: 1900000,
                avatar: "https://arena.trade/images/traders/altcoinhunter.png",
                bio: "Specializes in alternative cryptocurrencies"
            },
            {
                rank: 12,
                name: "YieldFarmer",
                score: 1850000,
                avatar: "https://arena.trade/images/traders/yieldfarmer.png",
                bio: "DeFi yield optimization expert"
            },
            // ... tambahkan sampai rank 500
            // Untuk contoh, saya akan generate data sampai rank 50
        ];
        
        // Generate data untuk rank 13-500
        for (let i = 13; i <= 500; i++) {
            arenaTradeTop500.push({
                rank: i,
                name: `Trader${i}`,
                score: Math.floor(Math.random() * 2000000),
                avatar: `https://arena.trade/images/traders/trader${i}.png`,
                bio: `Active trader on Arena.Trade leaderboard`
            });
        }
        
        gameState.traderData = arenaTradeTop500;
        
        // Buat array indeks acak (0-499)
        const indices = Array.from({length: 500}, (_, i) => i);
        gameState.shuffledIndices = shuffleArray(indices);
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        gameImage.parentElement.classList.remove('loading');
        
        // Load first trader if game is active
        if (gameState.isPlaying && gameState.hasPaid) {
            loadGameBoard();
        }
    }, 1500);
}

// Setup Event Listeners
function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    submitBtn.addEventListener('click', submitGuess);
    helpBtn.addEventListener('click', useHelp);
    showKeyBtn.addEventListener('click', togglePrivateKey);
    depositBtn.addEventListener('click', depositAVAX);
    playBtn.addEventListener('click', payToPlay);
    
    // Enter key to submit
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitGuess();
    });
}

// Connect Wallet
function connectWallet() {
    // Simulasi koneksi wallet
    const walletAddress = '0x' + Math.random().toString(16).substr(2, 40);
    const privateKey = '0x' + Math.random().toString(16).substr(2, 64);
    
    gameState.wallet = {
        address: walletAddress,
        privateKey: privateKey,
        balance: 0.1 // Saldo awal untuk demo
    };
    
    localStorage.setItem('cyberguess_wallet', JSON.stringify(gameState.wallet));
    showWalletPanel();
    showNotification('Wallet connected successfully!', 'success');
}

// Show Wallet Panel
function showWalletPanel() {
    if (gameState.wallet) {
        walletAddress.textContent = gameState.wallet.address;
        privateKey.textContent = gameState.wallet.privateKey;
        walletBalance.textContent = gameState.wallet.balance.toFixed(4);
        walletPanel.classList.remove('hidden');
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.disabled = true;
        
        // Update play button state
        updatePlayButton();
    }
}

// Toggle Private Key
function togglePrivateKey() {
    privateKey.classList.toggle('revealed');
}

// Deposit AVAX (Simulasi)
function depositAVAX() {
    const amount = prompt('Enter AVAX amount to deposit:');
    if (amount && !isNaN(amount)) {
        gameState.wallet.balance += parseFloat(amount);
        walletBalance.textContent = gameState.wallet.balance.toFixed(4);
        showNotification(`Deposited ${amount} AVAX successfully!`, 'success');
        updatePlayButton();
    }
}

// Pay to Play
function payToPlay() {
    if (gameState.wallet.balance >= 0.02) {
        gameState.wallet.balance -= 0.02;
        gameState.hasPaid = true;
        gameState.isPlaying = true;
        walletBalance.textContent = gameState.wallet.balance.toFixed(4);
        loadGameBoard();
        updatePlayButton();
        showNotification('Payment successful! Game started.', 'success');
    } else {
        showNotification('Insufficient balance. Please deposit AVAX.', 'error');
    }
}

// Update Play Button
function updatePlayButton() {
    if (gameState.hasPaid) {
        playBtn.textContent = 'Playing...';
        playBtn.disabled = true;
    } else if (gameState.wallet.balance >= 0.02) {
        playBtn.disabled = false;
    } else {
        playBtn.disabled = true;
    }
}

// Load Game Board
function loadGameBoard() {
    if (!gameState.hasPaid || gameState.traderData.length === 0 || gameState.shuffledIndices.length === 0) return;
    
    currentLevelSpan.textContent = gameState.level;
    
    // Get current trader data dari urutan acak
    const randomIndex = gameState.shuffledIndices[gameState.level - 1];
    gameState.currentTrader = gameState.traderData[randomIndex];
    
    // Update game image and info
    gameImage.src = gameState.currentTrader.avatar;
    gameImage.alt = `Guess this trader: ${gameState.currentTrader.name}`;
    traderRank.textContent = `Rank: #${gameState.currentTrader.rank}`;
    traderScore.textContent = `Score: ${gameState.currentTrader.score.toLocaleString()}`;
    
    // Update difficulty indicator
    updateDifficulty();
    
    // Reset input and help
    guessInput.value = '';
    gameState.helpUsed = false;
    
    // Reset card flip
    document.querySelector('.card-inner').classList.remove('flipped');
}

// Update difficulty indicator
function updateDifficulty() {
    // Remove existing difficulty indicator
    const existingIndicator = document.querySelector('.difficulty-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new difficulty indicator
    const difficultyIndicator = document.createElement('div');
    difficultyIndicator.className = 'difficulty-indicator';
    
    // Add random mode indicator
    const randomMode = document.createElement('div');
    randomMode.className = 'random-mode';
    
    const gameCard = document.querySelector('.game-card');
    gameCard.appendChild(difficultyIndicator);
    gameCard.appendChild(randomMode);
    
    // Set difficulty based on level
    if (gameState.level <= 100) {
        difficultyIndicator.classList.add('difficulty-easy');
    } else if (gameState.level <= 250) {
        difficultyIndicator.classList.add('difficulty-medium');
    } else if (gameState.level <= 400) {
        difficultyIndicator.classList.add('difficulty-hard');
    } else {
        difficultyIndicator.classList.add('difficulty-extreme');
    }
}

// Submit Guess
function submitGuess() {
    if (!gameState.isPlaying || !gameState.hasPaid) {
        showNotification('Please pay to play first!', 'error');
        return;
    }
    
    const guess = guessInput.value.trim();
    if (!guess) {
        showNotification('Please enter your guess!', 'error');
        return;
    }
    
    const isCorrect = guess.toLowerCase() === gameState.currentTrader.name.toLowerCase();
    
    if (isCorrect) {
        // Correct answer
        document.getElementById('resultText').textContent = `CORRECT! It's ${gameState.currentTrader.name} (Rank #${gameState.currentTrader.rank})`;
        document.querySelector('.card-inner').classList.add('flipped');
        
        gameState.score += 100;
        gameState.isPlaying = false;
        
        showNotification('Correct! +100 points', 'success');
        
        // Next level after delay
        setTimeout(() => {
            if (gameState.level < gameState.maxLevel) {
                gameState.level++;
                
                // Check if need to pay for next level
                if (gameState.level % 25 === 0) {
                    if (gameState.wallet.balance >= 0.025) {
                        gameState.wallet.balance -= 0.025;
                        walletBalance.textContent = gameState.wallet.balance.toFixed(4);
                        loadGameBoard();
                        gameState.isPlaying = true;
                        updatePlayButton();
                        showNotification('Level unlocked! Continue playing.', 'success');
                    } else {
                        showNotification('Insufficient balance to unlock next level. Please deposit 0.025 AVAX.', 'error');
                        gameState.hasPaid = false;
                        updatePlayButton();
                    }
                } else {
                    loadGameBoard();
                    gameState.isPlaying = true;
                }
            } else {
                showNotification('Congratulations! You completed all levels!', 'success');
                gameState.hasPaid = false;
                updatePlayButton();
            }
        }, 2500);
    } else {
        // Wrong answer
        showNotification('Wrong answer! Try again.', 'error');
        guessInput.value = '';
        guessInput.focus();
    }
}

// Use Help
function useHelp() {
    if (!gameState.isPlaying || !gameState.hasPaid) {
        showNotification('Please pay to play first!', 'error');
        return;
    }
    
    if (gameState.helpUsed) {
        showNotification('You already used help for this level!', 'error');
        return;
    }
    
    if (gameState.wallet.balance >= 0.005) {
        gameState.wallet.balance -= 0.005;
        walletBalance.textContent = gameState.wallet.balance.toFixed(4);
        gameState.helpUsed = true;
        
        // Show hint based on trader info
        let hint = '';
        const trader = gameState.currentTrader;
        
        // Berikan hint yang lebih spesifik karena mode random
        if (trader.rank <= 10) {
            hint = `This trader is in the TOP 10! Very famous!`;
        } else if (trader.rank <= 50) {
            hint = `This trader is in the TOP 50! Well-known trader!`;
        } else if (trader.rank <= 100) {
            hint = `This trader is in the TOP 100! Recognizable name!`;
        } else if (trader.rank <= 250) {
            hint = `This trader is in the TOP 250! Mid-tier trader!`;
        } else {
            hint = `This trader is in the TOP 500! Lesser-known trader!`;
        }
        
        // Tambahkan bio hint jika available
        if (trader.bio) {
            hint += ` Bio: ${trader.bio}`;
        }
        
        // Berikan hint tambahan untuk mode random
        hint += ` Remember: Traders appear in RANDOM order!`;
        
        showNotification(`Hint: ${hint}`, 'info');
    } else {
        showNotification('Insufficient balance for help. Please deposit 0.005 AVAX.', 'error');
    }
}

// Load Leaderboard
function loadLeaderboard() {
    top25List.innerHTML = '';
    
    // Get top 25 traders
    const top25 = gameState.traderData.slice(0, 25);
    
    top25.forEach(trader => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        let rankClass = '';
        let rankIcon = `#${trader.rank}`;
        
        if (trader.rank === 1) {
            rankClass = 'gold';
            rankIcon = '🥇';
        } else if (trader.rank === 2) {
            rankClass = 'silver';
            rankIcon = '🥈';
        } else if (trader.rank === 3) {
            rankClass = 'bronze';
            rankIcon = '🥉';
        }
        
        item.innerHTML = `
            <span class="rank ${rankClass} neon-text">${rankIcon}</span>
            <img src="${trader.avatar}" class="player-avatar" alt="${trader.name}">
            <span class="player-name">${trader.name}</span>
            <span class="player-score">${trader.score.toLocaleString()} $ARTGA</span>
        `;
        
        top25List.appendChild(item);
    });
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.5s ease;
        max-width: 300px;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #00ff00, #00cc00)';
            notification.style.borderLeft = '4px solid #00ff00';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #ff0040, #cc0033)';
            notification.style.borderLeft = '4px solid #ff0040';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #00d9ff, #0099cc)';
            notification.style.borderLeft = '4px solid #00d9ff';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', initGame);
