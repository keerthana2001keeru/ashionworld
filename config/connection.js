// const mongoClient=require('mongodb').MongoClient
// const state={
//     db:null
// }
// module.exports.connect=function(done){
   // const url='mongodb://localhost:27017'
   // const dbname='shopping'

//     mongoClient.connect(url,(err,data)=>{
//         if(err) return done(err)
//         state.db=data.db(dbname)
//         done()
//     })
    

// }
// module.exports.get=function(){
//     return state.db
// }
const mongoose = require('mongoose');
require('dotenv').config();

const databaseUrl = process.env.URL;
console.log('MongoDB URI:', databaseUrl); // Check if URI is loaded correctly

 const connect=mongoose.connect(databaseUrl)
 connect.then(() => {
 console.log('MongoDB connected');
 })
.catch(error => {
  console.error('Error connecting to the database:', error);
 });

 module.exports = connect;