import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from '../src/pages/api/contributions/[username].ts';
import {
	calculatePlayerMetrics,
	normalizeContributionData,
	scoreBattle,
	type ContributionData,
	type ContributionDay,
} from '../src/lib/contributions.ts';

function makeDaily(start: string, counts: number[]): ContributionDay[] {
	const date = new Date(`${start}T00:00:00Z`);
	return counts.map((count) => {
		const day = {
			date: date.toISOString().slice(0, 10),
			count,
			level: count === 0 ? 0 : 1,
		};
		date.setUTCDate(date.getUTCDate() + 1);
		return day;
	});
}

function makeData(username: string, daily: ContributionDay[]): ContributionData {
	return {
		username,
		from: daily[0]?.date ?? null,
		to: daily.at(-1)?.date ?? null,
		total_contributions: daily.reduce((total, day) => total + day.count, 0),
		range_days: daily.length,
		colors_full: [],
		weeks: [],
		daily,
	};
}

test('normalizes a zero-contribution year without introducing activity', () => {
	const daily = makeDaily('2025-01-01', Array.from({ length: 365 }, () => 0));
	const weeks = [];
	for (let index = 0; index < daily.length; index += 7) {
		const weekDays = daily.slice(index, index + 7);
		weeks.push({
			first_day: weekDays[0].date,
			contribution_days: weekDays.map((day) => ({
				weekday: new Date(`${day.date}T00:00:00Z`).getUTCDay(),
				count: day.count,
				level: day.level,
			})),
		});
	}

	const normalized = normalizeContributionData('quiet-user', {
		from: daily[0].date,
		to: daily.at(-1)?.date,
		total_contributions: 0,
		weeks,
	});
	const metrics = calculatePlayerMetrics(normalized);

	assert.equal(normalized.daily.length, 365);
	assert.equal(metrics.total, 0);
	assert.equal(metrics.longestStreak, 0);
	assert.equal(metrics.currentStreak, 0);
	assert.equal(metrics.peakCount, 0);
	assert.equal(metrics.consistency, 0);
});

test('calculates a contribution streak across month and year boundaries', () => {
	const daily = makeDaily('2024-12-30', [1, 2, 1, 3, 1, 0]);
	const metrics = calculatePlayerMetrics(makeData('boundary-user', daily));

	assert.equal(daily[0].date, '2024-12-30');
	assert.equal(daily[4].date, '2025-01-03');
	assert.equal(metrics.longestStreak, 5);
	assert.equal(metrics.currentStreak, 0);
});

test('identical contribution stats produce a match tie and tied categories', () => {
	const daily = makeDaily('2025-01-01', [1, 0, 2, 1, 0, 3, 1]);
	const result = scoreBattle(makeData('player-one', daily), makeData('player-two', daily));

	assert.equal(result.playerOneScore, 2.5);
	assert.equal(result.playerTwoScore, 2.5);
	assert.equal(result.winner, null);
	assert.ok(result.categories.every((category) => category.winner === 'tie'));
});

test('API route rejects invalid GitHub usernames before fetching upstream', async (t) => {
	const invalidUsernames = ['', 'bad_name', 'has space', '-starts-with-hyphen', 'ends-with-hyphen-', 'a'.repeat(40)];

	for (const username of invalidUsernames) {
		await t.test(JSON.stringify(username), async () => {
			const response = await GET({ params: { username } } as Parameters<typeof GET>[0]);
			assert.equal(response.status, 400);
			assert.deepEqual(await response.json(), { error: 'Invalid GitHub username.' });
		});
	}
});
