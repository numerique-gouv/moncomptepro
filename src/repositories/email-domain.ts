import {
  addDomainFactory,
  findEmailDomainsByOrganizationIdFactory,
  type AddDomainHandler,
} from "@gouvfr-lasuite/proconnect.identite/repositories/email-domain";
import { getDatabaseConnection } from "../connectors/postgres";

export const findEmailDomainsByOrganizationId =
  findEmailDomainsByOrganizationIdFactory({
    pg: getDatabaseConnection(),
  });

export const addDomain: AddDomainHandler = addDomainFactory({
  pg: getDatabaseConnection(),
});
