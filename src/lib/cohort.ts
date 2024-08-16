import { type Address, isAddress } from 'viem';
import { type BuilderWithdrawal, builderWithdrawalSchema, cohortBuilderSchema } from '$lib/builder';
import { PUBLIC_STREAM_INDEXER_URL } from '$env/static/public';
import { z } from 'zod';

export interface CohortProvider {
	getBuilders(): Promise<Address[]>;

	getWithdrawals(): Promise<BuilderWithdrawal[]>;
}

export class GraphQLCohortProvider implements CohortProvider {
	public constructor(private readonly cohortAddress: Address) {}

	async getBuilders(): Promise<Address[]> {
		const cohortAddressesQuery = `
            query Builders($cohortAddress: String!) {
                cohortBuilders(where: { cohortContractAddress: $cohortAddress }) {
                    id
                    amount
                    cohortContractAddress
                    timestamp
                    ens
                }
            }`;

		const res = await fetch(PUBLIC_STREAM_INDEXER_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: cohortAddressesQuery,
				variables: { cohortAddress: this.cohortAddress }
			})
		});

		const bodySchema = z.object({
			data: z.object({ cohortBuilders: z.array(cohortBuilderSchema) })
		});

		const rawBody = await res.json();
		const body = bodySchema.parse(rawBody);

		return body.data.cohortBuilders
			.map(({ id }) => id.split('-')[0])
			.filter((maybeAddress) => isAddress(maybeAddress));
	}

	async getWithdrawals(): Promise<BuilderWithdrawal[]> {
		const cohortAddressesQuery = `
			query Withdrawals($cohortAddress: String!) {
				cohortWithdrawals(where: { cohortContractAddress: $cohortAddress }) {
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
				variables: { cohortAddress: this.cohortAddress }
			})
		});

		const bodySchema = z.object({
			data: z.object({ cohortWithdrawals: z.array(builderWithdrawalSchema) })
		});

		const rawBody = await res.json();
		const body = bodySchema.parse(rawBody);

		return body.data.cohortWithdrawals;
	}
}
