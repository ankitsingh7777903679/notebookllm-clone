import {Express} from 'express'
import cors from 'cors'
import express, { Request, Response } from 'express';
import { expressServer } from './express/expressServer';



export function bootStrapApp(app: Express, PORT:number) {

 expressServer(app, PORT)

}