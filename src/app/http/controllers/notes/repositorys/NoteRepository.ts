// import { User } from "@/app/models/userSchema";
import { generateTokens, signAccessToken, signRefreshToken } from "@/app/helpers/jwt";
import { Note } from "@/app/models/noteSchema";
import { User } from "@/app/models/userSchema";
import { GoogleUserType } from "@/types/user-types";
import { promise } from "zod";

export class NoteRepository {
    private static instance: NoteRepository;



    public static getInstance(): NoteRepository {
        if (!NoteRepository.instance) {
            NoteRepository.instance = new NoteRepository();
        }
        return NoteRepository.instance;

    }

    async createNote(props: { title: string, image: string, userId: string }) {

        const note = new Note({
            ...props

        })
        const newNote = await note.save();
        return newNote.toObject();

    }


}

