import { txBuilderUrl } from '../config'

const headers = { 'Content-Type': 'application/json', }

export async function createTxn(type: string, payload: any) {
    const resp = await fetch(`${txBuilderUrl}/tx/create`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({ type, payload })
    })
    if (resp.status == 200) {
        const data = await resp.json()
        return data
    } else {
        throw new Error(resp.statusText)
    }
}

export async function buildTxn(txId: string, address: string) {
    try {
        const resp = await fetch(`${txBuilderUrl}/tx/build`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ txId, address })
        })
        const data = await resp.json()
        console.log('tx/build: ', data)
        if (data.success) {
            return data.transactions
        }
    } catch (error) {
        console.error('tx/build: ', error)
    }
}