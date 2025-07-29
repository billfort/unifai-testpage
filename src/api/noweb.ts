

import { createPublicClient, http, createWalletClient } from 'viem'
import { polygon } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { getEvent, getUserPosition } from './polymarket'
import { createTxn, } from './txn'
import { TransactionAPI } from '../../../unifai-sdk-js/src/toolkit/api'
import { txBuilderUrl } from '../config'

async function main() {
    const client = createPublicClient({
        chain: polygon,
        transport: http(),
    })
    const block = await client.getBlockNumber()
    console.log('block: ', block)

    const account = privateKeyToAccount('0xf8e4a07a4c9be50e073df43e74130d6774152743f809e516af1e5bd2319968d8')
    const walletClient = createWalletClient({
        account,
        chain: polygon,
        transport: http(),
    })
    const address = walletClient.account.address;
    console.log('address', address);

    const eventUrl = 'https://polymarket.com/event/us-recession-in-2025?tid=1750725700356';
    const {market, outcome, tokenId} = await getEvent(eventUrl);
    console.log('market: ', market);
    console.log('outcome: ', outcome);
    console.log('tokenId: ', tokenId);

    const userPosition = await getUserPosition(address);
    console.log('userPosition: ', userPosition);

    const res = await createTxn('polymarket/marketOrderBuy', {
        tokenId: tokenId,
        amount: 1,
        orderType: 'FAK',
    })
    const txId = res.txId
    console.log('txId: ', txId);

    const txApi = new TransactionAPI({ endpoint: txBuilderUrl, apiKey: '' });
    const txn = await txApi.signAndSendTransaction(txId, walletClient)
    console.log('send txn: ', txn)

}

main().catch(console.error)