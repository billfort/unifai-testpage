<template>
    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <button @click="connWallet">connect wallet</button>
        <p class="info">address: {{ walletAddress }}</p>
    </div>

    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <div>Recipient address</div>
        <textarea type="" v-model="toAddress" placeholder="send to address" multiple="true" rows="2"
            style="width: 100%; text-align: center;" />
        <input type="number" v-model="amount" placeholder="amount" />
        <button @click="myCreateTxn">create txn</button>
        <input v-model="txId" placeholder="tx id" />
        <button @click="sendTo">Send</button>
    </div>

    <div class="mask" v-if="loading">
        <div class="loader"></div>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import { TransactionAPI } from '../../../unifai-sdk-js/src'
import { createTxn } from '../api/txn'

const walletAddress = ref('');
const toAddress = ref('AUkcZS8zZqUYGRmUjwwkFKNoSJ9CrB1uV2eVoQWSYgnW');
const amount = ref(0.1);
const loading = ref(false);
const txId = ref('');
let provider = null;

const myCreateTxn = async () => {
    try {
        const res = await createTxn('solana/transfer', {
            chain: 'solana',
            toWalletAddress: toAddress.value,
            amount: amount.value,
            // tokenAddress: USDC_ON_POLYGON,
        })
        console.log('create txn: ', res)
        txId.value = res.txId
    } catch (error) {
        console.error('create txn error: ', error)
    }
}

const sendTo = async () => {
    try {
        const txApi = new TransactionAPI({ endpoint: 'http://localhost:8001/api', apiKey: process.env.TOOLKIT_API_KEY });
        const txn = await txApi.signAndSendTransaction(txId.value, provider)
        console.log('send txn: ', txn)
    } catch (error) {
        console.error('send txn error: ', error)
    }
}

const connWallet = async () => {
    if (!window.solana) {
        alert('Solana wallet is not installed. Please install it to use this app.');
    }

    walletAddress.value = '';
    try {
        provider = window.solana;
        await provider.connect();
        provider.on('connect', (publicKey) => {
            console.log('connected', publicKey)
            walletAddress.value = publicKey.toBase58();
            console.log('walletAddress: ', walletAddress.value)
        })
        provider.on('disconnect', () => {
            console.log('disconnect')
        })
    } catch (error) {
        alert('Failed to connect to Solana wallet.');
        console.error(error);
    }
}

</script>
