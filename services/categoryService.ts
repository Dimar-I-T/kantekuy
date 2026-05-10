import { pool } from "@/lib/db/config";

export async function getCategories(name: string) {
    let query = `SELECT * FROM categories WHERE 1=1`;
    const values: any[] = [];
    let valueIndex = 1;
    if (name) {
        query += ` AND name ILIKE $${valueIndex}`;
        values.push(`%${name}%`);
        valueIndex++;
    }
    
    const result = await pool.query(query, values);
    return result.rows;
}