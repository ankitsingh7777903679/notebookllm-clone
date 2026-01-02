import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { NoteRepository } from './repositorys/NoteRepository';
import path from 'node:path';
import { generateTitle } from './helpers/TitleGeneration';
import { generatePrompt } from './helpers/promptGenerator';
// import { generateImage } from './helpers/generateImage';
import { LLM } from '@/app/llm/LLM';
import { loadDocument } from './loaders/loaders';
// import { get } from 'lodash';
import { DocRepository } from './repositorys/DocRepository';



export async function createNote(req: Request, res: Response, next: NextFunction) {
    try {

        if (!req.file) {
            return res.status(400).send("No file uploaded")
        }

        const userId = req.body?.userId;

        const currentDir = process.cwd();
        const uploadsDir = path.join(currentDir, "public", "uploads");
        const randomName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = req.file?.filename

        const llm = LLM.getInstance()

        const ext = path.extname(req.file.filename).toLowerCase();
        let docType: 'pdf' | 'html' | 'txt' = 'txt';
        if (ext === '.pdf') docType = 'pdf';
        else if (ext === '.html' || ext === '.htm') docType = 'html';

        const docSplit = await loadDocument(`${uploadsDir}/${fileName}`, docType)

        const firstChunk = getDocChunk(docSplit)
        // console.log("First Chunk: ", firstChunk)

        const title = await generateTitle(llm, firstChunk)
        console.log("Generated Title: ", title)
        const generateImagePrompt = await generatePrompt(llm, title)
        console.log("Generated Prompt: ", generateImagePrompt)


        const image = `${process.env.APP_URL}/uploads/${randomName}.png`
        const noteRepo = NoteRepository.getInstance()
        const docRepo = DocRepository.getInstance()
        const newNote = await noteRepo.createNote({ title, image, userId },
            {
                generateImagePrompt, uploadsDir, randomName
            }
        )

        const newDoc = await docRepo.createDoc({fileName, userId, noteId: newNote._id, title })

        return res.status(201).send({ message: "Note created successfully", newDoc })


    } catch (error) {
        next(error)
    }
}

function getDocChunk(docSplit: any[]) {
    const docChunk = [] as any
    if (docSplit.length > 0) {
        docChunk.push(docSplit[0])
    } else {
        throw new Error('The provide Document is empty')
    }
    // console.log("Doc Chunk: ", docChunk)
    return docChunk
}