/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  const same_email_domains = `
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY
          organization_id,
          domain
        ORDER BY
          verification_type
      ) AS count
    FROM
      email_domains
    WHERE
      verification_type IS NULL
  `;

  const ids_to_delete = `
    SELECT
      id
    FROM
      same_email_domains
    WHERE
      count > 1
  `;

  return pgm.db.query(`
    WITH
      same_email_domains AS ( ${same_email_domains} )
    DELETE
    FROM
      email_domains
    WHERE
      id IN ( ${ids_to_delete} )
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = () => {};
