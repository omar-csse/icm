cards = new Map([
    ['2', 0],
    ['3', 1],
    ['4', 2],
    ['5', 3],
    ['6', 4],
    ['7', 5],
    ['8', 6],
    ['9', 7],
    ['10', 8],
    ['J', 9],
    ['Q', 10],
    ['K', 11],
    ['A', 12]
])


hands = ['10C', 'JC', 'QC', 'KC', 'AD']
// hands = ['10C', 'JD', 'QD', 'KC', 'AC']
// hands = ['4C', '5D', '6D', '7C', '8C']
// hands = ['8C', '4D', '6D', '7C', '5C']

read_cards = async () => {
    let hand_values = await hands.map(card => cards.get(card[0] == '1' ? card.substring(0,2) : card[0]))
    let hand_values_sorted = await hand_values.sort((a, b) => a - b)

    return { hands, hand_values, hand_values_sorted }
}

consecutive = async () => {

    let { hands, hand_values, hand_values_sorted } = await read_cards()
    let count = 1
    let max = 0;

    for (let i = 0; i <= hand_values_sorted.length; i++) {
        if (hand_values_sorted[i] === hand_values_sorted[i-1] + 1) {
            count++;
            max < count ? max = count: count = 1;
        }
    }
    
    console.log(max)

    return max
}

check_straight = async () => {
    let res = await consecutive()
    if (res) return true
    return false
}

check_flush = async () => {
    
    let { hands, hand_values, hand_values_sorted } = await read_cards()
    let suits = hands.map(card => card.slice(-1))
    let res = await suits.every(suit => suit === suits[0])
    console.log(`check_flush: ${res}`)
}

ranks = async () => {

    let { hands, hand_values, hand_values_sorted } = await read_cards()

    hand = {}
    hand.pairs = 0
    hand.trips = 0
    hand.quads = 0
    hand.hasFlush = false
    hand.hasStraight = false

    let count = {}
    hand_values.forEach(i => count[i] = (count[i]||0) + 1);
    console.log(count)

    for (const prop in count) {
        if (count[prop] === 2) hand.pairs++
        else if (count[prop] === 3) hand.trips = 1
        else if (count[prop] === 4) hand.quads = 1
    }

    console.log(hand)
}





ranks()
check_straight().then(console.log)
check_flush()