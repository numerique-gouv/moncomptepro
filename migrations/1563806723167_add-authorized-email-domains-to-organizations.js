exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN authorized_email_domains character varying[] DEFAULT '{}'::character varying[];
`);

  await pgm.db.query(`
UPDATE organizations
SET authorized_email_domains = subquery.domains
FROM (
  SELECT siret, array_agg(domain) AS domains
  FROM (
           SELECT siret, SUBSTRING(u.email from '@(.*)$') AS domain
           FROM organizations
                    INNER JOIN users_organizations AS uo ON uo.organization_id = organizations.id
                    INNER JOIN users AS u ON u.id = uo.user_id
           GROUP BY siret, substring(u.email from '@(.*)$')
  ) AS domains
  GROUP BY siret
) AS subquery
WHERE organizations.siret = subquery.siret;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations
DROP COLUMN authorized_email_domains;
`);
};
