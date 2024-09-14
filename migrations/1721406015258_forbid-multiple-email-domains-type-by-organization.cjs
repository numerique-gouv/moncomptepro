exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE email_domains
      ADD CONSTRAINT unique_organization_domain
        UNIQUE (organization_id, domain, verification_type);
  `);
  // TODO ne fonctionne pas quand un des champs est à null, il faut mettre à jour en postgres 15 et ajouter un flag qui permet de considérer les nulls comme une seule et même valeur
  // TODO : si il existe un domain avec un null et un domaine avec une vérif
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain;
  `);
};
