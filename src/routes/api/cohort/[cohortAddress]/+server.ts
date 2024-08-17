import type { RequestHandler } from './$types';
import { isAddress } from 'viem';
import { GraphQLCohortProvider } from '$lib/cohort';
import { OpenAISummaryProvider } from '$lib/summarizer';
import { hashWithdrawals } from '$lib/utils';
import { redis } from '$lib/redis';

export const GET: RequestHandler = async ({ params }) => {
	const { cohortAddress } = params;

	if (!cohortAddress || !isAddress(cohortAddress)) {
		return new Response('Invalid cohort address', { status: 400 });
	}

	const cohortProvider = new GraphQLCohortProvider(cohortAddress);
	const withdrawals = await cohortProvider.getWithdrawals();

	if (withdrawals.length === 0) {
		return new Response('No withdrawals found', { status: 404 });
	}

	const hash = hashWithdrawals(withdrawals);
	const cached = await redis.get(hash);
	if (cached && typeof cached === 'string') {
		return new Response(cached);
	}

	const summary = await new OpenAISummaryProvider().summarizeCohortDevelopers(withdrawals);
	await redis.set(hash, summary);

	return new Response(summary);
};
