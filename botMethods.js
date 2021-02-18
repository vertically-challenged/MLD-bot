const mongoose = require('mongoose');
const User = require('./models/user.js');

class Methods {
    static async connectDB(url) {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true, 
            useFindAndModify: false
        });
    }
    
    static async findUser(telegramID) {
        let result = await User.find({tID: telegramID});
        return await result[0];
    }
    
    static async addUser(telegramID) {
        const user = new User({
            tID: telegramID,
            activeLanguage: 0,
            activeWord: 0,
            languages: []
        })
        await user.save()
        return await Methods.findUser(telegramID);
    }
    
    static async addLang(lang, userObj){
        let id = userObj.tID;
        let user = await Methods.findUser(id);
        
        let language = {
            name: lang,
            words : []
        }
    
        let updateLanguages = Object.assign([], user.languages);
        updateLanguages.push(language);
    
        await User.updateOne(
            {tID: id},
            { $set: {languages : updateLanguages}}
        ) 

        await Methods.activationLanguage(lang, user);
    }

    static async activationLanguage (lang, userObj) {
        let id = userObj.tID;
        let user = await Methods.findUser(id);

        let updateLanguages = Object.assign([], user.languages);
        updateLanguages.forEach( async (item, i) => {
            if (item.name == lang) {
                await User.updateOne(
                    {tID: id},
                    { $set: {activeLanguage : i}}
                ) 
            }
        })
    }

    static async addWord(word_translate, userObj) {
        let id = userObj.tID;
        let user = await Methods.findUser(id);

        let word_translateArr = [];

        let word_translateNoSpace = word_translate.split(' ');
        if (word_translateNoSpace.length < 2) {
            return 'ERROR'; // Вывести ошибку 
        }

        if (word_translateNoSpace.length < 3) {
            if (word_translateNoSpace[1] !== '-' && word_translateNoSpace[1] !== '–') {
                word_translateArr[0] = word_translateNoSpace[0]; 
                word_translateArr[1] = word_translateNoSpace[1];
            } else {
                word_translateArr[0] = word_translateNoSpace[0]; 
                word_translateArr[1] = 'no translation';
            }
        } else {
            if (word_translateNoSpace[1] == '–') word_translateNoSpace[1] = '-';
            word_translate = word_translateNoSpace.join('');
            word_translateArr = word_translate.split('-', 2); 
        }
        
        let newWord = {
            word: word_translateArr[0],
            translate: word_translateArr[1],
            dropChance: 0.5
        }
    
        let updateLanguages = Object.assign([], user.languages);
        let newWords = Object.assign([], updateLanguages[user.activeLanguage].words);
        newWords.push(newWord);
        updateLanguages[user.activeLanguage].words = newWords;
    
        await User.updateOne(
            {tID: id},
            { $set: {languages : updateLanguages}}
        )  
    }

    static async lerp(min, max, value) {
        return await ((1 - value) * min + value * max);
    }

    static async drop(items, userObj) {
        let id = userObj.tID;

        let total = items.reduce((accumulator, item) => (accumulator += item.dropChance), 0);
        let chance = await Methods.lerp(0, total, Math.random());
    
        let current = 0;
        let index = 0;
        for (let item of items) { 
            if (current <= chance && chance < current + item.dropChance) {
                await User.updateOne(
                    {tID: id},
                    { $set: {activeWord : index}}
                ) 
                return await item;
            }
            current += item.dropChance;
            index += 1; 
        }
    }

    static async randomWord(userObj) {
        let id = userObj.tID;
        let user = await Methods.findUser(id);

        let words = Object.assign([], user.languages[user.activeLanguage].words);

        let result = await Methods.drop(words, user); 
        return result;
    }

    static async getWordTranslation(userObj) {
        try {
            let id = userObj.tID;
            let user = await Methods.findUser(id);
    
            let word = user.languages[user.activeLanguage].words[user.activeWord]; 
    
            word.dropChance *= 10; 
            if (word.dropChance < 8) {
                word.dropChance += 2
            } else {
                word.dropChance += 1
            }
            word.dropChance /= 10;
    
            let updateLanguages = Object.assign([], user.languages);
            let updateWords = Object.assign([], updateLanguages[user.activeLanguage].words);
            updateWords[user.activeWord] = word
            updateLanguages[user.activeLanguage].words = updateWords;
        
            await User.updateOne(
                {tID: id},
                { $set: {languages : updateLanguages}}
            ) 
    
            return word.translate;
        } catch (err) {
            return undefined;
        }
    }

    static async nextWord(userObj) {
        try {
            let id = userObj.tID;
            let user = await Methods.findUser(id);
    
            let word = user.languages[user.activeLanguage].words[user.activeWord]; 
    
            word.dropChance *= 10; 
            if (word.dropChance > 2) {
                word.dropChance -= 1
            }
            word.dropChance /= 10;
    
            let updateLanguages = Object.assign([], user.languages);
            let updateWords = Object.assign([], updateLanguages[user.activeLanguage].words);
            updateWords[user.activeWord] = word
            updateLanguages[user.activeLanguage].words = updateWords;
        
            await User.updateOne(
                {tID: id},
                { $set: {languages : updateLanguages}}
            ) 
                
            let result = await await Methods.randomWord(user);
            return await result;
        } catch (err) {
            return undefined;
        }

    }
}

module.exports = Methods;