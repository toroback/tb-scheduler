/*
 * Schema para los diferentes documentos necesarios para tb-Scheduler
 * @module Scheduler
 * @class Scheduler
 * @author Javier Arpa
*/
var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var log = App.log.child({module:'scheduler-Schema'});

var SchedulerSchema = new Schema({  
  _id:    {type: String}, // _id con textos fijos. (stat)
  status:  {type: Number}, //0 desactivado, 1 stopped, 2 running 
  version: {type: String},
  tsStart: {type: Date, default: Date.now}
},{
  _id: false,
  collection: 'tb.scheduler' 
});


module.exports = SchedulerSchema; 