import { get } from 'lodash';
import { getAllNotes } from '../getAllNotes';
import { Router } from 'express';



export function getAllNoteRoutes(router:Router){  

    
    router.get('/notes', getAllNotes) 
    return router
}