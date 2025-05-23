import zh from "./zh.js";
import en from "./en.js";


// 初始化语言对象
 const lang = {
     zh,
     en
 }



export const getLang = (langcode,router) => {
   return lang[langcode][router]
}

export const getTranslate = (word) => {
     //todo 翻译
    return  word
}


