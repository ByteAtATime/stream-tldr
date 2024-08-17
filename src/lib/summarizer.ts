import type { BuilderWithdrawal } from '$lib/builder';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export interface SummaryProvider {
	summarizeBuilderWithdrawals(withdrawals: BuilderWithdrawal[]): Promise<string>;
	summarizeCohortDevelopers(withdrawals: BuilderWithdrawal[]): Promise<string>;
}

const CONTEXT = `
### Context:
- **BuidlGuidl:** A community of Ethereum builders focused on onboarding and supporting developers.
- **SE-2:** Ethereum application framework, a core project within the BuidlGuidl.
- **SRE (SpeedRun Ethereum):** A series of challenges designed to test and improve Ethereum development skills.
- **Batches Program:** A training initiative aimed at developing Ethereum skills among new developers.
`;

const BUILDER_PROMPT = `
Your task: Summarize the given user's recent activities based on their Ethereum withdrawals, each with a timestamp, amount, and description of work.

Instructions:
1. Start with a brief overview of the user's focus and recent projects.
2. Provide a chronological list of the withdrawals, each with a brief description of the work done at that time. Don't simply regurgitate the withdrawal details.
3. Include links where possible and relevant.

${CONTEXT}

Audience: Fellow BuidlGuidl member, so be direct and concise. Address the user as they/them.

Example Summary:
The user has made many contributions to the SE-2 framework, including a new feature for handling user authentication. They also participated in the SRE challenge, where they optimized a smart contract for gas efficiency. Recently, they withdrew 0.8 ETH for a security audit of their latest project, a decentralized exchange.
`;

const COHORT_PROMPT = `
**Your Task:** Analyze the provided data on developers, including their Ethereum withdrawals and their contributions to the BuidlGuidl mission ("Onboarding developers onto Ethereum"). For each developer:

### Instructions:
1. **Summarize Activities:** Write a concise 1-2 sentence summary of the developer's activities over the past 6 months. Focus on how their work aligns with the BuidlGuidl mission, highlighting specific contributions and achievements.
2. **ETH Withdrawals:** Display the total amount of ETH the developer has withdrawn during this period.
3. **Impact Score:** Assign an impact score (0-100) based on the developer's contribution to the BuidlGuidl mission. Justify your score by evaluating the relevance and effectiveness of their work relative to their withdrawals. A higher score should reflect a strong work-to-ETH ratio.
4. **Key Contributions:** List major PRs, projects, or other significant contributions the developer has made, including links where available. Also, mention a list of any PRs submitted by the developer.

${CONTEXT}

### Key Considerations:
- **Mission Alignment:** Ensure the summary emphasizes how well the developer’s work supports the BuidlGuidl mission.
- **ETH Withdrawals:** Consider the amount of ETH withdrawn when assigning the impact score, favoring developers with a high output relative to their withdrawals.
- **Specific Examples:** Use concrete examples from the developer’s contributions and withdrawals to support your analysis.

### Output Format:
#### Developer: 0x...
- **Summary**: ...
- **ETH Withdrawn**: ...
- **Impact Score**: .../100 - ... (justification)
- **Key Contributions**:
	- [PR #123](https://github.com/...): ...
	- Project: ...
	- ...
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
			temperature: 0.0000001,
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
