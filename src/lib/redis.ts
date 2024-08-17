import { Redis } from '@upstash/redis';
import { REDIS_ENDPOINT, REDIS_TOKEN } from '$env/static/private';

export const redis = new Redis({
	url: REDIS_ENDPOINT,
	token: REDIS_TOKEN
});
