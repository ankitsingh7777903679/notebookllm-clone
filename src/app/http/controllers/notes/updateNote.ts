import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { NoteRepository } from './repositorys/NoteRepository';
import path from 'node:path';
import { generateTitle } from './TitleGeneration';
import { generatePrompt } from './promptGenerator';
import { generateImage } from './generateImage';
import { LLM } from '@/app/llm/LLM';
import { loadDocument } from './loaders';
import { get } from 'lodash';
import { error } from 'node:console';



export async function updateNote(req: Request, res: Response, next: NextFunction) {
    try {

        const {id, title} = req.body;
        if(!id && !title) {
            throw new Error("Please provide id and title to update note")
        }

        const noteRepo=NoteRepository.getInstance()
        const updateNote=await noteRepo.updateNotes({id,title}) 
        return res.status (200).send({message:"note updated successfully", updateNote}) 
        

        
    } catch (error) {
        next(error)
    }
}