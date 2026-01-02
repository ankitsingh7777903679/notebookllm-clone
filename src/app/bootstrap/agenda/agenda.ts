// jobs/agenda.ts 
import Agenda from "agenda";  
const agenda = new Agenda({ 
    db: { address: process.env.MONGO_URL as string, collection: "jobs" }, 
});  

export default agenda; 

