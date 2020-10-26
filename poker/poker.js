const readline = require('readline');
const fs = require('fs');
const path = require('path');


let PokerGame = class Poker {

    player1_winning = 0
    player2_winning = 0
    player1_hands = []
    player2_hands = []
    player1_hands_sorted = []
    player2_hands_sorted = []

    /*
        This cards map acts like a HashMap to link every card to an integer
    */
    cards = new Map([
        ['2', 0], ['3', 1], ['4', 2], ['5', 3], 
        ['6', 4], ['7', 5], ['8', 6], ['9', 7], 
        ['T', 8], ['J', 9], ['Q', 10], ['K', 11],
        ['A', 12]
    ])

    ranks = {
        ROYALFLUSH: 10,
        STRAIGHTFLUSH: 9,
        QUADS: 8,
        FULLHOUSE: 7,
        FLUSH: 6,
        STRAIGHT: 5,
        TRIPS: 4,
        TWOPAIRS: 3,
        PAIR: 2,
        HIGHCARD: 1
    }

    constructor(txtfile) {
        this.txtfile = txtfile
    }

    /*
        * Read the provided txt file, split the hands, sort them, 
        * and map each card to its integer value.
        *
        * @param {}.
    */
    readHands = async () => {
        
        return new Promise((resolve, reject) => {
            const readPokerLine = readline.createInterface({
                input: fs.createReadStream(path.join(__dirname, this.txtfile)),
                console: false
            });
        
            readPokerLine.on('line', (line) => {
    
                let hands = line.split(" ", 10)
                let hand1 = hands.slice(0, 5)
                let hand2 = hands.slice(5, 10)
                this.player1_hands.push(hand1)
                this.player2_hands.push(hand2)

                let hand_values = hands.map(card => this.cards.get(card[0]))

                let player1_hand = hand_values.slice(0, 5).sort((a, b) => a - b)
                let player2_hand = hand_values.slice(5, 10).sort((a, b) => a - b)
                
                this.player1_hands_sorted.push(player1_hand)
                this.player2_hands_sorted.push(player2_hand)
    
            }).on('close', () => {
                resolve()
            }).on('error', (err) => {
                reject(err)
            })
        })
        
    }

    /*
        * Calculate repeated cards (helper 
        * funcion to check whether we have pairs, trips, or quads), 
        * Used in hand_rank
        *
        * @param {hand} the cards (sorted).
    */
    frequencies = (hand) => {
        
        let freq = new Array(14)
        freq.fill(0, 0, 14)

        for (let i = 0; i < hand.length; i++) {
            freq[hand[i]] += 1;
        }
    
        return freq
    }

    /*
        * Check the max number of sequenced numbers (used to check straight)
        * for example: [2,7,8,2,9]: the consecutive: 7,8,9
        *
        * @param {hand} the cards (sorted).
    */
    consecutive = (hand) => {

        let count = 1
        let max = 0;
        let values = []
    
        for (let i = 0; i <= hand.length; i++) {
            if (hand[i] === hand[i-1] + 1) {
                count++;
                max < count ? max = count: count = 1;
                values.push(hand[i])
            }
        }
        
        return { max: max, value: Math.max(...values) }
    }

    /*
        * Check if two arrays are equal
        *
        * @param {arr1}.
        * @param {arr2}.
    */
    arrEq = (arr1, arr2) => {
        let arrLength;
        if ((arrLength = arr1.length) != arr2.length) return false;
        for (let i = 0; i < arrLength; i++) if (arr1[i] !== arr2[i]) return false;
        return true;
    }

    check_straight = (hand) => {
        let straight = this.consecutive(hand)
        if (straight.max === 5) return { exist: true, card: straight.value }
        return { exist: false, card: straight.value }
    }

    check_flush = async (hand, hand_original) => {
        let suits = hand_original.map(card => card.slice(-1))
        let res = await suits.every(suit => suit === suits[0])
        return { exist: res, card: Math.max(...hand) }
    }

    check_royal_flush = async (hand) => {
        let royal = [8, 9, 10, 11, 12]
        if (this.arrEq(royal, hand)) return {exist: true, card: 12}
        return {exist: false, card: 12}
    }

    /*
        * Get the rank of the hand
        *
        * @param {hand_original} the cards (unsorted and with the suit).
        * @param {hand} the cards (sorted).
    */
    hand_rank = async (hand_original, hand) => {

        let freq = this.frequencies(hand)
    
        let rank = 0
        let pairs_counter = 0
        let pairs = {}
        let trips = {}
        let quads = {}
        let flush = {}
        let straight = {}
        let royal = {}
    
        for (let i = 0; i < freq.length; i++) {
            if (freq[i] === 2) pairs = {count: ++pairs_counter, card: i}
            else if (freq[i] === 3) trips = {exist: true, card: i}
            else if (freq[i] === 4) quads = {exist: true, card: i}
        }

        if (!trips.exist && !quads.exist) {
            straight = this.check_straight(hand)
            flush = await this.check_flush(hand, hand_original)
            royal = await this.check_royal_flush(hand)
        }
    
        if (flush.exist && royal.exist) rank = {rank: this.ranks.ROYALFLUSH, card: royal.card}
        else if (straight.exist && flush.exist) rank = {rank: this.ranks.STRAIGHTFLUSH, card: straight.card}
        else if (quads.exist) rank = {rank: this.ranks.QUADS, card: quads.card}
        else if (trips.exist && pairs == 1) rank = {rank: this.ranks.FULLHOUSE, card: trips.card}
        else if (flush.exist) rank = {rank: this.ranks.FLUSH, card: flush.card}
        else if (straight.exist) rank = {rank: this.ranks.STRAIGHT, card: straight.card}
        else if (trips.exist) rank = {rank: this.ranks.TRIPS, card: trips.card}
        else if (pairs.count == 2) rank = {rank: this.ranks.TWOPAIRS, card: pairs.card}
        else if (pairs.count == 1) rank = {rank: this.ranks.PAIR, card: pairs.card}
        else rank = {rank: this.ranks.HIGHCARD, card: 0}
    
        return rank

    }

    /*
        * Check the winner of each hand
        *
        * @param {p1} player1 rank and highest card.
        * @param {p2} player2 rank and highest card.
        * @param {hand1} player1 hand.
        * @param {hand2} player2 hand.
    */
    check_rank = (p1, p2, hand1, hand2) => {

        let hand1_new = hand1
        let hand2_new = hand2

        if (p1.rank !== 1 && p1.rank == p2.rank) {
            if (p1.card == p2.card) {
                hand1_new = hand1_new.filter(card => p1.card !== card)
                hand2_new = hand2_new.filter(card => p1.card !== card)
            } 
            else {
                return p1.card > p2.card ? 1 : 2
            }
        }
        else if (p1.rank !== p2.rank) {
            return p1.rank > p2.rank ? 1 : 2
        }

        for (let i = hand1_new.length - 1; i >= 0; i--) {
            if (hand1_new[i] > hand2_new[i]) return 1
            else if (hand2_new[i] > hand1_new[i]) return 2
        }
    }

    /*
        * Entry point
        * Loop through all the games in the txt file to get the rank of each hand
        * check the winner
        * keep increamenting the winning of each player
        *  
    */
    play = async () => {
        
        await this.readHands()

        for (let i = 0; i < this.player1_hands.length; i++) {
            let p1 = await this.hand_rank(this.player1_hands[i], this.player1_hands_sorted[i])
            let p2 = await this.hand_rank(this.player2_hands[i], this.player2_hands_sorted[i])

            let winner = this.check_rank(p1, p2, this.player1_hands_sorted[i], this.player2_hands_sorted[i])
            winner === 1 ? this.player1_winning++ : this.player2_winning++
        }

        console.log(`player1: ${this.player1_winning} hands`)
        console.log(`player2: ${this.player2_winning} hands`)

    }

}


let main = async () => {
    let Poker = new PokerGame('poker-hands.txt')
    Poker.play()
}

main()
