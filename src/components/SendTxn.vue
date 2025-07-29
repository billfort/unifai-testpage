<template>
    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <button @click="connWallet">connect wallet</button>
        <p v-if="walletAddress" style="color: blue; font-size: small;">address: {{ walletAddress }}</p>
    </div>

    <div class="col" style="border-bottom: 10px solid lightgray; padding-bottom: 20px;">
        <div>Recipient address</div>
        <textarea type="" v-model="toAddress" placeholder="send to address" multiple="true" rows="2"
            style="width: 100%; text-align: center;" />
        <input type="number" v-model="amount" placeholder="amount" />
        <button @click="createTxn2">create txn</button>
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
import { USDC_ON_POLYGON, USDCe_ON_POLYGON } from '../api/const'
import { ethers } from 'ethers';

const walletAddress = ref('');
const toAddress = ref('0xA31AE2f02B257b234D8C773ECEC21B73F17c2036');
const amount = ref(1000);
const loading = ref(false);
const txId = ref('');

const createTxn2 = async () => {
    const res = await createTxn('evm/transfer', {
        chain: 'polygon',
        recipient: toAddress.value,
        amount: amount.value,
        token: USDC_ON_POLYGON,
    })
    console.log('create txn: ', res)
    txId.value = res.txId
}

const sendTo = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const txApi = new TransactionAPI({ endpoint: 'http://localhost:8001/api', apiKey: process.env.TOOLKIT_API_KEY });
    const txn = await txApi.signAndSendTransaction(txId.value, signer)
    console.log('send txn: ', txn)
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


</script>

<style scoped>
</style>