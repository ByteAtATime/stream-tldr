import type { Address } from 'viem';
import { PUBLIC_STREAM_INDEXER_URL } from '$env/static/public';
import { z } from 'zod';
import { addressSchema } from '$lib/types';

const cohortBuilderSchema = z.object({
	id: z.string(),
	amount: z.number(),
	cohortContractAddress: addressSchema,
	timestamp: z.string(),
	ens: z.null()
});

const builderWithdrawalSchema = z.object({
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
