/*
 * Schema para los jobs del sistema
 * @module Scheduler
 * @class Scheduler
 * @author Javier Arpa
*/
var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var log = App.log.child({module:'scheduler-job-Schema'});

var SchedulerJobSchema = new Schema({  
  _id:       {type: String}, // _id con textos fijos. (nombre del job)
  status:    {type: Number}, //0 desactivado, 1 active (but not running), 2 running 
  lastStart: {type: Date},
  lastEnd:   {type: Date},
  response:  {type: String},
  duration:  {type: Number},
  job: new Schema ({
    desc:     { type: String },
    cron:     { type: String },
    code:     { type: String },
    module:   { type: String },  // module name, respect to <process path>/scheduler/
    function: { type: String }, // function to call from "module"
    args:     [ ],    // array of arguments to be passed to "function"
  }, { _id: false })
},{
  _id: false,
  collection: 'tb.scheduler.jobs' 
});

/**
 * Job Object
 *  description: 
 *  code
 *  function
 *  modulePath (Relativo al path del proceso)
 *  date
 *  cron
 *  
 */


module.exports = SchedulerJobSchema; 