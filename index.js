let schedule = require('node-schedule');
let path     = require('path');

let rscPath  = __dirname +'/resources';
let curPath  = process.cwd();
let basePath = curPath + '/app/scheduler/';

/**
 * Módulo para el manejo de procesos scheduler
 * Inicio de un módulo genérico para ampliar Toroback
 *
 * Debemos considerar:
 * Inicio: 
 *   -Verificar si esta todo para ejecutarse y sino crearlo
 *     -Colecciones
 *     -Carpetas
 *     -Código
 *   -Ver si debe establecer estados en base de datos por reinicio
 *   -Cargas Iniciales
 *   
 *   
 * Fin: Parar en caso de parada de todo
 *   -Finalizar procesos
 *   -Establecer estados
 *
 * Rutas:
 *   -reiniciar
 *   -parar
 *   -iniciar
 *   -estados ultimos procesos
 *   -procesos lista
 *   -proceso estados (crud) iniciar, parar
 *   -
 *
 * Colecciones:
 *   scheduler.jobs
 *   scheduler (stat, config)
 *
 * Opciones
 *   string basado en cron (ver cron-parser )//Rango opcional (con now o fecha especifica)luego
 *   fecha fija
 * Un archivo (modulo) module, function
 * Un script directamente
 * una funcion global  
 *   
 */

/*
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
 */

let App;
let log;

 var codigo = function(){
    var a = 0;
    console.log(" a ver si furula : " +a++);  
 }

 function systemJobs(SJob){
  let SchedulerJob = SJob;
  return new Promise((resolve,reject)=>{
    var job = new SchedulerJob({
      _id:  "_tb.test",      
      status: 1,
      job:{
        desc: "Prueba de job de mantenimiento",
        code: "console.log('Esto es una prueba' + new Date().toUTCString());",
        cron: "*/5 * * * * *"
      }
    })

    job.save().then(resolve).catch(reject);

  })
 }

 //var log = App.log.child({module:'Scheduler'});
 class tbScheduler {
  constructor(tb) { //Esto tenemos que analizar bien ya que no devuelve nada ni espera por nadie asi que tendremos que pasarlo al init.
    this.ver = '1.0.0'; //Sacarlo del package.json
    // this.App = tb;
    this.status = 0;
    // log = this.App.log.child({module:'Scheduler'});

    // console.log("\n-----------------\n");

    // console.log(curPath);    
    // console.log(__dirname);
    // console.log("-----------------\n");
    
    // App._model['tb.scheduler'] = that.dbMongo.model('a2s.user',userSchema);

    //Verificamos la base de datos
    
    //1.-Cargamos el modelo
    

    /*
    this.app = express();
    this.router = express.Router(); 
    //Ruta Genérica
    this.app.use('/api',    apiRoutes(this)); //Define /api base de la ruta
    this.app.use('/pubsub', pubSubRoutes(this)); //Define /api base de la ruta
    */
    //console.log(rscPath);
    //console.log(curPath);

    //let j = schedule.scheduleJob('*/5 * * * * *' , codigo);

    // let j = schedule.scheduleJob('*/5 * * * * *' , function(){
    //   eval(codigo);
    //   //console.log(`Schedule Time: ${ new Date().toUTCString()}` );
    // });
  }

  start(){
    if (this.status){
      log.info("Scheduler start");
      
      this.SchedulerJob.find()
      .then((jobs)=>{
        jobs.forEach((job, index) =>{
          if (job.status){
            log.debug(job._id);
            log.debug(job.status);
            //job.status = 2;
            //job.save()

            let j = schedule.scheduleJob(job.job.cron , function(job){
              job.lastStart =  Date.now();
              job.status = 2;
              job.save();
              log.debug(`Job ${job._id} ini at ${job.lastStart}`)

              if(job.job.code){
                //Ejecuta el código puesto en la función
                let res = eval(job.job.code);
                job.status = 1;
                job.lastEnd =  Date.now();
                job.save();
              }else{
                //Ejecuta la función de un módulo
                log.trace(`scheduler module`)
                log.info(`Run module ${job._id}`)
                // let wmodule = require(curPath + job.job.module);
                let wmodule = require(basePath + job.job.module);
                wmodule[job.job.function]( ...job.job.args )
                .then((doc) => {
                  log.info(doc);
                  log.trace('scheduler response');
                  job.response=JSON.stringify(doc);
                })
                .catch((err) => {
                  console.log("@@@@@@@@   errror")
                  log.error("\n=====> error!!!!\n")
                  job.response=JSON.stringify(err);
                })
                .then(()=>{
                  log.debug("end job")
                  job.status = 1;
                  job.lastEnd =  Date.now();
                  job.save();                
                })

              }
            }.bind(null, job));
          }

        });


      })
      //-Leer los jobs
      //-iniciar los jobs
      //   tiempoini, respuesta tiempo fin

      this.statDoc.status = 2;
      this.statDoc.tsStart = Date.now();
      this.statDoc.save();    


    }else{
      log.error("Scheduler not init");
    }
  }
  stop(){
    console.log("stop");
  }

  _init( ) {
    return new Promise( (resolve, reject) => {
      // new tbScheduler
      // App.db.setModel('tb.payments-transaction',rscPath + '/tb.payments-transaction');
      // App.db.setModel('tb.payments-register',rscPath + '/tb.payments-register');

      let Scheduler     = App.db.setModel('tb.scheduler',rscPath + '/tb.scheduler-schema');
      let SchedulerJob  = App.db.setModel('tb.scheduler.job',rscPath + '/tb.scheduler.jobs-schema');

      this.SchedulerJob = SchedulerJob;
      Scheduler.findOne({'_id':'stat'}).then(doc=>{
        if(doc){
          if (doc.version == this.ver){
            //Verificamos si quedo prendido de alguna forma y se hace manteniemiento
            log.info("Scheduler current version "+ doc.version)
            doc.status = (doc.status)?1:0;
            doc.save();
            if(doc.status){
              this.statDoc = doc;
              this.status = 1
              this.start();             
            }
           
          }
        }else{
          log.info("no hay doc deberiamos crear uno")
          let newScheduler = new Scheduler();
          newScheduler._id = "stat";
          newScheduler.status = 1;
          newScheduler.version = this.ver;
          newScheduler.save();
          this.statDoc = newScheduler;

          systemJobs(SchedulerJob).
          then(()=>{
            console.log("##########");
            this.status = 1;
            this.start();          
          })
        }
      })
      .then(resolve)
      .catch(reject)
    });
  }

  /**
   * Setup del módulo. Debe ser llamado antes de crear una instancia
   * @param {Object} _app Objeto App del servidor
   * @return {Promise} Una promesa
   */
  static setup(app){
    return new Promise((resolve,reject)=>{
      App = app;
      log = App.log.child({module:'scheduler'});

      log.debug("iniciando Módulo Scheduler");

      // require("./routes")(app);
    
      resolve();

    });
  }

  /**
   * Inicializa los modelos del módulo - arranca el servicio de cron
   * @return {Promise} Una promesa
   */
  // static init(){
  static init(){
    return new Promise( (resolve, reject) => {
      // new tbScheduler
      // App.db.setModel('tb.payments-transaction',rscPath + '/tb.payments-transaction');
      // App.db.setModel('tb.payments-register',rscPath + '/tb.payments-register');

      let scheduler = new tbScheduler( );
      scheduler._init()
      .then(resolve)
      .catch(reject)
    });
  }

}


module.exports = tbScheduler;