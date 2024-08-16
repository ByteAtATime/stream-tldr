import type { BuilderWithdrawal } from '$lib/builder';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export interface SummaryProvider {
	summarizeWithdrawals(withdrawals: BuilderWithdrawal[]): Promise<string>;
}

export class OpenAISummaryProvider implements SummaryProvider {
	private openai: OpenAI;

	public constructor() {
		this.openai = new OpenAI({
			apiKey: OPENAI_API_KEY
		});
	}

	async summarizeWithdrawals(withdrawals: BuilderWithdrawal[]): Promise<string> {
		const output = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: `Your job is to summarize the following withdrawals. Each withdrawal has 3 data points: the timestamp, the amount, and the reason. Given this data, you are to create a summary of what the user has been working on.
					
Some knowledge you might not know:
- The BuidlGuidl is a community of Ethereum builders.
- SE-2 is a framework for building Ethereum applications.
- SRE (SpeedRun Ethereum) is a series of challenges to get started with Ethereum.`
				},
				{
					role: 'user',
					content: `Withdrawals: ${withdrawals.map((w) => `${w.amount} ETH at ${w.timestamp}:\n${w.reason}`).join('\n\n')}`
				}
			]
		});

		return output.choices[0].message.content ?? "I'm sorry, I couldn't generate a summary.";
	}
}
