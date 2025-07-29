import { polymarkGamaUrl } from '../config'

const eventPrefix = 'https://polymarket.com/event/'
const dataUrl = 'https://data-api.polymarket.com'


// get event from polymarket
export async function getEvent(eventUrl: string) {
    let slug = eventUrl.replace(eventPrefix, '');
    slug = slug.split('?')[0];
    if (!slug) {
        throw new Error('Please paste the polymarket event URL first')
    }

    let queryString = `slug=${slug}`;
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        let url: string
        if (polymarkGamaUrl) {
            url = `${polymarkGamaUrl}/events?${queryString}`;
        } else {
            url = `/api/events?${queryString}`;
        }
        console.log('getEvent url: ', url)
        const res = await fetch(url, options)
        const event = await res.json();
        console.log('event: ', event)
        let tokenIds = JSON.parse(event[0].markets[0].clobTokenIds);
        console.log('tokenIds', tokenIds);
        let outcomes = JSON.parse(event[0].markets[0].outcomes);
        console.log('outcomes', outcomes);

        return {
            market: event[0].markets[0].question,
            outcome: outcomes[0],
            tokenId: tokenIds[0],
        }

    } catch (error) {
        console.error('Error fetching event:', error);
        throw new Error('Fail fetching event, please check the event URL is still available')
    } 
}

export async function getUserPosition(walletAddress: string){
    if (!walletAddress) {
        throw new Error('Please connect wallet first')
    }

    try {
        const res = await fetch(`${dataUrl}/positions?user=${walletAddress}&sortBy=CURRENT`)
        const positions = await res.json();

        // for (let p of positions) {
        //     console.log('title: ', p.title, 'tokenId: ', p.asset, 'size: ', p.size)
        // }
        return positions;

    } catch (error) {
        console.error('get user position: ', error)
    } 
}