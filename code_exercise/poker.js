const readline = require('readline');
const fs = require('fs');


let PokerGame = class Poker {

    player1_ranks = {}
    player2_ranks = {}
    player1_cards = []
    player2_cards = []

    cards = new Map([
        ['2',0], ['3',1], ['4',2], ['5',3],
        ['6',4], ['7',5], ['8',6], ['9',7],
        ['10',8], ['J',9], ['Q',10], ['K',11],
        ['A',12]
    ])

    HANDVALUES = {
        ROYALFULUSH: 10,
        STRAIGHTFLUSH: 9,
        QUADS: 8,
        FULLHOUSE: 7,
        FLUSH: 6,
        STRAIGHT: 5,
        TRIPS: 4,
        TWOPAIR: 3,
        PAIR: 2,
        HIGHCARD: 1
    };


    readCards = async () => {
        
        return new Promise((resolve, reject) => {
            const readPokerLine = readline.createInterface({
                input: fs.createReadStream(__dirname + '/poker-hands.txt'),
                console: false
            });
        
            readPokerLine.on('line', (line) => {
    
                let cards = line.split(" ", 10)
                this.player1_cards.push(cards.slice(0, 5))
                this.player2_cards.push(cards.slice(5, 10))
    
            }).on('close', () => {
                console.log(`Setup cards`)
                resolve()
            }).on('error', (err) => {
                reject(err)
            })
        })
        
    }

    player1_hand = (game) => {
        return this.player1_cards[game]
    }

    player2_hand = (game) => {
        return this.player2_cards[game]
    }
    
    same_rank = () => {

        let rank = 0

        for (let i = 0; i <= this.player1_cards.length; i++) {
            
        }
    }

    is_staright = () => {

    }

    is_flush = () => {
        
    }

    is_straight_flush = () => {
        
    }

    is_straight_flush = () => {
        
    }

}


let main = async () => {
    let Poker = new PokerGame()
    await Poker.readCards()
    console.log(Poker.player1_hand(1))
}

main()
