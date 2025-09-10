const mongoose = require('mongoose');

// Schema for items
const itemSchema = new mongoose.Schema({
  subtitle: { type: String },
  content: { type: String },
  contents: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

// Schema for sections
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: { type: [itemSchema], required: true }
}, { _id: false });

// Main schema (with userId)
const cvDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sections: { type: [sectionSchema], required: true }
});

const CvData = mongoose.model('CvData', cvDataSchema);
module.exports = CvData;




































// const mongoose = require('mongoose')
// const express = require('express');

// const sectionSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   items: { type: String, required: true } // CKEditor stores HTML as string
// });

// const cvDataSchema = new mongoose.Schema({
// data:{
//     userId:{ 
//         type:String, 
//         required:true 
//     },
//     sections:[sectionSchema],
// }
// })
// const CvData = mongoose.model('CvData',cvDataSchema)
// module.exports = CvData



