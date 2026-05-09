import { StallType } from "@/app/types/types";
import { cloudinary } from "@/lib/cloudinary";
import { pool } from "@/lib/db/config";

export async function createStall(user_id: string, { name, description, block_id, phone_number }: StallType, file: File) {
    if (!file) {
        throw Error('No file uploaded');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
        resource_type: "image",
        folder: "uploads",
    });

    const res = await pool.query(`
            insert into stalls (owner_id, name, description, picture_url, block_id, phone_number) values
            ($1, $2, $3, $4, $5, $6)
            returning *
        `, [user_id, name, description, result.secure_url, block_id, phone_number]);
    
    return res.rows;
}