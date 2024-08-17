import type { RequestHandler } from '@sveltejs/kit';
import { isAddress } from 'viem';
import { GraphQLBuilderProvider } from '$lib/builder';
import { OpenAISummaryProvider } from '$lib/summarizer';
import { hashWithdrawals } from '$lib/utils';
import { redis } from '$lib/redis';

export const GET: RequestHandler = async ({ params }) => {
	const { builderAddress } = params;

	if (!builderAddress || !isAddress(builderAddress)) {
		return new Response('Invalid builder address', { status: 400 });
	}

	const builderProvider = new GraphQLBuilderProvider(builderAddress);
	const withdrawals = await builderProvider.getWithdrawals();

	if (withdrawals.length === 0) {
		return new Response('No withdrawals found', { status: 404 });
	}

	const hash = hashWithdrawals(withdrawals);
	const cached = await redis.get(hash);
	if (cached && typeof cached === 'string') {
		return new Response(cached);
	}

	const summary = await new OpenAISummaryProvider().summarizeBuilderWithdrawals(withdrawals);
	await redis.set(hash, summary);

	return new Response(summary);
};
