import { interactionPolicy } from 'oidc-provider';
import { getSelectedOrganizationId } from '../repositories/redis/selected-organization';
import { mustReturnOneOrganizationInPayload } from './must-return-one-organization-in-payload';

const { Prompt, Check, base } = interactionPolicy;

const policy = base();

policy.add(
  new Prompt(
    { name: 'choose_organization', requestable: false },
    new Check(
      'organization_missing',
      'End-User must select one organization',
      async (ctx) => {
        const { oidc } = ctx;

        // existence of oidc.session.accountId is ensured by previous prompt
        const user_id = parseInt(oidc.session!.accountId!, 10);

        const selectedOrganizationId = await getSelectedOrganizationId(user_id);

        if (
          mustReturnOneOrganizationInPayload(
            [...oidc.requestParamScopes].join(' ')
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
  )
);

policy.add(
  new Prompt(
    { name: 'select_organization', requestable: true },

    new Check(
      'organization_selection_prompt',
      'client required organization selection prompt',
      'interaction_required',
      async (ctx) => {
        const { oidc } = ctx;
        if (
          ctx.params.prompt === 'select_organization' &&
          !oidc.result?.select_organization
        ) {
          // @ts-ignore
          return Check.REQUEST_PROMPT;
        }

        // @ts-ignore
        return Check.NO_NEED_TO_PROMPT;
      }
    )
  )
);

policy.add(
  new Prompt(
    { name: 'update_userinfo', requestable: true },

    new Check(
      'update_userinfo_prompt',
      'client required userinfo edition prompt',
      'interaction_required',
      async (ctx) => {
        const { oidc } = ctx;
        if (
          ctx.params.prompt === 'update_userinfo' &&
          !oidc.result?.update_userinfo
        ) {
          // @ts-ignore
          return Check.REQUEST_PROMPT;
        }

        // @ts-ignore
        return Check.NO_NEED_TO_PROMPT;
      }
    )
  )
);

export default policy;
