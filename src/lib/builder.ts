import type { Address } from 'viem';
import { PUBLIC_STREAM_INDEXER_URL } from '$env/static/public';
import { z } from 'zod';
import { addressSchema } from '$lib/types';

export const BUILDERS: { name: string; address: Address }[] = [
	{ name: 'byteatatime.eth', address: '0x598cb95773D9b66a27a5780DB5EED2d018685879' },
	{ name: 'shivbhonde.eth', address: '0x1A2d838c4bbd1e73d162d0777d142c1d783Cb831' },
	{ name: 'portdev.eth', address: '0xA122A7Ed69597DBd77Fb2C539E13B7C3fB804637' },
	{ name: 'inc.carletex.eth', address: '0x1990a6bCdb13D33463cBA884a1aE6020292523e8' },
	{ name: 'matthu.eth', address: '0x41f727fA294E50400aC27317832A9F78659476B9' }
];

export const cohortBuilderSchema = z.object({
	id: z.string(),
	amount: z.number(),
	cohortContractAddress: addressSchema,
	timestamp: z.string(),
	ens: z.null()
});

export const builderWithdrawalSchema = z.object({
	builder: addressSchema,
	amount: z.number(),
	reason: z.string(),
	cohortContractAddress: addressSchema,
	timestamp: z
		.string()
		.or(z.date())
		.transform((val) => (typeof val === 'string' ? new Date(parseInt(val) * 1000) : val))
});

export type BuilderWithdrawal = z.infer<typeof builderWithdrawalSchema>;

export interface BuilderProvider {
	getWithdrawals(): Promise<BuilderWithdrawal[]>;
}

export class GraphQLBuilderProvider implements BuilderProvider {
	public constructor(private readonly builderAddress: Address) {}

	async getWithdrawals(): Promise<BuilderWithdrawal[]> {
		const cohortAddressesQuery = `
            query Withdrawals($builderAddress: String!) {
                cohortWithdrawals(where: { builder: $builderAddress }) {
                    builder,
                    amount,
                    reason,
                    cohortContractAddress,
                    timestamp,
                }
            }`;

		const res = await fetch(PUBLIC_STREAM_INDEXER_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: cohortAddressesQuery,
				variables: { builderAddress: this.builderAddress }
			})
		});

		const bodySchema = z.object({
			data: z.object({ cohortWithdrawals: z.array(builderWithdrawalSchema) })
		});

		const rawBody = (await res.json()) as unknown;
		const body = bodySchema.parse(rawBody);

		return body.data.cohortWithdrawals;
	}
}
