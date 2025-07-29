<template>
    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <button @click="connWallet">connect wallet</button>
        <p v-if="walletAddress" class="info">address: {{ walletAddress }}</p>
    </div>

    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <div>Please paste the polymarket event URL here</div>
        <textarea type="" v-model="eventUrl" placeholder="Paste polymarket event URL here" multiple="true" rows="4"
            style="width: 100%; text-align: center;" />
        <button @click="myGetEvent">Get Event</button>
        <div v-if="tokenId"  class="info">
            event market: {{ market }}<br>
            {{ outcome }}: {{ tokenId }}<br>
        </div>
    </div>

    <div class="row">
        <div style="width: 200px;">amount to buy</div>
        <input type="number" v-model="amount" placeholder="amount" />
    </div>
    <div class="row">
        <div style="width: 100px;">txId</div>
        <div  class="info">{{ txId }}</div>
    </div>
    <div class="row" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <button @click="createBuyTxn">create buy txn</button>
        <button @click="sendTxn">send txn</button>
    </div>

    <div class="mask" v-if="loading">
        <div class="loader"></div>
    </div>

    <div class="row">
        <button @click="myGetUserPosition">get user position</button>
    </div>
    <table v-if="positions.length" class="info"
        style="width: 100%; border-collapse: collapse; border: 1px solid lightgray; " border="1">
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
        <button @click="sendTxn">send txn</button>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import { createTxn } from '@/api/txn'
import { TransactionAPI } from '../../../unifai-sdk-js/src'
import { connectWallet } from '@/api/wallet'
import { getEvent, getUserPosition } from '@/api/polymarket'
import { createWalletClient, custom, createPublicClient, http } from 'viem';
import { mainnet, polygon } from 'viem/chains';

const eventUrl = ref('https://polymarket.com/event/israel-x-hamas-ceasefire-by-july-15?tid=1751629624904');
const tokenId = ref('');
const outcome = ref('');
const market = ref('');
const walletAddress = ref('');
const walletClient = ref(null);
const amount = ref(1);
const txId = ref('');
const positions = ref([]);
const loading = ref(false);


const myGetUserPosition = async () => {
    if (!walletAddress.value) {
        alert('Please connect wallet first')
        return
    }
    try {
        loading.value = true;
        positions.value = await getUserPosition(walletAddress.value)
    } catch (error) {
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
        const res = await createTxn('polymarket/marketOrderBuy', {
            tokenId: tokenId.value,
            amount: amount.value,
            orderType: 'FAK',
        })
        txId.value = res.txId
    } catch (error) {
        console.error('tx/create: ', error)
    } finally {
        loading.value = false;
    }
}

const sendTxn = async () => {
    const txApi = new TransactionAPI({ endpoint: 'http://localhost:8001/api', apiKey: process.env.TOOLKIT_API_KEY });
    const txn = await txApi.signAndSendTransaction(txId.value, walletClient.value)
    console.log('send txn: ', txn)
}

const createSellTxn = async () => {
    if (!positions.value.length) {
        alert('Please get user position first')
        return
    }
    const positionIndex = 1;

    try {
        loading.value = true;
        const res = await createTxn('polymarket/marketOrderSell', {
            tokenId: positions.value[positionIndex].asset,
            size: positions.value[positionIndex].size,
            orderType: 'FAK',
        })
        txId.value = res.txId

    } catch (error) {
        console.error('createSellTxn: ', error)
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
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('accounts: ', accounts)
        const account = accounts[0];

        // const publicClient = createPublicClient({
        //     chain: polygon,
        //     transport: http(),
        // });
        // console.log('blockNumber: ', await publicClient.getBlockNumber())

        walletClient.value = await createWalletClient({
            account: account,
            chain: polygon,
            transport: custom(window.ethereum),
        });
        console.log('walletClient: ', walletClient.value)
        
        const addresses = await walletClient.value.requestAddresses();
        console.log('addresses: ', addresses)
        walletAddress.value = addresses[0];
        
    } catch (error) {
        alert('Failed to connect to MetaMask.');
        console.error(error);
    }
}

const myGetEvent = async () => {
    if (!eventUrl.value) {
        alert('Please paste the polymarket event URL first')
        return
    }
    loading.value = true;
    try {
        const event = await getEvent(eventUrl.value)
        market.value = event.market
        outcome.value = event.outcome
        tokenId.value = event.tokenId

    } catch (error) {
        console.error('Error fetching event:', error);
        alert('Fail fetching event, please check the event URL is still available')
    } finally {
        loading.value = false;
    }
}

</script>
