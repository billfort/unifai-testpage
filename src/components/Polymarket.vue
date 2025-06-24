<template>
    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <button @click="connWallet">connect wallet</button>
        <p v-if="walletAddress" style="color: blue; font-size: small;">address: {{ walletAddress }}</p>
    </div>

    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <div>Please paste the polymarket event URL here</div>
        <textarea type="" v-model="eventUrl" placeholder="Paste polymarket event URL here" multiple="true" rows="4"
            style="width: 100%; text-align: center;" />
        <button @click="getEvent">Get Event</button>
        <div v-if="tokenId" style="word-break: break-all; font-size: small; color: blue;">
            event market: {{ market }}<br>
            {{ outcome }}: {{ tokenId }}<br>
        </div>
    </div>

    <div class="row">
        <div style="width: 200px;">amount to buy</div>
        <input type="number" v-model="amount" placeholder="amount" />
    </div>
    <div class="row" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <button @click="createBuyTxn">create buy txn</button>
        <button @click="buildBuyTxn">build buy txn</button>
        <button @click="approve">approve allowance</button>
        <button @click="marketOrder">market order buy</button>
    </div>

    <div class="mask" v-if="loading">
        <div class="loader"></div>
    </div>

    <div class="row">
        <button @click="getUserPosition">get user position</button>
    </div>
    <table v-if="positions.length"
        style="width: 100%; border-collapse: collapse; border: 1px solid lightgray; color: blue;" border="1">
        <thead>
            <tr>
                <th>title</th>
                <th>tokenId</th>
                <th>size</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="p in positions" :key="p.tokenId">
                <td style="word-break: break-all; font-size: small;">{{ p.title }}</td>
                <td style="word-break: break-all; font-size: small;">{{ p.asset }}</td>
                <td>{{ Number(p.size).toFixed(2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="row">
        <button @click="createSellTxn">create sell txn</button>
        <button @click="buildSellTxn">build sell txn</button>
        <button @click="marketOrder">market order sell</button>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import { ClobClient, OrderType, } from "@polymarket/clob-client";

const txBuilderUrl = '/txbuilder'
const dataUrl = 'https://data-api.polymarket.com'
const clobUrl = 'https://clob.polymarket.com/'
const eventPrefix = 'https://polymarket.com/event/'
const chainId = 137

const eventUrl = ref('https://polymarket.com/event/us-recession-in-2025?tid=1750725700356');
const tokenId = ref('');
const outcome = ref('');
const market = ref('');
const walletAddress = ref('');
const amount = ref(1);
const txId = ref('');
const headers = { 'Content-Type': 'application/json', }
const transactions = ref([]);
const positions = ref([]);
const loading = ref(false);

const getUserPosition = async () => {
    if (!walletAddress.value) {
        alert('Please connect wallet first')
        return
    }
    try {
        loading.value = true;
        const res = await fetch(`${dataUrl}/positions?user=${walletAddress.value}`)
        positions.value = await res.json();

        for (let p of positions.value) {
            console.log('title: ', p.title, 'tokenId: ', p.asset, 'size: ', p.size)
        }
    } catch (error) {
        console.error('get user position: ', error)
        alert('Fail to get user position, please check the wallet address is correct')
    } finally {
        loading.value = false;
    }
}

const createBuyTxn = async () => {
    if (!tokenId.value) {
        alert('Please get event first')
        return
    }
    try {
        loading.value = true;
        const resp = await fetch(`${txBuilderUrl}/create`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({
                type: 'polymarket/marketOrderBuy',
                payload: {
                    tokenId: tokenId.value,
                    amount: amount.value,
                }
            })
        })
        const data = await resp.json()
        console.log('tx/create: ', data)
        const message = data.message
        txId.value = message.substring(message.indexOf('polygon')).replace(' .', '')
        console.log('txId: ', txId.value)
    } catch (error) {
        console.error('tx/create: ', error)
    } finally {
        loading.value = false;
    }
}

const buildBuyTxn = async () => {
    try {
        loading.value = true;
        const resp = await fetch(`${txBuilderUrl}/build`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({
                txId: txId.value,
                address: walletAddress.value,
            })
        })
        const data = await resp.json()
        console.log('tx/build: ', data)
        if (data.success) {
            transactions.value = data.transactions
        }
    } catch (error) {
        console.error('tx/build: ', error)
    } finally {
        loading.value = false;
    }
}

const approve = async () => {
    if (!transactions.value.length) {
        alert('Please build txn first')
        return
    }
    if (transactions.value.length == 1) {
        alert('No need to approve')
        return
    }
    // 前面1个或2个为approve交易，后面为marketOrder交易
    for (let i = 0; i < transactions.value.length - 1; i++) {
        let tx = transactions.value[i]
        await sendApprove(tx)
    }
}

const sendApprove = async (tx) => {
    const unsignedTx = ethers.Transaction.from(tx.hex);

    const txParams = {
        from: walletAddress.value,
        to: unsignedTx.to,
        data: unsignedTx.data,
    };

    if (unsignedTx.value) { txParams.value = unsignedTx.value; }
    if (unsignedTx.gasLimit) { txParams.gas = unsignedTx.gasLimit; }
    if (unsignedTx.maxFeePerGas) { txParams.maxFeePerGas = unsignedTx.maxFeePerGas; }
    if (unsignedTx.maxPriorityFeePerGas) { txParams.maxPriorityFeePerGas = unsignedTx.maxPriorityFeePerGas; }

    // send transaction
    try {
        loading.value = true;
        const hash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
        })
        console.log(`Transaction sent: ${hash}`);
    } catch (error) {
        console.error('tx/send: ', error)
    } finally {
        loading.value = false;
    }
}

