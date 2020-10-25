const readline = require('readline');
const fs = require('fs');


let PokerGame = class Poker {

    player1_winning = 0
    player2_winning = 0
    player1_hands = []
    player2_hands = []
    player1_hands_sorted = []
    player2_hands_sorted = []

    cards = new Map([
        ['2', 0], ['3', 1], ['4', 2], ['5', 3], 
        ['6', 4], ['7', 5], ['8', 6], ['9', 7], 
        ['T', 8], ['J', 9], ['Q', 10], ['K', 11],
        ['A', 12]
    ])

    readHands = async () => {
        
        return new Promise((resolve, reject) => {
            const readPokerLine = readline.createInterface({
                input: fs.createReadStream(__dirname + '/poker-hands.txt'),
                console: false
            });
        
            readPokerLine.on('line', (line) => {
    
                let hands = line.split(" ", 10)
                let hand1 = hands.slice(0, 5)
                let hand2 = hands.slice(5, 10)
                this.player1_hands.push(hand1)
                this.player2_hands.push(hand2)

                let hand_values = hands.map(card => this.cards.get(card[0]))

                let player1_hand = hand_values.slice(0, 5).sort((a, b) => a = b)
                let player2_hand = hand_values.slice(5, 10).sort((a, b) => a = b)
                
                this.player1_hands_sorted.push(player1_hand)
                this.player2_hands_sorted.push(player2_hand)
    
            }).on('close', () => {
                console.log(`Setup cards`)
                resolve()
            }).on('error', (err) => {
                reject(err)
            })
        })
        
    }

    frequencies = (hand) => {
        
        let freq = new Array(14)
        freq.fill(0, 0, 14)

        for (let i = 0; i < hand.length; i++) {
            freq[hand[i]] += 1;
        }
    
        return freq
    }

    consecutive = (hand) => {

        let count = 1
        let max = 0;
    
        for (let i = 0; i <= hand.length; i++) {
            if (hand[i] === hand[i-1] + 1) {
                count++;
                max < count ? max = count: count = 1;
            }
        }
        
        return max
    }

    arrEq = (arr1, arr2) => {
        let arrLength;
        if ((arrLength = arr1.length) != arr2.length) return false;
        for (let i = 0; i < arrLength; i++) if (arr1[i] !== arr2[i]) return false;
        return true;
    }

    check_straight = async (hand) => {
        let res = await this.consecutive(hand)
        if (res === 5) return true
        return false
    }

    check_flush = async (hand_original) => {
    
        let suits = hand_original.map(card => card.slice(-1))
        let res = await suits.every(suit => suit === suits[0])
        return res
    }

    check_royal_flush = async (hand) => {
        let royal = [8, 9, 10, 11, 12]
        if (this.arrEq(royal, hand)) return true
        return false
    }

    hand_rank = async (hand_original, hand) => {

        let freq = this.frequencies(hand)
    
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
            hasStraight = await this.check_straight(hand)
            hasFlush = await this.check_flush(hand_original)
            isRoyal = await this.check_royal_flush(hand)
        }
    
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
    
    same_rank = (hand1, hand2) => {
        let hand1_max = Math.max.apply(Math, hand1);
        let hand2_max = Math.max.apply(Math, hand2);
        return hand1_max > hand2_max ? 1 : 2
    }

    play = async () => {
        
        await this.readHands()

        for (let i = 0; i < this.player1_hands.length; i++) {
            let rank_p1 = await this.hand_rank(this.player1_hands[i], this.player1_hands_sorted[i])
            let rank_p2 = await this.hand_rank(this.player2_hands[i], this.player2_hands_sorted[i])

            if (rank_p1 > rank_p2) this.player1_winning++
            else if (rank_p2 > rank_p1) this.player2_winning++
            else {
                let winner = this.same_rank(this.player1_hands_sorted[i], this.player2_hands_sorted[i])
                winner === 1 ? this.player1_winning++ : this.player2_winning++
            }
        }

        console.log(`player1: ${this.player1_winning} hands`)
        console.log(`player2: ${this.player2_winning} hands`)

    }

}


let main = async () => {
    let Poker = new PokerGame()
    Poker.play()
}

main()
