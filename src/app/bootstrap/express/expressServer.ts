import {Express} from 'express'
import cors from 'cors'
import express, { Request, Response, NextFunction } from 'express';
import { handleExpressError } from '../exceptions/handleExpressError';



export function expressServer(app: Express, PORT:number) {

app.use(cors({
    origin: '*',
    credentials: false,
}))

app.use(express.json())    
app.use(express.urlencoded({ extended: true }));
app.use(handleExpressError)

app.get('/', (req: Request, res: Response)  => {
    res.json({message:'NotebookLLM is running'});
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:8000`);
});

}