import type { BuilderWithdrawal } from '$lib/builder';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export interface SummaryProvider {
	summarizeBuilderWithdrawals(withdrawals: BuilderWithdrawal[]): Promise<string>;
	summarizeCohortDevelopers(withdrawals: BuilderWithdrawal[]): Promise<string>;
}

const BUILDER_PROMPT = `
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

const COHORT_PROMPT = `
Your task: Analyze the provided information about developers, including their Ethereum withdrawals and the BuidlGuidl mission ("Onboard developers onto Ethereum"). For each developer:

Instructions:
1. Write a 1-2 sentence summary of the developer's activities over the past 6 months, focusing on how their work aligns with the BuidlGuidl mission.
2. Display the total amount of ETH the developer has withdrawn.
3. Assign an impact score on a scale of 0-100, indicating the developer's contribution towards the BuidlGuidl mission.
4. Justify the score based on the developer's work and withdrawals.

Details to Consider:
- The summary should be concise and mission-focused.
- The impact score should reflect the relevance and effectiveness of the developer's work, especially related to the BuidlGuidl mission statement.
- Use specific examples from the developer's work and withdrawals to support your analysis.
`;

export class OpenAISummaryProvider implements SummaryProvider {
	private openai: OpenAI;

	public constructor() {
		this.openai = new OpenAI({
			apiKey: OPENAI_API_KEY
		});
	}

	async summarizeBuilderWithdrawals(withdrawals: BuilderWithdrawal[]): Promise<string> {
		const output = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: BUILDER_PROMPT
				},
				{
					role: 'user',
					content: `Withdrawals:\n${withdrawals.map(this.withdrawalToText).join('\n\n')}`
				}
			]
		});

		return output.choices[0].message.content ?? "I'm sorry, I couldn't generate a summary.";
	}

	async summarizeCohortDevelopers(withdrawals: BuilderWithdrawal[]): Promise<string> {
		const ethWithdrawnPerBuilder = withdrawals.reduce(
			(acc, w) => {
				acc[w.builder] = (acc[w.builder] ?? 0) + w.amount;
				return acc;
			},
			{} as Record<string, number>
		);

		const output = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: COHORT_PROMPT
				},
				{
					role: 'user',
					content: `
ETH withdrawn per developer:
${Object.entries(ethWithdrawnPerBuilder)
	.map(([builder, amount]) => `${builder}: ${amount} ETH`)
	.join('\n')}

Developer withdrawals:
${withdrawals.map(this.withdrawalToText).join('\n\n')}
					`
				}
			]
		});

		return output.choices[0].message.content ?? "I'm sorry, I couldn't generate a summary.";
	}

	private withdrawalToText(w: BuilderWithdrawal) {
		return `
Withdrawal by ${w.builder} for ${w.amount} ETH at ${w.timestamp}:
${w.reason}
		`.trim();
	}
}
