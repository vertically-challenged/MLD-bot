const {Schema, model} = require('mongoose');

const user = new Schema({ 
    tID: {
        type: Number, 
        required: true
    },

    activeLanguage: {
        type: Number,
        required: true
    },

    activeWord : {
        type: Number, 
        required: true
    },

    languages: [
        {
            name: {
                type: String,
            },
            words: [
                {
                    word: {
                        type: String
                    }, 
                    translate: {
                        type: String
                    },
                    dropChance: {
                        type: Number
                    }
                }
            ]
        }
    ]
})

module.exports = model('User', user);