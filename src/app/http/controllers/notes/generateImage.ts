import fs from "fs"
import fetch from "node-fetch"

// export const generateIimage=async (prompt :string, path: string, fileName: string, cb: (fileName:string) => void) => {
//     const API_KEY = process.env.GEMINI_API_KEY


//             // Dynamically import the ESM-only client at runtime to avoid CommonJS/ESM interop errors
//             console.log("Generating image...");
//             const { Client } = await import("@gradio/client");
//             const client = await Client.connect('NihalGazi/FLUX-Unlimited')
//             const result = await client.predict("/generate_image", {
//                 prompt: prompt,
//                 width: 512,
//                 height: 512,
//                 seed: 3,
//                 randomize: true,
//                 server_choice: "Google US Server"
//             });
//             console.log("Image generation result:", result);
//             const imageUrl = (result.data as Array<{ url: string }>)[0].url;

//             // download image
//             const imageResponse = await fetch(imageUrl);

//             const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
//             fs.writeFile(`${path}/${fileName}.png`, imageBuffer, () =>{ 
//                 cb(`${path}/${fileName}.png`) 
//                 console.log('Image saved as png');
//             });

//             // const title = await titleORFileNameGenrate(prompt, 'fileName');

//             // console.log("Generated title:", title.content);
//             // const imagePath = path.resolve(`./genImage/${title.content}.png`);

//             // await fs.promises.writeFile(imagePath, imageBuffer);

//             return {
//                 success: true,
//                 message: "Image generated successfully using FLUX Unlimited",
//                 filePath: imagePath,
//                 prompt: prompt,
//             }

//         }, {
//         name: "generateImage",
//         description: "Use for generating images.",
//         schema: z.object({
//             prompt: z.string().describe("The text prompt to generate the image from"),
//         }),
// }


export const generateImage = async (prompt: string, path: string, fileName: string, cb: (fileName: string) => void) => {
    const API_KEY = process.env.GEMINI_API_KEY

    const response = await fetch("https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "image/jpeg",
            "Authorization": "Bearer $API_KEY"
        },
        body: JSON.stringify({
            prompt: "",
            aspect_ratio: "16:9",
            guidance_scale: 3.5,
            num_inference_steps: 30,
            seed: -1
        }),
    });

    const result = await response.json();
    const requestId = result.request_id;

    if (!requestId) {
        throw new Error("No request ID returned");
    }

    console.log("Request submitted with ID:", requestId);

    // Step 2: Poll for the result
    const resultEndpoint = "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-kontext-pro/get_result";

    for (let attempts = 0; attempts < 60; attempts++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const resultResponse = await fetch(resultEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "image/jpeg",
                "Authorization": "Bearer $API_KEY"
            },
            body: JSON.stringify({ id: requestId })
        });

        const pollResult = await resultResponse.json();

        if (['Ready', 'Complete', 'Finished'].includes(pollResult.status)) {
            const imageData = pollResult.result?.sample;

            if (typeof imageData === 'string' && imageData.startsWith('http')) {
                // Download from URL
                const imageResponse = await fetch(imageData);
                const buffer = Buffer.from(await imageResponse.arrayBuffer());
                
                fs.writeFile(`${path}/${fileName}.png`, buffer, () => {
                    cb(`${path}/${fileName}.png`)
                    console.log('Image saved as png');
                });
            } else if (imageData) {
                // Base64 data
                const buffer = Buffer.from(imageData, 'base64');
                fs.writeFile(`${path}/${fileName}.png`, buffer, () => {
                    cb(`${path}/${fileName}.png`)
                    console.log('Image saved as png');
                });
            }
            break;
        }

        if (['Failed', 'Error'].includes(pollResult.status)) {
            throw new Error(`Generation failed: ${pollResult.details || 'Unknown error'}`);
        }

        console.log(`Status: ${pollResult.status}, attempt ${attempts + 1}/60`);
    }
}