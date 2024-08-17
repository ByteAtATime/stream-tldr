import { type Address, isAddress } from 'viem';
import { type BuilderWithdrawal, builderWithdrawalSchema, cohortBuilderSchema } from '$lib/builder';
import { PUBLIC_STREAM_INDEXER_URL } from '$env/static/public';
import { z } from 'zod';

// list of cohorts as seen on the buidlguidl website
export const COHORTS: { name: string; address: Address }[] = [
	{ name: 'Sand Garden', address: '0x964d0C9a421953F95dAF3A5c5406093a3014A5D8' },
	{ name: 'Mercs', address: '0x8d84f7E545F69746e4A1CAD0F7ac9A83CCDF2C65' },
	{ name: 'ENS Cohort', address: '0x2634aF3E799D3E17C6cf30bCF1275A7e3808F0df' },
	{ name: 'Denver Hacker House', address: '0x2Be18e07C7be0a2CC408C9E02C90203B2052D7DE' },
	{ name: 'Infrastructure', address: '0x502730421b796baeeB9D907d88685234dDb44750' }
];

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
