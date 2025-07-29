
export const typedData = {
    "primaryType": "Order",
    "types": {
        // "EIP712Domain":[
        //     { name: 'name', type: 'string' },
        //     { name: 'version', type: 'string' },
        //     { name: 'chainId', type: 'uint256' },
        //     { name: 'verifyingContract', type: 'address' },
        // ],
        "Order": [
            {
                "name": "salt",
                "type": "uint256"
            },
            {
                "name": "maker",
                "type": "address"
            },
            {
                "name": "signer",
                "type": "address"
            },
            {
                "name": "taker",
                "type": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "name": "makerAmount",
                "type": "uint256"
            },
            {
                "name": "takerAmount",
                "type": "uint256"
            },
            {
                "name": "expiration",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "feeRateBps",
                "type": "uint256"
            },
            {
                "name": "side",
                "type": "uint8"
            },
            {
                "name": "signatureType",
                "type": "uint8"
            }
        ]
    },
    "domain": {
        "name": "Polymarket CTF Exchange",
        "version": "1",
        "chainId": 137,
        "verifyingContract": "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E"
    },
    "message": {
        "salt": "1176663158560",
        "maker": "0xbdDf02772a5f7F75Be2dB4E9Bd180F59f8ebde91",
        "signer": "0xbdDf02772a5f7F75Be2dB4E9Bd180F59f8ebde91",
        "taker": "0x0000000000000000000000000000000000000000",
        "tokenId": "30735645061013802058114775311815951929563045710211802266038877095977609112774",
        "makerAmount": "1000000",
        "takerAmount": "6711400",
        "expiration": "0",
        "nonce": "0",
        "feeRateBps": "0",
        "side": 0,
        "signatureType": 0
    }
}