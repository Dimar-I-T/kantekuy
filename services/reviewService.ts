import { pool } from "@/lib/db/config";

export async function createReview(user_id: string, stall_id: string, item_id: string, comment: string, rating: string) {
    const rating_number = Number(rating);
    try {
        await pool.query('BEGIN');
        const result = await pool.query(`
                    insert into reviews (user_id, stall_id, item_id, comment, rating)
                    values ($1, $2, $3, $4, $5)
                    returning *
                `, [user_id, stall_id, item_id, comment, rating_number]);

        if (result.rows.length === 0) {
            throw Error('Tidak berhasil insert ke tabel reviews');
        }

        if (!item_id) {
            const ambilRating = await pool.query(`
                        select avg(rating) as rating_avg
                        from reviews
                        where stall_id = $1
                        group by stall_id
                    `, [stall_id]);

            const ratingSekarang = ambilRating.rows[0].rating_avg;
            const updateRating = await pool.query(`
                    update stalls
                    set rating_avg = $1
                    where stall_id = $2
                    returning *
                    `, [ratingSekarang, stall_id]);

            if (updateRating.rows.length === 0) {
                throw Error('tidak bisa mengupdate review_avg. stall_id salah');
            }
        }

        if (!stall_id) {
            const ambilRating = await pool.query(`
                        select avg(rating) as rating_avg
                        from reviews
                        where item_id = $1
                        group by item_id
                    `, [item_id]);

            const ratingSekarang = ambilRating.rows[0].rating_avg;
            const updateRating = await pool.query(`
                    update items
                    set rating_avg = $1
                    where item_id = $2
                    returning *
                    `, [ratingSekarang, item_id]);

            if (updateRating.rows.length === 0) {
                throw Error('tidak bisa mengupdate review_avg. item_id salah');
            }
        }

        await pool.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}

export async function getReview(stall_id: string, item_id: string) {
    let variabel = !stall_id ? "item" : "stall";
    let id = !stall_id ? item_id : stall_id;

    const result = await pool.query(`
            select ${variabel}s.${variabel}_id as ${variabel}_id, username, comment, rating, reviews.created_at as created_at from ${variabel}s
            join reviews
            on ${variabel}s.${variabel}_id = reviews.${variabel}_id
            join users
            on users.user_id = reviews.user_id 
            where ${variabel}s.${variabel}_id = $1
        `, [id]);
    
    if (result.rows.length == 0) {
        throw Error('id salah');
    }

    return result.rows;
}