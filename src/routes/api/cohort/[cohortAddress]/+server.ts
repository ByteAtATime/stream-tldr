import type { RequestHandler } from './$types';
import { isAddress } from 'viem';
import { GraphQLCohortProvider } from '$lib/cohort';
import { OpenAISummaryProvider } from '$lib/summarizer';

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

	const summary = await new OpenAISummaryProvider().summarizeCohortDevelopers(withdrawals);

	return new Response(summary);
};
