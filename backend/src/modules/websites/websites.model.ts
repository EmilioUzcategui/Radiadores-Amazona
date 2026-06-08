import { query } from "../../config/database/db";
import type { UpdateWebsiteBody, WebsiteSource, WebsitesResponse } from "./websites.schema";

type DbWebsiteRow = {
    id: string;
    name: string;
    url: string;
    is_active: boolean | null;
    priority: number | string | null;
    total_products: number | string | null;
    success_rate: number | string | null;
    last_scraped: string | Date | null;
};

const parseOptionalNumber = (value: number | string | null | undefined): number | null => {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const mapWebsiteRow = (row: DbWebsiteRow): WebsiteSource => {
    return {
        id: row.id,
        nombre: row.name,
        url: row.url,
        activo: row.is_active ?? false,
        prioridad: parseOptionalNumber(row.priority) ?? 0,
        total_productos: parseOptionalNumber(row.total_products),
        tasa_exito: parseOptionalNumber(row.success_rate),
        ultimo_scrapeo: row.last_scraped ? new Date(row.last_scraped) : null,
    };
};

export const getWebsitesModel = async (): Promise<WebsitesResponse> => {
    const result = await query(`
        SELECT
            id,
            name,
            url,
            is_active,
            priority,
            total_products,
            success_rate,
            last_scraped
        FROM scraping_sources
        ORDER BY is_active DESC, priority DESC, total_products DESC NULLS LAST
    `);

    const rows = result.rows as DbWebsiteRow[];
    return {
        items: rows.map((row) => mapWebsiteRow(row)),
    };
};

export const updateWebsiteModel = async (
    id: string,
    changes: UpdateWebsiteBody,
): Promise<WebsiteSource | null> => {
    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (changes.activo !== undefined) {
        fields.push(`is_active = $${index++}`);
        values.push(changes.activo);
    }

    if (changes.prioridad !== undefined) {
        fields.push(`priority = $${index++}`);
        values.push(changes.prioridad);
    }

    if (fields.length === 0) {
        return null;
    }

    values.push(id);

    const result = await query(
        `
        UPDATE scraping_sources
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING
            id,
            name,
            url,
            is_active,
            priority,
            total_products,
            success_rate,
            last_scraped
        `,
        values,
    );

    const rows = result.rows as DbWebsiteRow[];
    if (rows.length === 0) {
        return null;
    }

    return mapWebsiteRow(rows[0]);
};
