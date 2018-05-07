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
  status:    {type: Number}, //0 desactivado, 1 stopped, 2 running 
  lastStart: {type: Date},
  lastEnd:   {type: Date},
  response:  {type: String},
  duration:  {tyepe: Number},
  job:       Object
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