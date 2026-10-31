import type { APIRoute } from 'astro';
import { isValidGithubUsername, normalizeContributionData } from '../../../lib/contributions.ts';

export const prerender = false;

const cacheHeaders = {
	'Content-Type': 'application/json; charset=utf-8',
	'Cache-Control': 'public, max-age=300',
};

export const GET: APIRoute = async ({ params }) => {
	const username = params.username ?? '';

	if (!isValidGithubUsername(username)) {
		return new Response(JSON.stringify({ error: 'Invalid GitHub username.' }), {
			status: 400,
			headers: cacheHeaders,
		});
	}

	try {
		const response = await fetch(`https://github.com/${username}.contribs`, {
			headers: {
				Accept: 'application/json',
				'User-Agent': 'MonaMayhem/1.0',
			},
			redirect: 'follow',
		});

		if (response.status === 404) {
			return new Response(JSON.stringify({ error: `GitHub user "${username}" was not found.` }), {
				status: 404,
				headers: cacheHeaders,
			});
		}

		if (!response.ok) {
			return new Response(JSON.stringify({ error: `GitHub contribution service failed with status ${response.status}.` }), {
				status: 502,
				headers: cacheHeaders,
			});
		}

		const payload = await response.json();

		return new Response(JSON.stringify(normalizeContributionData(username, payload)), {
			status: 200,
			headers: cacheHeaders,
		});
	} catch (error) {
		console.error('Failed to fetch GitHub contribution data:', error);
		return new Response(JSON.stringify({ error: 'Failed to parse GitHub contribution data.' }), {
			status: 500,
			headers: cacheHeaders,
		});
	}
};
