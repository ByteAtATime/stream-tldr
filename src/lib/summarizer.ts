import type { BuilderWithdrawal } from '$lib/builder';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export interface SummaryProvider {
	summarizeWithdrawals(withdrawals: BuilderWithdrawal[]): Promise<string>;
}

const OPENAI_PROMPT = `
Your task: Summarize the given user's recent activities based on their Ethereum withdrawals, each with a timestamp, amount, and description of work.

Instructions:
1. Start with a brief overview of the user's focus and recent projects.
2. Provide a chronological list of the withdrawals, each with a brief description of the work done at that time.
3. Include links where possible and relevant.

Context:
- BuidlGuidl: Community of Ethereum builders.
- SE-2: Ethereum application framework.
- SRE (SpeedRun Ethereum): Challenges for Ethereum developers.

Audience: Fellow BuidlGuidl member, so be direct and concise. Address the user as they/them.

Example Summary:
The user has made many contributions to the SE-2 framework, including a new feature for handling user authentication. They also participated in the SRE challenge, where they optimized a smart contract for gas efficiency. Recently, they withdrew 0.8 ETH for a security audit of their latest project, a decentralized exchange.
`;

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
					content: OPENAI_PROMPT
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
