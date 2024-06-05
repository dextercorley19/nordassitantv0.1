import { currentUser, useUser } from "@clerk/nextjs";

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

interface UseUserT {
    isLoaded: boolean;
    isSignedIn: boolean;
    user: { id: string };
}

const f = createUploadthing();

async function postPDFUrl(userId: string) {
    console.log("userId", userId);
    const res = fetch(`http:172.18.0.4:3001/chunk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "userId": userId }),
    });
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ req }) => {
            // This code runs on your server before upload
            const user = await currentUser();

            // If you throw, the user will not be able to upload
            if (!user) throw new UploadThingError("You must be logged in to upload a pdf");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);


            console.log("file url", file.url);

            await postPDFUrl(metadata.userId);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;