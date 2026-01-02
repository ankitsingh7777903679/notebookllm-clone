import {Express} from 'express'
import cors from 'cors'
import express, { Request, Response } from 'express';
import { expressServer } from './express/expressServer';
import { dbConnection } from './mongos/dbConnection';
import agenda from './agenda/agenda';
import './agenda/jobs/imagejob'


export async function bootStrapApp(app: Express, PORT:number) {
 await dbConnection()

 await agenda.start();
 expressServer(app, PORT)

}