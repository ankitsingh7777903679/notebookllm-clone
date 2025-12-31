import {Express} from 'express'
import cors from 'cors'
import express, { Request, Response } from 'express';
import { expressServer } from './express/expressServer';
import { dbConnection } from './mongos/dbConnection';



export async function bootStrapApp(app: Express, PORT:number) {
 await dbConnection()
 expressServer(app, PORT)

}