import fs from "fs"
import fetch from "node-fetch"

export const generateImage = async (prompt: string, path: string, fileName: string, cb: (fileName: string) => void) => {
    try {
        // Dynamically import the ESM-only client at runtime to avoid CommonJS/ESM interop errors
        console.log("Generating image...");
        const { Client } = await import("@gradio/client");
        const client = await Client.connect('NihalGazi/FLUX-Unlimited')
        const result = await client.predict("/generate_image", {
            prompt: prompt,
            width: 512,
            height: 512,
            seed: 3,
            randomize: true,
            server_choice: "Google US Server"
        });
        console.log("Image generation result:", result);
        const imageUrl = (result.data as Array<{ url: string }>)[0].url;

        // download image
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        
        fs.writeFile(`${path}/${fileName}.png`, imageBuffer, () => { 
            cb(`${path}/${fileName}.png`) 
            console.log('Image saved as png, bytes:', imageBuffer.length);
        });
    } catch (error) {
        console.error('Image generation failed:', error);
        throw error;
    }
}