import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { NoteRepository } from '../repositorys/NoteRepository';
import { cwd } from 'process';
import path from 'path/win32';
import { DocRepository } from '../repositorys/DocRepository';
import { loadDocument } from '../loaders/loaders';
import { LLM } from '@/app/llm/LLM';
import { generateFAQ } from '@/pipelines/generate-faq';





export async function updateOrCreateFaq(req: Request, res: Response, next: NextFunction) {
    try {

        // steps :  
        // -getFileName 
        // -splitIntoChunks
        // - call generateSummary 
        // -storeSummaryInDB  
        const {userId, noteId}:Record<string, any> = req.body;
        const llm = LLM.getInstance()
        const docRepo = DocRepository.getInstance()
        const doc = await docRepo.getSingleDoc({ userId, noteId});
        if(!doc) throw new Error("Document not found")

        const currentDir = cwd(); 
        const uploadsDir = path. join(currentDir, "public", "uploads"); 
        const docFullPath=`${uploadsDir}/${(doc as any)?.fileName}`;

        const splittingDocs = await loadDocument(docFullPath)
        const faqResult = await generateFAQ(llm, splittingDocs)
        const faqDoc = faqResult?.finalFaq ?? ''
        await docRepo.updateFaq({userId, noteId, faq: faqDoc})

        return res.status(200).send({message: "faq generated successfully", faqDoc})


    } catch (error) {
        next(error)
    }
}