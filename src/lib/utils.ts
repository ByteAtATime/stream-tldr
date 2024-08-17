import type { BuilderWithdrawal } from '$lib/builder';
import { sha256 } from 'viem';

export const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export const hashWithdrawals = (withdrawals: BuilderWithdrawal[]) => {
	const string = withdrawals.map((w) => w.amount + w.builder + w.reason + w.timestamp).join('');

	return sha256(Buffer.from(string));
};
