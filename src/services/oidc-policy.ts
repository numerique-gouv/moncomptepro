import { interactionPolicy } from 'oidc-provider';
import { getSelectedOrganizationId } from '../repositories/redis/selected-organization';
import { mustReturnOneOrganizationInPayload } from './must-return-one-organization-in-payload';

const { Prompt, Check, base } = interactionPolicy;

const policy = base();

const selectOrganizationPrompt = new Prompt(
  { name: 'select-organization', requestable: true },

  new Check(
    'organization_selected',
    'requested scope require organization selection',
    async ctx => {
      const { oidc } = ctx;

      // existence of oidc.session.accountId is ensured by previous prompt
      const user_id = parseInt(oidc.session!.accountId!, 10);

      const selectedOrganizationId = await getSelectedOrganizationId(user_id);

      if (
        mustReturnOneOrganizationInPayload(
          [...ctx.oidc.requestParamScopes].join(' ')
        ) &&
        !selectedOrganizationId
      ) {
        // @ts-ignore
        return Check.REQUEST_PROMPT;
      }

      // @ts-ignore
      return Check.NO_NEED_TO_PROMPT;
    }
  )
);

policy.add(selectOrganizationPrompt);

export default policy;