const marketOrder = async () => {
    let tx = transactions.value[transactions.value.length - 1]
    try {
        loading.value = true;
        let data = JSON.parse(tx.hex);
        console.log('data: ', data)
        let od = data.data
        let orderData = od.orderData
        let typedData = od.typedData

        // sign tx by metamask
        const signature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress.value, typedData],
        })
        console.log('signature: ', signature)
        orderData.signature = signature

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        signer._signTypedData = signer.signTypedData

        const clobClient = new ClobClient(clobUrl, chainId, signer)
        const creds = await clobClient.deriveApiKey()

        const clobClient2 = new ClobClient(clobUrl, chainId, signer, creds)
        const res = await clobClient2.postOrder(orderData, OrderType.FAK);

        console.log('res: ', res)
        if (res.error) { // order is not success filled.
            alert(res.error)
        }
    } catch (error) {
        console.error('tx/sign: ', error)
    } finally {
        loading.value = false;
    }
}

const createSellTxn = async () => {
    if (!positions.value.length) {
        alert('Please get user position first')
        return
    }
    const positionIndex = 1;
    try {
        loading.value = true;
        const resp = await fetch(`${txBuilderUrl}/create`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({
                type: 'polymarket/marketOrderSell',
                payload: {
                    tokenId: positions.value[positionIndex].asset,
                    size: positions.value[positionIndex].size,
                }
            })
        })
        const data = await resp.json()
        console.log('tx/create: ', data)
        const message = data.message
        txId.value = message.substring(message.indexOf('polygon')).replace(' .', '')
        console.log('txId: ', txId.value)
    } catch (error) {
        console.error('tx/create: ', error)
    } finally {
        loading.value = false;
    }
}

const buildSellTxn = async () => {
    try {
        loading.value = true;
        const resp = await fetch(`${txBuilderUrl}/build`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({
                txId: txId.value,
                address: walletAddress.value,
            })
        })
        const data = await resp.json()
        console.log('tx/build: ', data)
        if (data.success) {
            transactions.value = data.transactions
        }
    } catch (error) {
        console.error('tx/build: ', error)
    } finally {
        loading.value = false;
    }
}

const connWallet = async () => {
    if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to use this app.');
    }

    walletAddress.value = '';
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('accounts: ', accounts)
        walletAddress.value = accounts[0];

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x89') { // Chain ID for Polygon is 137
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x89' }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x89',
                                    chainName: 'Polygon Mainnet',
                                    rpcUrls: ['https://polygon-rpc.com/'],
                                    nativeCurrency: {
                                        name: 'POL',
                                        symbol: 'POL',
                                        decimals: 18
                                    },
                                    blockExplorerUrls: ['https://polygonscan.com/']
                                },
                            ],
                        });
                    } catch (addError) {
                        alert('Failed to add the Polygon network to MetaMask.');
                        console.error(addError);
                    }
                } else {
                    alert('Failed to switch to the Polygon network.');
                    console.error(switchError);
                }
            }
        }
    } catch (error) {
        alert('Failed to connect to MetaMask.');
        console.error(error);
    }
}

const getEvent = async () => {
    let slug = eventUrl.value.replace(eventPrefix, '');
    slug = slug.split('?')[0];
    if (!slug) {
        alert('Please paste the polymarket event URL first')
        return
    }

    let queryString = `slug=${slug}`;
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    loading.value = true;
    try {
        let url = `/api/events?${queryString}`;
        const res = await fetch(url, options)
        const event = await res.json();
        let tokenIds = JSON.parse(event[0].markets[0].clobTokenIds);
        console.log('tokenIds', tokenIds);
        let outcomes = JSON.parse(event[0].markets[0].outcomes);
        console.log('outcomes', outcomes);
        market.value = event[0].markets[0].question;
        outcome.value = outcomes[0];
        tokenId.value = tokenIds[0];

    } catch (error) {
        console.error('Error fetching event:', error);
        alert('Fail fetching event, please check the event URL is still available')
    } finally {
        loading.value = false;
    }
}

</script>

<style scoped>
.col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.row {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

* {
    margin-top: 10px;
    margin-right: 10px;
}

input {
    width: 100%;
    max-width: 400px;
    padding: 10px;
}

.mask {
    position: fixed;
    inset: 0px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.loader {
    border: 16px solid #f3f3f3;
    /* Light grey */
    border-top: 16px solid #3498db;
    /* Blue */
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
    position: fixed;
    inset: 0px;
    margin: auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>