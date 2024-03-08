import { getDatabaseConnection } from "../connectors/postgres";
import { QueryResult } from "pg";

export const findBySlug = async (slug: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<ExternalPage> = await connection.query(
    `
SELECT * FROM external_pages WHERE slug = $1
`,
    [slug],
  );

  return rows.shift();
};

export const createPage = async ({
  slug,
  title,
  body,
}: Pick<ExternalPage, "slug" | "title" | "body">) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<ExternalPage> = await connection.query(
    `
INSERT INTO external_pages (slug, title, body, updated_at) VALUES ($1, $2, $3, $4)
RETURNING *
`,
    [slug, title, body, new Date()],
  );

  return rows;
};

export const updatePage = async ({ slug, title, body }: ExternalPage) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<ExternalPage> = await connection.query(
    `
UPDATE external_pages SET title = $2, body = $3, updated_at = $4 WHERE slug = $1
RETURNING *
`,
    [slug, title, body, new Date()],
  );

  return rows;
};
