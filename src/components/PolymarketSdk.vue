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
        <div style="width: 60px;">txId</div>
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
        <input v-model="positionFilter" placeholder="position filter" style="width: 150px;" />
        <button @click="myGetUserPosition">get position</button>
    </div>
    <table v-if="positions" class="info"
        style="width: 100%; border-collapse: collapse; border: 1px solid lightgray; " border="1">
        <thead>
            <tr>
                <th>title</th>
                <th>outcome</th>
                <th>size</th>
                <th>Pnl</th>
                <th>InitVal</th>
                <th>CurVal</th>
                <th>Redeem</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="p in positions" :key="p.tokenId">
                <td style="word-break: break-all; font-size: small;">{{ p.title }}</td>
                <td style="word-break: break-all; font-size: small;">{{ p.outcome }}</td>
                <td style="width: 1.5rem;">{{ Number(p.size).toFixed(1) }}</td>
                <td style="width: 1.5rem;">{{ Number(p.cashPnl).toFixed(1) }}</td>
                <td style="width: 3rem;">{{ Number(p.initialValue).toFixed(1) }}</td>
                <td style="width: 3rem;">{{ Number(p.currentValue).toFixed(1) }}</td>
                <td style="width: 3rem;">{{ (p.redeemable) }}</td>
            </tr>
        </tbody>
    </table>
    <div class="row">
        <div style="width: 300px;">index to sell/redeem</div>
        <input type="number" v-model="sellIndex" placeholder="amount" />
    </div>
    <div class="row">
        <div style="width: 60px;">txId</div>
        <div class="info">{{ txId }}</div>
    </div>
    <div class="row">
        <button @click="createSellTxn">create sell txn</button>
        <button @click="sendTxn">send txn</button>
    </div>
    <div class="row">
        <button @click="createRedeemTxn">create redeem txn</button>
        <button @click="sendTxn">redeem</button>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import { createTxn } from '@/api/txn'
import { TransactionAPI } from '../../../unifai-sdk-js/src'
import { connectWallet } from '@/api/wallet'
import { getEvent, getUserPosition } from '@/api/polymarket'
import { txBuilderUrl } from '@/config'

const eventUrl = ref('https://polymarket.com/event/new-york-city-mayoral-election?tid=1752197476915');
const tokenId = ref('');
const outcome = ref('');
const market = ref('');
const walletAddress = ref('');
const amount = ref(1);
const txId = ref('');
const positions = ref([]);
const loading = ref(false);
const sellIndex = ref(0);
const positionFilter = ref('July 20')

const myGetUserPosition = async () => {
    // walletAddress.value = '0x0FBd59e6ef38269E12568fB45E041eE6923eF725'; // for testing
    if (!walletAddress.value) {
        alert('Please connect wallet first')
        return
    }
    try {
        loading.value = true;
        positions.value = await getUserPosition(walletAddress.value)
        positions.value = positions.value.filter(p => p.title.indexOf(positionFilter.value)>0)
        console.log('positions: ', positions.value)
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
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const txBuilder = txBuilderUrl; // '/txbuilder'; 
    const txApi = new TransactionAPI({ endpoint: txBuilder, apiKey: process.env.TOOLKIT_API_KEY });
    const txn = await txApi.signAndSendTransaction(txId.value, signer, window.ethereum)
    console.log('send txn: ', txn)
}

const createSellTxn = async () => {
    if (!positions.value.length) {
        alert('Please get user position first')
        return
    }
    const positionIndex = sellIndex.value;

    try {
        loading.value = true;
        const res = await createTxn('polymarket/marketOrderSell', {
            tokenId: positions.value[positionIndex].asset,
            size: positions.value[positionIndex].size,
            orderType: 'FAK',
        })
        txId.value = res.txId
        console.log('txId: ', txId.value)

    } catch (error) {
        console.error('createSellTxn: ', error)
    } finally {
        loading.value = false;
    }
}

const createRedeemTxn = async () => {
    if (!positions.value.length) {
        alert('Please get user position first')
        return
    }
    const positionIndex = sellIndex.value;

    try {
        loading.value = true;
        const res = await createTxn('polymarket/redeem', {
            conditionId: positions.value[positionIndex].conditionId,
        })
        console.log('createRedeem res: ', res)
        txId.value = res.txId

    } catch (error) {
        console.error('createRedeem: ', error)
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
        walletAddress.value = await connectWallet(window.ethereum, '0x89')
        
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

<style scoped>
</style>