import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { NoteRepository } from './repositorys/NoteRepository';
import path from 'node:path';
import { generateTitle } from './TitleGeneration';
import { generatePrompt } from './promptGenerator';
import { generateImage } from './generateImage';
import { LLM } from '@/app/llm/LLM';
import { loadDocument } from './loaders';



export async function createNote(req: Request, res: Response, next: NextFunction) {
    try {

        if (!req.file) {
            return res.status(400).send("No file uploaded")
        }

        const userId = req.body?.userId;

        const currentDir = process.cwd();
        const uploadsDir = path.join(currentDir, "public", "uploads");
        const randomName= Date. now()  +"-"+ Math.round(Math.random()* 1e9);

        const llm = LLM.getInstance()

        const docSplit = await loadDocument(`${uploadsDir}/${req.file?.filename}`, 'txt')

        const title = await generateTitle(llm, docSplit)

        const generateImagePrompt = await generatePrompt(llm, title)

        await generateImage(generateImagePrompt, uploadsDir, randomName,async (fileName: string) => {
            
            const image=`${process.env.APP_URL}/uploads/${randomName}.png`
            const noteRepo = NoteRepository.getInstance()
            const newNote = await noteRepo.createNote({ title, image, userId })
        })

        return res.status(201).send({ message: "Note created successfully" })

        
    } catch (error) {
        next(error)
    }
}