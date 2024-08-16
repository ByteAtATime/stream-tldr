import type { PageLoad } from './$types';
import { isAddress } from 'viem';
import { error } from '@sveltejs/kit';
import { GraphQLCohortProvider } from '$lib/cohort';
import { ensClient } from '$lib/client';

export const load: PageLoad = async ({ params, fetch }) => {
	const { cohortAddress } = params;

	if (!cohortAddress || !isAddress(cohortAddress)) {
		error(400, 'Invalid builder address');
	}

	const builders = new GraphQLCohortProvider(cohortAddress).getBuilders();
	const builderAddressToEns = builders.then((addresses) =>
		addresses.map((address) => {
			return Promise.all([address, ensClient.getEnsName({ address })]);
		})
	);

	const res = fetch(`/api/cohort/${cohortAddress}`).then((res) => res.text());

	return {
		cohortAddress,
		summaryPromise: res,
		builderEnsPromise: builderAddressToEns
	};
};
