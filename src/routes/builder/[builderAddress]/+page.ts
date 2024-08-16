import type { PageLoad } from './$types';
import { isAddress } from 'viem';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const { builderAddress } = params;

	if (!builderAddress || !isAddress(builderAddress)) {
		error(400, 'Invalid builder address');
	}

	const res = fetch(`/api/builder/${builderAddress}`).then((res) => res.text());

	return {
		builderAddress,
		summaryPromise: res
	};
};
