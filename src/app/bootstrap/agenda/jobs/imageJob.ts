import { generateImage } from "@/app/http/controllers/notes/helpers/generateImage";
import agenda from "../agenda";



agenda.define("generateImage", async (job: any) => {
    const { noteId, generateImagePrompt, uploadsDir, randomName } = job.attrs.data as any;
    console.log(" Starting image generation for note:", noteId);  

    await generateImage(generateImagePrompt, uploadsDir, randomName, async (fileName: string) => {
        console.log(" Finished image generation");
    })

});