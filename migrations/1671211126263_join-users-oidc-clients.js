exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
CREATE TABLE users_oidc_clients (
    user_id int REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    oidc_client_id int REFERENCES oidc_clients (id) ON UPDATE CASCADE ON DELETE CASCADE,
    connection_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT users_oidc_clients_pkey PRIMARY KEY (user_id, oidc_client_id)
);
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
DROP TABLE users_oidc_clients;
`);
};
