cards = new Map([
    ['2', 0], ['3', 1], ['4', 2], ['5', 3], 
    ['6', 4], ['7', 5], ['8', 6], ['9', 7], 
    ['10', 8], ['J', 9], ['Q', 10], ['K', 11],
    ['A', 12], ['T', 13]
])


hand = ['10C', 'JC', 'QC', 'KC', 'AC']

// hand = ['4C', '5C', '6C', '7C', '8C']
// hand = ['10C', 'JC', 'QC', 'KC', 'AC']

// hand = ['10C', '10D', '10H', '10S', 'AC']

// hand = ['8C', '8D', '8H', '7C', '7H']

// hand = ['10C', 'JC', '8C', 'KC', 'AC']

// hand = ['10C', 'JC', 'QH', 'KC', 'AC']

// hand = ['4C', '4H', 'QH', 'KC', '4D']

// hand = ['4C', '4H', 'QH', 'KC', 'QD']

// hand = ['4C', '3H', 'QH', 'KC', 'QD']


read_cards = async () => {
    let hand_values = await hand.map(card => cards.get(card[0] == '1' ? card.substring(0,2) : card[0]))
    let hand_values_sorted = await hand_values.sort((a, b) => a - b)

    return { hand, hand_values, hand_values_sorted }
}

frequencies = async () => {
    let { hand, hand_values, hand_values_sorted } = await read_cards()

    let freq = new Array(13)
    freq.fill(0, 0, 13)

    for (let i = 0; i < hand.length; i++) {
        freq[hand_values_sorted[i]] += 1;
    }

    return freq
}

consecutive = async () => {

    let { hand, hand_values, hand_values_sorted } = await read_cards()
    let count = 1
    let max = 0;

    for (let i = 0; i <= hand_values_sorted.length; i++) {
        if (hand_values_sorted[i] === hand_values_sorted[i-1] + 1) {
            count++;
            max < count ? max = count: count = 1;
        }
    }
    
    return max
}

check_royal_flush = async () => {
    let { hand, hand_values, hand_values_sorted } = await read_cards()
    let royal = [8, 9, 10, 11, 12]
    if (arrEq(royal, hand_values_sorted)) return true
    return false
}

arrEq = (arr1, arr2) => {
    let arrLength;
    if ((arrLength = arr1.length) != arr2.length) return false;
    for (let i = 0; i < arrLength; i++) if (arr1[i] !== arr2[i]) return false;
    return true;
}

check_straight = async () => {
    let res = await consecutive()
    if (res === 5) return true
    return false
}

check_flush = async () => {
    
    let { hand, hand_values, hand_values_sorted } = await read_cards()
    let suits = hand.map(card => card.slice(-1))
    let res = await suits.every(suit => suit === suits[0])
    return res
}

check_straight_flush = async () => {
    let is_flush = await check_flush()
    if (is_flush === true) {
        let is_straight = await check_straight()
        if (is_straight === true) return true
    }

    return false
}

hand_rank = async () => {

    let freq = await frequencies()

    let rank = 0
    let pairs = 0
    let hasTrips = false
    let hasQuads = false
    let hasFlush = false
    let hasStraight = false
    let isRoyal = false

    for (let i = 0; i < freq.length; i++) {
        if (freq[i] === 2) pairs++
        else if (freq[i] === 3) hasTrips = true
        else if (freq[i] === 4) hasQuads = true
    }

    if (pairs < 1 && !hasTrips && !hasQuads) {
        hasStraight = await check_straight()
        hasFlush = await check_flush()
        isRoyal = await check_royal_flush()
    }

    console.log(isRoyal)

    if (hasFlush && isRoyal) rank = 10
    else if (hasStraight && hasFlush) rank = 9
    else if (hasQuads) rank = 8
    else if (hasTrips && pairs == 1) rank = 7
    else if (hasFlush) rank = 6
    else if (hasStraight) rank = 5
    else if (hasTrips) rank = 4
    else if (pairs == 2) rank = 3
    else if (pairs == 1) rank = 2
    else rank = 1

    return rank
}

ranks = async () => {

    let { hand, hand_values, hand_values_sorted } = await read_cards()
    let rank = await hand_rank()

    console.log(`rank: ${rank}`)
}


ranks()
check_straight_flush().then(res => console.log(`check_straight_flush: ${res}`))